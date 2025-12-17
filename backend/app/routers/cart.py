# app/routers/cart.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user

router = APIRouter(prefix="/cart", tags=["cart"])


# ---------- Helpers ----------


def _to_cart_item_read(item: models.CartItem, sneaker: models.Sneaker) -> schemas.CartItemRead:
  """Build CartItemRead from ORM objects."""
  sneaker_data = schemas.CartItemSneaker(
      id=sneaker.id,
      name=sneaker.name,
      brand=sneaker.brand,
      price=sneaker.price,
      colorway=sneaker.colorway,
      tag=sneaker.tag,
      image_url=sneaker.image_url,
      gender=sneaker.gender,
      description=sneaker.description,
  )

  return schemas.CartItemRead(
      id=item.id,
      quantity=item.quantity,
      size=item.size,
      sneaker=sneaker_data,
  )


def _get_size_row_or_400(db: Session, sneaker_id: int, eu_size: int) -> models.SneakerSize:
  size_row = (
      db.query(models.SneakerSize)
      .filter(
          models.SneakerSize.sneaker_id == sneaker_id,
          models.SneakerSize.eu_size == eu_size,
      )
      .first()
  )
  if not size_row:
      raise HTTPException(
          status_code=400,
          detail=f"Size {eu_size} is not available for this sneaker",
      )
  return size_row


# ---------- Endpoints ----------


@router.get("/", response_model=List[schemas.CartItemRead])
def get_cart(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
  items = (
      db.query(models.CartItem)
      .filter(models.CartItem.user_id == current_user.id)
      .all()
  )

  result: list[schemas.CartItemRead] = []
  for item in items:
      sneaker = (
          db.query(models.Sneaker)
          .filter(models.Sneaker.id == item.sneaker_id)
          .first()
      )
      if not sneaker:
          continue

      result.append(_to_cart_item_read(item, sneaker))

  return result


@router.post(
    "/",
    response_model=schemas.CartItemRead,
    status_code=status.HTTP_201_CREATED,
)
def add_to_cart(
    payload: schemas.CartItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
  """
  Add sneaker + size to cart.

  - checks stock in SneakerSize
  - reduces stock
  - merges with existing cart item of same sneaker+size
  """
  sneaker = (
      db.query(models.Sneaker)
      .filter(models.Sneaker.id == payload.sneaker_id)
      .first()
  )
  if not sneaker:
      raise HTTPException(status_code=404, detail="Sneaker not found")

  size_row = _get_size_row_or_400(db, sneaker.id, payload.size)

  if size_row.stock < payload.quantity:
      raise HTTPException(
          status_code=400,
          detail=f"Only {size_row.stock} items left for size {payload.size}",
      )

  item = (
      db.query(models.CartItem)
      .filter(
          models.CartItem.user_id == current_user.id,
          models.CartItem.sneaker_id == payload.sneaker_id,
          models.CartItem.size == payload.size,
      )
      .first()
  )

  if item:
      new_qty = item.quantity + payload.quantity
      if new_qty > size_row.stock + item.quantity:
          # existing quantity + requested > total stock
          max_available = size_row.stock + item.quantity
          raise HTTPException(
              status_code=400,
              detail=f"Only {max_available} items available for size {payload.size}",
          )
      item.quantity = new_qty
  else:
      item = models.CartItem(
          user_id=current_user.id,
          sneaker_id=payload.sneaker_id,
          size=payload.size,
          quantity=payload.quantity,
      )
      db.add(item)

  # decrease stock by added quantity
  size_row.stock -= payload.quantity

  db.commit()
  db.refresh(item)

  return _to_cart_item_read(item, sneaker)


@router.patch("/{item_id}", response_model=schemas.CartItemRead)
def update_cart_item(
    item_id: int,
    payload: schemas.CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
  """
  Change quantity of a cart item.

  - if quantity <= 0, remove item and restore stock (returns 204 via HTTPException)
  - if increasing, checks stock and reduces it
  - if decreasing, restores stock
  """
  item = (
      db.query(models.CartItem)
      .filter(
          models.CartItem.id == item_id,
          models.CartItem.user_id == current_user.id,
      )
      .first()
  )
  if not item:
      raise HTTPException(status_code=404, detail="Cart item not found")

  sneaker = (
      db.query(models.Sneaker)
      .filter(models.Sneaker.id == item.sneaker_id)
      .first()
  )
  if not sneaker:
      raise HTTPException(status_code=404, detail="Sneaker not found")

  size_row = _get_size_row_or_400(db, sneaker.id, item.size)

  current_qty = item.quantity
  new_qty = payload.quantity

  if new_qty <= 0:
      # remove item and give stock back
      size_row.stock += current_qty
      db.delete(item)
      db.commit()
      # keep same behavior you had: 204 via HTTPException
      raise HTTPException(status_code=204, detail="Item removed")

  diff = new_qty - current_qty

  if diff > 0:
      # increasing quantity
      if size_row.stock < diff:
          raise HTTPException(
              status_code=400,
              detail=f"Only {size_row.stock} items left for size {item.size}",
          )
      size_row.stock -= diff
  elif diff < 0:
      # decreasing quantity, give stock back
      size_row.stock += (-diff)

  item.quantity = new_qty
  db.commit()
  db.refresh(item)

  return _to_cart_item_read(item, sneaker)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
  """
  Remove an item from the cart and restore stock.
  """
  item = (
      db.query(models.CartItem)
      .filter(
          models.CartItem.id == item_id,
          models.CartItem.user_id == current_user.id,
      )
      .first()
  )
  if not item:
      raise HTTPException(status_code=404, detail="Cart item not found")

  size_row = (
      db.query(models.SneakerSize)
      .filter(
          models.SneakerSize.sneaker_id == item.sneaker_id,
          models.SneakerSize.eu_size == item.size,
      )
      .first()
  )

  if size_row:
      size_row.stock += item.quantity

  db.delete(item)
  db.commit()

@router.delete("/clear-after-checkout/all", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart_after_checkout(
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user),
  ):
      """
      Clear cart items AFTER a successful order.
      IMPORTANT: does NOT restore stock, because stock was already decreased
      when items were added/updated in the cart.
      """
      items = (
          db.query(models.CartItem)
          .filter(models.CartItem.user_id == current_user.id)
          .all()
      )

      for item in items:
          db.delete(item)

      db.commit()

