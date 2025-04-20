import os
import requests
import json
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
from google import genai
from typing import List, Dict
import re
from fastapi.middleware.cors import CORSMiddleware


# Load environment variables
load_dotenv("../.env.local")
GOOGLE_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
if not GOOGLE_KEY:
    raise RuntimeError("GOOGLE_PLACES_API_KEY not loaded. Check your .env file.")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_KEY:
    raise RuntimeError("GEMINI_API_KEY not loaded. Check your .env file.")

app = FastAPI()

origins = [
    "http://localhost:8081",
    # add any other origins you need, e.g. your mobile dev-client URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # or ["*"] to allow all
    allow_credentials=True,
    allow_methods=["*"],              # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],              # Authorization, Content-Type, etc.
)


def address_to_latlon(address: str) -> tuple[float, float]:
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {"address": address, "key": GOOGLE_KEY}
    resp = requests.get(url, params=params)
    resp.raise_for_status()
    data = resp.json()
    if data.get("status") != "OK":
        raise HTTPException(400, f"Geocode error: {data.get('status')}")
    loc = data["results"][0]["geometry"]["location"]
    return loc["lat"], loc["lng"]


def search_place(query: str, lat: float, lng: float, radius: int, api_key: str) -> list:
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lng}",
        "radius": radius,
        "type": "restaurant",
        "keyword": query,
        "maxprice": 1,
        "key": api_key,
    }
    resp = requests.get(url, params=params)
    resp.raise_for_status()
    return resp.json().get("results", [])


# Groceries

class StoreInfo(BaseModel):
    name: str
    address: str
    price_level: int

class GroceriesResponse(BaseModel):
    store: StoreInfo
    recipes: str    # Raw GPT output; parse if desired

# --- Core Functions ---
def find_cheapest_grocery(lat: float, lng: float, radius: int, max_price_level: int) -> Dict:
    """
    Uses Google Places Nearby Search to find the cheapest grocery/supermarket in the given radius.
    """
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "key": os.getenv("GOOGLE_API_KEY"),
        "location": f"{lat},{lng}",
        "radius": radius,
        "type": "grocery_or_supermarket",
        "maxprice": max_price_level,
    }
    resp = requests.get(url, params=params)
    resp.raise_for_status()
    places = resp.json().get("results", [])

    def price_level(place):
        return place.get("price_level", max_price_level + 1)

    sorted_places = sorted(places, key=price_level)
    if not sorted_places:
        raise RuntimeError("No grocery stores found within given parameters.")

    cheapest = sorted_places[0]
    return {
        "name": cheapest.get("name"),
        "address": cheapest.get("vicinity"),
        "price_level": cheapest.get("price_level", 0),
    }


def generate_recipes(cuisine: str, store_info: Dict, budget: float) -> str:
    """
    Queries OpenAI GPT to generate 5 recipes of the given cuisine
    using approximate ingredient costs within the specified budget.
    """
    prompt = (
        f"You are a helpful chef assistant.\n"
        f"Given the grocery store '{store_info['name']}' at '{store_info['address']}', "
        f"generate 5 {cuisine} recipes that can be made within a budget of ${budget}. "
        "For each recipe, provide in json:\n"
        "- Recipe name\n"
        "- List of ingredients with approximate quantity and cost\n"
        "- Brief cooking instructions\n"
        "- Estimated total cost\n"
    )
    client = genai.Client(api_key=GEMINI_KEY)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )
    return response.text.strip()

# --- API Endpoint ---
@app.get("/groceries", response_model=GroceriesResponse)
async def get_groceries(
    lat: float = Query(..., description="Latitude of search center"),
    lng: float = Query(..., description="Longitude of search center"),
    radius: int = Query(..., description="Search radius in meters"),
    max_price: int = Query(1, description="Max price level (0-4)"),
    cuisine: str = Query(..., description="Cuisine type for recipes"),
    budget: float = Query(..., description="Budget for total recipe cost in USD"),
):
    try:
        store = find_cheapest_grocery(lat, lng, radius, max_price)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

    recipes = generate_recipes(cuisine, store, budget)
    return {"store": store, "recipes": recipes}

class RecRequest(BaseModel):
    location: str           # Address or "lat,lng"
    maxDistance: float      # in miles
    cuisine: str            # e.g. "Mexican"
    cals: int               # max calories per dish
    budget: float           # max dollars per dish

class RecResult(BaseModel):
    name: str
    dish: str
    calories: str
    price: str


def address_to_latlon(address: str) -> tuple[float, float]:
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    resp = requests.get(url, params={"address": address, "key": GOOGLE_KEY})
    resp.raise_for_status()
    data = resp.json()
    if data.get("status") != "OK":
        raise HTTPException(400, f"Geocode error: {data.get('status')}")
    loc = data["results"][0]["geometry"]["location"]
    return loc["lat"], loc["lng"]


def search_place(query: str, lat: float, lng: float, radius: int) -> list:
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    resp = requests.get(url, params={
        "location": f"{lat},{lng}",
        "radius": radius,
        "type": "restaurant",
        "keyword": query,
        "maxprice": 1,
        "key": GOOGLE_KEY,
    })
    resp.raise_for_status()
    return resp.json().get("results", [])


def get_healthy_orders(restaurants: List[str], cals: int, budget: float) -> str:
    """Call Gemini once for all restaurants, output CSV lines."""
    prompt = f"""
You are a nutrition‐focused assistant.

Restaurants:
{restaurants}

Constraints:
- Max calories per dish: {cals}
- Max price per dish: ${budget}

For each restaurant, suggest exactly one healthy menu item or substitution under those constraints.

Output ONLY CSV lines, one per restaurant, in this exact format:
restaurant_name,dish_name,calories,price
No price is free or over 100 dollars. 
"""
    client = genai.Client(api_key=GEMINI_KEY)
    resp = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )
    text = resp.text.strip()
    # strip any markdown fences
    text = re.sub(r"^```[a-z]*\n", "", text)
    text = re.sub(r"\n```$", "", text)
    return text

@app.post("/recs", response_model=List[RecResult])
def recs(req: RecRequest) -> List[RecResult]:
    # Geocode or parse lat/lng
    if any(c.isalpha() for c in req.location):
        lat, lng = address_to_latlon(req.location)
    else:
        lat, lng = map(float, req.location.split(","))

    # Find restaurants
    radius_m = int(req.maxDistance * 1609)
    places = search_place(f"{req.cuisine} restaurants", lat, lng, radius_m)
    if not places:
        return []

    # Get first 3 names
    restaurant_names = [p.get("name") for p in places[:3]]
    csv_text = get_healthy_orders(restaurant_names, req.cals, req.budget)

    
    # Parse CSV lines
    lines = [line.strip() for line in csv_text.splitlines() if line.strip()]
    # No exceptions: pad/truncate lines to expected count
    expected = len(restaurant_names)
    if len(lines) < expected:
        lines += [""] * (expected - len(lines))
    elif len(lines) > expected:
        lines = lines[:expected]

    results: List[RecResult] = []
    for line in lines:
        parts = [p.strip() for p in line.split(",")]
        # pad/truncate parts to exactly 4 fields
        if len(parts) < 4:
            parts += [""] * (4 - len(parts))
        elif len(parts) > 4:
            parts = parts[:4]
        name, dish, calories, price = parts
        results.append(RecResult(name=name, dish=dish, calories=calories, price=price))

    return results