import { Droplet } from "lucide-react"

const waterCategories = [
    {
        name: "Potable Water",
        id: "potable",
        icon: "https://unpkg.com/lucide-static@0.469.0/icons/droplet.svg",
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
    {
        name: "Filter Sources",
        id: "filter",
        icon: "https://unpkg.com/lucide-static@0.469.0/icons/filter.svg",
        active: true,
        tags: [
            ["man_made", "water_well"],
            ["natural", "spring"],
            ["water", "cenote"],
            ["water", "stream_pool"],
        ],
    },
    {
        name: "Risky Sources",
        id: "risky",
        icon: "https://unpkg.com/lucide-static@0.469.0/icons/triangle-alert.svg",
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
]

export const poiTypes = [
    {
        name: "Water",
        icon: Droplet,
        color: [94, 129, 255],
        categories: waterCategories,
    }
]
