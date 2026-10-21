import generated from "@/lib/destination-images.generated.json";

/**
 * Domestic destinations — the default source of truth for the eight
 * domestic destinations shown on the homepage and on /destinations.
 *
 * The data is static and version-controlled so the section always renders
 * even when the database is unavailable or empty. If a published
 * `Destination` record exists for the same slug, its fields override the
 * static ones (see `getDomesticDestinations` in
 * `@/lib/data/domestic-destinations`).
 *
 * Image filenames are CASE-SENSITIVE and are used exactly as they exist
 * on disk under public/images/destinations. `scripts/validate-destination-images.mjs`
 * fails the build if any of them goes missing.
 */

export type DestinationImageInfo = {
  file: string;
  url: string;
  width: number;
  height: number;
  blurDataURL: string;
  thumb: string | null;
  thumbSmall: string | null;
  thumbBlurDataURL: string | null;
};

export type DomesticDestination = {
  slug: string;
  name: string;
  tagline: string;
  overview: string;
  knownFor: string[];
  bestTime: string;
  /** Original file names, in display order. */
  images: string[];
  /** Index into `images` used as the cover. */
  coverIndex: number;
};

type GeneratedManifest = Record<string, Omit<DestinationImageInfo, "file" | "url">>;

const manifest = generated as GeneratedManifest;

/** Public path of an original image. */
export function originalUrl(file: string): string {
  return `/images/destinations/${file}`;
}

/** Generated metadata for one image (width/height/blur/thumbs). */
export function imageInfo(file: string): DestinationImageInfo | null {
  const entry = manifest[file];
  if (!entry) return null;
  return {
    file,
    url: originalUrl(file),
    width: entry.width,
    height: entry.height,
    blurDataURL: entry.blurDataURL,
    thumb: entry.thumb,
    thumbSmall: entry.thumbSmall,
    thumbBlurDataURL: entry.thumbBlurDataURL ?? null,
  };
}

/**
 * Note appended to every "best time" answer — the copy stays factual and
 * avoids promising specific conditions.
 */
export const BEST_TIME_NOTE =
  "General guidance only. Weather and conditions vary by region and year; our team can help you choose the right time.";

export const DOMESTIC_DESTINATIONS: readonly DomesticDestination[] = [
  {
    slug: "jammu-and-kashmir",
    name: "Jammu & Kashmir",
    tagline: "Valleys, lakes and mountain landscapes",
    overview:
      "Jammu and Kashmir, in the northern Himalayan region of India, is known for its green valleys, lakes, snow-capped mountains and traditional crafts. The landscapes change with the seasons, from spring blooms and summer meadows to autumn colours and winter snow.",
    knownFor: [
      "Valleys and meadows",
      "Lakes and houseboats",
      "Himalayan scenery",
      "Traditional handicrafts",
    ],
    bestTime:
      "Spring to autumn for pleasant weather; winter for snow.",
    images: [
      "JK1.jpg",
      "JK2.jpg",
      "JK3.jpg",
      "JK4.jpg",
      "JK5.jpg",
      "JK6.jpg",
      "JK7.jpg",
    ],
    coverIndex: 0,
  },
  {
    slug: "assam",
    name: "Assam",
    tagline: "Tea gardens, rivers and wildlife",
    overview:
      "Assam, in North East India, is known for its rolling tea gardens, the Brahmaputra river and wildlife habitats. The state blends lush green landscapes with distinct local culture, festivals and cuisine.",
    knownFor: [
      "Tea gardens",
      "The Brahmaputra river",
      "Wildlife and national parks",
      "Local culture and festivals",
    ],
    bestTime:
      "Generally October to April, when the weather is cooler and drier.",
    images: [
      "assam1.jpg",
      "assam2.jpg",
      "assam3.jpg",
      "assam4.jpg",
      "assam5.jpg",
    ],
    coverIndex: 0,
  },
  {
    slug: "gujarat",
    name: "Gujarat",
    tagline: "Culture, coastline and wide open landscapes",
    overview:
      "Gujarat, on India's western coast, offers a mix of heritage sites, lively festivals, coastline and the vast salt desert landscapes of Kutch. Its towns and cities reflect a long history of trade, craft and culture.",
    knownFor: [
      "Kutch and the salt desert",
      "Heritage sites and architecture",
      "Handicrafts and textiles",
      "Coastline and temples",
    ],
    bestTime: "Generally October to March.",
    images: [
      "gujrat1.jpg",
      "gujrat2.jpg",
      "gujrat3.jpg",
      "gujrat4.jpg",
      "gujrat5.jpg",
      "gujrat6.jpg",
      "gujrat7.jpg",
      "gujrat8.jpg",
      "gujrat9.jpg",
    ],
    coverIndex: 0,
  },
  {
    slug: "himachal-pradesh",
    name: "Himachal Pradesh",
    tagline: "Hill stations, valleys and Himalayan views",
    overview:
      "Himachal Pradesh, in the western Himalayas, is known for its hill stations, deodar forests, river valleys and mountain villages. It suits scenic drives, treks and relaxed mountain breaks.",
    knownFor: [
      "Hill stations",
      "Valleys and mountain villages",
      "Treks and adventure activities",
      "Temples and monasteries",
    ],
    bestTime:
      "Spring and early summer for pleasant weather; winter for snow; the monsoon can disrupt mountain roads.",
    images: [
      "himachal1.jpg",
      "himachal2.jpg",
      "himachal3.jpg",
      "himachal4.jpg",
      "himachal5.jpg",
    ],
    coverIndex: 0,
  },
  {
    slug: "rajasthan",
    name: "Rajasthan",
    tagline: "Forts, palaces and desert landscapes",
    overview:
      "Rajasthan, in north-western India, is known for its forts, palaces, bustling bazaars and the Thar desert. Its cities preserve centuries of royal heritage, folk music and handicrafts.",
    knownFor: [
      "Forts and palaces",
      "Desert landscapes",
      "Folk music and dance",
      "Markets and handicrafts",
    ],
    bestTime: "Generally October to March.",
    images: [
      "rajisthan1.jpg",
      "rajisthan2.jpg",
      "rajisthan3.jpg",
      "rajisthan4.jpg",
      "rajisthan5.jpg",
      "rajisthan6.jpg",
      "rajisthan7.jpg",
      "rajisthan8.jpg",
    ],
    coverIndex: 0,
  },
  {
    slug: "tamil-nadu",
    name: "Tamil Nadu",
    tagline: "Temples, hills and a long coastline",
    overview:
      "Tamil Nadu, in southern India, is known for its Dravidian temple architecture, classical arts, hill stations and a long coastline. The state combines heritage towns with nature escapes and local cuisine.",
    knownFor: [
      "Temple architecture",
      "Hill stations",
      "Beaches and coastline",
      "Cuisine and classical arts",
    ],
    bestTime:
      "Generally November to February, when the weather is milder.",
    images: [
      "tamil1.jpg",
      "tamil2.jpg",
      "tamil3.jpg",
      "tamil4.jpg",
      "tamil5.jpg",
      "tamil6.jpg",
      "tamil7.jpg",
    ],
    coverIndex: 0,
  },
  {
    slug: "uttar-pradesh",
    name: "Uttar Pradesh",
    tagline: "Heritage, spiritual cities and history",
    overview:
      "Uttar Pradesh, in northern India, is home to historic monuments, ancient spiritual cities along the Ganga and a rich culinary tradition. Its cities offer a layered view of India's history and culture.",
    knownFor: [
      "Historic monuments",
      "Spiritual cities and ghats",
      "Cuisine",
      "Arts and crafts",
    ],
    bestTime: "Generally October to March.",
    images: [
      "UP1.jpg",
      "UP2.jpg",
      "UP3.jpg",
      "UP4.jpg",
      "UP5.jpg",
      "UP6.jpg",
      "UP7.jpg",
    ],
    coverIndex: 0,
  },
  {
    slug: "uttarakhand",
    name: "Uttarakhand",
    tagline: "Himalayan peaks, rivers and pilgrim trails",
    overview:
      "Uttarakhand, in the Himalayan foothills, is known for its mountain scenery, rivers, forests and sacred pilgrimage sites. It offers options from relaxed hill-town stays to treks and river activities.",
    knownFor: [
      "Himalayan scenery",
      "Rivers and valleys",
      "Pilgrimage sites",
      "Treks and adventure activities",
    ],
    bestTime:
      "Spring and autumn for clear views; the monsoon can disrupt mountain roads.",
    images: [
      "utrakhand1.jpg",
      "utrakhand2.jpg",
      "utrakhand3.jpg",
      "utrakhand4.jpg",
    ],
    coverIndex: 0,
  },
];

/** Look-up by slug. */
export function getStaticDestination(
  slug: string,
): DomesticDestination | null {
  return DOMESTIC_DESTINATIONS.find((d) => d.slug === slug) ?? null;
}

/** Cover image file name for a destination. */
export function coverFile(destination: DomesticDestination): string {
  return (
    destination.images[
      Math.min(destination.coverIndex, destination.images.length - 1)
    ] ?? destination.images[0]!
  );
}
