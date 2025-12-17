from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from .auth import get_current_user
from typing import List


router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/checkout", response_model=schemas.OrderRead)
def create_order(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Get cart items
    cart_items = (
        db.query(models.CartItem)
        .filter(models.CartItem.user_id == current_user.id)
        .all()
    )

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Calculate total
    total = sum(
        item.quantity *
        db.query(models.Sneaker).filter(models.Sneaker.id == item.sneaker_id).first().price
        for item in cart_items
    )

    # Create order
    order = models.Order(
        user_id=current_user.id,
        total=total,
    )
    db.add(order)
    db.flush()  # get order.id before inserting items

    # Add order items
    for item in cart_items:
        sneaker = db.query(models.Sneaker).filter(models.Sneaker.id == item.sneaker_id).first()
        order_item = models.OrderItem(
            order_id=order.id,
            sneaker_id=item.sneaker_id,
            size=item.size,
            quantity=item.quantity,
            price=sneaker.price,  # snapshot
        )
        db.add(order_item)

    # Clear cart NOW (but do NOT restore stock)
    for item in cart_items:
        db.delete(item)

    db.commit()
    db.refresh(order)

    return order

@router.get("/", response_model=List[schemas.OrderRead])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    orders = (
        db.query(models.Order)
        .filter(models.Order.user_id == current_user.id)
        .order_by(models.Order.created_at.desc())
        .all()
    )

    return orders
