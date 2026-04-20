// ─── State ────────────────────────────────────────────────────────────────────
let currentCards = [];
let currentView = "input"; // input | cards | full
let activeTab = "search";  // search | saved

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const views = {
  input: document.getElementById("view-input"),
  cards: document.getElementById("view-cards"),
  full: document.getElementById("view-full"),
};
const tabs = {
  search: document.getElementById("tab-search"),
  saved: document.getElementById("tab-saved"),
};
const savedPanel = document.getElementById("saved-panel");

// ─── Init ─────────────────────────────────────────────────────────────────────
(async () => {
  await openDB();
  bindInputForm();
  bindTabs();
  showView("input");
})();

// ─── View switching ───────────────────────────────────────────────────────────
function showView(name) {
  Object.entries(views).forEach(([k, el]) => {
    el.classList.toggle("active", k === name);
  });
  currentView = name;
  savedPanel.classList.add("hidden");
  if (activeTab === "search") {
    tabs.search.classList.add("active");
    tabs.saved.classList.remove("active");
  }
}

// ─── Tabs ──────────────────────────────────────────────────────────────────────
function bindTabs() {
  tabs.search.addEventListener("click", () => {
    activeTab = "search";
    tabs.search.classList.add("active");
    tabs.saved.classList.remove("active");
    savedPanel.classList.add("hidden");
    showView(currentView === "input" ? "input" : currentView);
  });

  tabs.saved.addEventListener("click", async () => {
    activeTab = "saved";
    tabs.saved.classList.add("active");
    tabs.search.classList.remove("active");
    Object.values(views).forEach((el) => el.classList.remove("active"));
    savedPanel.classList.remove("hidden");
    await renderSavedRecipes();
  });
}

// ─── Input Form ───────────────────────────────────────────────────────────────
function bindInputForm() {
  const chipInput = document.getElementById("chip-input");
  const chipContainer = document.getElementById("chip-container");
  const form = document.getElementById("recipe-form");

  chipInput.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === ",") && chipInput.value.trim()) {
      e.preventDefault();
      addChip(chipInput.value.trim(), chipContainer);
      chipInput.value = "";
    }
  });

  chipContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("chip-remove")) {
      e.target.closest(".chip").remove();
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const ingredients = [...chipContainer.querySelectorAll(".chip-label")].map(
      (el) => el.textContent.trim()
    );
    const recipeText = document.getElementById("recipe-text").value.trim();

    if (!ingredients.length && !recipeText) {
      showToast("Add ingredients or describe a dish first.", "error");
      return;
    }

    const payload = {
      ingredients,
      recipe_text: recipeText,
      servings: parseInt(document.getElementById("servings").value) || 1,
      dietary_flags: [
        ...document.querySelectorAll(".dietary-flag:checked"),
      ].map((cb) => cb.value),
      cuisine_pref: document.getElementById("cuisine-pref").value,
    };

    setLoading(true);
    try {
      const data = await apiSuggest(payload);
      currentCards = data.recipes.map((r) => ({
        ...r,
        id: crypto.randomUUID(),
        thumbnail_url: pollinationsUrl(r.dish_name, r.cuisine),
        saved_at: Date.now(),
        full_recipe: null,
      }));
      await Promise.all(currentCards.map(saveRecipe));
      renderCards(currentCards);
      showView("cards");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  });
}

function addChip(text, container) {
  const chip = document.createElement("span");
  chip.className = "chip";
  chip.innerHTML = `<span class="chip-label">${escHtml(text)}</span><button class="chip-remove" type="button">×</button>`;
  container.insertBefore(chip, container.querySelector("#chip-input"));
}

// ─── Cards ────────────────────────────────────────────────────────────────────
function renderCards(cards) {
  const grid = document.getElementById("cards-grid");
  grid.innerHTML = "";

  cards.forEach((card, i) => {
    const el = buildCardElement(card, i);
    grid.appendChild(el);
  });

  document.getElementById("btn-new-search").onclick = () => showView("input");
}

function buildCardElement(card, index) {
  const wrap = document.createElement("div");
  wrap.className = "recipe-card";
  wrap.style.animationDelay = `${index * 0.08}s`;

  const haveIngredients = card.ingredients.filter((i) => i.have);
  const missIngredients = card.ingredients.filter((i) => !i.have);

  wrap.innerHTML = `
    <div class="card-img-wrap">
      <img src="${card.thumbnail_url}" alt="${escHtml(card.dish_name)}" loading="lazy" />
      <span class="match-badge">${card.match_percent}% match</span>
    </div>
    <div class="card-body">
      <h2 class="card-title">${escHtml(card.dish_name)}</h2>
      <div class="card-meta">
        <span>${escHtml(card.cuisine)}</span>
        <span class="dot">·</span>
        <span>${escHtml(card.difficulty)}</span>
        <span class="dot">·</span>
        <span>${escHtml(card.cook_time)}</span>
      </div>
      <p class="card-desc">${escHtml(card.short_description)}</p>
      <div class="macros-row">
        <div class="macro"><span class="macro-val">${card.macros.calories}</span><span class="macro-label">cal</span></div>
        <div class="macro"><span class="macro-val">${card.macros.carbs_g}g</span><span class="macro-label">carbs</span></div>
        <div class="macro"><span class="macro-val">${card.macros.protein_g}g</span><span class="macro-label">protein</span></div>
        <div class="macro"><span class="macro-val">${card.macros.fat_g}g</span><span class="macro-label">fat</span></div>
      </div>
      <div class="ingredients-list">
        ${haveIngredients.map((i) => `<span class="ing have">✓ ${escHtml(i.name)} <em>${escHtml(i.quantity)}</em></span>`).join("")}
        ${missIngredients.map((i) => `<span class="ing miss">✗ ${escHtml(i.name)} <em>${escHtml(i.quantity)}</em></span>`).join("")}
      </div>
      <button class="btn-generate" data-id="${card.id}">Generate Full Recipe</button>
    </div>
  `;

  wrap.querySelector(".btn-generate").addEventListener("click", () =>
    handleGenerateClick(card)
  );

  return wrap;
}

async function handleGenerateClick(card) {
  setLoading(true);
  try {
    const full = await apiGenerate({
      dish_name: card.dish_name,
      cuisine: card.cuisine,
      short_description: card.short_description,
      ingredients_have: card.ingredients.filter((i) => i.have).map((i) => i.name),
      all_ingredients: card.ingredients,
      servings: card.servings || 1,
      dietary_flags: card.dietary_flags || [],
      original_servings: card.original_servings || 1,
    });
    await updateFullRecipe(card.id, full);
    renderFullRecipe(full, card.thumbnail_url, card.id);
    showView("full");
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    setLoading(false);
  }
}

// ─── Full Recipe ──────────────────────────────────────────────────────────────
function renderFullRecipe(recipe, thumbnailUrl, cardId) {
  const container = document.getElementById("full-recipe-content");

  const scaled = recipe.scaled_ingredients || [];
  const haveScaled = scaled.filter((i) => i.have);
  const missScaled = scaled.filter((i) => !i.have);

  container.innerHTML = `
    <div class="full-hero">
      <img src="${thumbnailUrl || ""}" alt="${escHtml(recipe.dish_name)}" />
      <div class="full-hero-info">
        <h1 class="full-title">${escHtml(recipe.dish_name)}</h1>
        <div class="full-meta">
          <span>${escHtml(recipe.cuisine)}</span>
          <span class="dot">·</span>
          <span>${escHtml(recipe.difficulty)}</span>
          <span class="dot">·</span>
          <span>Prep ${escHtml(recipe.prep_time)}</span>
          <span class="dot">·</span>
          <span>Cook ${escHtml(recipe.cook_time)}</span>
          <span class="dot">·</span>
          <span>${recipe.servings} serving${recipe.servings !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>

    <section class="full-section">
      <h3 class="section-title">Macros per Serving</h3>
      <div class="macros-grid">
        ${macroItem("Calories", recipe.macros_per_serving.calories, "")}
        ${macroItem("Carbs", recipe.macros_per_serving.carbs_g, "g")}
        ${macroItem("Protein", recipe.macros_per_serving.protein_g, "g")}
        ${macroItem("Fat", recipe.macros_per_serving.fat_g, "g")}
        ${macroItem("Fiber", recipe.macros_per_serving.fiber_g, "g")}
        ${macroItem("Sugar", recipe.macros_per_serving.sugar_g, "g")}
        ${macroItem("Sodium", recipe.macros_per_serving.sodium_mg, "mg")}
      </div>
    </section>

    <section class="full-section">
      <h3 class="section-title">Ingredients</h3>
      <div class="ingredients-full">
        ${haveScaled.map((i) => `<div class="ing-row have">✓ <strong>${escHtml(i.quantity)} ${escHtml(i.unit)}</strong> ${escHtml(i.name)}</div>`).join("")}
        ${missScaled.map((i) => `<div class="ing-row miss">✗ <strong>${escHtml(i.quantity)} ${escHtml(i.unit)}</strong> ${escHtml(i.name)}</div>`).join("")}
      </div>
    </section>

    ${recipe.scaling_notes && recipe.scaling_notes.length ? `
    <section class="full-section">
      <h3 class="section-title">⚠ Scaling Notes</h3>
      ${recipe.scaling_notes.map((n) => `<div class="scaling-note"><strong>${escHtml(n.ingredient)}:</strong> ${escHtml(n.note)}</div>`).join("")}
    </section>` : ""}

    <section class="full-section">
      <h3 class="section-title">Instructions</h3>
      <ol class="instructions-list">
        ${recipe.instructions.map((step) => `
          <li class="instruction-step">
            <div class="step-num">${step.step}</div>
            <div class="step-body">
              <strong class="step-title">${escHtml(step.title)}</strong>
              <p>${escHtml(step.description)}</p>
            </div>
          </li>
        `).join("")}
      </ol>
    </section>

    ${recipe.tips && recipe.tips.length ? `
    <section class="full-section">
      <h3 class="section-title">💡 Tips</h3>
      <ul class="tips-list">${recipe.tips.map((t) => `<li>${escHtml(t)}</li>`).join("")}</ul>
    </section>` : ""}

    ${recipe.variations && recipe.variations.length ? `
    <section class="full-section">
      <h3 class="section-title">🔀 Variations</h3>
      <ul class="tips-list">${recipe.variations.map((v) => `<li>${escHtml(v)}</li>`).join("")}</ul>
    </section>` : ""}

    ${recipe.storage_instructions ? `
    <section class="full-section">
      <h3 class="section-title">📦 Storage</h3>
      <p class="storage-text">${escHtml(recipe.storage_instructions)}</p>
    </section>` : ""}

    ${recipe.buy_list && recipe.buy_list.length ? `
    <section class="full-section buy-list-section">
      <h3 class="section-title">🛒 Shopping List</h3>
      <div class="buy-list">
        ${recipe.buy_list.map((b) => `<div class="buy-item">☐ ${escHtml(b.quantity)} ${escHtml(b.unit)} <strong>${escHtml(b.name)}</strong></div>`).join("")}
      </div>
    </section>` : ""}
  `;

  document.getElementById("btn-back-cards").onclick = () => {
    if (activeTab === "saved") {
      tabs.saved.click();
    } else {
      showView("cards");
    }
  };
}

function macroItem(label, value, unit) {
  return `<div class="macro-card"><span class="macro-card-val">${value}${unit}</span><span class="macro-card-label">${label}</span></div>`;
}

// ─── Saved Recipes ─────────────────────────────────────────────────────────────
async function renderSavedRecipes() {
  const container = document.getElementById("saved-grid");
  container.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;

  const recipes = await getAllRecipes();
  container.innerHTML = "";

  if (!recipes.length) {
    container.innerHTML = `<p class="empty-msg">No saved recipes yet.</p>`;
    return;
  }

  recipes.forEach((card, i) => {
    const el = buildCardElement(card, i);

    el.querySelector(".btn-generate").addEventListener("click", async () => {
      if (card.full_recipe) {
        renderFullRecipe(card.full_recipe, card.thumbnail_url, card.id);
        savedPanel.classList.add("hidden");
        showView("full");
      } else {
        await handleGenerateClick(card);
        savedPanel.classList.add("hidden");
        showView("full");
      }
    });

    if (card.full_recipe) {
      el.querySelector(".btn-generate").textContent = "⚡ View Full Recipe";
    }

    container.appendChild(el);
  });

  document.getElementById("btn-clear-all").onclick = async () => {
    if (!confirm("Clear all saved recipes?")) return;
    await clearAll();
    await renderSavedRecipes();
    showToast("All recipes cleared.");
  };
}

// ─── Loading overlay ──────────────────────────────────────────────────────────
function setLoading(on) {
  document.getElementById("loading-overlay").classList.toggle("visible", on);
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg, type = "info") {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ─── Util ──────────────────────────────────────────────────────────────────────
function escHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
