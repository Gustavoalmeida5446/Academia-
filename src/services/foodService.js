function normalizeFoodSearchItem(item) {
  const nutriments = item?.nutriments || {};
  const protein = nutriments.proteins_100g ?? nutriments.proteins ?? 0;
  const calories = nutriments["energy-kcal_100g"] ?? nutriments["energy-kcal"] ?? 0;
  const carbs = nutriments.carbohydrates_100g ?? nutriments.carbohydrates ?? 0;
  const fat = nutriments.fat_100g ?? nutriments.fat ?? 0;

  return {
    id: item.code || crypto.randomUUID(),
    externalId: item.code || "",
    name: item.product_name || item.generic_name || "Alimento sem nome",
    protein: Number(protein) || 0,
    calories: Number(calories) || 0,
    carbs: Number(carbs) || 0,
    fat: Number(fat) || 0,
    servingSize: 100,
    servingUnit: "g",
    source: "api"
  };
}

export async function searchFoodsFromApi(query) {
  if (!query || query.trim().length < 2) return [];

  const endpoints = [
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&json=1&page_size=16`,
    `https://us.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&json=1&page_size=16`
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) continue;

      const data = await response.json();
      const products = Array.isArray(data?.products) ? data.products : [];
      const normalized = products
        .map(normalizeFoodSearchItem)
        .filter((item) => item.name && (item.protein || item.calories))
        .slice(0, 12);

      if (normalized.length) return normalized;
    } catch {
      continue;
    }
  }

  return [];
}
