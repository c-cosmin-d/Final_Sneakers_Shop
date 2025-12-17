# app/models.py
from sqlalchemy import Column, Integer, String, Float,Boolean,ForeignKey,DateTime
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

sneak_id = "sneakers.id"
users_id = "users.id"

class Sneaker(Base):
    __tablename__ = "sneakers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    brand = Column(String(100), nullable=False)
    price = Column(Float, nullable=False)
    colorway = Column(String(255), nullable=True)
    tag = Column(String(50), nullable=True)
    image_url = Column(String(255), nullable=True)
    gender = Column(String(10), nullable=True)  # 'men' or 'women'
    description = Column(String(2000), nullable=True)
    sizes = relationship(
        "SneakerSize",
        back_populates="sneaker",
        cascade="all, delete-orphan",
    )

class SneakerSize(Base):
    __tablename__ = "sneaker_sizes"

    id = Column(Integer, primary_key=True, index=True)
    sneaker_id = Column(Integer, ForeignKey(sneak_id), nullable=False)
    eu_size = Column(Integer, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    sneaker = relationship("Sneaker", back_populates="sizes")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey(users_id), nullable=False)
    sneaker_id = Column(Integer, ForeignKey(sneak_id), nullable=False)
    size = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    image_url = Column(String(255), nullable=True)

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey(users_id))
    total = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    sneaker_id = Column(Integer, ForeignKey(sneak_id))
    size = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)  # snapshot price at time of order

    order = relationship("Order", back_populates="items")
    sneaker = relationship("Sneaker")


