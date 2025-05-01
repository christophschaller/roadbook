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
  Goal,
  Wine,
  Wrench,
  Amphora,
} from "lucide-react";
import type {
  ResourceCategory,
  Resource,
  ResourceState,
} from "@/types/resource.types";

// --- static data ---
const waterCategories: { [key: string]: ResourceCategory } = {
  potable: {
    name: "Potable Water",
    id: "potable",
    icon: Droplet,
    description: "You should find potable water here.",
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
    description: "Filter or cook this water before drinking it!",
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
    description: "This water is not safe to drink!",
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
    description: "This place should sell a variety of foods.",
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
    description: "They probably have a fresh meal or snack.",
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
    description: "You will probably find some small snacks here.",
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
    description:
      "A roof over your head, a bed to sleep in, maybe even a hot shower.",
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
    description: "A place to pitch your tent.",
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
    description:
      "Looks like some kind of shelter. Make sure your are allowed to sleep in it!",
    osmTags: [
      ["amenity", "shelter"],
      ["tourism", "wilderness_hut"],
    ],
  },
};

const shardanaCategories: { [key: string]: ResourceCategory } = {
  // checkpoint: {
  //   name: "Checkpoints",
  //   id: "checkpoint",
  //   icon: Goal,
  //   description: "A place of wonder!",
  //   osmTags: [],
  // },
  restaurant: {
    name: "Restaurants",
    id: "restaurant",
    icon: Utensils,
    description: "Tasted by Sascha personally!",
    osmTags: [],
  },
  bar: {
    name: "Bars",
    id: "bar",
    icon: Wine,
    description: "David enjoyed this too much!",
    osmTags: [],
  },
  accomodation: {
    name: "Accomodation",
    id: "accomodation",
    icon: Bed,
    description: "A restful night awaits you!",
    osmTags: [],
  },
  campground: {
    name: "Campground",
    id: "campground",
    icon: Tent,
    description: "A night under the stars!",
    osmTags: [],
  },
  culture: {
    name: "Culture",
    id: "culture",
    icon: Amphora,
    description: "You will enjoy this!",
    osmTags: [],
  },
  repair: {
    name: "Bike Service",
    id: "repair",
    icon: Wrench,
    description: "Salvation!",
    osmTags: [],
  },
  // supermarket: {
  //   name: "Convenience",
  //   id: "supermarket",
  //   icon: Store,
  //   description: "They should have food!",
  //   osmTags: [],
  // },
};

export const Resources: Resource[] = [
  {
    name: "Shardana",
    id: "shardana",
    icon: "shardana.svg",
    color: [82, 38, 98],
    minDistance: 500,
    maxDistance: 5000,
    categories: shardanaCategories,
  },
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
  },
];

// --- defaults for user state ---
export const DefaultResourceState: Record<string, ResourceState> = {
  water: {
    active: true,
    distance: 700,
    categoryStates: {
      potable: {
        active: true,
      },
      filter: {
        active: false,
      },
      risky: {
        active: false,
      },
    },
  },
  food: {
    active: false,
    distance: 600,
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
  shardana: {
    active: false,
    distance: 800,
    categoryStates: {
      // checkpoint: {
      //   active: true,
      // },
      restaurant: {
        active: true,
      },
      bar: {
        active: true,
      },
      accomodation: {
        active: true,
      },
      campground: {
        active: true,
      },
      repair: {
        active: true,
      },
      culture: {
        active: true,
      },
      // supermarket: {
      //   active: true,
      // },
    },
  },
};
