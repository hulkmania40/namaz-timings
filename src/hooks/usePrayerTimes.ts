import { useEffect, useState } from "react";
import {
  getTimingsByCoordinates,
  getTimingsByCity,
  getTimingsByAddress,
} from "../api/prayerApi";

export type Location = {
  city?: string;
  region?: string;
  country?: string;
  lat?: number;
  lon?: number;
};

type Options = {
  method?: number;
  school?: number;
};

type NextPrayer = {
  name: string;
  time: string;
  countdownMs: number;
  countdownText: string;
};

const ORDER = [
  "Fajr",
  "Sunrise",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
  "Imsak",
  "Midnight",
];

export function usePrayerTimes(
  location?: Location,
  { method, school }: Options = {}
) {
  const [timings, setTimings] = useState<Record<string, string> | null>(null);
  const [dateLabel, setDateLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!location) {
        setTimings(null);
        setDateLabel(null);
        setNextPrayer(null);
        return;
      }

      setLoading(true);
      setError(null);
      setTimings(null);
      setDateLabel(null);
      setNextPrayer(null);

      try {
        let data: any = null;

        if (location.lat != null && location.lon != null) {
          data = await getTimingsByCoordinates(location.lat, location.lon, {
            method,
            school,
          });
        } else if (location.city && location.country) {
          data = await getTimingsByCity(location.city, location.country, {
            method,
            school,
          });
        } else if (location.city) {
          data = await getTimingsByAddress(location.city, { method, school });
        } else {
          throw new Error("Incomplete location");
        }

        if (cancelled) return;

        const t: Record<string, string> | null = data?.timings ?? null;
        setTimings(t);

        const readable =
          data?.date?.readable ??
          (data?.meta?.timezone ? `Timezone: ${data.meta.timezone}` : null);
        setDateLabel(readable ?? null);

        if (t) {
          const np = computeNextPrayer(t);
          setNextPrayer(np);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Failed to load timings");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [location?.lat, location?.lon, location?.city, location?.country, method, school]);

  return {
    timings,
    dateLabel,
    loading,
    error,
    order: ORDER,
    nextPrayer,
  };
}

// --- helpers ---

function computeNextPrayer(timings: Record<string, string>): NextPrayer | null {
  const now = new Date();
  let best: { key: string; time: string; diffMs: number } | null = null;

  for (const key of ORDER) {
    const raw = timings[key];
    if (!raw) continue;

    // Expecting format "HH:MM" (Aladhan style). Strip anything after space, just in case.
    const timePart = raw.split(" ")[0];
    const [hStr, mStr] = timePart.split(":");
    const h = Number(hStr);
    const m = Number(mStr);
    if (Number.isNaN(h) || Number.isNaN(m)) continue;

    const dt = new Date();
    dt.setHours(h, m, 0, 0);

    const diff = dt.getTime() - now.getTime();
    if (diff > 0 && (!best || diff < best.diffMs)) {
      best = { key, time: raw, diffMs: diff };
    }
  }

  if (!best) return null;

  return {
    name: best.key,
    time: best.time,
    countdownMs: best.diffMs,
    countdownText: formatDuration(best.diffMs),
  };
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");
  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}
