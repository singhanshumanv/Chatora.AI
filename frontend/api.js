const BASE = "http://localhost:8000";

async function apiSuggest(payload) {
  const res = await fetch(`${BASE}/api/suggest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

async function apiGenerate(payload) {
  const res = await fetch(`${BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

function pollinationsUrl(dishName, cuisine) {
  const prompt = encodeURIComponent(
    `${dishName} ${cuisine} food photography, overhead shot, dark moody background, professional plating, appetizing`
  );
  // width=400&height=300 for card thumbnails
  return `https://image.pollinations.ai/prompt/${prompt}?model=flux&width=800&height=700&nologo=true&seed=${Math.floor(Math.random() * 9999)}&key=pk_ebCkCGPi8nHcaQLZ`;
}
