import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminOrNull } from "@/lib/guards";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/shared/page-header";
import { Container } from "@/components/shared/container";
import { Marquee } from "@/components/shared/marquee";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Carousel } from "@/components/ui/carousel";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SectionDivider } from "@/components/ui/dividers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Skeleton,
  SkeletonCard,
  SkeletonLine,
  SkeletonTitle,
} from "@/components/ui/skeleton";
import { GallerySection, Panel } from "@/components/design-system/gallery";
import { ColorTokens } from "@/components/design-system/color-tokens";
import {
  ShadowsAndBorders,
  TypeScale,
  TypeUtilities,
} from "@/components/design-system/foundations";
import { ButtonsDemo } from "@/components/design-system/buttons-demo";
import { BadgesDemo } from "@/components/design-system/badges-demo";
import { InputsDemo } from "@/components/design-system/inputs-demo";
import { ControlsDemo } from "@/components/design-system/controls-demo";
import { FormStatusDemo } from "@/components/design-system/form-status-demo";
import { CardsDemo } from "@/components/design-system/cards-demo";
import { ImagesDemo } from "@/components/design-system/images-demo";
import { PaginationDemo } from "@/components/design-system/pagination-demo";
import { MotionDemo } from "@/components/design-system/motion-demo";
import { ToastsDemo } from "@/components/design-system/toasts-demo";
import { MultiStepDemo } from "@/components/design-system/multi-step-demo";
import { IntegratedFormDemo } from "@/components/design-system/integrated-form-demo";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Design System",
    path: "/design-system",
    noIndex: true,
  });
}

const INDEX_LINKS: { id: string; label: string }[] = [
  { id: "tokens", label: "Tokens" },
  { id: "type", label: "Type" },
  { id: "shadows", label: "Shadows" },
  { id: "buttons", label: "Buttons" },
  { id: "badges", label: "Badges" },
  { id: "inputs", label: "Inputs" },
  { id: "cards", label: "Cards" },
  { id: "images", label: "Images" },
  { id: "carousel", label: "Carousel" },
  { id: "pagination", label: "Pagination" },
  { id: "marquee", label: "Marquee" },
  { id: "empty", label: "Empty" },
  { id: "accordion", label: "Accordion" },
  { id: "breadcrumbs", label: "Breadcrumbs" },
  { id: "dividers", label: "Dividers" },
  { id: "multi-step", label: "Multi-step" },
  { id: "skeletons", label: "Skeletons" },
  { id: "motion", label: "Motion" },
  { id: "toasts", label: "Toasts" },
  { id: "palette", label: "Palette" },
  { id: "form", label: "Form" },
];

const CAROUSEL_SLIDES = [
  { tone: "bg-sky", label: "One" },
  { tone: "bg-mint", label: "Two" },
  { tone: "bg-peach", label: "Three" },
  { tone: "bg-lavender", label: "Four" },
] as const;

const FAQ_ITEMS = [
  {
    value: "faq-one",
    question: "Demo question one?",
    answer:
      "Generic demo answer copy. Real FAQ content is stored in the database and rendered here â€” this block exists only to show the accordion behaviour.",
  },
  {
    value: "faq-two",
    question: "Demo question two?",
    answer:
      "Another generic answer. Tabs and accordions share the same brutalist border and shadow language.",
  },
  {
    value: "faq-three",
    question: "Demo question three?",
    answer:
      "Third demo answer â€” keyboard navigation, focus rings and reduced-motion behaviour all come from the Radix primitives underneath.",
  },
];

const DIVIDER_VARIANTS = ["zigzag", "torn", "stripe", "thick"] as const;
const DIVIDER_TONES = ["ink", "lemon", "tomato", "paper"] as const;

/** Dev/admin-only gallery: open when NODE_ENV isn't production, or for a signed-in admin. */
export default async function DesignSystemPage() {
  const allowed =
    process.env.NODE_ENV !== "production" ||
    (await getAdminOrNull()) !== null;
  if (!allowed) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Dev only"
        title="Design system"
        description="A living gallery of every component, token and state in this codebase. Hidden from search and gated: open in development, or in production only for signed-in admins."
        tone="lavender"
      />

      <nav
        aria-label="Design system sections"
        className="sticky top-14 z-30 border-b-[3px] border-ink bg-lemon lg:top-16"
      >
        <Container className="flex gap-2 overflow-x-auto py-2.5 no-scrollbar">
          {INDEX_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="label-brutal tap-44 inline-flex shrink-0 items-center border-[2px] border-ink bg-paper px-3 py-2 shadow-hard-xs transition-colors hover:bg-butter"
            >
              {link.label}
            </a>
          ))}
        </Container>
      </nav>

      <GallerySection
        id="tokens"
        eyebrow="Foundations"
        title="Colour tokens"
        tone="paper"
        description="Every palette entry as a swatch with its utility class, plus a strip that rotates through the palette."
      >
        <Panel label="Swatches + rotating strip" note="bg-* utilities">
          <ColorTokens />
        </Panel>
      </GallerySection>

      <GallerySection
        id="type"
        eyebrow="Foundations"
        title="Type scale"
        tone="cream"
        description="Fluid clamp() sizes from display down to body, with the marker, label and outline utilities."
      >
        <Panel label="Fluid type scale" note="clamp() labels">
          <TypeScale />
        </Panel>
        <Panel label="Type utilities" note=".marker / .marker-hot / .text-outline">
          <TypeUtilities />
        </Panel>
      </GallerySection>

      <GallerySection
        id="shadows"
        eyebrow="Foundations"
        title="Shadows & borders"
        tone="paper"
        description="Hard offset shadows, the three border weights and the radius demo."
      >
        <Panel label="Shadows, borders, radius" note="border-2 / 3 / 4">
          <ShadowsAndBorders />
        </Panel>
      </GallerySection>

      <GallerySection
        id="buttons"
        eyebrow="Components"
        title="Buttons"
        tone="cream"
        description="Every variant across every size, plus loading, disabled, icon, magnetic and asChild states."
      >
        <Panel label="Button" note="variant Ã— size matrix">
          <ButtonsDemo />
        </Panel>
      </GallerySection>

      <GallerySection
        id="badges"
        eyebrow="Components"
        title="Badges & stickers"
        tone="paper"
        description="Badge palette variants in all sizes, rotated stamps, edge ribbons and toggleable tag chips."
      >
        <Panel label="Badge / Stamp / Ribbon / TagChip" note="interactive chips">
          <BadgesDemo />
        </Panel>
      </GallerySection>

      <GallerySection
        id="inputs"
        eyebrow="Forms"
        title="Inputs"
        tone="cream"
        description="Text fields in every state, floating labels, selection controls and form status regions."
      >
        <Panel label="Input / Textarea / Floating / Select" note="focus, invalid, disabled, success">
          <InputsDemo />
        </Panel>
        <Panel label="Stepper / Slider / Chips / RadioCards / DateRange" note="controlled demo state">
          <ControlsDemo />
        </Panel>
        <Panel label="FormLiveRegion / SubmitError" note="static demo messages">
          <FormStatusDemo />
        </Panel>
      </GallerySection>

      <GallerySection
        id="cards"
        eyebrow="Components"
        title="Cards"
        tone="paper"
        description="The four BrutalCard variants with placeholder media, plus sticker and badge slots."
      >
        <Panel label="BrutalCard" note="destination / package / review / info">
          <CardsDemo />
        </Panel>
      </GallerySection>

      <GallerySection
        id="images"
        eyebrow="Components"
        title="Images"
        tone="cream"
        description="Aspect presets rendered with the built-in placeholder, and zoom on vs off."
      >
        <Panel label="BrutalImage" note="placeholder SVG (empty src)">
          <ImagesDemo />
        </Panel>
      </GallerySection>

      <GallerySection
        id="carousel"
        eyebrow="Components"
        title="Carousel"
        tone="paper"
        description="Four demo slides with drag, dots, arrow buttons and a live counter."
      >
        <Panel label="Carousel" note="keyboard: â† / â†’ when focused">
          <div className="grid grid-cols-1 gap-3">
            <Carousel
              label="Demo carousel"
              items={CAROUSEL_SLIDES.map((slide) => (
                <div
                  key={slide.label}
                  className={`flex min-h-52 items-center justify-center border-b-[3px] border-ink p-8 ${slide.tone}`}
                >
                  <span className="font-display text-display uppercase">
                    {slide.label}
                  </span>
                </div>
              ))}
            />
            <p className="text-sm font-medium text-ink-soft">
              Focus the carousel (tab to it) and use â† / â†’ arrow keys, or drag on
              touch. Focus lands on the region â€” controls are reachable by Tab.
            </p>
          </div>
        </Panel>
      </GallerySection>

      <GallerySection
        id="pagination"
        eyebrow="Components"
        title="Pagination"
        tone="cream"
        description="Stateful demo â€” page 1 of 12."
      >
        <Panel label="Pagination" note="useState page">
          <PaginationDemo />
        </Panel>
      </GallerySection>

      <GallerySection
        id="marquee"
        eyebrow="Shared"
        title="Marquee"
        tone="paper"
        description="Default ticker items. Pauses on hover and focus; stops entirely under reduced motion."
      >
        <Panel label="Marquee" note="pause on hover" bodyClassName="p-0">
          <div className="grid gap-0">
            <Marquee />
            <Marquee tone="lemon" reverse slow />
          </div>
          <p className="border-t-[3px] border-ink p-4 text-sm font-medium text-ink-soft sm:p-5">
            Hovering (or focusing inside) the strip pauses it via{" "}
            <code className="font-bold">.marquee-pause</code>; the duplicate track is
            aria-hidden and reduced motion disables the animation.
          </p>
        </Panel>
      </GallerySection>

      <GallerySection
        id="empty"
        eyebrow="Shared"
        title="Empty states"
        tone="cream"
        description="All four illustrations across tones, with and without a call to action."
      >
        <Panel label="EmptyState" note="4 illustrations Ã— tones">
          <div className="grid gap-6 lg:grid-cols-2">
            <EmptyState
              illustration="compass"
              tone="butter"
              eyebrow="Demo label"
              title="Compass empty state"
              description="Demo description copy shown under the title."
              action={
                <Button size="sm" variant="outline">
                  Demo action
                </Button>
              }
            />
            <EmptyState
              illustration="luggage"
              tone="mint"
              eyebrow="Demo label"
              title="Luggage empty state"
              description="Same component, different illustration and tone."
              action={
                <Button size="sm" variant="secondary">
                  Demo action
                </Button>
              }
            />
            <EmptyState
              illustration="map"
              tone="sky"
              eyebrow="Demo label"
              title="Map empty state"
              description="With an action button pinned below the copy."
            />
            <EmptyState
              illustration="search"
              tone="peach"
              eyebrow="Demo label"
              title="Search empty state"
              description="Without an action â€” title and copy only."
            />
          </div>
        </Panel>
      </GallerySection>

      <GallerySection
        id="accordion"
        eyebrow="Components"
        title="Accordion & tabs"
        tone="paper"
        description="Demo Q&A in an accordion and a tab set â€” generic copy only."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel label="Accordion" note="demo Q&A">
            <Accordion type="single" collapsible defaultValue="faq-one" className="grid gap-3">
              {FAQ_ITEMS.map((item) => (
                <AccordionItem key={item.value} value={item.value}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Panel>

          <Panel label="Tabs" note="demo tabs">
            <Tabs defaultValue="tab-one">
              <TabsList>
                <TabsTrigger value="tab-one">Demo tab one</TabsTrigger>
                <TabsTrigger value="tab-two">Demo tab two</TabsTrigger>
                <TabsTrigger value="tab-three">Demo tab three</TabsTrigger>
              </TabsList>
              <TabsContent value="tab-one">
                <p className="text-sm font-medium leading-relaxed text-ink-soft">
                  Generic demo panel content for tab one â€” the active trigger flips to
                  the lemon highlight.
                </p>
              </TabsContent>
              <TabsContent value="tab-two">
                <p className="text-sm font-medium leading-relaxed text-ink-soft">
                  Generic demo panel content for tab two, sharing the same brutal
                  borders as the accordion.
                </p>
              </TabsContent>
              <TabsContent value="tab-three">
                <p className="text-sm font-medium leading-relaxed text-ink-soft">
                  Generic demo panel content for tab three.
                </p>
              </TabsContent>
            </Tabs>
          </Panel>
        </div>
      </GallerySection>

      <GallerySection
        id="breadcrumbs"
        eyebrow="Navigation"
        title="Breadcrumbs"
        tone="cream"
        description="Demo trail with a linked root, an intermediate link and the current page highlighted."
      >
        <Panel label="Breadcrumbs" note="demo items">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Destinations", href: "/destinations" },
              { label: "Sample destination" },
            ]}
          />
        </Panel>
      </GallerySection>

      <GallerySection
        id="dividers"
        eyebrow="Navigation"
        title="Section dividers"
        tone="paper"
        description="All four variants stacked in every tone â€” purely decorative."
      >
        <Panel label="SectionDivider" note="4 variants Ã— 4 tones">
          <div className="grid gap-5">
            {DIVIDER_VARIANTS.map((variant) => (
              <div key={variant} className="grid gap-2">
                <span className="label-brutal text-ink-soft">{variant}</span>
                <div className="border-[3px] border-ink bg-sand">
                  {DIVIDER_TONES.map((tone) => (
                    <SectionDivider key={`${variant}-${tone}`} variant={variant} tone={tone} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </GallerySection>

      <GallerySection
        id="multi-step"
        eyebrow="Forms"
        title="Multi-step form"
        tone="cream"
        description="Three demo steps with progress bar, clickable indicators and fake field slots."
      >
        <Panel label="MultiStepForm" note="draftKey: design-system-demo">
          <MultiStepDemo />
        </Panel>
      </GallerySection>

      <GallerySection
        id="skeletons"
        eyebrow="Feedback"
        title="Skeletons"
        tone="paper"
        description="Loading placeholders: card, title line and body lines."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel label="SkeletonCard" note="pulse + aria-hidden">
            <SkeletonCard />
          </Panel>
          <Panel label="SkeletonTitle / SkeletonLine">
            <div className="grid gap-3 border-[3px] border-ink bg-paper p-4 shadow-hard-xs">
              <SkeletonTitle />
              <SkeletonLine />
              <SkeletonLine className="w-5/6" />
              <SkeletonLine className="w-2/3" />
              <Skeleton className="h-11 w-full" />
            </div>
          </Panel>
        </div>
      </GallerySection>

      <GallerySection
        id="motion"
        eyebrow="Feedback"
        title="Motion"
        tone="cream"
        description="Scroll reveal, count-up and magnetic wrappers â€” all reduced-motion aware."
      >
        <Panel label="RevealTitle / CountUp / Magnetic" note="respects prefers-reduced-motion">
          <MotionDemo />
        </Panel>
      </GallerySection>

      <GallerySection
        id="toasts"
        eyebrow="Feedback"
        title="Toasts"
        tone="paper"
        description="Sonner toasts through the globally mounted Toaster."
      >
        <Panel label="toast.success / error / info" note="global Toaster">
          <ToastsDemo />
        </Panel>
      </GallerySection>

      <GallerySection
        id="palette"
        eyebrow="Feedback"
        title="Command palette"
        tone="cream"
        description="The palette provider is mounted once in the root layout."
      >
        <Panel label="Command palette" note="static info">
          <div className="grid gap-3">
            <p className="text-base font-medium leading-relaxed">
              Press{" "}
              <kbd className="label-brutal border-[2px] border-ink bg-butter px-2 py-1.5 shadow-hard-xs">
                âŒ˜K
              </kbd>{" "}
              or{" "}
              <kbd className="label-brutal border-[2px] border-ink bg-butter px-2 py-1.5 shadow-hard-xs">
                Ctrl+K
              </kbd>{" "}
              anywhere on the site to open the search palette.
            </p>
            <p className="text-sm font-medium text-ink-soft">
              <code className="font-bold">CommandPaletteProvider</code> is wrapped
              around the app in <code className="font-bold">src/app/layout.tsx</code>,
              alongside the <code className="font-bold">Toaster</code> â€” there is
              nothing to mount per page.
            </p>
          </div>
        </Panel>
      </GallerySection>

      <GallerySection
        id="form"
        eyebrow="Forms"
        title="Integrated demo form"
        tone="paper"
        description="Floating input + date range + traveller stepper wired to a fake submit."
      >
        <Panel label="Mini form" note="local submit only">
          <IntegratedFormDemo />
        </Panel>
      </GallerySection>
    </>
  );
}
