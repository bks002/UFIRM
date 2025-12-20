const API = "https://api.urest.in:8096/api/propertytype";

export async function getAllPropertyTypes() {
  const res = await fetch(`${API}/getall`, {
    headers: { Accept: "application/json" }
  });
  if (!res.ok) throw new Error("Failed to fetch property types");
  return res.json();
}
