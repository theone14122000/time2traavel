import Link from "next/link";
import { Mail, MapPin, Phone, Clock3, ExternalLink } from "lucide-react";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/brand/logo";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { MapEmbed } from "@/components/shared/map-embed";
import { SectionDivider } from "@/components/ui/dividers";
import { getSiteSettings } from "@/lib/data/site";
import { getFounder } from "@/lib/data/team";
import { formatPhoneDisplay, mailtoHref, telHref } from "@/lib/contact";
import { NAV_LINKS } from "@/lib/constants";
import { absoluteUrl, toSocialLinks } from "@/lib/utils";

/** Letter badges instead of brand icons (lucide ships no brand glyphs). */
const socialBadges: Record<string, string> = {
  Instagram: "IG",
  Facebook: "FB",
  YouTube: "YT",
  X: "X",
  LinkedIn: "IN",
};

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
] as const;

export async function SiteFooter() {
  const [settings, founder] = await Promise.all([getSiteSettings(), getFounder()]);
  const year = new Date().getFullYear();
  const socials = toSocialLinks(settings.socials);

  const phoneHref = settings.phone
    ? telHref(settings.phone) ?? `tel:${settings.phone.replace(/[^\d+]/g, "")}`
    : null;
  const phoneDisplay = formatPhoneDisplay(settings.phone) ?? settings.phone;
  const emailHref = mailtoHref(settings.email);
  const supportDisplay = settings.supportPhone
    ? formatPhoneDisplay(settings.supportPhone) ?? settings.supportPhone
    : null;

  const footerLinkClass =
    "text-sm font-semibold underline-offset-4 hover:text-lemon hover:underline";

  return (
    <footer className="border-t border-line bg-ink text-cream">
      <SectionDivider variant="stripe" tone="lemon" />

      <Container className="pt-8 sm:pt-12">
        <Logo height={48} priority={false} />

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Brand + newsletter */}
          <div className="flex flex-col gap-4 lg:col-span-4">
            <span className="inline-flex w-fit items-center rounded-xl bg-cream px-4 py-3">
              <Logo height={30} href={null} />
            </span>

            {settings.tagline ? (
              <p className="max-w-sm text-sm font-medium leading-relaxed text-cream/85">
                {settings.tagline}
              </p>
            ) : null}

            <div>
              <p className="label-brutal mb-2 text-lemon">Newsletter</p>
              <NewsletterForm tone="dark" />
            </div>
          </div>

          {/* Sitemap */}
          <nav aria-label="Sitemap" className="lg:col-span-2">
            <p className="label-brutal mb-3 text-lemon">Explore</p>
            <ul className="grid gap-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/admin" className={footerLinkClass}>
                  Admin
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Legal" className="lg:col-span-2">
            <p className="label-brutal mb-3 text-lemon">Legal</p>
            <ul className="grid gap-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="lg:col-span-4">
            <p className="label-brutal mb-3 text-lemon">Contact</p>
            <ul className="grid gap-2.5 text-sm font-medium">
              <li className="flex items-start gap-2.5 border-l border-lemon pl-3">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-lemon" />
                <address className="not-italic font-semibold">
                  <Link
                    href="/about-us#contact"
                    className="hover:text-lemon hover:underline"
                  >
                    {settings.address}
                  </Link>
                </address>
              </li>
              {settings.phone && phoneHref ? (
                <li className="flex items-center gap-2.5">
                  <Phone aria-hidden="true" className="size-4 shrink-0 text-lemon" />
                  <a href={phoneHref} className="hover:text-lemon hover:underline">
                    {phoneDisplay}
                  </a>
                </li>
              ) : null}
              {settings.email && emailHref ? (
                <li className="flex items-center gap-2.5">
                  <Mail aria-hidden="true" className="size-4 shrink-0 text-lemon" />
                  <a href={emailHref} className="break-all hover:text-lemon hover:underline">
                    {settings.email}
                  </a>
                </li>
              ) : null}
              {settings.workingHours ? (
                <li className="flex items-start gap-2.5">
                  <Clock3 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-lemon" />
                  <span>{settings.workingHours}</span>
                </li>
              ) : null}
            </ul>

            {socials.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {socials.map((social) => {
                  const badge = socialBadges[social.platform];
                  return (
                    <li key={`${social.platform}-${social.url}`}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${social.platform} — opens in a new tab`}
                        className="flex size-10 items-center justify-center border border-cream bg-ink shadow-hard transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-lemon hover:text-ink"
                      >
                        {badge ? (
                          <span aria-hidden="true" className="font-display text-sm leading-none">
                            {badge}
                          </span>
                        ) : (
                          <ExternalLink aria-hidden="true" className="size-4" />
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>

          {/* Map */}
          <div className="lg:col-span-12">
            <p className="label-brutal mb-3 text-lemon">Find us</p>
            <MapEmbed
              src={settings.mapEmbedUrl ?? ""}
              title={`${settings.siteName} office — ${settings.address}`}
              height="h-[240px] sm:h-[300px]"
            />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-cream/30 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-cream/80">
            © {year} {settings.siteName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-cream/80">
            <li>
              <Link href="/privacy" className="hover:text-lemon hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-lemon hover:underline">
                Terms &amp; Conditions
              </Link>
            </li>
            {founder ? <li>Founded by {founder.name}</li> : null}
            {supportDisplay ? (
              <li>
                Website &amp; I.T support: {supportDisplay} — for website or technical issues
                only.
              </li>
            ) : null}
            <li>
              <a
                href={absoluteUrl("/")}
                className="hover:text-lemon hover:underline"
                rel="canonical"
              >
                {settings.siteName}
              </a>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
