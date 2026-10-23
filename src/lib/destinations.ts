import { DOMESTIC_DESTINATIONS } from "@/lib/domestic-destinations";

export type DestinationType = "domestic" | "international";

export type Destination = {
  slug: string;
  name: string;
  type: DestinationType;
  tagline: string;
  overview: string;
  knownFor: string[];
  bestTime: string;
  images: string[];
  coverIndex: number;
  /** Folder under public/images/destinations where the images live. */
  imageFolder: "destinations" | "destinations/international";
  /** Image tags used for filtering. */
  tags: string[];
  /** Visa/entry note (international only). */
  visaNote?: string;
  /** Weather note (appended to best time). */
  weatherNote?: string;
};

const INTERNATIONAL_DESTINATIONS: Destination[] = [
  {
    slug: "dubai",
    name: "Dubai (UAE)",
    type: "international",
    tagline: "Skylines, desert and city leisure",
    overview:
      "Dubai, in the United Arab Emirates, is known for its modern skyline, shopping, beaches and desert experiences. The city blends contemporary architecture with traditional markets and creek-side districts.",
    knownFor: ["Modern skyline", "Desert experiences", "Shopping and markets", "Beaches and waterfront"],
    bestTime: "Generally November to March, when temperatures are milder.",
    images: ["dubai1.jpg", "dubai2.jpg", "dubai3.jpg", "dubai4.jpg"],
    coverIndex: 0,
    imageFolder: "destinations/international",
    tags: ["city"],
    visaNote: "Entry and visa requirements differ by country and nationality and can change. Our team can guide you on the documents to arrange before you travel.",
    weatherNote: "General guidance only. Weather and conditions vary; our team can help you choose the right time.",
  },
  {
    slug: "nepal",
    name: "Nepal",
    type: "international",
    tagline: "Himalayan peaks, temples and valleys",
    overview:
      "Nepal, in the Himalayas, is known for its mountain scenery, ancient temples and stupas, and trekking routes. The Kathmandu Valley and Pokhara offer culture, lakes and mountain views.",
    knownFor: ["Himalayan scenery", "Temples and stupas", "Trekking routes", "Lakes and valleys"],
    bestTime: "Generally March to May and October to November for clearer views.",
    images: ["nepal1.jpg", "nepal2.jpg", "nepal3.jpg", "nepal4.jpg", "nepal5.jpg"],
    coverIndex: 0,
    imageFolder: "destinations/international",
    tags: ["mountains", "heritage", "spiritual"],
    visaNote: "Entry and visa requirements differ by country and nationality and can change. Our team can guide you on the documents to arrange before you travel.",
    weatherNote: "General guidance only. Weather and conditions vary; our team can help you choose the right time.",
  },
  {
    slug: "bhutan",
    name: "Bhutan",
    type: "international",
    tagline: "Monasteries, mountains and traditional culture",
    overview:
      "Bhutan, in the eastern Himalayas, is known for its hilltop monasteries, fortress-style dzongs, mountain landscapes and traditional culture.",
    knownFor: ["Monasteries and dzongs", "Mountain landscapes", "Traditional culture and festivals", "Walks and short hikes"],
    bestTime: "Generally March to May and September to November.",
    images: ["bhutan1.jpg", "bhutan2.jpg", "bhutan3.jpg", "bhutan4.jpg", "bhutan5.jpg", "bhutan6.jpg"],
    coverIndex: 0,
    imageFolder: "destinations/international",
    tags: ["mountains", "heritage", "spiritual"],
    visaNote: "Entry and visa requirements differ by country and nationality and can change. Our team can guide you on the documents to arrange before you travel.",
    weatherNote: "General guidance only. Weather and conditions vary; our team can help you choose the right time.",
  },
  {
    slug: "singapore",
    name: "Singapore",
    type: "international",
    tagline: "City, gardens and waterfront",
    overview:
      "Singapore is a compact island city-state known for its modern skyline, gardens, waterfront areas and varied food. Its neighbourhoods reflect a mix of cultures.",
    knownFor: ["Modern skyline", "Gardens and parks", "Food and neighbourhoods", "Waterfront and attractions"],
    bestTime: "Warm and humid all year; the drier months are usually February to April.",
    images: ["singapore1.jpg", "singapore2.jpg", "singapore3.jpg", "singapore4.jpg", "singapore5.jpg"],
    coverIndex: 0,
    imageFolder: "destinations/international",
    tags: ["city", "coast"],
    visaNote: "Entry and visa requirements differ by country and nationality and can change. Our team can guide you on the documents to arrange before you travel.",
    weatherNote: "General guidance only. Weather and conditions vary; our team can help you choose the right time.",
  },
  {
    slug: "sri-lanka",
    name: "Sri Lanka",
    type: "international",
    tagline: "Beaches, tea hills and ancient heritage",
    overview:
      "Sri Lanka, an island nation in the Indian Ocean, is known for its beaches, tea-covered hill country, wildlife parks and ancient heritage sites.",
    knownFor: ["Beaches and coastline", "Hill country and tea estates", "Wildlife parks", "Ancient heritage sites"],
    bestTime: "The season differs by coast; our team can advise based on the region you choose.",
    images: ["lanka1.jpg", "lanka2.jpg", "lanka3.jpg", "lanka4.jpg", "lanka5.jpg", "lanka6.jpg"],
    coverIndex: 0,
    imageFolder: "destinations/international",
    tags: ["coast", "heritage", "nature"],
    visaNote: "Entry and visa requirements differ by country and nationality and can change. Our team can guide you on the documents to arrange before you travel.",
    weatherNote: "General guidance only. Weather and conditions vary; our team can help you choose the right time.",
  },
];

// Domestic destinations mapped to unified type
const domesticMapped: Destination[] = DOMESTIC_DESTINATIONS.map((d) => ({
  slug: d.slug,
  name: d.name,
  type: "domestic" as const,
  tagline: d.tagline,
  overview: d.overview,
  knownFor: d.knownFor,
  bestTime: d.bestTime,
  images: d.images,
  coverIndex: d.coverIndex,
  imageFolder: "destinations" as const,
  tags: getDomesticTags(d.slug),
  visaNote: undefined,
  weatherNote: "General guidance only. Weather and conditions vary by region and year; our team can help you choose the right time.",
}));

function getDomesticTags(slug: string): string[] {
  switch (slug) {
    case "jammu-and-kashmir":
    case "himachal-pradesh":
    case "uttarakhand":
      return ["mountains", "spiritual"];
    case "assam":
      return ["nature"];
    case "gujarat":
      return ["heritage", "coast"];
    case "rajasthan":
      return ["heritage"];
    case "tamil-nadu":
      return ["heritage", "coast", "spiritual"];
    case "uttar-pradesh":
      return ["heritage", "spiritual"];
    default:
      return [];
  }
}

export const DESTINATIONS: readonly Destination[] = [
  ...domesticMapped,
  ...INTERNATIONAL_DESTINATIONS,
];

export function getDestination(slug: string): Destination | null {
  return DESTINATIONS.find((d) => d.slug === slug) ?? null;
}

export function getDomesticDestinations(): Destination[] {
  return DESTINATIONS.filter((d) => d.type === "domestic");
}

export function getInternationalDestinations(): Destination[] {
  return DESTINATIONS.filter((d) => d.type === "international");
}

export function getDestinationImageUrl(dest: Destination, file: string): string {
  return `/${dest.imageFolder}/${file}`;
}

export function coverFile(dest: Destination): string {
  const idx = Math.min(dest.coverIndex, dest.images.length - 1);
  return dest.images[idx >= 0 ? idx : 0] ?? dest.images[0] ?? "";
}
