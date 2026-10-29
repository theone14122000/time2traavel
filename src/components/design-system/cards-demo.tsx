import { BrutalImage } from "@/components/ui/brutal-image";
import {
  BrutalCard,
  BrutalCardBody,
  BrutalCardFooter,
  BrutalCardHeader,
  BrutalCardMedia,
} from "@/components/ui/brutal-card";
import { Badge, Stamp } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/** Four card variants with placeholder media — no real inventory shown. */
export function CardsDemo() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <BrutalCard variant="destination">
        <BrutalCardMedia aspect="landscape">
          <BrutalImage
            src=""
            alt=""
            decorative
            aspect="free"
            className="h-full border-0"
          />
        </BrutalCardMedia>
        <BrutalCardHeader>
          <div>
            <p className="label-brutal text-ink-soft">destination</p>
            <h3 className="font-display text-h4 uppercase">Sample destination</h3>
          </div>
        </BrutalCardHeader>
        <BrutalCardBody>
          <p className="text-sm font-medium leading-relaxed text-ink-soft">
            Placeholder body copy for the gallery — real cards render database content.
          </p>
        </BrutalCardBody>
        <BrutalCardFooter>
          <Badge variant="default">Demo badge</Badge>
          <Button size="sm" variant="outline">
            Demo action
          </Button>
        </BrutalCardFooter>
      </BrutalCard>

      <BrutalCard variant="package">
        <BrutalCardMedia aspect="landscape">
          <BrutalImage
            src=""
            alt=""
            decorative
            aspect="free"
            className="h-full border-0"
          />
        </BrutalCardMedia>
        <BrutalCardHeader>
          <div>
            <p className="label-brutal text-ink-soft">package</p>
            <h3 className="font-display text-h4 uppercase">Sample package</h3>
          </div>
        </BrutalCardHeader>
        <BrutalCardBody>
          <p className="text-sm font-medium leading-relaxed text-ink-soft">
            Placeholder body copy — no prices or durations are shown on this demo page.
          </p>
        </BrutalCardBody>
        <BrutalCardFooter>
          <span className="label-brutal text-ink-soft">shadow-brutal-md</span>
          <Badge variant="tomato">Demo</Badge>
        </BrutalCardFooter>
      </BrutalCard>

      <BrutalCard variant="review" disableHover>
        <BrutalCardBody className="pt-6">
          <p className="label-brutal text-ink-soft">review</p>
          <p className="font-display text-h4 uppercase">Sample review card</p>
          <p className="text-sm font-medium leading-relaxed text-ink-soft">
            Placeholder quote slot — this gallery never attributes words to real people.
          </p>
        </BrutalCardBody>
      </BrutalCard>

      <BrutalCard
        variant="info"
        disableHover
        sticker={<Stamp variant="mint" rotate={-8}>Sticker</Stamp>}
        badge={<Badge variant="sky-strong">Badge slot</Badge>}
      >
        <BrutalCardBody className="pt-8">
          <p className="label-brutal text-ink-soft">info — sticker + badge slots</p>
          <h3 className="font-display text-h4 uppercase">Slot demo</h3>
          <p className="text-sm font-medium leading-relaxed text-ink-soft">
            Border-4 info card showing absolutely positioned sticker (top-left) and
            badge (top-right) slots.
          </p>
        </BrutalCardBody>
        <BrutalCardFooter>
          <span className="label-brutal text-ink-soft">border</span>
        </BrutalCardFooter>
      </BrutalCard>
    </div>
  );
}
