# app/routers/sneakers.py
from typing import List
from fastapi import APIRouter, HTTPException,Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/sneakers", tags=["sneakers"])

@router.get("/", response_model=list[schemas.SneakerRead])
def list_sneakers(
    gender: str | None = None,
    db: Session = Depends(get_db),  # ✅ only here
):
    query = db.query(models.Sneaker)
    if gender in ("men", "women"):
        query = query.filter(models.Sneaker.gender == gender)
    return query.all()


@router.post("/", response_model=schemas.SneakerRead, status_code=201)
def create_sneaker(sneaker: schemas.SneakerCreate, db: Session = Depends(get_db)):
    db_sneaker = models.Sneaker(**sneaker.dict())
    db.add(db_sneaker)
    db.commit()
    db.refresh(db_sneaker)
    return db_sneaker


@router.get("/{sneaker_id}", response_model=schemas.SneakerRead)
def get_sneaker(sneaker_id: int, db: Session = Depends(get_db)):
    sneaker = db.query(models.Sneaker).filter(models.Sneaker.id == sneaker_id).first()
    if not sneaker:
        raise HTTPException(status_code=404, detail="Sneaker not found")
    return sneaker
