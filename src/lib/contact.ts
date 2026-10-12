/**
 * Shared contact helpers: one place for number normalisation (E.164 storage),
 * display formatting, and tel: / wa.me / mailto: link builders.
 * Every UI value should flow through these — never format in JSX.
 */

const NON_DIGITS = /[^\d]/g;

/** Normalise an Indian/mobile number to E.164 ("+919882726990"). Null when unusable. */
export function toE164(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(NON_DIGITS, "");
  if (!digits) return null;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (raw.trim().startsWith("+")) return `+${digits}`;
  return digits.length >= 10 ? `+${digits}` : null;
}

/** Display format for Indian numbers: "+91 98827 26990". Falls back to the raw input. */
export function formatPhoneDisplay(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const e164 = toE164(raw);
  if (!e164) return raw.trim();
  const digits = e164.replace(NON_DIGITS, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    const local = digits.slice(2);
    return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }
  return e164;
}

/** `tel:` href for a stored number. */
export function telHref(raw: string | null | undefined): string | null {
  const e164 = toE164(raw);
  return e164 ? `tel:${e164}` : null;
}

/** `https://wa.me/<digits>` href with an optional pre-filled message. */
export function waHref(
  raw: string | null | undefined,
  message?: string,
): string | null {
  const e164 = toE164(raw);
  if (!e164) return null;
  const digits = e164.replace(NON_DIGITS, "");
  const base = `https://wa.me/${digits}`;
  const text = message?.trim();
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** `mailto:` href with optional subject/body. */
export function mailtoHref(
  email: string | null | undefined,
  subject?: string,
  body?: string,
): string | null {
  const value = email?.trim();
  if (!value) return null;
  let href = `mailto:${value}`;
  const params: string[] = [];
  if (subject?.trim()) params.push(`subject=${encodeURIComponent(subject.trim())}`);
  if (body?.trim()) params.push(`body=${encodeURIComponent(body.trim())}`);
  if (params.length > 0) href += `?${params.join("&")}`;
  return href;
}

/** Digits only — for structured data or analytics payloads. */
export function digitsOnly(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(NON_DIGITS, "");
  return digits || null;
}
