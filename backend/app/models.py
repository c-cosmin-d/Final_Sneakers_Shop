# app/models.py
from sqlalchemy import Column, Integer, String, Float,Boolean,ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


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
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sneaker_id = Column(Integer, ForeignKey("sneakers.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)

