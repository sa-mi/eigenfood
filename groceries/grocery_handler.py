from fastapi import FastAPI
import generate_recipes as gr
import get_stores as gs
import os
from dotenv import load_dotenv

app = FastAPI()

load_dotenv(".env.local")

@app.get("/stores/{location}/{max_price}")
async def get_stores(location: str, max_price: str):
    return gs.find_store("supermarket", location, max_price, os.getenv("GOOGLE_PLACES_API_KEY"))

@app.get("/dishes/{cuisine}/{store_info}/{budget}")
async def get_dishes(cuisine: str, store_info: str, budget: str):
    return gr.generate_dishes(cuisine, store_info, budget, os.getenv("GEMINI_API_KEY"))

@app.get("/cuisine/{dish}/{store_info}/{budget}")
async def get_recipe(dish: str, store_info: str, budget: str):
    return gr.generate_recipe(dish, store_info, budget, os.getenv("GEMINI_API_KEY"))

if __name__ == "__main__":
    cuisine = input("cuisine name: ")
    store_name = input("store name: ")
    store_address = input("store address: ")
    budget = input("budget: ")
    print(get_dishes(cuisine, {"name": store_name, "address": store_address}, budget))
    dish = input("dish name: ")
    print(get_recipe(dish, {"name": store_name, "address": store_address}, budget))