import os
import requests
import json
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
from google import genai
from typing import List, Dict


# Load environment variables
load_dotenv("../.env.local")
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
    openai.api_key = os.getenv("OPENAI_API_KEY")
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
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=800,
        temperature=0.7,
    )
    return response.choices[0].text.strip()

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


