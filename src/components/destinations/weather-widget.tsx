"use client";

import * as React from "react";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Loader2,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { describeWeatherCode, lookupCityCoords } from "@/lib/weather";

const BUCKET_ICONS = {
  clear: Sun,
  cloudy: Cloud,
  fog: CloudFog,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
} as const;

type WidgetState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; temperature: number; code: number | null }
  | { status: "hidden" };

/**
 * Live current-weather card powered by Open-Meteo (no API key).
 * Coordinates come from props or the factual city lookup in `@/lib/weather`.
 * Renders nothing when the place is unknown or the request fails.
 */
export function WeatherWidget({
  place,
  latitude,
  longitude,
}: {
  place: string;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const coords = React.useMemo(() => {
    if (
      typeof latitude === "number" &&
      Number.isFinite(latitude) &&
      typeof longitude === "number" &&
      Number.isFinite(longitude)
    ) {
      return { latitude, longitude };
    }
    return lookupCityCoords(place);
  }, [latitude, longitude, place]);

  const [state, setState] = React.useState<WidgetState>(
    coords ? { status: "loading" } : { status: "hidden" },
  );

  React.useEffect(() => {
    if (!coords) {
      setState({ status: "hidden" });
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(coords.latitude));
    url.searchParams.set("longitude", String(coords.longitude));
    url.searchParams.set("current", "temperature_2m,weather_code");

    fetch(url.toString(), { signal: AbortSignal.timeout(8000) })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("bad response"))))
      .then((data: unknown) => {
        if (cancelled) return;
        const current = (data as { current?: { temperature_2m?: unknown; weather_code?: unknown } } | null)?.current;
        const temperature =
          typeof current?.temperature_2m === "number" ? current.temperature_2m : null;
        const code =
          typeof current?.weather_code === "number" ? current.weather_code : null;
        if (temperature === null) {
          setState({ status: "hidden" });
          return;
        }
        setState({ status: "ready", temperature, code });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "hidden" });
      });

    return () => {
      cancelled = true;
    };
  }, [coords]);

  if (state.status === "hidden" || !coords) return null;

  const isReady = state.status === "ready";
  const summary = describeWeatherCode(isReady ? state.code : null);
  const Icon = BUCKET_ICONS[summary.bucket] ?? Cloud;

  return (
    <div className="border-4 border-ink bg-sky p-5 shadow-brutal-md">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="flex size-9 items-center justify-center border-[3px] border-ink bg-paper"
        >
          <Icon className="size-4" />
        </span>
        <h3 className="font-display text-h4 uppercase">Right now</h3>
      </div>

      <p role="status" aria-live="polite" className="mt-3">
        {isReady ? (
          <span className="flex flex-wrap items-baseline gap-2">
            <span className="font-display text-h2 uppercase leading-none">
              {Math.round(state.temperature)}°C
            </span>
            <span className="text-sm font-semibold text-ink-soft">{summary.label}</span>
          </span>
        ) : (
          <span className="flex items-center gap-2 text-sm font-medium text-ink-soft">
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Fetching the latest reading…
          </span>
        )}
      </p>

      <p className={cn("mt-3 text-xs font-semibold text-ink-soft")}>
        {place} · current weather via Open-Meteo
      </p>
    </div>
  );
}
