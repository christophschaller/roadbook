import type { PointOfInterest } from "@/types";
import { nanoquery } from "@nanostores/query";

export const [createFetcherStore] = nanoquery({
  fetcher: async (...keys) => {
    const url = keys.join("");

    // Merge all POI section files when requesting the base POIs path
    if (url.endsWith("/data/pois/") || url.endsWith("/data/pois")) {
      const sections = [
        "Alps Divide ULTRA 2025 Section 1.json",
        "Alps Divide ULTRA 2025 Section 2.json",
        "Alps Divide ULTRA 2025 Section 3.json",
        "Alps Divide ULTRA 2025 Section 4.json",
        "Alps Divide ULTRA 2025 Section 5.json",
      ];

      const results: PointOfInterest[] = [];
      for (const file of sections) {
        const res = await fetch(`${url.endsWith("/") ? url : url + "/"}${file}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          results.push(
            ...data.map((poi: PointOfInterest) => ({
              ...poi,
              icon: resolveIconName(poi.resourceId, poi.resourceCategoryId),
            })),
          );
        }
      }
      return results;
    }

    const res = await fetch(url);
    return res.json();
  },
});

export const $poiStore = createFetcherStore<PointOfInterest[]>(["", "/data/pois/"]); 

// Map resource/category pair to an icon filename (without path)
function resolveIconName(resourceId?: string, categoryId?: string): string {
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

  if (!resourceId || !categoryId) return "bike"; // safe fallback present in /public/icons
  const group = map[resourceId];
  if (!group) return "bike";
  return group[categoryId] || "bike";
}
