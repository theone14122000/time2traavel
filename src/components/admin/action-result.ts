/**
 * Client-safe mirror of the server Action result shape
 * (`src/actions/admin/shared.ts` exports the canonical version).
 */
export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
