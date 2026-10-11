import "server-only";

/**
 * Optional admin notifications via Resend.
 * Everything is skipped gracefully when env vars are missing, so the site
 * works with database-only submissions out of the box.
 */
type MailPayload = {
  subject: string;
  text: string;
  html?: string;
};

function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.ADMIN_NOTIFY_EMAIL);
}

export async function notifyAdmin(payload: MailPayload): Promise<boolean> {
  if (!isEmailConfigured()) return false;

  const apiKey = process.env.RESEND_API_KEY!;
  const to = process.env.ADMIN_NOTIFY_EMAIL!;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "Time to Travel <onboarding@resend.dev>",
        to: [to],
        subject: payload.subject,
        text: payload.text,
        ...(payload.html ? { html: payload.html } : {}),
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[email] Resend responded ${res.status}: ${await res.text()}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(
      "[email] Failed to send notification:",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}

export function notifyNewInquiry(input: {
  type: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  details?: Record<string, string | number | null | undefined>;
}): Promise<boolean> {
  const lines = [
    `New ${input.type} enquiry`,
    ``,
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    input.phone ? `Phone: ${input.phone}` : null,
    ...Object.entries(input.details ?? {})
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .map(([k, v]) => `${k}: ${v}`),
    input.message ? `` : null,
    input.message ? `Message:` : null,
    input.message ?? null,
  ].filter((l): l is string => l !== null);

  return notifyAdmin({
    subject: `[Time to Travel] New enquiry — ${input.name}`,
    text: lines.join("\n"),
  });
}
