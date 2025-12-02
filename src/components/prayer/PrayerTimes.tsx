import { useEffect, useState } from "react";
import {
  getTimingsByCoordinates,
  getTimingsByCity,
  getTimingsByAddress,
} from "../../api/prayerApi";

type Location = {
  city?: string;
  region?: string;
  country?: string;
  lat?: number;
  lon?: number;
};

type Props = {
  location?: Location;
  method?: number;
  school?: number;
};

export default function PrayerTimes({ location, method, school }: Props) {
  const [timings, setTimings] = useState<Record<string, string> | null>(null);
  const [dateLabel, setDateLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!location) {
        setTimings(null);
        setDateLabel(null);
        return;
      }

      setLoading(true);
      setError(null);
      setTimings(null);
      setDateLabel(null);

      try {
        let data: any = null;

        if (location.lat != null && location.lon != null) {
          data = await getTimingsByCoordinates(location.lat, location.lon, { method, school });
        } else if (location.city && location.country) {
          data = await getTimingsByCity(location.city, location.country, { method, school });
        } else if (location.city) {
          data = await getTimingsByAddress(location.city, { method, school });
        } else {
          throw new Error("Incomplete location");
        }

        if (cancelled) return;

        // Aladhan response data typically contains .timings and .date
        setTimings(data?.timings ?? null);

        const readable =
          data?.date?.readable ??
          (data?.meta?.timezone ? `Timezone: ${data.meta.timezone}` : null);
        setDateLabel(readable ?? null);
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Failed to load timings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [location, method, school]);

  const order = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha", "Imsak", "Midnight"];

  return (
    <section style={{ padding: 16, maxWidth: 760, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 8 }}>Prayer times</h2>
      {location && (
        <div style={{ marginBottom: 10, color: "#444" }}>
          <strong>
            {location.city ?? location.region ?? location.country ?? "Selected location"}
          </strong>
          {location.lat != null && location.lon != null && (
            <span style={{ marginLeft: 8, color: "#666" }}>
              {location.lat.toFixed(3)}, {location.lon.toFixed(3)}
            </span>
          )}
        </div>
      )}

      {loading && <div>Loading…</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      {!loading && timings && (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>{dateLabel}</div>
          {order
            .filter((k) => timings[k])
            .map((k) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #eee",
                  background: "#fff",
                }}
              >
                <div style={{ fontWeight: 600 }}>{k}</div>
                <div style={{ color: "#222" }}>{timings[k]}</div>
              </div>
            ))}

          {/* any remaining keys */}
          {Object.keys(timings)
            .filter((k) => !order.includes(k))
            .map((k) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #eee",
                  background: "#fff",
                }}
              >
                <div style={{ fontWeight: 600 }}>{k}</div>
                <div style={{ color: "#222" }}>{timings[k]}</div>
              </div>
            ))}
        </div>
      )}

      {!loading && !timings && !error && <div style={{ color: "#666" }}>No timings to display.</div>}
    </section>
  );
}