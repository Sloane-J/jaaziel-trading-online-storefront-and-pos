const LOCATIONIQ_API_KEY = process.env.LOCATIONIQ_API_KEY;

// Store's fixed origin coordinates (Madina, Accra, Ghana — matches your contact page).
const STORE_LAT = 5.6837;
const STORE_LNG = -0.1669;

async function geocodeArea(area: string): Promise<{ lat: number; lng: number }> {
  const url = `https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(
    `${area}, Accra, Ghana`,
  )}&format=json&limit=1`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Could not locate that area. Please check the spelling and try again.");
  }

  const results = (await res.json()) as { lat: string; lon: string }[];
  if (!results.length) {
    throw new Error("Could not locate that area. Please check the spelling and try again.");
  }

  return { lat: Number(results[0].lat), lng: Number(results[0].lon) };
}

// Returns the estimated driving distance (in km) between the store and a delivery area.
export async function getDistanceKm(area: string): Promise<number> {
  if (!LOCATIONIQ_API_KEY) {
    throw new Error("Delivery fee calculation is not configured. Please contact the store.");
  }

  const destination = await geocodeArea(area);

  // LocationIQ's Matrix API expects coordinates as longitude,latitude — opposite of the usual order.
  const coordinates = `${STORE_LNG},${STORE_LAT};${destination.lng},${destination.lat}`;
  const url = `https://us1.locationiq.com/v1/matrix/driving/${coordinates}?key=${LOCATIONIQ_API_KEY}&sources=0&destinations=1&annotations=distance`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Could not calculate delivery distance. Please try again.");
  }

  const data = (await res.json()) as { distances: number[][] };
  const distanceMeters = data.distances?.[0]?.[0];

  if (typeof distanceMeters !== "number") {
    throw new Error("Could not calculate delivery distance. Please try again.");
  }

  return distanceMeters / 1000;
}