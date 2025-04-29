import { persistentAtom } from "@nanostores/persistent";

export const favoritesStore = persistentAtom<string[]>("favoritesStore", [], {
  encode: JSON.stringify,
  decode: JSON.parse,
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
