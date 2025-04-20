from fastapi import FastAPI
import generate_recipes as gr
import get_stores as gs
import os
from dotenv import load_dotenv

app = FastAPI()

load_dotenv(".env.local")

# returns store infos of multiple stores given location and max_price (int from 1 -> 4)
@app.get("/stores/{location}/{max_price}", response_model=dict)
async def get_stores(location: str, max_price: str):
    return gs.find_store("supermarket", location, max_price, os.getenv("GOOGLE_PLACES_API_KEY"))

# returns different dishes the specified store can create on budget
@app.get("/dishes/{cuisine}/{store_info}/{budget}", reponse_model=list)
async def get_dishes(cuisine: str, store_info: str, budget: str):
    return gr.generate_dishes(cuisine, store_info, budget, os.getenv("GEMINI_API_KEY"))

# returns recipe of dish using store info and budget (index 0 is the recipe)
@app.get("/cuisine/{dish}/{store_info}/{budget}", response_model=list)
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