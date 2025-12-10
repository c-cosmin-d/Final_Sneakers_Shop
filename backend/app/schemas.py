# app/schemas.py
from pydantic import BaseModel,EmailStr,ConfigDict

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

    class Config:
        orm_mode = True
        
class CartItemBase(BaseModel):
    sneaker_id: int
    quantity: int = 1
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