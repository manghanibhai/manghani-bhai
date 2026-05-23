"""Manghani Toy World - Backend API tests."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://toy-world-admin.preview.manghani-toy-worldagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@manghanitoyworld.com"
ADMIN_PASSWORD = "Admin@123"


# ---------------- Fixtures ----------------
@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["user"]["role"] == "admin"
    return data["token"]


@pytest.fixture(scope="session")
def customer_token():
    email = f"TEST_cust_{uuid.uuid4().hex[:8]}@example.com"
    r = requests.post(f"{API}/auth/register", json={"name": "TEST Customer", "email": email, "password": "Test@123"}, timeout=20)
    assert r.status_code == 200, f"register failed: {r.text}"
    data = r.json()
    assert data["user"]["role"] == "customer"
    return data["token"], data["user"], email


def admin_h(t): return {"Authorization": f"Bearer {t}"}


# ---------------- Public endpoints ----------------
class TestPublic:
    def test_branding(self):
        r = requests.get(f"{API}/branding", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "brand_name" in d
        assert "banner_images" in d and isinstance(d["banner_images"], list)

    def test_contact(self):
        r = requests.get(f"{API}/contact-settings", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d.get("whatsapp_numbers"), list) and len(d["whatsapp_numbers"]) > 0
        assert isinstance(d.get("phone_numbers"), list)
        assert "address" in d

    def test_categories(self):
        r = requests.get(f"{API}/categories", timeout=15)
        assert r.status_code == 200
        cats = r.json()
        assert isinstance(cats, list) and len(cats) >= 8
        for c in cats:
            assert "id" in c and "name" in c and "slug" in c

    def test_products_list(self):
        r = requests.get(f"{API}/products", timeout=15)
        assert r.status_code == 200
        prods = r.json()
        assert len(prods) >= 8
        # category_name enrichment
        with_cat = [p for p in prods if p.get("category_name")]
        assert len(with_cat) >= 1

    def test_products_featured(self):
        r = requests.get(f"{API}/products?featured=true", timeout=15)
        assert r.status_code == 200
        prods = r.json()
        assert all(p["featured"] is True for p in prods)
        assert len(prods) >= 1

    def test_products_search_teddy(self):
        r = requests.get(f"{API}/products?q=teddy", timeout=15)
        assert r.status_code == 200
        prods = r.json()
        assert len(prods) >= 1
        assert any("teddy" in p["title"].lower() for p in prods)

    def test_products_by_category(self):
        cats = requests.get(f"{API}/categories", timeout=15).json()
        cid = cats[0]["id"]
        r = requests.get(f"{API}/products?category_id={cid}", timeout=15)
        assert r.status_code == 200
        for p in r.json():
            assert p["category_id"] == cid

    def test_product_detail(self):
        prods = requests.get(f"{API}/products", timeout=15).json()
        pid = prods[0]["id"]
        r = requests.get(f"{API}/products/{pid}", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == pid
        assert "category_name" in d


# ---------------- Auth ----------------
class TestAuth:
    def test_admin_login(self, admin_token):
        assert isinstance(admin_token, str) and len(admin_token) > 10

    def test_me(self, admin_token):
        r = requests.get(f"{API}/auth/me", headers=admin_h(admin_token), timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["role"] == "admin"
        assert d["email"] == ADMIN_EMAIL

    def test_me_unauthorized(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_register_customer(self, customer_token):
        t, u, _ = customer_token
        assert u["role"] == "customer"

    def test_duplicate_register(self, customer_token):
        _, u, email = customer_token
        r = requests.post(f"{API}/auth/register", json={"name": "x", "email": email, "password": "Test@123"}, timeout=15)
        assert r.status_code == 400

    def test_login_invalid(self):
        r = requests.post(f"{API}/auth/login", json={"email": "nope@example.com", "password": "bad"}, timeout=15)
        assert r.status_code == 401


# ---------------- Orders ----------------
class TestOrders:
    @pytest.fixture(scope="class")
    def created_order(self, customer_token):
        token, user, _ = customer_token
        prods = requests.get(f"{API}/products", timeout=15).json()
        p = prods[0]
        body = {
            "items": [{"product_id": p["id"], "title": p["title"], "image": (p["images"] or [None])[0], "price": p.get("discounted_price") or p["price"], "qty": 2}],
            "shipping_name": "TEST User",
            "shipping_phone": "+919999999999",
            "shipping_address": "TEST Address, Ajmer",
            "notes": "test order"
        }
        r = requests.post(f"{API}/orders", json=body, headers=admin_h(token), timeout=15)
        assert r.status_code == 200, r.text
        return r.json(), token

    def test_order_created(self, created_order):
        order, _ = created_order
        assert order["status"] == "pending"
        assert order["order_no"].startswith("MTW-")
        assert order["total_price"] > 0
        assert len(order["status_history"]) == 1

    def test_orders_mine(self, created_order):
        order, token = created_order
        r = requests.get(f"{API}/orders/mine", headers=admin_h(token), timeout=15)
        assert r.status_code == 200
        orders = r.json()
        assert any(o["id"] == order["id"] for o in orders)

    def test_orders_track(self, created_order):
        order, _ = created_order
        r = requests.get(f"{API}/orders/track/{order['order_no']}", timeout=15)
        assert r.status_code == 200
        assert r.json()["id"] == order["id"]

    def test_orders_track_404(self):
        r = requests.get(f"{API}/orders/track/MTW-000000-XXXXXX", timeout=15)
        assert r.status_code == 404

    def test_orders_admin_403_for_customer(self, customer_token):
        token, _, _ = customer_token
        r = requests.get(f"{API}/orders", headers=admin_h(token), timeout=15)
        assert r.status_code == 403

    def test_orders_admin_list(self, admin_token):
        r = requests.get(f"{API}/orders", headers=admin_h(admin_token), timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_orders_status_update(self, created_order, admin_token):
        order, _ = created_order
        r = requests.patch(f"{API}/orders/{order['id']}/status", json={"status": "confirmed"}, headers=admin_h(admin_token), timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "confirmed"
        assert len(d["status_history"]) == 2
        assert d["status_history"][-1]["status"] == "confirmed"


# ---------------- Admin RBAC ----------------
class TestAdminOnly:
    def test_create_category_admin(self, admin_token):
        name = f"TEST_Cat_{uuid.uuid4().hex[:6]}"
        r = requests.post(f"{API}/categories", json={"name": name}, headers=admin_h(admin_token), timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["name"] == name
        # cleanup
        requests.delete(f"{API}/categories/{d['id']}", headers=admin_h(admin_token), timeout=15)

    def test_create_category_403_customer(self, customer_token):
        token, _, _ = customer_token
        r = requests.post(f"{API}/categories", json={"name": "TEST_no"}, headers=admin_h(token), timeout=15)
        assert r.status_code == 403

    def test_create_product_admin(self, admin_token):
        cats = requests.get(f"{API}/categories", timeout=15).json()
        body = {"title": f"TEST_Prod_{uuid.uuid4().hex[:6]}", "description": "x", "images": [], "price": 100.0, "stock": 5, "category_id": cats[0]["id"], "featured": False}
        r = requests.post(f"{API}/products", json=body, headers=admin_h(admin_token), timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["title"].startswith("TEST_Prod_")
        assert d["category_name"] == cats[0]["name"]
        # cleanup
        requests.delete(f"{API}/products/{d['id']}", headers=admin_h(admin_token), timeout=15)

    def test_branding_update_admin(self, admin_token):
        r = requests.put(f"{API}/branding", json={"hero_subtitle": "TEST subtitle"}, headers=admin_h(admin_token), timeout=15)
        assert r.status_code == 200
        assert r.json()["hero_subtitle"] == "TEST subtitle"

    def test_contact_update_admin(self, admin_token):
        r = requests.put(f"{API}/contact-settings", json={"address": "TEST Address Update"}, headers=admin_h(admin_token), timeout=15)
        assert r.status_code == 200
        assert r.json()["address"] == "TEST Address Update"

    def test_customers_list_admin(self, admin_token):
        r = requests.get(f"{API}/customers", headers=admin_h(admin_token), timeout=15)
        assert r.status_code == 200
        for c in r.json():
            assert "orders_count" in c and "total_spent" in c

    def test_admin_stats(self, admin_token):
        r = requests.get(f"{API}/admin/stats", headers=admin_h(admin_token), timeout=15)
        assert r.status_code == 200
        d = r.json()
        for k in ["total_products", "total_orders", "total_customers", "pending_orders", "revenue", "sales_chart", "status_breakdown"]:
            assert k in d
        assert len(d["sales_chart"]) == 7
