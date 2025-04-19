import requests
import os
from dotenv import load_dotenv
env = "C:\\Users\\cheng\\Documents\\My Documents\\code\\hackathons\\hackdavis2025\\food-deserts\\.env.local"
load_dotenv(env)

def find_store(query, location, max_price, api_key):
    # Base URL
    base_url = "https://maps.googleapis.com/maps/api/place/textsearch/json?"
    # Parameters in a dictionary
    params = {
        "query": query,
        "rankby": "distance",
        "location": location,
        "type": "grocery_or_supermarket|food|supermarket",
        "maxprice": max_price,
        "key": api_key,
    }
    # Send request and capture response
    response = requests.get(base_url, params=params)
    # Check if the request was successful
    if response.status_code == 200:
        return response.json()
    else:
        return None

if __name__ == "__main__":
    query = input('Search query: ')
    result = find_store(query, "37.427944,-121.913667", 1, os.getenv('GOOGLE_PLACES_API_KEY'))
    print(result)
    for store in result["results"]:
        for property in store:
            print(property + ": " + str(store[property]))

