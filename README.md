<div align="center">

# 🍳 Chatora.AI
### *"Let the AI Cook..."*

**Built at home. Submitted at Hack-Your-Way 2026 · AI/ML Track · Envisage · TMSL Kolkata**

---

![FastAPI](https://img.shields.io/badge/FastAPI-0e0e0e?style=for-the-badge&logo=fastapi&logoColor=009688)
![Python](https://img.shields.io/badge/Python-0e0e0e?style=for-the-badge&logo=python&logoColor=3776AB)
![JavaScript](https://img.shields.io/badge/Vanilla_JS-0e0e0e?style=for-the-badge&logo=javascript&logoColor=F7DF1E)
![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-0e0e0e?style=for-the-badge&logo=google&logoColor=4285F4)
![Pollinations](https://img.shields.io/badge/Pollinations_AI-0e0e0e?style=for-the-badge&logo=image&logoColor=c9a96e)
![License](https://img.shields.io/badge/license-MIT-0e0e0e?style=for-the-badge)

</div>

---

## 🤌 What is this?

You open the fridge. Stare at some random stuff. Close it. Open it again. Order Zomato.

**Chatora.AI is the intervention you needed.**

Toss in whatever's in your kitchen — `aloo`, `eggs`, `that sad half-onion in the corner` — and Chatora's AI gives you 3 real recipe suggestions with match scores, full macros, and a shopping list for whatever you're missing.

Pick a recipe. Get the full thing. Scaled to however many people you're feeding. With smart adjustments because no, doubling the salt is NOT how scaling works.

The tagline is on the homepage for a reason: **Let the AI Cook.** 🤌

---

## ✨ Features

- 🤖 **AI Recipe Suggestions** — 3 cards per search, ranked by ingredient match %
- 📏 **Smart Scaling** — spices, salt, and leavening don't scale 1:1. Chatora knows.
- 📊 **Full Macros** — calories (kcal), carbs, protein, fat, fiber, sugar, sodium per serving
- 🛒 **Auto Buy List** — only the ingredients you're actually missing
- 🖼️ **AI Dish Thumbnails** — Pollinations Flux model generates food photography per card
- 💾 **Offline Cache** — IndexedDB saves everything. Revisit any recipe instantly. No repeat AI calls.
- 🔍 **Saved Recipe Search** — search through your saved recipes by name
- 🔄 **Provider Agnostic** — swap Gemini for GPT-4o or any OpenAI-compatible API via `.env`
- 🌙 **Dark mode only** — light mode is not on the roadmap. Ever.

---

## 🗂️ Project Structure

```
Chatora.AI/
├── backend/
│   ├── main.py         ← FastAPI · 2 endpoints · serves the frontend too
│   ├── models.py       ← Pydantic request validation
│   └── prompts.py      ← All AI prompt templates (strict JSON output)
│
├── frontend/
│   ├── index.html      ← HTML skeleton + "Let the AI Cook..." tagline
│   ├── style.css       ← Full dark warm design system · 16k chars
│   ├── db.js           ← IndexedDB: save, get, update, search, clear
│   ├── api.js          ← fetch → /api/suggest, /api/generate + Pollinations image gen
│   └── app.js          ← All UI logic · 3 views · animations · 18k chars
│
├── .env.example        ← Copy → .env → drop your keys in
├── .gitignore
├── requirements.txt
└── README.md
```

---

## 🚀 Running It

### 1. Clone

```bash
git clone https://github.com/shumaqueraza/Chatora.AI.git
cd Chatora.AI
```

### 2. Add your keys

```bash
cp .env.example .env
```

```env
API_KEY=your_key_here
BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
MODEL_NAME=gemini-2.5-flash
```

> Swap `BASE_URL` and `MODEL_NAME` for any OpenAI-compatible provider. Zero code changes.

### 3. Run

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**One terminal. That's it.**

→ App: http://localhost:8000  
→ Swagger docs: http://localhost:8000/docs

---

## 🔌 API

### `POST /api/suggest`
Ingredients or dish description → 3 recipe cards with macros + match %.

```json
{
  "ingredients": ["aloo", "pyaaz", "jeera"],
  "recipe_text": "",
  "servings": 2,
  "dietary_flags": ["Vegan"],
  "cuisine_pref": "Indian"
}
```

**Two modes, auto-detected:**
- `recipe_text` filled → **Scale Mode** (scales your recipe to target servings)
- `ingredients` filled → **Suggest Mode** (AI picks 3 recipes from what you have)

---

### `POST /api/generate`
Selected card → full detailed recipe, scaled.

```json
{
  "dish_name": "Aloo Jeera",
  "cuisine": "Indian",
  "short_description": "...",
  "servings": 4,
  "original_servings": 1,
  "dietary_flags": [],
  "ingredients_have": ["aloo", "jeera", "oil"],
  "all_ingredients": [...]
}
```

Response includes:
- Scaled ingredient list (✅ have / ❌ missing)
- ⚠️ Non-linear scaling notes per ingredient
- Step-by-step instructions with titles
- Tips, variations, storage instructions
- 🛒 Buy list (missing items + exact quantities)

---

## 🎨 Design

No framework. Pure CSS. Dark and warm.

```
#0e0e0e  bg          #141414  card surface
#f0ece4  text        #7a7570  muted
#c9a96e  gold        #6aab7a  have ✅
#e05a4e  missing ❌  #232323  border

Playfair Display  →  headings, dish names
Cabinet Grotesk   →  everything else
```

Animations: spring-bounce buttons, staggered card entrances, skeleton loading shimmer, smooth view fades.

---

## 🧠 Under the Hood

No LangChain. No LangGraph. No 300MB of dependencies. Just clean prompts.

```
Form submit
  → Pydantic validates request
  → Prompt built from template
  → One OpenAI-compatible API call
  → JSON cleaned (strips rogue markdown fences)
  → Returned to frontend
  → Pollinations generates dish image in parallel
  → Card saved to IndexedDB
```

The prompts (`prompts.py`) enforce strict JSON schemas directly in the prompt text — no post-processing magic needed.

---

## 📦 Dependencies

```txt
fastapi
uvicorn
openai
python-dotenv
pydantic
```

Five. That's the entire backend. Frontend is zero-dependency vanilla JS. 🫡

---

## 🏆 Hackathon

**Hack-Your-Way 2026** — AI/ML Track 003  
Envisage · Techno Main Salt Lake, Kolkata · April 2026

---


## 👨‍💻 Team

Built with conviction for the **Hack Your Way Hackathon by TMSL, Kolkata**:

<table>
  <tr>
    <td align="center">
      <b>Shumaque Raza</b>
    </td>
    <td align="center">
      <b>Anirban Goswami</b>
    </td>
    <td align="center">
      <b>Anshuman Kumar Singh</b>
    </td>
  </tr>
</table>

---

## 📄 License

MIT — cook whatever you want with this code.  
Just don't blame us if the AI tells you to put pineapple on pizza. 🍍
