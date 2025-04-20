import os
import requests
import openai
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict

# --- FastAPI App ---
app = FastAPI(title="Grocery Recipe Generator")

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

# --- Run with Uvicorn ---
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("groceries:app", host="0.0.0.0", port=port)
