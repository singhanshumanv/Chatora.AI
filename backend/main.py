import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from openai import OpenAI
from dotenv import load_dotenv

from models import SuggestRequest, GenerateRequest
from prompts import (
    SUGGEST_SYSTEM, SUGGEST_PROMPT,
    GENERATE_SYSTEM, GENERATE_PROMPT
)

load_dotenv()

app = FastAPI(title="Recipe Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    api_key=os.getenv("API_KEY"),
    base_url=os.getenv("BASE_URL"),
)
MODEL = os.getenv("MODEL_NAME", "gemini-2.5-flash")


def call_ai(system: str, user: str) -> dict:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.7,
    )
    raw = response.choices[0].message.content.strip()
    # Strip markdown fences if model adds them anyway
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
        raw = raw.rsplit("```", 1)[0]
    return json.loads(raw)


@app.post("/api/suggest")
async def suggest(req: SuggestRequest):
    if not req.ingredients and not req.recipe_text:
        raise HTTPException(status_code=400, detail="Provide ingredients or a recipe description.")

    prompt = SUGGEST_PROMPT.format(
        ingredients=", ".join(req.ingredients) if req.ingredients else "none specified",
        recipe_text=req.recipe_text or "none",
        servings=req.servings,
        dietary_flags=", ".join(req.dietary_flags) if req.dietary_flags else "none",
        cuisine_pref=req.cuisine_pref or "any",
    )

    try:
        data = call_ai(SUGGEST_SYSTEM, prompt)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"AI returned invalid JSON: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return data


@app.post("/api/generate")
async def generate(req: GenerateRequest):
    prompt = GENERATE_PROMPT.format(
        dish_name=req.dish_name,
        cuisine=req.cuisine,
        short_description=req.short_description,
        servings=req.servings,
        original_servings=req.original_servings,
        dietary_flags=", ".join(req.dietary_flags) if req.dietary_flags else "none",
        ingredients_have=", ".join(req.ingredients_have) if req.ingredients_have else "none",
        all_ingredients=json.dumps(req.all_ingredients),
    )

    try:
        data = call_ai(GENERATE_SYSTEM, prompt)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"AI returned invalid JSON: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return data


app.mount("/", StaticFiles(directory="../frontend", html=True), name="static")