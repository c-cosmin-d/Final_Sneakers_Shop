# backend/tests/test_sneakers.py
from sqlalchemy.orm import Session

# from app import models
from backend.app import models


def make_sneaker_payload(
    *,
    name: str = "Air Max 90",
    brand: str = "Nike",
    price: float = 120.0,
    colorway: str | None = "White/Red",
    tag: str | None = "bestseller",
    image_url: str | None = "http://example.com/airmax.jpg",
    gender: str | None = "men",
    description: str | None = "Classic Nike Air Max 90.",
) -> dict:
    """
    Payload that matches schemas.SneakerCreate / SneakerBase.
    """
    return {
        "name": name,
        "brand": brand,
        "price": price,
        "colorway": colorway,
        "tag": tag,
        "image_url": image_url,
        "gender": gender,
        "description": description,
    }

def create_sneaker_with_size(
    db_session,
    *,
    name: str = "Sneaker With Size",
    brand: str = "Nike",
    price: float = 150.0,
    eu_size: int = 42,
    stock: int = 10,
    gender: str = "men",
):
    sneaker = models.Sneaker(
        name=name,
        brand=brand,
        price=price,
        colorway="Black/Red",
        tag="test",
        image_url="http://example.com/test.jpg",
        gender=gender,
        description="Test sneaker with size",
    )
    db_session.add(sneaker)
    db_session.commit()
    db_session.refresh(sneaker)

    size_row = models.SneakerSize(
        sneaker_id=sneaker.id,
        eu_size=eu_size,
        stock=stock,
    )
    db_session.add(size_row)
    db_session.commit()
    db_session.refresh(size_row)

    return sneaker, size_row


def test_list_sneakers_empty_initially(client):
    response = client.get("/sneakers/")
    assert response.status_code == 200
    assert response.json() == []

def test_create_sneaker_validation_error(client):
    # price is missing -> Pydantic validation should fail -> 422
    payload = {
        "name": "Invalid Sneaker",
        "brand": "Nike",
        # "price" is omitted on purpose
    }
    response = client.post("/sneakers/", json=payload)
    assert response.status_code == 422

def test_sneaker_read_includes_sizes(client, db_session):
    sneaker, _ = create_sneaker_with_size(db_session, eu_size=43, stock=7)

    resp = client.get(f"/sneakers/{sneaker.id}")
    assert resp.status_code == 200

    data = resp.json()
    assert data["id"] == sneaker.id
    assert "sizes" in data
    assert len(data["sizes"]) == 1
    assert data["sizes"][0]["eu_size"] == 43
    assert data["sizes"][0]["stock"] == 7

def test_create_sneaker(client):
    payload = make_sneaker_payload()

    response = client.post("/sneakers/", json=payload)
    assert response.status_code == 201

    data = response.json()
    # Fields from SneakerRead
    assert "id" in data
    assert data["name"] == payload["name"]
    assert data["brand"] == payload["brand"]
    assert data["price"] == payload["price"]
    assert data["colorway"] == payload["colorway"]
    assert data["tag"] == payload["tag"]
    assert data["image_url"] == payload["image_url"]
    assert data["gender"] == payload["gender"]
    assert data["description"] == payload["description"]


def test_get_sneaker_by_id(client):
    payload = make_sneaker_payload(name="Jordan 1", gender="women")
    create_resp = client.post("/sneakers/", json=payload)
    assert create_resp.status_code == 201
    sneaker_id = create_resp.json()["id"]

    resp = client.get(f"/sneakers/{sneaker_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == sneaker_id
    assert data["name"] == "Jordan 1"
    assert data["gender"] == "women"


def test_get_sneaker_not_found(client):
    resp = client.get("/sneakers/999999")
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Sneaker not found"


def test_filter_sneakers_by_gender(client, db_session: Session):
    # create one men + one women sneaker directly in the test DB
    men_sneaker = models.Sneaker(**make_sneaker_payload(gender="men"))
    women_sneaker = models.Sneaker(
        **make_sneaker_payload(name="AJ1 High", gender="women")
    )

    db_session.add(men_sneaker)
    db_session.add(women_sneaker)
    db_session.commit()

    # /sneakers/?gender=men
    resp_men = client.get("/sneakers/?gender=men")
    assert resp_men.status_code == 200
    men_list = resp_men.json()
    assert len(men_list) >= 1
    assert all(item["gender"] == "men" for item in men_list)

    # /sneakers/?gender=women
    resp_women = client.get("/sneakers/?gender=women")
    assert resp_women.status_code == 200
    women_list = resp_women.json()
    assert len(women_list) >= 1
    assert all(item["gender"] == "women" for item in women_list)
