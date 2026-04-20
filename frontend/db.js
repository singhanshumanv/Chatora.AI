const DB_NAME = "RecipeEngine";
const DB_VERSION = 1;
const STORE = "recipes";

let db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);

    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(STORE, { keyPath: "id" });
      }
    };

    req.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };

    req.onerror = () => reject(req.error);
  });
}

async function saveRecipe(recipe) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(recipe);
    tx.oncomplete = () => resolve(recipe);
    tx.onerror = () => reject(tx.error);
  });
}

async function getRecipe(id) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const req = database.transaction(STORE).objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function getAllRecipes() {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const req = database.transaction(STORE).objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result.reverse());
    req.onerror = () => reject(req.error);
  });
}

async function updateFullRecipe(id, full_recipe) {
  const existing = await getRecipe(id);
  if (!existing) throw new Error(`Recipe ${id} not found`);
  return saveRecipe({ ...existing, full_recipe });
}

async function clearAll() {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
