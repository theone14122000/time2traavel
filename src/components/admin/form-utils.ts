/**
 * The shared `FormField` (ui/form) types `field.value` as the union of every
 * field value in the form. These helpers narrow it back to a usable shape.
 */
export function asStr(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
}

export function asChecked(value: unknown): boolean {
  return value === true;
}
