import {
  Droplet,
  Filter,
  TriangleAlert,
  Utensils,
  Store,
  ShoppingCart,
  Hotel,
  Tent,
  House,
  Bed,
} from "lucide-react";
import type {
  ResourceCategory,
  Resource,
  ResourceCategoryState,
  ResourceState,
} from "@/types/resource.types";

// --- static data ---
const waterCategories: { [key: string]: ResourceCategory } = {
  potable: {
    name: "Potable Water",
    id: "potable",
    icon: Droplet,
    // active: true,
    osmTags: [
      ["amenity", "drinking_water"],
      ["man_made", "water_tap"],
      ["man_made", "drinking_fountain"],
      ["water_source", "main"],
      ["amenity", "water_point"],
      ["amenity", "toilets"],
    ],
  },
  filter: {
    name: "Filter Sources",
    id: "filter",
    icon: Filter,
    // active: true,
    osmTags: [
      ["man_made", "water_well"],
      ["natural", "spring"],
      ["water", "cenote"],
      ["water", "stream_pool"],
    ],
  },
  risky: {
    name: "Risky Sources",
    id: "risky",
    icon: TriangleAlert,
    // active: false,
    osmTags: [
      ["amenity", "toilets"],
      ["waterway", "river"],
      ["waterway", "stream"],
      ["waterway", "ditch"],
      ["waterway", "drain"],
      ["waterway", "canal"],
      ["natural", "water"],
      ["water", "lake"],
      ["water", "pond"],
      ["water", "oxbow"],
      ["water", "rapids"],
      ["water", "lagoon"],
      ["water", "reflecting_pool"],
      ["landuse", "reservoir"],
      ["water", "reservoir"],
      ["water", "basin"],
      ["water", "moat"],
      ["water", "harbour"],
      ["water", "lock"],
      ["water", "fish_pass"],
    ],
  },
};

const foodCategories: { [key: string]: ResourceCategory } = {
  supermarket: {
    name: "Food Markets",
    id: "supermarket",
    icon: ShoppingCart,
    // active: true,
    osmTags: [
      ["shop", "supermarket"],
      ["shop", "grocery"],
      ["shop", "hypermarket"],
      ["shop", "wholesale"],
      ["shop", "food"],
      ["shop", "farm"],
      ["shop", "greengrocer"],
      ["shop", "bakery"],
      ["shop", "butcher"],
      ["shop", "deli"],
      ["shop", "confectionery"],
      ["shop", "organic"],
      ["amenity", "marketplace"],
    ],
  },
  eat: {
    name: "Quick Bites",
    id: "eat",
    icon: Utensils,
    // active: true,
    osmTags: [
      ["amenity", "restaurant"],
      ["amenity", "fast_food"],
      ["amenity", "cafe"],
      ["amenity", "food_truck"],
      ["amenity", "pub"],
      ["amenity", "biergarten"],
      ["amenity", "food_court"],
      ["amenity", "ice_cream"],
      ["amenity", "snack_bar"],
    ],
  },
  convenience: {
    name: "Mini-Marts",
    id: "convenience",
    icon: Store,
    // active: true,
    osmTags: [
      ["shop", "convenience"],
      ["shop", "kiosk"],
      ["shop", "mini_mart"],
      ["shop", "general"],
      ["amenity", "fuel"],
      ["street_vendor", "yes"],
    ],
  },
};

const sleepCategories: { [key: string]: ResourceCategory } = {
  hotel: {
    name: "Hotels",
    id: "hotel",
    icon: Hotel,
    osmTags: [
      ["tourism", "hotel"],
      ["tourism", "motel"],
      ["tourism", "hostel"],
      ["tourism", "guest_house"],
      ["tourism", "apartment"],
      ["tourism", "chalet"],
      ["tourism", "alpine_hut"],
    ],
  },
  campground: {
    name: "Campgrounds",
    id: "campground",
    icon: Tent,
    osmTags: [
      ["amenity", "campground"],
      ["amenity", "camp_site"],
      ["amenity", "camping"],
    ],
  },
  shelter: {
    name: "Shelters",
    id: "shelter",
    icon: House,
    osmTags: [
      ["amenity", "shelter"],
      ["tourism", "wilderness_hut"],
    ],
  },
};

export const Resources: Resource[] = [
  {
    name: "Water",
    id: "water",
    icon: Droplet,
    color: [64, 153, 255],
    minDistance: 500,
    maxDistance: 5000,
    categories: waterCategories,
  },
  {
    name: "Food",
    id: "food",
    icon: ShoppingCart,
    color: [255, 171, 64],
    minDistance: 500,
    maxDistance: 5000,
    categories: foodCategories,
  },
  {
    name: "Sleep",
    id: "sleep",
    icon: Bed,
    color: [0, 128, 0],
    minDistance: 500,
    maxDistance: 5000,
    categories: sleepCategories,
  }
];

// --- defaults for user state ---
export const DefaultResourceState: Record<string, ResourceState> = {
  water: {
    active: true,
    distance: 600,
    categoryStates: {
      potable: {
        active: true,
      },
      filter: {
        active: true,
      },
      risky: {
        active: false,
      },
    },
  },
  food: {
    active: false,
    distance: 500,
    categoryStates: {
      supermarket: {
        active: true,
      },
      eat: {
        active: true,
      },
      convenience: {
        active: true,
      },
    },
  },
  sleep: {
    active: false,
    distance: 500,
    categoryStates: {
      hotel: {
        active: true,
      },
      campground: {
        active: true,
      },
      shelter: {
        active: false,
      },
    },
  },
};
