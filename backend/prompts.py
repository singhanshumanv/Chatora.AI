SUGGEST_SYSTEM = """You are a culinary AI. When given user inputs, return ONLY valid JSON — no markdown, no code fences, no explanation.

Return exactly 3 recipe suggestions that best match what the user has. Be creative but practical."""

SUGGEST_PROMPT = """
User inputs:
- Ingredients available: {ingredients}
- Recipe/dish text: {recipe_text}
- Servings needed: {servings}
- Dietary restrictions: {dietary_flags}
- Cuisine preference: {cuisine_pref}

Return a JSON object with this exact shape:
{{
  "recipes": [
    {{
      "dish_name": "string",
      "cuisine": "string",
      "cook_time": "string (e.g. '20 mins')",
      "prep_time": "string (e.g. '10 mins')",
      "difficulty": "Easy | Medium | Hard",
      "match_percent": number (0-100, how well ingredients match),
      "short_description": "string (1-2 sentences)",
      "macros": {{
        "calories": number,
        "carbs_g": number,
        "protein_g": number,
        "fat_g": number,
        "fiber_g": number,
        "sugar_g": number,
        "sodium_mg": number
      }},
      "ingredients": [
        {{ "name": "string", "quantity": "string", "have": true/false }}
      ]
    }}
  ]
}}

Rules:
- match_percent reflects how many of the listed ingredients the user already has
- "have" is true only if the ingredient appears in the user's list (case-insensitive partial match is fine)
- Macros are per serving
- Return exactly 3 recipes
"""

GENERATE_SYSTEM = """You are a professional recipe writer. Return ONLY valid JSON — no markdown, no code fences, no explanation."""

GENERATE_PROMPT = """
Generate a detailed recipe for:
- Dish: {dish_name}
- Cuisine: {cuisine}
- Description: {short_description}
- Target servings: {servings} (original recipe was for {original_servings})
- Dietary flags: {dietary_flags}
- Ingredients the user has: {ingredients_have}
- All ingredients (with have flag): {all_ingredients}

Return this exact JSON shape:
{{
  "dish_name": "string",
  "cuisine": "string",
  "cook_time": "string",
  "prep_time": "string",
  "difficulty": "Easy | Medium | Hard",
  "servings": number,
  "macros_per_serving": {{
    "calories": number,
    "carbs_g": number,
    "protein_g": number,
    "fat_g": number,
    "fiber_g": number,
    "sugar_g": number,
    "sodium_mg": number
  }},
  "scaled_ingredients": [
    {{ "name": "string", "quantity": "string", "unit": "string", "have": true/false }}
  ],
  "scaling_notes": [
    {{ "ingredient": "string", "note": "string" }}
  ],
  "instructions": [
    {{ "step": number, "title": "string", "description": "string" }}
  ],
  "tips": ["string"],
  "variations": ["string"],
  "storage_instructions": "string",
  "buy_list": [
    {{ "name": "string", "quantity": "string", "unit": "string" }}
  ]
}}

Rules:
- Scale all ingredient quantities from {original_servings} to {servings} servings
- Add scaling_notes for ingredients that don't scale linearly (spices, salt, leavening agents)
- buy_list should only contain ingredients where have=false
- Instructions should be clear, numbered, with descriptive titles
- Tips and variations: 3-5 each
"""
