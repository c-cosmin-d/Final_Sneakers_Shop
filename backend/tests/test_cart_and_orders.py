# backend/tests/test_cart_and_orders.py
from backend.app import models


def create_sneaker_with_size(
    db_session,
    *,
    name: str = "Cart Sneaker",
    brand: str = "Nike",
    price: float = 100.0,
    eu_size: int = 42,
    stock: int = 10,
    gender: str = "men",
):
    sneaker = models.Sneaker(
        name=name,
        brand=brand,
        price=price,
        colorway="Blue/White",
        tag="cart_test",
        image_url="http://example.com/cart.jpg",
        gender=gender,
        description="Sneaker used in cart tests",
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


# ----------------------
# Cart tests
# ----------------------


def test_get_cart_initially_empty(client, db_session):
    # clean cart in case other tests inserted data
    db_session.query(models.CartItem).delete()
    db_session.commit()

    resp = client.get("/cart/")
    assert resp.status_code == 200
    assert resp.json() == []


def test_add_to_cart_success_and_stock_decreased(client, db_session):
    sneaker, size_row = create_sneaker_with_size(db_session, stock=5, eu_size=42)

    payload = {
        "sneaker_id": sneaker.id,
        "quantity": 2,
        "size": 42,
    }

    resp = client.post("/cart/", json=payload)
    assert resp.status_code == 201

    data = resp.json()
    assert data["quantity"] == 2
    assert data["size"] == 42
    assert data["sneaker"]["id"] == sneaker.id

    # stock should be decreased by 2
    refreshed_size = (
        db_session.query(models.SneakerSize)
        .filter(models.SneakerSize.id == size_row.id)
        .first()
    )
    assert refreshed_size.stock == 3


def test_add_to_cart_nonexistent_sneaker(client):
    payload = {
        "sneaker_id": 999999,
        "quantity": 1,
        "size": 42,
    }

    resp = client.post("/cart/", json=payload)
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Sneaker not found"


def test_add_to_cart_invalid_size_returns_400(client, db_session):
    # Sneaker without sizes
    sneaker = models.Sneaker(
        name="No Size Sneaker",
        brand="Nike",
        price=120.0,
        colorway="White",
        tag="nosize",
        image_url="http://example.com/nosize.jpg",
        gender="men",
        description="Sneaker without size rows",
    )
    db_session.add(sneaker)
    db_session.commit()
    db_session.refresh(sneaker)

    payload = {
        "sneaker_id": sneaker.id,
        "quantity": 1,
        "size": 42,
    }

    resp = client.post("/cart/", json=payload)
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Size 42 is not available for this sneaker"


def test_add_to_cart_exceeds_stock_returns_400(client, db_session):
    sneaker, _ = create_sneaker_with_size(db_session, stock=1, eu_size=42)

    payload = {
        "sneaker_id": sneaker.id,
        "quantity": 3,  # more than stock
        "size": 42,
    }

    resp = client.post("/cart/", json=payload)
    assert resp.status_code == 400
    data = resp.json()
    assert "Only 1 items left for size 42" in data["detail"]


def test_add_to_cart_merges_quantities_and_respects_max_stock(client, db_session):
    sneaker, size_row = create_sneaker_with_size(db_session, stock=5, eu_size=42)

    # First add - quantity 2 (stock -> 3)
    resp1 = client.post(
        "/cart/",
        json={"sneaker_id": sneaker.id, "quantity": 2, "size": 42},
    )
    assert resp1.status_code == 201
    item_id = resp1.json()["id"]

    # Second add - quantity 2 (total 4, stock -> 1)
    resp2 = client.post(
        "/cart/",
        json={"sneaker_id": sneaker.id, "quantity": 2, "size": 42},
    )
    assert resp2.status_code == 201
    assert resp2.json()["quantity"] == 4
    assert resp2.json()["id"] == item_id

    # Third add - try to exceed total stock (5)
    resp3 = client.post(
        "/cart/",
        json={"sneaker_id": sneaker.id, "quantity": 2, "size": 42},
    )
    assert resp3.status_code == 400
    data = resp3.json()
    # max_available should be 5
    assert "Only 5 items available for size 42" in data["detail"]

    # stock should remain 1 after failed attempt
    refreshed_size = (
        db_session.query(models.SneakerSize)
        .filter(models.SneakerSize.id == size_row.id)
        .first()
    )
    assert refreshed_size.stock == 1


def test_update_cart_item_increase_quantity_success(client, db_session):
    sneaker, size_row = create_sneaker_with_size(db_session, stock=5, eu_size=42)

    resp = client.post(
        "/cart/",
        json={"sneaker_id": sneaker.id, "quantity": 2, "size": 42},
    )
    assert resp.status_code == 201
    item_id = resp.json()["id"]

    # Increase quantity from 2 -> 4 (diff = 2, stock 3 -> 1)
    resp_update = client.patch(f"/cart/{item_id}", json={"quantity": 4})
    assert resp_update.status_code == 200
    data = resp_update.json()
    assert data["id"] == item_id
    assert data["quantity"] == 4

    refreshed_size = (
        db_session.query(models.SneakerSize)
        .filter(models.SneakerSize.id == size_row.id)
        .first()
    )
    assert refreshed_size.stock == 1


def test_update_cart_item_increase_over_stock_returns_400(client, db_session):
    sneaker, size_row = create_sneaker_with_size(db_session, stock=3, eu_size=42)

    # add 2 -> stock 1
    resp = client.post(
        "/cart/",
        json={"sneaker_id": sneaker.id, "quantity": 2, "size": 42},
    )
    assert resp.status_code == 201
    item_id = resp.json()["id"]

    # try to go 2 -> 5 (diff=3, stock=1)
    resp_update = client.patch(f"/cart/{item_id}", json={"quantity": 5})
    assert resp_update.status_code == 400
    data = resp_update.json()
    assert "Only 1 items left for size 42" in data["detail"]

    # ensure quantity & stock unchanged
    item = (
        db_session.query(models.CartItem)
        .filter(models.CartItem.id == item_id)
        .first()
    )
    size_row_db = (
        db_session.query(models.SneakerSize)
        .filter(models.SneakerSize.id == size_row.id)
        .first()
    )
    assert item.quantity == 2
    assert size_row_db.stock == 1


def test_update_cart_item_decrease_quantity_restores_stock(client, db_session):
    sneaker, size_row = create_sneaker_with_size(db_session, stock=5, eu_size=42)

    resp = client.post(
        "/cart/",
        json={"sneaker_id": sneaker.id, "quantity": 4, "size": 42},
    )
    assert resp.status_code == 201
    item_id = resp.json()["id"]

    # stock now 1, decrease qty 4 -> 1 (diff = -3)
    resp_update = client.patch(f"/cart/{item_id}", json={"quantity": 1})
    assert resp_update.status_code == 200

    refreshed_size = (
        db_session.query(models.SneakerSize)
        .filter(models.SneakerSize.id == size_row.id)
        .first()
    )
    assert refreshed_size.stock == 4  # 1 + 3 restored


def test_update_cart_item_to_zero_removes_item_and_restores_stock(client, db_session):
    sneaker, size_row = create_sneaker_with_size(db_session, stock=5, eu_size=42)

    resp = client.post(
        "/cart/",
        json={"sneaker_id": sneaker.id, "quantity": 2, "size": 42},
    )
    assert resp.status_code == 201
    item_id = resp.json()["id"]

    resp_update = client.patch(f"/cart/{item_id}", json={"quantity": 0})
    assert resp_update.status_code == 204  # removed

    # item should be gone
    item = (
        db_session.query(models.CartItem)
        .filter(models.CartItem.id == item_id)
        .first()
    )
    assert item is None

    # stock fully restored
    refreshed_size = (
        db_session.query(models.SneakerSize)
        .filter(models.SneakerSize.id == size_row.id)
        .first()
    )
    assert refreshed_size.stock == 5


def test_delete_cart_item_restores_stock_and_removes_item(client, db_session):
    sneaker, size_row = create_sneaker_with_size(db_session, stock=5, eu_size=42)

    resp = client.post(
        "/cart/",
        json={"sneaker_id": sneaker.id, "quantity": 2, "size": 42},
    )
    assert resp.status_code == 201
    item_id = resp.json()["id"]

    resp_delete = client.delete(f"/cart/{item_id}")
    assert resp_delete.status_code == 204

    # item removed
    item = (
        db_session.query(models.CartItem)
        .filter(models.CartItem.id == item_id)
        .first()
    )
    assert item is None

    # stock restored
    refreshed_size = (
        db_session.query(models.SneakerSize)
        .filter(models.SneakerSize.id == size_row.id)
        .first()
    )
    assert refreshed_size.stock == 5


def test_delete_cart_item_not_found(client, db_session):
    # ensure no item with a big id
    db_session.query(models.CartItem).delete()
    db_session.commit()

    resp = client.delete("/cart/999999")
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Cart item not found"


def test_clear_cart_after_checkout_does_not_restore_stock(client, db_session):
    sneaker, size_row = create_sneaker_with_size(db_session, stock=5, eu_size=42)

    resp = client.post(
        "/cart/",
        json={"sneaker_id": sneaker.id, "quantity": 2, "size": 42},
    )
    assert resp.status_code == 201

    # stock is now 3
    resp_clear = client.delete("/cart/clear-after-checkout/all")
    assert resp_clear.status_code == 204

    # cart empty
    cart_items = (
        db_session.query(models.CartItem)
        .all()
    )
    assert cart_items == []

    # stock should still be 3 (NOT restored)
    refreshed_size = (
        db_session.query(models.SneakerSize)
        .filter(models.SneakerSize.id == size_row.id)
        .first()
    )
    assert refreshed_size.stock == 3


# ----------------------
# Order / checkout tests
# ----------------------


def test_checkout_creates_order_and_clears_cart(client, db_session):
    # clean existing orders & cart
    db_session.query(models.OrderItem).delete()
    db_session.query(models.Order).delete()
    db_session.query(models.CartItem).delete()
    db_session.commit()

    # Create 2 sneakers with sizes
    sneaker1, _ = create_sneaker_with_size(
        db_session,
        name="Checkout Sneaker 1",
        price=100.0,
        eu_size=42,
        stock=10,
    )
    sneaker2, _ = create_sneaker_with_size(
        db_session,
        name="Checkout Sneaker 2",
        price=200.0,
        eu_size=43,
        stock=5,
    )

    # Add items to cart
    resp1 = client.post(
        "/cart/",
        json={"sneaker_id": sneaker1.id, "quantity": 2, "size": 42},
    )
    resp2 = client.post(
        "/cart/",
        json={"sneaker_id": sneaker2.id, "quantity": 1, "size": 43},
    )
    assert resp1.status_code == 201
    assert resp2.status_code == 201

    # Perform checkout
    resp_checkout = client.post("/orders/checkout")
    assert resp_checkout.status_code == 200

    order_data = resp_checkout.json()
    assert "id" in order_data
    assert order_data["total"] == 400.0  # 2*100 + 1*200
    assert len(order_data["items"]) == 2

    # Check order items payload
    item_sneaker_ids = {item["sneaker_id"] for item in order_data["items"]}
    assert item_sneaker_ids == {sneaker1.id, sneaker2.id}

    # Cart should now be empty
    cart_after = client.get("/cart/")
    assert cart_after.status_code == 200
    assert cart_after.json() == []


def test_checkout_empty_cart_returns_400(client, db_session):
    # ensure cart is empty
    db_session.query(models.CartItem).delete()
    db_session.commit()

    resp = client.post("/orders/checkout")
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Cart is empty"


def test_get_my_orders_returns_orders_sorted_desc(client, db_session):
    # clean orders & cart
    db_session.query(models.OrderItem).delete()
    db_session.query(models.Order).delete()
    db_session.query(models.CartItem).delete()
    db_session.commit()

    # First order
    sneaker1, _ = create_sneaker_with_size(
        db_session,
        name="Order 1 Sneaker",
        price=50.0,
        eu_size=40,
        stock=10,
    )
    client.post(
        "/cart/",
        json={"sneaker_id": sneaker1.id, "quantity": 1, "size": 40},
    )
    resp_o1 = client.post("/orders/checkout")
    assert resp_o1.status_code == 200
    order1_id = resp_o1.json()["id"]

    # Second order (later)
    sneaker2, _ = create_sneaker_with_size(
        db_session,
        name="Order 2 Sneaker",
        price=75.0,
        eu_size=41,
        stock=10,
    )
    client.post(
        "/cart/",
        json={"sneaker_id": sneaker2.id, "quantity": 2, "size": 41},
    )
    resp_o2 = client.post("/orders/checkout")
    assert resp_o2.status_code == 200
    order2_id = resp_o2.json()["id"]

    # Fetch orders, should be sorted newest first
    resp_orders = client.get("/orders/")
    assert resp_orders.status_code == 200

    orders = resp_orders.json()
    assert len(orders) >= 2
    assert orders[0]["id"] == order2_id
    assert orders[1]["id"] == order1_id
