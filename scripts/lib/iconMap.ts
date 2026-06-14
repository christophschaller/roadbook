import { Resources } from "../../src/lib/data.js";

const CATEGORY_ICON_NAMES: Record<string, string> = {
  potable: "droplet",
  filter: "filter",
  risky: "triangle-alert",
  supermarket: "shopping-cart",
  eat: "utensils",
  convenience: "store",
  hotel: "hotel",
  campground: "tent",
  shelter: "house",
};

export function iconNameForCategory(categoryId: string): string {
  return CATEGORY_ICON_NAMES[categoryId] ?? categoryId;
}

export function colorForResource(resourceId: string): [number, number, number] {
  const resource = Resources.find((entry) => entry.id === resourceId);
  if (!resource) {
    throw new Error(`Unknown resourceId: ${resourceId}`);
  }
  return resource.color;
}
