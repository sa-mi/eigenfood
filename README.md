# EigenFood
EigenFood is a mobile app built to support individuals living in food deserts—especially those from underrepresented or low-income communities—by making healthy eating more accessible and affordable.

Users simply input their preferences such as location, cuisine, budget, and dietary goals. The app then returns a list of nearby restaurants that match those needs, along with healthy meal suggestions or substitutions tailored to each menu.

## GIF Demo

<p style="display: flex; align-items: center; gap: 1rem;">
  <img
    src="https://github.com/user-attachments/assets/df597f76-2381-4eb8-a17b-8e9ab80a9a57"
    alt="Landscape demo"
    width="55%"
  />
  <img
    src="https://github.com/user-attachments/assets/e4ec3379-3a35-46ae-b4e6-6eec60523b15"
    alt="Mobile demo"
    width="45%"
  />
</p>


## 💡 Why EigenFood?
Millions of people in the U.S. live in food deserts—areas with limited access to affordable and nutritious food. EigenFood aims to bridge that gap with smart technology, helping users make informed, healthy food choices without added cost or effort.

## 🔧 How It Works
User Input: Enter location, cuisine, dietary goals, and budget.

Restaurant Search: The backend uses the Google Places API to find relevant nearby restaurants.

Healthy Suggestions: Google Gemini LLM reviews those restaurants and suggests healthier menu options or substitutions.

Results: The user receives a curated list of nearby restaurants, each with a healthy, affordable meal recommendation.

## 🧰 Tech Stack
Frontend: React Native with Expo Go

Backend: FastAPI

APIs:

Google Places API

Google Gemini LLM (via prompt-based meal filtering)

## 🚀 Getting Started
Clone the repo and install dependencies:

```
git clone [https://github.com/DanielLi030809/eigenfood.git](https://github.com/DanielLi030809/eigenfood)
cd eigenfood
```

Install frontend packages:

```
cd eigenfood
npm install
npx expo start
```

Run backend server:

```
cd backend
pip install -r requirements.txt
fastapi dev combined.py
```
Make sure to add your API keys in .env files for both frontend and backend.

🌍 Built For
People living in food deserts

Low-income and underserved communities

Anyone seeking affordable, healthier food options near them

📫 Contact
For questions, ideas, or collaborations, feel free to reach out or open an issue.
