# backend/tests/conftest.py
import os
import sys

# --- make sure /app (in container) or backend (on host) is on path ---
CURRENT_DIR = os.path.dirname(__file__)
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app import main
from backend.app import database

# ---- Test database (SQLite file) ----
SQLALCHEMY_TEST_DB_URL = "sqlite:///./test_sneaker_shop.db"

engine = create_engine(
    SQLALCHEMY_TEST_DB_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Drop and recreate tables on the test DB
database.Base.metadata.drop_all(bind=engine)
database.Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Override the real DB dependency with the test one
main.app.dependency_overrides[database.get_db] = override_get_db


@pytest.fixture
def client() -> TestClient:
    """FastAPI TestClient using the SQLite test database."""
    return TestClient(main.app)


@pytest.fixture
def db_session():
    """Raw SQLAlchemy session for seeding data directly in tests."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
