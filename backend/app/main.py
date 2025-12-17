# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from . import models
from .database import engine
from .routers import auth, sneakers, cart,orders


# Create DB tables
if os.getenv("DISABLE_AUTO_CREATE_DB") != "1":
    models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="Sneaker Shop API")


# ---- CORS SETUP (DEV) ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ---------------------------

# STATIC FILES (images, etc.)
# base dir = backend/app
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")

app.mount(
    "/static",
    StaticFiles(directory=STATIC_DIR),
    name="static",
)

# Include routers
app.include_router(auth.router)
app.include_router(sneakers.router)
app.include_router(cart.router)
app.include_router(orders.router)

@app.get("/")
def read_root():
    return {"status": "ok"}
