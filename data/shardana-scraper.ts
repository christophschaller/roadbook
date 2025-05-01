import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

interface Partner {
  type: string;
  name: string;
  address: string;
  phone?: string;
  isPremium?: boolean;
}

async function scrapeShardanaPartners(): Promise<Partner[]> {
  const url = 'https://www.shardana-bikeventure.com/de/partners';
  const partners: Partner[] = [];

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Find all elements with class T7n0L6
    $('.T7n0L6').each((index: number, element: cheerio.Element) => {
      const $element = $(element);
      const text = $element.text().trim();
      
      // Split the text into lines and clean it up
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      
      if (lines.length >= 2) {
        // First line contains type, name, and possibly premium status
        const firstLine = lines[0];
        const isPremium = firstLine.includes('PREMIUM');
        
        // Extract type and name
        let type = '';
        let name = '';
        
        // Known types of establishments
        const types = ['ACCOMMODATION', 'FOOD/DRINKS', 'DRINKS', 'CULTURE', 'BIKE SERVICE', 'CHECK POINT', 'GROCERY', 'CAMP AREA', 'FOOD', 'ARTISTRY', 'MUSEUM'];
        
        // Find the type in the first line
        for (const possibleType of types) {
          if (firstLine.includes(possibleType)) {
            type = possibleType;
            // Name is everything after the type and any special markers
            name = firstLine
              .substring(firstLine.indexOf(possibleType) + possibleType.length)
              .replace('PREMIUM', '')
              .replace('%', '')
              .trim();
            break;
          }
        }
        
        // Get address from the next non-empty line that's not a phone number
        const addressLines: string[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.startsWith('Tel.') && !line.includes('MORE INFO')) {
            addressLines.push(line);
          }
        }
        const address = addressLines.join(', ');
        
        // Find phone number (usually starts with Tel.)
        const phoneLine = lines.find(line => line.startsWith('Tel.'));
        let phone = undefined;
        if (phoneLine) {
          phone = phoneLine
            .replace('Tel.', '')
            .replace('WHATSAPP', '')
            .replace('MORE INFO', '')
            .trim();
        }

        if (type && name) {
          partners.push({
            type,
            name,
            address,
            phone,
            isPremium
          });
        }
      }
    });

    return partners;
  } catch (error) {
    console.error('Error scraping partners:', error);
    throw error;
  }
}

// Save partners to JSON file
async function savePartnersToJson(partners: Partner[]): Promise<void> {
  const outputDir = path.join(__dirname, 'output');
  const outputFile = path.join(outputDir, 'shardana-partners.json');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save partners to JSON file
  fs.writeFileSync(
    outputFile,
    JSON.stringify(partners, null, 2),
    'utf-8'
  );

  console.log(`Partners data saved to ${outputFile}`);
}

// Example usage
async function main() {
  try {
    const partners = await scrapeShardanaPartners();
    console.log(`Found ${partners.length} partners`);
    await savePartnersToJson(partners);
  } catch (error) {
    console.error('Failed to scrape partners:', error);
  }
}

main();

