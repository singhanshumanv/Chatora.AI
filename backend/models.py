from pydantic import BaseModel


class SuggestRequest(BaseModel):
    ingredients: list[str] = []
    recipe_text: str = ""
    servings: int = 1
    dietary_flags: list[str] = []
    cuisine_pref: str = ""


class GenerateRequest(BaseModel):
    dish_name: str
    cuisine: str
    short_description: str
    ingredients_have: list[str]
    all_ingredients: list[dict]
    servings: int = 1
    dietary_flags: list[str] = []
    original_servings: int = 1
