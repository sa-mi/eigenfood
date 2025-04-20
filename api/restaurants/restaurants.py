import os
import requests
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
from google import genai

# Load environment variables
load_dotenv("../../.env.local")
GOOGLE_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
if not GOOGLE_KEY:
    raise RuntimeError("GOOGLE_PLACES_API_KEY not loaded. Check your .env file.")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_KEY:
    raise RuntimeError("GEMINI_API_KEY not loaded. Check your .env file.")

app = FastAPI()

# Request payload
class RecRequest(BaseModel):
    location: str           # Address or "lat,lng"
    maxDistance: float      # in miles
    cuisine: str            # e.g. "Mexican"
    cals: int               # max calories per dish
    budget: float           # max dollars per dish

# Response payload\ n
class RecResult(BaseModel):
    name: str
    calories: str
    price: str
    dish: str



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

@app.post("/recs", response_model=List[RecResult])
def recs(req: RecRequest) -> List[RecResult]:
    # Determine coordinates
    if any(c.isalpha() for c in req.location):
        lat, lng = address_to_latlon(req.location)
    else:
        lat, lng = map(float, req.location.split(","))

    # Search for restaurants
    radius_m = int(req.maxDistance * 1609)
    places = search_place(f"{req.cuisine} restaurants", lat, lng, radius_m, GOOGLE_KEY)

    if not places:
        return []

    results: List[RecResult] = []
    # Limit to first 3 restaurants
    name = [place.get("name") for place in places[:3]]
        # Get three healthy options
    orders = get_healthy_orders(name, req.cals, req.budget)
    
    return [RecResult(dish=order[0], price=order[1][1:], calories=order[2], name=order[3]) for order in orders]
    

def get_healthy_orders(restaurants: str, cals: int, budget: float) -> List[str]:
    """Use Gemini to suggest three healthy menu items or substitutions."""
    prompt = (
        f"""You are a nutrition‐focused assistant.

Restaurants:
{restaurants}

Constraints:
- Maximum calories per dish: {cals}
- Maximum price per dish: ${budget}

For **each** restaurant in the list, suggest **exactly three** healthy menu items or substitutions that satisfy those constraints.

🔔 **Output** **only** a single comma‑separated **string** (no JSON, no bullets, no markdown fences, no extra text) in this exact pattern:

dish1, price1, calories1, restaurant1, dish2, price2, calories2, restaurant2, … , dish9, price9, calories9, restaurant9

—so you end up with 36 comma‑separated values (4 fields × 9 items) in one flat string.

"""
    )
    client = genai.Client(api_key=GEMINI_KEY)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )
    text = response.text.strip()

    suggestions = text.split(", ")


    new_lst = []
    for i in range(4, 40, 4):
        new_lst.append(suggestions[i-4:i])

    return new_lst


