enum FILTER {
  Water = "water",
  Food = "food",
  Shelter = "shelter",
  // Add more filter types here as needed
}

enum WATER_SUB_FITER {
  FreshWater = "freshWater",
  Well = "well",
  Stream = "stream"
}

enum FOOD_SUB_FILTER {
  Grocery = "grocery",
  Restaurant = "restaurant"
}

enum SHELTER_SUB_FILTER {
  Campsite = "campsite",
  Hut = "hut"
}

type GeoJSONGeometry = 
  | { type: "Point"; coordinates: [number, number] }
  | { type: "LineString"; coordinates: [number, number][] }
  | { type: "Polygon"; coordinates: [ [number, number][] ] };

type Filter =
  | {
      type: FILTER.Water;
      distance: number;
      activeSubFilters: WATER_SUB_FITER[];
    }
  | {
      type: FILTER.Food;
      distance: number;
      activeSubFilters: FOOD_SUB_FILTER[];
    }
  | {
      type: FILTER.Shelter;
      distance: number;
      activeSubFilters: SHELTER_SUB_FILTER[];
    };

type Track = {
  name: string;
  color: string;
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
};

type CustomElement = {
  name: string;
  color: string;
  geometry: GeoJSONGeometry;
};

type CustomElementGroup = {
  groupName: string;
  color: string;
  groupCoord: [number, number];
  elements: CustomElement[];
};

type RouteData = {
  slug: string;
  passwordHash: string;
  name: string;
  tracks: Track[];
  filters: Filter[];
  customElementGroups: CustomElementGroup[];
  createdAt: string; // ISO timestamp
  lastUpdatedAt: string; // ISO timestamp
};
