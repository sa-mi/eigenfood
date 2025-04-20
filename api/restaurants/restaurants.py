import os
import requests
import re
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
from google import genai

# Load environment variables
load_dotenv("../../.env.local")
GOOGLE_KEY = os.getenv("GOOGLE_PLACES_API_KEY") or (_ for _ in ()).throw(RuntimeError("GOOGLE_PLACES_API_KEY not loaded. Check your .env file."))
GEMINI_KEY = os.getenv("GEMINI_API_KEY") or (_ for _ in ()).throw(RuntimeError("GEMINI_API_KEY not loaded. Check your .env file."))

app = FastAPI()

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
Make sure the prices are realistic, nothing is free or too expensive.
If you dont know the price, simply put a random number 3 - 9 inclusive

 Output ONLY CSV lines, one per restaurant, in this exact format:
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
        print("Price: before ", price)
        print("Price: after ", price)
        results.append(RecResult(name=name, dish=dish, calories=calories, price=price))

    return results
