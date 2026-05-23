from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict


# ---------- DB ----------
mongo_url = os.getenv('MONGO_URL')
if not mongo_url:
    raise RuntimeError("Missing required env var MONGO_URL")

client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
db_name = os.getenv('DB_NAME', 'manghani_toy_world')
db = client[db_name]

# ---------- App ----------
app = FastAPI(title="Manghani Toy World API")
@app.get("/")
def home():
    return{
        "status": "online",
        "message": "Welcome to the Manghani Toy World API!",
        "docs": "/docs"
    }
    return {"message": "Welcome to the Manghani Toy World API!"}
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("Missing required env var JWT_SECRET")


# ---------- Helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------- Models ----------
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    role: str


class AuthResponse(BaseModel):
    token: str
    user: UserOut


class CategoryIn(BaseModel):
    name: str


class CategoryOut(BaseModel):
    id: str
    name: str
    slug: str


class ProductIn(BaseModel):
    title: str
    description: str = ""
    images: List[str] = []
    price: float
    discounted_price: Optional[float] = None
    stock: int = 0
    category_id: Optional[str] = None
    featured: bool = False


class ProductOut(ProductIn):
    id: str
    category_name: Optional[str] = None
    created_at: str


class CartItem(BaseModel):
    product_id: str
    title: str
    image: Optional[str] = None
    price: float
    qty: int


class OrderIn(BaseModel):
    items: List[CartItem]
    shipping_name: str
    shipping_phone: str
    shipping_address: str
    notes: Optional[str] = ""


class OrderStatusUpdate(BaseModel):
    status: str


class BrandingIn(BaseModel):
    brand_name: Optional[str] = None
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    banner_images: Optional[List[str]] = None
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None


class ContactIn(BaseModel):
    whatsapp_numbers: Optional[List[str]] = None
    phone_numbers: Optional[List[str]] = None
    address: Optional[str] = None
    map_embed_url: Optional[str] = None
    show_map: Optional[bool] = None
    instagram_url: Optional[str] = None
    youtube_url: Optional[str] = None




# ---------- Auth Routes ----------
@api_router.post("/auth/register", response_model=AuthResponse)
async def register(body: RegisterIn):
    email = body.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {
        "id": str(uuid.uuid4()),
        "name": body.name.strip(),
        "email": email,
        "password_hash": hash_password(body.password),
        "role": "customer",
        "created_at": now_iso(),
    }
    await db.users.insert_one(user)
    token = create_token(user["id"], user["role"])
    return {"token": token, "user": {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"]}}


@api_router.post("/auth/login", response_model=AuthResponse)
async def login(body: LoginIn):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"], user["role"])
    return {"token": token, "user": {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"]}}


@api_router.get("/auth/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return user


# ---------- Categories ----------
def _slugify(name: str) -> str:
    return "".join(c if c.isalnum() else "-" for c in name.lower()).strip("-")


@api_router.get("/categories", response_model=List[CategoryOut])
async def list_categories():
    cats = await db.categories.find({}, {"_id": 0}).to_list(500)
    return cats


@api_router.post("/categories", response_model=CategoryOut)
async def create_category(body: CategoryIn, _: dict = Depends(require_admin)):
    cat = {"id": str(uuid.uuid4()), "name": body.name.strip(), "slug": _slugify(body.name)}
    await db.categories.insert_one(cat)
    cat.pop("_id", None)
    return cat


@api_router.put("/categories/{cat_id}", response_model=CategoryOut)
async def update_category(cat_id: str, body: CategoryIn, _: dict = Depends(require_admin)):
    await db.categories.update_one({"id": cat_id}, {"$set": {"name": body.name.strip(), "slug": _slugify(body.name)}})
    cat = await db.categories.find_one({"id": cat_id}, {"_id": 0})
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat


@api_router.delete("/categories/{cat_id}")
async def delete_category(cat_id: str, _: dict = Depends(require_admin)):
    await db.categories.delete_one({"id": cat_id})
    return {"ok": True}


# ---------- Products ----------
async def _enrich_product(p: dict) -> dict:
    if p.get("category_id"):
        cat = await db.categories.find_one({"id": p["category_id"]}, {"_id": 0, "name": 1})
        p["category_name"] = cat["name"] if cat else None
    else:
        p["category_name"] = None
    return p


@api_router.get("/products", response_model=List[ProductOut])
async def list_products(
    q: Optional[str] = None,
    category_id: Optional[str] = None,
    featured: Optional[bool] = None,
    sort: Optional[str] = None,
    limit: int = 200,
):
    query = {}
    if q:
        query["title"] = {"$regex": q, "$options": "i"}
    if category_id:
        query["category_id"] = category_id
    if featured is not None:
        query["featured"] = featured
    cursor = db.products.find(query, {"_id": 0})
    if sort == "price_asc":
        cursor = cursor.sort("price", 1)
    elif sort == "price_desc":
        cursor = cursor.sort("price", -1)
    elif sort == "newest":
        cursor = cursor.sort("created_at", -1)
    products = await cursor.to_list(limit)
    for p in products:
        await _enrich_product(p)
    return products


@api_router.get("/products/{pid}", response_model=ProductOut)
async def get_product(pid: str):
    p = await db.products.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    await _enrich_product(p)
    return p


@api_router.post("/products", response_model=ProductOut)
async def create_product(body: ProductIn, _: dict = Depends(require_admin)):
    p = body.model_dump()
    p["id"] = str(uuid.uuid4())
    p["created_at"] = now_iso()
    await db.products.insert_one(p)
    p.pop("_id", None)
    await _enrich_product(p)
    return p


@api_router.put("/products/{pid}", response_model=ProductOut)
async def update_product(pid: str, body: ProductIn, _: dict = Depends(require_admin)):
    await db.products.update_one({"id": pid}, {"$set": body.model_dump()})
    p = await db.products.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    await _enrich_product(p)
    return p


@api_router.delete("/products/{pid}")
async def delete_product(pid: str, _: dict = Depends(require_admin)):
    await db.products.delete_one({"id": pid})
    return {"ok": True}


# ---------- Orders ----------
@api_router.post("/orders")
async def create_order(body: OrderIn, user: dict = Depends(get_current_user)):
    items = [i.model_dump() for i in body.items]
    total = sum(i["price"] * i["qty"] for i in items)
    order = {
        "id": str(uuid.uuid4()),
        "order_no": "MTW-" + datetime.now(timezone.utc).strftime("%y%m%d") + "-" + uuid.uuid4().hex[:6].upper(),
        "user_id": user["id"],
        "customer_name": user["name"],
        "customer_email": user["email"],
        "items": items,
        "total_price": round(total, 2),
        "status": "pending",
        "shipping_name": body.shipping_name,
        "shipping_phone": body.shipping_phone,
        "shipping_address": body.shipping_address,
        "notes": body.notes or "",
        "created_at": now_iso(),
        "status_history": [{"status": "pending", "at": now_iso()}],
    }
    await db.orders.insert_one(order)
    order.pop("_id", None)
    return order


@api_router.get("/orders/mine")
async def list_my_orders(user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return orders


@api_router.get("/orders/track/{order_no}")
async def track_order(order_no: str):
    order = await db.orders.find_one({"order_no": order_no}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@api_router.get("/orders")
async def list_orders(_: dict = Depends(require_admin)):
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders


@api_router.patch("/orders/{oid}/status")
async def update_order_status(oid: str, body: OrderStatusUpdate, _: dict = Depends(require_admin)):
    order = await db.orders.find_one({"id": oid}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    history = order.get("status_history", [])
    history.append({"status": body.status, "at": now_iso()})
    await db.orders.update_one({"id": oid}, {"$set": {"status": body.status, "status_history": history}})
    updated = await db.orders.find_one({"id": oid}, {"_id": 0})
    return updated


# ---------- Customers ----------
@api_router.get("/customers")
async def list_customers(_: dict = Depends(require_admin)):
    users = await db.users.find({"role": "customer"}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(1000)
    # add order count + total spent
    for u in users:
        orders = await db.orders.find({"user_id": u["id"]}, {"_id": 0, "total_price": 1}).to_list(1000)
        u["orders_count"] = len(orders)
        u["total_spent"] = round(sum(o.get("total_price", 0) for o in orders), 2)
    return users


# ---------- Branding ----------
DEFAULT_BRANDING = {
    "id": "branding",
    "brand_name": "Manghani Toy World",
    "logo_url": "https://customer-assets.manghani-toy-worldagent.com/job_toy-world-admin/artifacts/z4l3xaxx_logo.PNG",
    "favicon_url": "https://customer-assets.manghani-toy-worldagent.com/job_toy-world-admin/artifacts/z4l3xaxx_logo.PNG",
    "primary_color": "#C85A4F",
    "secondary_color": "#E1A140",
    "banner_images": [
        "https://static.prod-images.manghani-toy-worldagent.com/jobs/6a7ee1f7-7ad6-4f10-a934-f9445d1ad5c7/images/fc4c4300110c80fbe6039350f1f8d3665b8f65bc1683a1e99697f0e7b8acce1b.png",
    ],
    "hero_title": "Where Childhood Wonder Lives.",
    "hero_subtitle": "A boutique collection of premium, hand-picked toys for the modern Indian family. Crafted to spark imagination, built to last generations.",
}


@api_router.get("/branding")
async def get_branding():
    b = await db.branding.find_one({"id": "branding"}, {"_id": 0})
    return b or DEFAULT_BRANDING


@api_router.put("/branding")
async def update_branding(body: BrandingIn, _: dict = Depends(require_admin)):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    await db.branding.update_one({"id": "branding"}, {"$set": update}, upsert=True)
    b = await db.branding.find_one({"id": "branding"}, {"_id": 0})
    return b


# ---------- Contact ----------
DEFAULT_CONTACT = {
    "id": "contact",
    "whatsapp_numbers": ["+916375361590", "+918824837553"],
    "phone_numbers": ["+916375361590", "+918824837553"],
    "address": "Shree Talkish Mall, Near Madar Gate, Ajmer, Rajasthan, India",
    "map_embed_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3640.5!2d74.6399!3d26.4499!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDI2JzU5LjYiTiA3NMKwMzgnMjMuNiJF!5e0!3m2!1sen!2sin!4v1700000000000",
    "instagram_url": "",
    "youtube_url": "",
    "show_map": True,
}



@api_router.get("/contact-settings")
async def get_contact():
    c = await db.contact_settings.find_one({"id": "contact"}, {"_id": 0})
    return c or DEFAULT_CONTACT


@api_router.put("/contact-settings")
async def update_contact(body: ContactIn, _: dict = Depends(require_admin)):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    await db.contact_settings.update_one({"id": "contact"}, {"$set": update}, upsert=True)
    c = await db.contact_settings.find_one({"id": "contact"}, {"_id": 0})
    return c


# ---------- Admin Stats ----------
@api_router.get("/admin/stats")
async def admin_stats(_: dict = Depends(require_admin)):
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    total_customers = await db.users.count_documents({"role": "customer"})
    pending_orders = await db.orders.count_documents({"status": "pending"})

    # revenue
    orders = await db.orders.find({}, {"_id": 0, "total_price": 1, "created_at": 1, "status": 1}).to_list(2000)
    revenue = round(sum(o.get("total_price", 0) for o in orders if o.get("status") != "cancelled"), 2)

    # last 7 day sales
    by_day = {}
    today = datetime.now(timezone.utc).date()
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        by_day[d.isoformat()] = 0
    for o in orders:
        try:
            d = datetime.fromisoformat(o["created_at"]).date().isoformat()
            if d in by_day:
                by_day[d] += o.get("total_price", 0)
        except Exception:
            pass
    sales_chart = [{"date": k, "revenue": round(v, 2)} for k, v in by_day.items()]

    # status breakdown
    status_map = {}
    for o in orders:
        status_map[o.get("status", "pending")] = status_map.get(o.get("status", "pending"), 0) + 1
    status_breakdown = [{"status": k, "count": v} for k, v in status_map.items()]

    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_customers": total_customers,
        "pending_orders": pending_orders,
        "revenue": revenue,
        "sales_chart": sales_chart,
        "status_breakdown": status_breakdown,
    }


@api_router.get("/")
async def root():
    return {"message": "Manghani Toy World API"}


# ---------- Startup ----------
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("id", unique=True)
    await db.categories.create_index("id", unique=True)
    await db.orders.create_index("id", unique=True)
    await db.orders.create_index("order_no", unique=True)

    # seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@manghanitoyworld.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "name": "Store Admin",
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "created_at": now_iso(),
        })
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    # seed branding & contact
    if not await db.branding.find_one({"id": "branding"}):
        await db.branding.insert_one(DEFAULT_BRANDING.copy())
    if not await db.contact_settings.find_one({"id": "contact"}):
        await db.contact_settings.insert_one(DEFAULT_CONTACT.copy())

    # seed categories
    if await db.categories.count_documents({}) == 0:
        defaults = ["Soft Toys", "Educational", "Remote Control", "Board Games", "Dolls & Figures", "Outdoor & Sports", "Wooden Toys", "Building Blocks"]
        for name in defaults:
            await db.categories.insert_one({"id": str(uuid.uuid4()), "name": name, "slug": _slugify(name)})

    # seed products
    if await db.products.count_documents({}) == 0:
        cat_map = {}
        async for c in db.categories.find({}, {"_id": 0}):
            cat_map[c["name"]] = c["id"]

        samples = [
            {
                "title": "Classic Premium Teddy Bear",
                "description": "Heirloom-quality plush teddy bear crafted from ultra-soft organic cotton. A timeless companion designed to be loved for generations. Hand-finished with attention to every detail.",
                "images": ["https://static.prod-images.manghani-toy-worldagent.com/jobs/6a7ee1f7-7ad6-4f10-a934-f9445d1ad5c7/images/58041ea3c2488c6fa1328073a2068aa90dee1ac38501737e633033c46c8c0867.png"],
                "price": 2499, "discounted_price": 1899, "stock": 24, "category": "Soft Toys", "featured": True,
            },
            {
                "title": "Vintage Red RC Sports Car",
                "description": "Precision-engineered remote control sports car with smooth steering, durable suspension and a beautiful retro-modern finish. 2.4GHz controller included. Ages 6+.",
                "images": ["https://static.prod-images.manghani-toy-worldagent.com/jobs/6a7ee1f7-7ad6-4f10-a934-f9445d1ad5c7/images/e535252eb2fc02db09df62b1f51bd7ddb50895605104f13a190ce5fce7052432.png"],
                "price": 3999, "discounted_price": 3299, "stock": 12, "category": "Remote Control", "featured": True,
            },
            {
                "title": "Pastel Wooden Blocks Set",
                "description": "A 50-piece set of beautifully finished pastel wooden blocks. Smooth, splinter-free edges, water-based non-toxic paint. Encourages spatial reasoning and creativity from age 2+.",
                "images": ["https://static.prod-images.manghani-toy-worldagent.com/jobs/6a7ee1f7-7ad6-4f10-a934-f9445d1ad5c7/images/c6e6a34ff018b903b5efa7c11970bf5c876c6bc86725dbe84200fe7c6253b95d.png"],
                "price": 1799, "discounted_price": 1399, "stock": 36, "category": "Building Blocks", "featured": True,
            },
            {
                "title": "Handcrafted Wooden Animal Set",
                "description": "Each piece in this charming wooden animal set is hand-carved and finished with natural oils. A heirloom collection designed for storytelling and imaginative play.",
                "images": ["https://images.unsplash.com/photo-1714618888538-8d15a9228236?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHw0fHxoaWdoJTIwZW5kJTIwd29vZGVuJTIwdG95cyUyMGJvdXRpcXVlfGVufDB8fHx8MTc3ODgzOTAxMXww&ixlib=rb-4.1.0&q=85"],
                "price": 2299, "discounted_price": None, "stock": 18, "category": "Wooden Toys", "featured": True,
            },
            {
                "title": "Montessori Learning Tower",
                "description": "A premium educational toy set inspired by Montessori principles. Includes shape sorters, counting beads, lacing cards and a beautifully crafted wooden tray.",
                "images": ["https://images.unsplash.com/photo-1503455637927-730bce8583c0?w=1200&q=80"],
                "price": 3499, "discounted_price": 2899, "stock": 15, "category": "Educational", "featured": False,
            },
            {
                "title": "Heritage Chess & Board Game Set",
                "description": "A walnut-finished wooden chess board with hand-turned classic pieces. Doubles as a backgammon and checkers set. Stores beautifully on any shelf.",
                "images": ["https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=1200&q=80"],
                "price": 4299, "discounted_price": None, "stock": 9, "category": "Board Games", "featured": False,
            },
            {
                "title": "Porcelain Heritage Doll",
                "description": "Hand-painted porcelain doll with hand-stitched silk dress. Each piece is signed by the artisan. Designed as a collectible heirloom.",
                "images": ["https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=1200&q=80"],
                "price": 5999, "discounted_price": 4799, "stock": 6, "category": "Dolls & Figures", "featured": True,
            },
            {
                "title": "Premium Outdoor Cricket Set",
                "description": "Tournament-grade wooden bat, leather ball, stumps and bails. Crafted for serious play with a beautiful natural finish. Carry case included.",
                "images": ["https://images.unsplash.com/photo-1607734834519-d8576ae60ea4?w=1200&q=80"],
                "price": 2799, "discounted_price": 2299, "stock": 20, "category": "Outdoor & Sports", "featured": False,
            },
        ]
        for s in samples:
            cat_name = s.pop("category", None)
            doc = {
                "id": str(uuid.uuid4()),
                "title": s["title"],
                "description": s["description"],
                "images": s["images"],
                "price": s["price"],
                "discounted_price": s.get("discounted_price"),
                "stock": s["stock"],
                "category_id": cat_map.get(cat_name),
                "featured": s.get("featured", False),
                "created_at": now_iso(),
            }
            await db.products.insert_one(doc)


# ---------- Router include & CORS ----------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
