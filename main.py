from decimal import FloatOperation
import requests  # safe to use here since it's sync
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
GOOGLE_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
print(GOOGLE_KEY)
if not GOOGLE_KEY:
    raise RuntimeError("GOOGLE_PLACES_API_KEY not loaded. Check .env file.")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
print(GEMINI_KEY)
if not GEMINI_KEY:
    raise RuntimeError("GEMINI_KEY not loaded. Check .env file.")

app = FastAPI()


class RecRequest(BaseModel):
    location: str
    moneyBudget: str
    calorieBudget: str
    maxDistance: float  # in miles
    cuisine: str

class RecItem(BaseModel):
    name: str
    distance: float
    avg_price: float
    healthy_order: str

class ItemLLM(BaseModel):
    restaurant: str
    cals: str
    budget: str

def search_place(query: str, lat, lng, api_key: str):
    base_url = "https://maps.googleapis.com/maps/api/place/textsearch/json?"
    params = {
        "query": query,
        "location": f"{float(lat)},{float(lng)}",
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
async def get_llm_recs(req: ItemLLM):

    prompt = (
        "Suggest a healthy order or substitution under "
        f"{req.cals if req.cals else "200-3000"} calories and ${req.budget if req.budget else "$5-$100"} budget for the restaurant: {req.restaurant}.\n Ensure the only thing listed is the healthy order or substitution with no unnecessary text. No markdown.\n"
            )

    client = genai.Client(api_key=GEMINI_KEY)

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        suggestions_text = response.text
    except Exception as e:
        raise HTTPException(502, f"LLM error: {e}")

    suggestion_lines = [line.strip("- ").strip() for line in suggestions_text.split("\n") if line.strip()]
    print(suggestion_lines)
    new_lst = []
    new_lst.append(suggestions_text[:-2])
    return new_lst

@app.post("/rest-recs", response_model=List)
async def get_recs(req: RecRequest):
    def contains_letters(text):
        for char in text:
            if char.isalpha():
                return True
        return False

    if contains_letters(req.location):
        lat, lng = address_to_latlon(req.location)
    else:
        print(tuple(req.location[1:-1].split(", ")))
        lat, lng = tuple(req.location[1:-1].split(", "))
    cuisine = req.cuisine.strip() or "restaurants"
    query = f"{cuisine} restaurants"
    print(f"{float(lat)},{float(lng)}")
    data = search_place(query, float(lat), float(lng), GOOGLE_KEY)

    print(data)

    if not data or "results" not in data:
        raise HTTPException(status_code=502, detail="Google API error or no results")

    places = data["results"][:10]
    if not places:
        print("Did not work")
        return []
    
    names = []
    for place in places:
        names.append(place["name"])

    return names

 
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
    return tuple([loc["lat"], loc["lng"]])

# lat, lon = address_to_latlon("1600 Amphitheatre Pkwy, Mountain View, CA")
# print(lat, lon)

