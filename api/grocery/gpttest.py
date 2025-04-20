import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(".env.local")
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

response = client.chat.completions.create(
    model="gpt-4.1-nano-2025-04-14",
    messages=[{"role": "user", "content": "Write a one-sentence bedtime story about a unicorn."}]
)

print(response.choices[0].message.content)
