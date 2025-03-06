import { Droplet, Filter, TriangleAlert, Utensils, Store, ShoppingCart } from "lucide-react"
import type { Category, PoiType } from "@/types/poi.types"

const waterCategories: { [key: string]: Category } = {
    "potable": {
        name: "Potable Water",
        id: "potable",
        icon: Droplet,
        active: true,
        tags: [
            ["amenity", "drinking_water"],
            ["man_made", "water_tap"],
            ["man_made", "drinking_fountain"],
            ["water_source", "main"],
            ["amenity", "water_point"],
            ["amenity", "toilets"],
        ],
    },
    "filter": {
        name: "Filter Sources",
        id: "filter",
        icon: Filter,
        active: true,
        tags: [
            ["man_made", "water_well"],
            ["natural", "spring"],
            ["water", "cenote"],
            ["water", "stream_pool"],
        ],
    },
    "risky": {
        name: "Risky Sources",
        id: "risky",
        icon: TriangleAlert,
        active: false,
        tags: [
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
}

const foodCategories: { [key: string]: Category } = {
    "supermarket": {
        name: "Food Markets",
        id: "supermarket",
        icon: ShoppingCart,
        active: true,
        tags: [
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
        ]
    },
    "eat": {
        name: "Quick Bites",
        id: "eat",
        icon: Utensils,
        active: true,
        tags: [
            ["amenity", "restaurant"],
            ["amenity", "fast_food"],
            ["amenity", "cafe"],
            ["amenity", "food_truck"],
            ["amenity", "pub"],
            ["amenity", "biergarten"],
            ["amenity", "food_court"],
            ["amenity", "ice_cream"],
            ["amenity", "snack_bar"],
        ]
    },
    "convenience": {
        name: "Mini-Marts",
        id: "convenience",
        icon: Store,
        active: true,
        tags: [
            ["shop", "convenience"],
            ["shop", "kiosk"],
            ["shop", "mini_mart"],
            ["shop", "general"],
            ["amenity", "fuel"],
            ["street_vendor", "yes"],
        ]
    },
}

export const poiTypes: PoiType[] = [
    {
        name: "Water",
        id: "water",
        icon: Droplet,
        color: [94, 129, 255],
        active: true,
        distance: 500,
        minDistance: 500,
        maxDistance: 5000,
        categories: waterCategories,
    },
    {
        name: "Food",
        id: "food",
        icon: ShoppingCart,
        color: [255, 225, 53],
        active: false,
        distance: 500,
        minDistance: 500,
        maxDistance: 5000,
        categories: foodCategories,
    }
]
