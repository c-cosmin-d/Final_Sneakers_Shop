# app/routers/cart.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from .auth import get_current_user

router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("/", response_model=List[schemas.CartItemRead])
def get_cart(
    db: Session = Depends(get_db),                    # 👈 FIXED
    current_user: models.User = Depends(get_current_user),
):
    items = (
        db.query(models.CartItem)
        .filter(models.CartItem.user_id == current_user.id)
        .all()
    )

    result: list[schemas.CartItemRead] = []
    for item in items:
        sneaker = db.query(models.Sneaker).get(item.sneaker_id)
        if not sneaker:
            continue

        sneaker_data = schemas.CartItemSneaker(
            id=sneaker.id,
            name=sneaker.name,
            brand=sneaker.brand,
            price=sneaker.price,
            colorway=sneaker.colorway,
            tag=sneaker.tag,
            image_url=sneaker.image_url,
        )

        result.append(
            schemas.CartItemRead(
                id=item.id,
                quantity=item.quantity,
                sneaker=sneaker_data,
            )
        )

    return result


@router.post("/", response_model=schemas.CartItemRead, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    payload: schemas.CartItemCreate,
    db: Session = Depends(get_db),                    # 👈 FIXED
    current_user: models.User = Depends(get_current_user),
):
    sneaker = db.query(models.Sneaker).get(payload.sneaker_id)
    if not sneaker:
        raise HTTPException(status_code=404, detail="Sneaker not found")

    item = (
        db.query(models.CartItem)
        .filter(
            models.CartItem.user_id == current_user.id,
            models.CartItem.sneaker_id == payload.sneaker_id,
        )
        .first()
    )

    if item:
        item.quantity += payload.quantity
    else:
        item = models.CartItem(
            user_id=current_user.id,
            sneaker_id=payload.sneaker_id,
            quantity=payload.quantity,
        )
        db.add(item)

    db.commit()
    db.refresh(item)

    sneaker_data = schemas.CartItemSneaker(
        id=sneaker.id,
        name=sneaker.name,
        brand=sneaker.brand,
        price=sneaker.price,
        colorway=sneaker.colorway,
        tag=sneaker.tag,
        image_url=sneaker.image_url,
    )

    return schemas.CartItemRead(
        id=item.id,
        quantity=item.quantity,
        sneaker=sneaker_data,
    )


@router.patch("/{item_id}", response_model=schemas.CartItemRead)
def update_cart_item(
    item_id: int,
    payload: schemas.CartItemUpdate,
    db: Session = Depends(get_db),                    # 👈 FIXED
    current_user: models.User = Depends(get_current_user),
):
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

    if payload.quantity <= 0:
        db.delete(item)
        db.commit()
        raise HTTPException(status_code=204, detail="Item removed")

    item.quantity = payload.quantity
    db.commit()
    db.refresh(item)

    sneaker = db.query(models.Sneaker).get(item.sneaker_id)

    sneaker_data = schemas.CartItemSneaker(
        id=sneaker.id,
        name=sneaker.name,
        brand=sneaker.brand,
        price=sneaker.price,
        colorway=sneaker.colorway,
        tag=sneaker.tag,
        image_url=sneaker.image_url,
    )

    return schemas.CartItemRead(
        id=item.id,
        quantity=item.quantity,
        sneaker=sneaker_data,
    )


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cart_item(
    item_id: int,
    db: Session = Depends(get_db),                    # 👈 FIXED
    current_user: models.User = Depends(get_current_user),
):
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

    db.delete(item)
    db.commit()
