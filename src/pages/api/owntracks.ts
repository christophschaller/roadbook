import type { APIRoute } from "astro";
import fs from "fs/promises";
import path from "path";

let riderData: any = null;

async function loadRiderData() {
  if (riderData === null) {
    const dataPath = path.resolve("./data/shardana_riders.json");
    const fileContent = await fs.readFile(dataPath, "utf-8");
    riderData = JSON.parse(fileContent);
  }
  return riderData;
}

export const GET: APIRoute = async () => {
  const username = import.meta.env.OWNTRACKS_USERNAME;
  const password = import.meta.env.OWNTRACKS_PASSWORD;
  const auth = Buffer.from(`${username}:${password}`).toString("base64");

  const riderData = loadRiderData();

  const response = await fetch(
    "https://tracking.roadbook.bike/owntracks/api/0/last",
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    },
  );

  if (!response.ok) {
    return new Response(JSON.stringify(null), { // TODO: better error handling on client side
      status: 500,
    });
  }

  const data = await response.json();
  const riders = await riderData;
  data.forEach((item: any) => {
    const rider = riders[item.username];
    if (rider) {
      item.type = "rider";
      item.display_name = rider.display_name;
      item.cap_number = rider.cap_number;
    }
  });

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
