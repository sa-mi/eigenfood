import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import httpx

load_dotenv()
GOOGLE_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
# NUTRI_ID   = os.getenv("NUTRITIONIX_APP_ID")
# NUTRI_KEY  = os.getenv("NUTRITIONIX_API_KEY")

app = FastAPI()

class RecRequest(BaseModel):
    lat: float
    lng: float
    moneyBudget: float
    calorieBudget: float
    maxDistance: float  # in miles
    cuisine: str

class RecItem(BaseModel):
    name: str
    distance: float
    avg_price: float
    healthy_order: str

@app.post("/recs", response_model=list[RecItem])
async def get_recs(req: RecRequest):
    # 1) Google Places nearby search
    places_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "key": GOOGLE_KEY,
        "location": f"{req.lat},{req.lng}",
        "radius": int(req.maxDistance * 1609),  # miles→meters
        "type": "restaurant",
        "keyword": req.cuisine
    }
    async with httpx.AsyncClient() as client:
        gp = await client.get(places_url, params=params)
    if gp.status_code != 200:
        raise HTTPException(502, "Places API error")
    results = gp.json().get("results", [])[:10]

    recs = []
    # 2) For each place, query Nutritionix and pick the lowest‐cal dish under budgets
    for place in results:
        name    = place["name"]
        vicinity= place.get("vicinity","")
        # Nutritionix natural nutrients endpoint
        nut_url = "https://trackapi.nutritionix.com/v2/natural/nutrients"
        headers = {
            "x-app-id":   NUTRI_ID,
            "x-app-key":  NUTRI_KEY,
            "Content-Type":"application/json"
        }
        payload = {"query": name}
        async with httpx.AsyncClient() as client:
            nut = await client.post(nut_url, json=payload, headers=headers)
        if nut.status_code != 200:
            continue
        foods = nut.json().get("foods", [])
        # filter by calorie budget, assume price ~$0.02 per kcal to approximate cost
        valid = [
          f for f in foods
          if f["nf_calories"] <= req.calorieBudget
             and (f["nf_calories"] * 0.02) <= req.moneyBudget
        ]
        if not valid:
            continue
        best = min(valid, key=lambda f: f["nf_calories"])
        # average price approx:
        avg_price = round(best["nf_calories"] * 0.02, 2)

        # distance (already filtered by radius; we could compute precise)
        recs.append(RecItem(
            name=name,
            distance=round(place["geometry"]["location"].get("lat",0) - req.lat, 2),  # placeholder
            avg_price=avg_price,
            healthy_order=f"{best['food_name']} ({int(best['nf_calories'])} kcal, ${avg_price})"
        ))
        if len(recs) >= 5:
            break

    return recs

