import requests  # safe to use here since it's sync
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import os
from dotenv import load_dotenv
import openai

load_dotenv()
GOOGLE_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
print(GOOGLE_KEY)
if not GOOGLE_KEY:
    raise RuntimeError("GOOGLE_PLACES_API_KEY not loaded. Check .env file.")
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
print(OPENAI_KEY)
if not OPENAI_KEY:
    raise RuntimeError("OPENAI_KEY not loaded. Check .env file.")
openai.api_key = OPENAI_KEY

app = FastAPI()


class RecRequest(BaseModel):
    lat: float
    lng: float
    moneyBudget: str
    calorieBudget: str
    maxDistance: float  # in miles
    cuisine: str

class RecItem(BaseModel):
    name: str
    distance: float
    avg_price: float
    healthy_order: str

def search_place(query: str, lat: float, lng: float, api_key: str):
    base_url = "https://maps.googleapis.com/maps/api/place/textsearch/json?"
    params = {
        "query": query,
        "location": f"{lat},{lng}",
        "type": "restaurant",
        "maxprice": 1,
        "key": api_key,
    }
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return None

@app.post("/llm-rest-recs", response_model=List)
async def get_llm_recs(req: RecRequest):
    restaurant = req[0]



@app.post("/rest-recs", response_model=List)
async def get_recs(req: RecRequest):
    cuisine = req.cuisine.strip() or "restaurants"
    query = f"{cuisine} restaurants"
    data = search_place(query, req.lat, req.lng, GOOGLE_KEY)

    if not data or "results" not in data:
        raise HTTPException(status_code=502, detail="Google API error or no results")

    places = data["results"][:10]
    if not places:
        print("Did not work")
        return []
    
    names = []
    for place in places:
        names.append(place["name"])

    prompt = (
        "Suggest a healthy order or substitution under "
        f"{int(req.calorieBudget)} calories and ${req.moneyBudget} budget for these restaurants:\n"
        + "\n".join(f"- {name}" for name in names)
    )

    client = openai.OpenAI()

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        suggestions_text = response.choices[0].message.content
    except Exception as e:
        raise HTTPException(502, f"LLM error: {e}")

    suggestion_lines = [line.strip("- ").strip() for line in suggestions_text.split("\n") if line.strip()]
    print(suggestion_lines)
    # recs = []
    # for i, place in enumerate(places):
    #     name = place["name"]
    #     suggestion = suggestion_lines[i] if i < len(suggestion_lines) else "No suggestion"
    #     lat_diff = abs(place["geometry"]["location"]["lat"] - req.lat)
    #     lng_diff = abs(place["geometry"]["location"]["lng"] - req.lng)
    #     approx_dist = round((lat_diff**2 + lng_diff**2)**0.5 * 69, 2)  # rough miles
    #
    #     recs.append(RecItem(
    #         name=name,
    #         distance=approx_dist,
    #         avg_price=req.moneyBudget,  # no real price data from Google
    #         healthy_order=suggestion
    #     ))
    #
    #     if len(recs) >= 5:
    #         break

    recs = []
    for i, place in enumerate(places):
        name = place["name"]
        suggestion = suggestion_lines[i] if i < len(suggestion_lines) else "No suggestion"
        lat_diff = abs(place["geometry"]["location"]["lat"] - req.lat)
        lng_diff = abs(place["geometry"]["location"]["lng"] - req.lng)
        approx_dist = round((lat_diff**2 + lng_diff**2)**0.5 * 69, 2)  # rough miles

        recs.append(RecItem(
            name=name,
            distance=approx_dist,
            avg_price=req.moneyBudget,  # no real price data from Google
            healthy_order=suggestion
        ))

        if len(recs) >= 5:
            break

    return recs

def address_to_latlon(address: str):
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": address,
        "key": os.getenv("GOOGLE_API_KEY")
    }
    resp = requests.get(url, params=params)
    resp.raise_for_status()
    data = resp.json()
    if data["status"] != "OK":
        raise RuntimeError(data["status"])
    loc = data["results"][0]["geometry"]["location"]
    return loc["lat"], loc["lng"]

lat, lon = address_to_latlon("1600 Amphitheatre Pkwy, Mountain View, CA")
print(lat, lon)

