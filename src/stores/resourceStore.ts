import { atom, computed } from "nanostores";
import type { Resource, ResourceState, ResourceView } from "@/types";
import { Resources, DefaultResourceState } from "@/lib/data";

export const resourceStore = atom<Record<string, Resource>>(
  Object.fromEntries(Resources.map((resource) => [resource.id, resource])),
);

export const resourceStateStore =
  atom<Record<string, ResourceState>>(DefaultResourceState);

export const resourceViewStore = computed(
  [resourceStore, resourceStateStore],
  (resources, states): Record<string, ResourceView> =>
    Object.fromEntries(
      Object.values(resources).map((resourceDef) => {
        const state = states[resourceDef.id] ?? {};
        return [
          resourceDef.id,
          {
            ...resourceDef,
            active: state.active ?? true,
            distance: state.distance ?? resourceDef.maxDistance,
            categories: Object.fromEntries(
              Object.entries(resourceDef.categories).map(([catId, catDef]) => [
                catId,
                {
                  ...catDef,
                  active: state.categoryStates?.[catId]?.active ?? true,
                },
              ]),
            ),
          },
        ];
      }),
    ),
);
