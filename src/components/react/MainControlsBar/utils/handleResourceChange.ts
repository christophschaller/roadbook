import { resourceStateStore } from "@/stores/resourceStore";

export const handleResourceChange = (id: string) => {
  const currentStore = resourceStateStore.get();
  const updatedResourceMap = Object.fromEntries(
    Object.entries(currentStore).map(([resourceId, resourceData]) => [
      resourceId,
      {
        ...resourceData,
        active: resourceId === id,
      },
    ]),
  );
  resourceStateStore.set(updatedResourceMap);
};