import { poiStore } from "@/stores/poiStore";

export const handleResourceChange = (id: string) => {
  const currentStore = poiStore.get();
  const updatedResourceMap = Object.fromEntries(
    Object.entries(currentStore).map(([resourceId, resourceData]) => [
      resourceId,
      {
        ...resourceData,
        active: resourceId === id,
      },
    ]),
  );
  poiStore.set({ pois: Object.values(updatedResourceMap) });
};