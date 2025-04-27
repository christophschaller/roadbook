import { atom } from "nanostores";
import type { PointOfInterest } from "@/types";

export const favoritesStore = atom<string[]>([]);

// Load initial favorites from localStorage
const loadFavorites = (): PointOfInterest[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("favorites");
  return stored ? JSON.parse(stored) : [];
};

// Create the store with initial value from localStorage
// export const favoritesStore = atom<PointOfInterest[]>(loadFavorites());

// Subscribe to changes and save to localStorage
favoritesStore.subscribe((favorites) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }
});

// Helper functions to manage favorites
export const addFavorite = (poiId: string) => {
  if (!poiId) {
    console.warn("Cannot add favorite: POI ID is undefined");
    return;
  }
  const currentFavorites = favoritesStore.get();
  if (!currentFavorites.some((f) => f.toString() === poiId.toString())) {
    favoritesStore.set([...currentFavorites, poiId]);
  }
};

export const removeFavorite = (poiId: string) => {
  if (!poiId) {
    console.warn("Cannot remove favorite: POI ID is undefined");
    return;
  }
  const currentFavorites = favoritesStore.get();
  favoritesStore.set(currentFavorites.filter((f) => f.toString() !== poiId));
};

export const isFavorite = (poiId: string): boolean => {
  if (!poiId) {
    console.warn("Cannot check favorite status: POI ID is undefined");
    return false;
  }
  const currentFavorites = favoritesStore.get();
  return currentFavorites.some((f) => f.toString() === poiId);
};
