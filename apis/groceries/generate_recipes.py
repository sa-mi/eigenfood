from google import genai

def generate_dishes(cuisine, store_info, budget, api_key):
    client = genai.Client(api_key=api_key)
    prompt = (
        f"You are a helpful chef assistant.\n"
        f"Given the grocery store '{store_info['name']}' at '{store_info['address']}', "
        f"generate 5 {cuisine} recipes that can be made within a budget of ${budget}. "
        "Provide the recipe names in comma seperated list of strings.\n"
        "Ensure the only thing listed are the recipe names and commas like a comma seperated list.\n"
    )
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )
    return [(i if i[0] != " " else i[1:]).replace('\n', '') for i in response.text.split(",")]

def generate_recipe(dish, store_info, budget, api_key):
    client = genai.Client(api_key=api_key)
    prompt = (
        f"You are a helpful chef assistant.\n"
        f"Given the grocery store '{store_info['name']}' at '{store_info['address']}',\n"
        f"Generate a full recipe for {dish} that can be made within a budget of ${budget}.\n"
        "Stay professional and minimize filler. No introduction.\n"
        "For this recipe, only provide:\n"
        "- Recipe name\n"
        "- List of ingredients with approximate quantity and cost (Be as specific as possible given the information. Use brand names if possible)\n"
        "- Brief cooking instructions\n"
        "- Estimated total cost\n"
    )
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )
    return [response.text]

if __name__ == "__main__":
    import os
    from dotenv import load_dotenv
    env = "C:\\Users\\cheng\\Documents\\My Documents\\code\\hackathons\\hackdavis2025\\food-deserts\\.env.local"
    load_dotenv(env)
    api_key = os.getenv("GEMINI_API_KEY")
    cuisine = input("cuisine name: ")
    store_name = input("store name: ")
    store_address = input("store address: ")
    budget = input("budget: ")
    print(generate_dishes(cuisine, {"name": store_name, "address": store_address}, budget, api_key))
    dish = input("dish name: ")
    print(generate_recipe(dish, {"name": store_name, "address": store_address}, budget, api_key))