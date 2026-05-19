export function resolveIconName(
  resourceId?: string,
  categoryId?: string,
): string {
  const map: Record<string, Record<string, string>> = {
    water: {
      potable: "droplet",
      filter: "filter",
      risky: "triangle-alert",
    },
    food: {
      supermarket: "shopping-cart",
      eat: "utensils",
      convenience: "store",
    },
    sleep: {
      hotel: "hotel",
      campground: "tent",
      shelter: "house",
    },
    shardana: {
      restaurant: "utensils",
      bar: "wine",
      accomodation: "bed",
      campground: "tent",
      culture: "amphora",
      repair: "wrench",
    },
  };

  if (!resourceId || !categoryId) return "bike";
  const group = map[resourceId];
  if (!group) return "bike";
  return group[categoryId] || "bike";
}
