import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

interface Partner {
  type: string;
  name: string;
  address: string;
  phone?: string;
  isPremium?: boolean;
}

interface PointOfInterest {
  id: number;
  lat: number;
  lon: number;
  tags: { [key: string]: string };
  type: string;
  name: string;
  icon: string;
  color: [number, number, number];
  address?: string;
  website?: string;
  phone?: string;
  trackDistance?: number;
  resourceId: string;
  resourceCategoryId: string;
}

// Map of partner types to icons and colors
const TYPE_CONFIG: { [key: string]: { icon: string; color: [number, number, number] } } = {
  'ACCOMMODATION': { icon: 'bed', color: [0, 100, 255] },
  'FOOD/DRINKS': { icon: 'utensils', color: [255, 100, 0] },
  'DRINKS': { icon: 'glass-martini', color: [255, 50, 0] },
  'CULTURE': { icon: 'landmark', color: [150, 0, 150] },
  'BIKE SERVICE': { icon: 'bicycle', color: [0, 150, 0] },
  'CHECK POINT': { icon: 'flag-checkered', color: [255, 0, 0] },
  'GROCERY': { icon: 'shopping-bag', color: [0, 150, 150] },
  'CAMP AREA': { icon: 'campground', color: [100, 50, 0] },
  'FOOD': { icon: 'hamburger', color: [255, 100, 0] },
  'ARTISTRY': { icon: 'palette', color: [200, 0, 200] },
  'MUSEUM': { icon: 'university', color: [150, 0, 150] }
};

// Function to geocode an address
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    // Add Sardinia, Italy to the address for better results
    const fullAddress = `${address}, Sardinia, Italy`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Shardana-Partners-Geocoder/1.0'
      }
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon)
      };
    }
    return null;
  } catch (error) {
    console.error(`Error geocoding address: ${address}`, error);
    return null;
  }
}

// Function to convert partner to POI
function partnerToPOI(partner: Partner, index: number): PointOfInterest {
  const config = TYPE_CONFIG[partner.type] || { icon: 'map-marker', color: [100, 100, 100] };
  
  return {
    id: index + 1,
    lat: 0, // Will be filled by geocoding
    lon: 0, // Will be filled by geocoding
    tags: {
      'shardana': 'yes',
      'sardinia': 'yes',
      'type': partner.type.toLowerCase().replace('/', '-'),
      ...(partner.isPremium ? { 'premium': 'yes' } : {})
    },
    type: partner.type.toLowerCase().replace('/', '-'),
    name: partner.name,
    icon: config.icon,
    color: config.color,
    address: partner.address,
    phone: partner.phone,
    trackDistance: 0, // Will be calculated later if needed
    resourceId: `shardana-${index}`,
    resourceCategoryId: `shardana-${partner.type.toLowerCase().replace('/', '-')}`
  };
}

async function main() {
  try {
    // Read the partners JSON file
    const inputFile = path.join(__dirname, 'output', 'shardana-partners.json');
    const partners: Partner[] = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

    console.log(`Processing ${partners.length} partners...`);

    // Convert partners to POIs and geocode addresses
    const pois: PointOfInterest[] = [];
    for (let i = 0; i < partners.length; i++) {
      const partner = partners[i];
      const poi = partnerToPOI(partner, i);
      
      // Geocode the address
      const location = await geocodeAddress(partner.address);
      if (location) {
        poi.lat = location.lat;
        poi.lon = location.lon;
        pois.push(poi);
        console.log(`Geocoded ${i + 1}/${partners.length}: ${partner.name}`);
      } else {
        console.log(`Failed to geocode ${i + 1}/${partners.length}: ${partner.name}`);
      }

      // Add a small delay to respect Nominatim's usage policy
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Save POIs to JSON file
    const outputFile = path.join(__dirname, 'output', 'shardana-pois.json');
    fs.writeFileSync(outputFile, JSON.stringify(pois, null, 2), 'utf-8');
    console.log(`Saved ${pois.length} POIs to ${outputFile}`);

  } catch (error) {
    console.error('Error processing partners:', error);
  }
}

main(); 