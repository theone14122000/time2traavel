/**
 * Factual city-coordinate lookup for the weather widget.
 * Used when a Destination row has no explicit coordinates — every value is
 * a public geographical fact, never marketing copy.
 */

export type CityCoords = {
  latitude: number;
  longitude: number;
};

/** Normalised place name → coordinates. */
const CITY_COORDINATES: Record<string, CityCoords> = {
  // India — hills
  shimla: { latitude: 31.1048, longitude: 77.1734 },
  manali: { latitude: 32.2396, longitude: 77.1887 },
  leh: { latitude: 34.1526, longitude: 77.5771 },
  ladakh: { latitude: 34.1526, longitude: 77.5771 },
  srinagar: { latitude: 34.0837, longitude: 74.7973 },
  dharamshala: { latitude: 32.219, longitude: 76.3234 },
  mcleodganj: { latitude: 32.2535, longitude: 76.3242 },
  darjeeling: { latitude: 27.036, longitude: 88.2627 },
  gangtok: { latitude: 27.3314, longitude: 88.6138 },
  nainital: { latitude: 29.3919, longitude: 79.4542 },
  rishikesh: { latitude: 30.0869, longitude: 78.2676 },
  mussoorie: { latitude: 30.4598, longitude: 78.0662 },
  "jim corbett": { latitude: 29.53, longitude: 78.7747 },
  // India — cities & coast
  delhi: { latitude: 28.6139, longitude: 77.209 },
  "new delhi": { latitude: 28.6139, longitude: 77.209 },
  jaipur: { latitude: 26.9124, longitude: 75.7873 },
  jodhpur: { latitude: 26.2389, longitude: 73.0243 },
  udaipur: { latitude: 24.5854, longitude: 73.7125 },
  goa: { latitude: 15.2993, longitude: 74.124 },
  mumbai: { latitude: 19.076, longitude: 72.8777 },
  pune: { latitude: 18.5204, longitude: 73.8567 },
  kochi: { latitude: 9.9312, longitude: 76.2673 },
  kovalam: { latitude: 8.3988, longitude: 76.9775 },
  munnar: { latitude: 10.0889, longitude: 77.0595 },
  bengaluru: { latitude: 12.9716, longitude: 77.5946 },
  chennai: { latitude: 13.0827, longitude: 80.2707 },
  hyderabad: { latitude: 17.385, longitude: 78.4867 },
  kolkata: { latitude: 22.5726, longitude: 88.3639 },
  varanasi: { latitude: 25.3176, longitude: 82.9739 },
  agra: { latitude: 27.1767, longitude: 78.0081 },
  "port blair": { latitude: 11.6234, longitude: 92.7265 },
  andaman: { latitude: 11.6234, longitude: 92.7265 },
  havelock: { latitude: 12.0167, longitude: 93.0 },
  "neil island": { latitude: 11.8333, longitude: 93.0333 },
  // Neighbour countries & beyond
  kathmandu: { latitude: 27.7172, longitude: 85.324 },
  pokhara: { latitude: 28.2096, longitude: 83.9856 },
  thimphu: { latitude: 27.4712, longitude: 89.6339 },
  paro: { latitude: 27.4034, longitude: 89.4136 },
  yangon: { latitude: 16.8409, longitude: 96.1735 },
  mandalay: { latitude: 21.9588, longitude: 96.0891 },
  dubai: { latitude: 25.2048, longitude: 55.2708 },
  "abu dhabi": { latitude: 24.4539, longitude: 54.3773 },
  bangkok: { latitude: 13.7563, longitude: 100.5018 },
  singapore: { latitude: 1.3521, longitude: 103.8198 },
  "kuala lumpur": { latitude: 3.139, longitude: 101.6869 },
  colombo: { latitude: 6.9271, longitude: 79.8612 },
  maldives: { latitude: 3.2028, longitude: 73.2207 },
  paris: { latitude: 48.8566, longitude: 2.3522 },
  london: { latitude: 51.5074, longitude: -0.1278 },
  "new york": { latitude: 40.7128, longitude: -74.006 },
  tokyo: { latitude: 35.6762, longitude: 139.6503 },
};

function normalise(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Looks up coordinates for a common city/place name, or null when unknown. */
export function lookupCityCoords(place: string): CityCoords | null {
  const key = normalise(place);
  if (!key) return null;

  const exact = CITY_COORDINATES[key];
  if (exact) return exact;

  // "Shimla, Himachal Pradesh" → "shimla"
  const firstToken = key.split(" ")[0];
  if (firstToken && firstToken !== key) {
    const byFirstToken = CITY_COORDINATES[firstToken];
    if (byFirstToken) return byFirstToken;
  }

  // Fuzzy: the place name starts with a known city ("Shimla District").
  for (const [name, coords] of Object.entries(CITY_COORDINATES)) {
    if (key.startsWith(`${name} `) || key === name) return coords;
  }

  return null;
}

const WMO_LABELS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Dense drizzle",
  56: "Freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Heavy rain showers",
  82: "Violent rain showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

export type WeatherSummary = {
  label: string;
  /** Rough visual bucket used to pick the widget icon. */
  bucket: "clear" | "cloudy" | "fog" | "rain" | "snow" | "storm";
};

/** Maps a WMO weather code to a short human label + icon bucket. */
export function describeWeatherCode(code: number | null | undefined): WeatherSummary {
  const value = typeof code === "number" && Number.isFinite(code) ? code : null;
  if (value === null) return { label: "Weather unavailable", bucket: "cloudy" };

  let bucket: WeatherSummary["bucket"] = "rain";
  if (value === 0 || value === 1) bucket = "clear";
  else if (value === 2 || value === 3) bucket = "cloudy";
  else if (value === 45 || value === 48) bucket = "fog";
  else if ((value >= 71 && value <= 77) || value === 85 || value === 86) bucket = "snow";
  else if (value >= 95) bucket = "storm";

  return { label: WMO_LABELS[value] ?? `Weather code ${value}`, bucket };
}
