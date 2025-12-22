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

from backend.app import main,models
from backend.app import database
from backend.app.routers.auth import get_current_user

# from app.main import app
# from app.database import Base, get_db
# from app import models
# from app.routers.auth import get_current_user
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
# database.Base.metadata.drop_all(bind=engine)
# database.Base.metadata.create_all(bind=engine)
database.Base.metadata.drop_all(bind=engine)
database.Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
def override_get_current_user():
    db = TestingSessionLocal()
    try:
        user = db.query(models.User).filter(models.User.email == "test@example.com").first()
        if not user:
            user = models.User(
                email="test@example.com",
                hashed_password="fake-hash",
                full_name="Test User",
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # detach the instance so it can be safely used outside this session
        db.expunge(user)
    finally:
        db.close()

    return user


# Override the real dependencies with the test ones
main.app.dependency_overrides[database.get_db] = override_get_db
main.app.dependency_overrides[get_current_user] = override_get_current_user

@pytest.fixture
def client() -> TestClient:
    """FastAPI TestClient using the SQLite test database."""
    # return TestClient(main.app)
    return TestClient(main.app)


@pytest.fixture
def db_session():
    """Raw SQLAlchemy session for seeding data directly in tests."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
