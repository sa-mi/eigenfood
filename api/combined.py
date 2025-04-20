import os
import requests
import json
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import grocery.generate_recipes as gr
import grocery.get_stores as gs
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
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:8081"],   # or ["*"] if no credentials
  allow_methods=["OPTIONS", "GET", "POST"],  # explicitly list OPTIONS
  allow_headers=["*"],
  allow_credentials=False,                   # or True + specific origins
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



# returns store infos of multiple stores given location and max_price (int from 1 -> 4)
@app.get("/stores/{location}/{max_price}", response_model=dict)
async def get_stores(location: str, max_price: str):
    return gs.find_store("supermarket", location, max_price, os.getenv("GOOGLE_PLACES_API_KEY"))

# returns different dishes the specified store can create on budget
@app.get("/dishes/{cuisine}/{store_info}/{budget}", response_model=list)
async def get_dishes(cuisine: str, store_info: str, budget: str):
    return gr.generate_dishes(cuisine, store_info, budget, os.getenv("GEMINI_API_KEY"))

# returns recipe of dish using store info and budget (index 0 is the recipe)
@app.get("/cuisine/{dish}/{store_info}/{budget}", response_model=list)
async def get_recipe(dish: str, store_info: str, budget: str):
    return gr.generate_recipe(dish, store_info, budget, os.getenv("GEMINI_API_KEY"))

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

🔔 Output ONLY CSV lines, one per restaurant, in this exact format:
restaurant_name,dish_name,calories,price
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
    lines = [line.strip() for line in csv_text.split("\n") if line.strip()]
    if len(lines) != len(restaurant_names):
        raise HTTPException(
            502,
            detail=f"Expected {len(restaurant_names)} lines, got {len(lines)}: {lines}"
        )

    results: List[RecResult] = []
    for line in lines:
        parts = [p.strip() for p in line.split(",")]
        if len(parts) != 4:
            raise HTTPException(
                502,
                detail=f"Invalid CSV format: '{line}'"
            )
        name, dish, calories, price = parts
        results.append(RecResult(name=name, dish=dish, calories=calories, price=price))

    return results
