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
    for place in places[:3]:
        name = place.get("name")
        # Get three healthy options
        orders = get_healthy_orders(name, req.cals, req.budget)
        results.append(RecResult(name=name, calories=orders[0], price=orders[1], dish=orders[2]))
        results.append(RecResult(name=name, calories=orders[3], price=orders[4], dish=orders[5]))
        results.append(RecResult(name=name, calories=orders[6], price=orders[7], dish=orders[8]))

    return results

def get_healthy_orders(restaurant: str, cals: int, budget: float) -> List[str]:
    """Use Gemini to suggest three healthy menu items or substitutions."""
    prompt = (
        f"For the restaurant {restaurant}, suggest three healthy menu items or substitutions "
        f"under {cals} calories and ${budget} budget. Strictly give the output in the format 'calories1, price1, dish1, calories2, price2, dish2, ...'. Only include commas in the output. No extra text."
    )
    client = genai.Client(api_key=GEMINI_KEY)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )
    text = response.text.strip()

    suggestions = text.split(", ")
    return suggestions


