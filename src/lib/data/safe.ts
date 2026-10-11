/**
 * All database reads go through these guards so the site keeps rendering
 * (with brutalist empty states) even if the database is temporarily
 * unreachable. Errors are logged server-side, never shown to visitors.
 */
export async function safeQuery<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[data:${label}] ${message}`);
    return fallback;
  }
}
