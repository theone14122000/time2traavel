/**
 * Deterministic diversity allocator — picks N images from a pool
 * without repeating within a window, seeded by a string key so the
 * same slot always gets the same images across server/client renders.
 *
 * Used by: mountains-band slideshow, hero rotation, destination cards,
 * trip-type tiles, service tiles, gallery teaser.
 */

type Pickable = { url: string; region: string; tags?: readonly string[] };

/** Small deterministic hash (FNV-1a 32-bit). */
function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * Mulberry32 PRNG — fast, deterministic, good enough for image picking.
 */
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pick `count` items from `pool` without repeating any URL within the
 * returned set. Deterministic per `slotKey`. If the pool is smaller than
 * `count`, items may repeat (best effort).
 */
export function allocateImages<T extends Pickable>(
  pool: readonly T[],
  count: number,
  slotKey: string,
): T[] {
  if (pool.length === 0 || count <= 0) return [];
  if (pool.length <= count) return [...pool];

  const rand = mulberry32(fnv1a(slotKey));
  // Fisher–Yates partial shuffle: swap `count` items into the front.
  const arr = [...pool];
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(rand() * (arr.length - i));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

/**
 * Filter a pool by domestic/international flag (or region string).
 * Domestic images must never appear on international placements and vice versa.
 */
export function filterByScope<T extends Pickable>(
  pool: readonly T[],
  scope: "domestic" | "international",
): T[] {
  return pool.filter((item) => {
    if (scope === "domestic") {
      return item.region !== "international" && item.region !== "UNASSIGNED";
    }
    return item.region === "international";
  });
}

/**
 * Convenience: filter by scope + allocate deterministically.
 */
export function allocateForSlot<T extends Pickable>(
  pool: readonly T[],
  count: number,
  slotKey: string,
  scope?: "domestic" | "international",
): T[] {
  const scoped = scope ? filterByScope(pool, scope) : [...pool];
  return allocateImages(scoped, count, slotKey);
}
