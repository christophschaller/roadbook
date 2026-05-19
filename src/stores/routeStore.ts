import { atom } from "nanostores";

export const $routeSlug = atom<string>("");

export function initRouteStores(slug: string): void {
  $routeSlug.set(slug);
}

