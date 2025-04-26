import { atom } from "nanostores";
import type { PointOfInterest } from "@/types";

// Load initial favorites from localStorage
const loadFavorites = (): PointOfInterest[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("favorites");
  return stored ? JSON.parse(stored) : [];
};

// Create the store with initial value from localStorage
export const favoritesStore = atom<PointOfInterest[]>(loadFavorites());

// Subscribe to changes and save to localStorage
favoritesStore.subscribe((favorites) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }
});

// Helper functions to manage favorites
export const addFavorite = (poi: PointOfInterest) => {
  const currentFavorites = favoritesStore.get();
  if (!currentFavorites.some((f) => f.id === poi.id)) {
    favoritesStore.set([...currentFavorites, poi]);
  }
};

export const removeFavorite = (poiId: string) => {
  const currentFavorites = favoritesStore.get();
  favoritesStore.set(currentFavorites.filter((f) => f.id !== poiId));
};

export const isFavorite = (poiId: string): boolean => {
  const currentFavorites = favoritesStore.get();
  return currentFavorites.some((f) => f.id === poiId);
}; 