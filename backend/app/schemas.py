# app/schemas.py
from pydantic import BaseModel,EmailStr,ConfigDict
from datetime import datetime
from typing import List


class SneakerSizeBase(BaseModel):
    eu_size: int
    stock: int

class SneakerSizeCreate(SneakerSizeBase):
    pass

class SneakerSizeRead(SneakerSizeBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class CartItemSneaker(BaseModel):
    id: int
    name: str
    brand: str
    price: float
    colorway: str | None = None
    tag: str | None = None
    image_url: str | None = None
    gender: str | None = None
    description: str | None = None
    model_config = ConfigDict(from_attributes=True)


class CartItemRead(BaseModel):
    id: int
    quantity: int
    size: int
    sneaker: CartItemSneaker
    image_url: str | None = None
    gender: str | None = None
    description: str | None = None
    model_config = ConfigDict(from_attributes=True)

class SneakerBase(BaseModel):
    name: str
    brand: str
    price: float
    colorway: str | None = None
    tag: str | None = None
    image_url: str | None = None
    gender: str | None = None
    description: str | None = None

class SneakerCreate(SneakerBase):
    pass


class SneakerRead(SneakerBase):
    id: int
    sizes: list[SneakerSizeRead] = []  # NEW: include size/stock info

    class Config:
        orm_mode = True
        
class CartItemBase(BaseModel):
    sneaker_id: int
    quantity: int = 1
    size: int
    image_url: str | None = None
    gender: str | None = None
    description: str | None = None

class CartItemCreate(CartItemBase):
    pass


class CartItemUpdate(BaseModel):
    quantity: int


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None


class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    sub: str | None = None  # email

class OrderItemRead(BaseModel):
    id: int
    sneaker_id: int
    size: int
    quantity: int
    price: float
    sneaker: CartItemSneaker  # reuse your sneaker schema

    class Config:
        orm_mode = True

class OrderRead(BaseModel):
    id: int
    total: float
    created_at: datetime
    items: List[OrderItemRead]

    class Config:
        orm_mode = True

