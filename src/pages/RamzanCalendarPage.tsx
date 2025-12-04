import { useEffect, useMemo, useState } from "react";
import { useLocation } from "@/context/LocationContext";
import {
  fetchRamzanCalendarByCoordinates,
  type AladhanCalendarDay,
} from "@/api/prayerApi";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Status = "idle" | "loading" | "success" | "error";

function dayMatches(d: Date, day: AladhanCalendarDay): boolean {
  const [dd, mm, yyyy] = day.date.gregorian.date.split("-").map(Number);
  return (
    d.getFullYear() === yyyy &&
    d.getMonth() === mm - 1 &&
    d.getDate() === dd
  );
}

function formatTimeLabel(label: string): string {
  if (label === "Fajr") return "Fajr (Sehri end)";
  if (label === "Maghrib") return "Maghrib (Iftar)";
  return label;
}

export function RamzanCalendarPage() {
  const { location } = useLocation();

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<AladhanCalendarDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [ramzanStart, setRamzanStart] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "cards">("calendar");

  // Countdown timer
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  function getCountdownText(start: Date) {
    const diff = start.getTime() - now.getTime();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return `${days} days ${hours}h ${minutes}m ${seconds}s`;
  }

  // Toast on error (once)
  useEffect(() => {
    if (status === "error" && error) {
      toast.error(`Failed to load Ramzan calendar: ${error}`);
    }
  }, [status, error]);

  // Fetch on mount / when location changes
  useEffect(() => {
    if (!location) return;

    const lat =
      (location as any).lat ??
      (location as any).latitude ??
      (location as any).coords?.lat;

    const lon =
      (location as any).lon ??
      (location as any).lng ??
      (location as any).longitude ??
      (location as any).coords?.lng ??
      (location as any).coords?.lon;

    if (lat == null || lon == null) return;

    setStatus("loading");
    setError(null);

    fetchRamzanCalendarByCoordinates({
      latitude: lat,
      longitude: lon,
      method: 2,
    })
      .then((data) => {
        setDays(data || []);
        setStatus("success");

        if (data && data.length > 0) {
          const [dd, mm, yyyy] = data[0].date.gregorian.date
            .split("-")
            .map(Number);
          const firstDate = new Date(yyyy, mm - 1, dd);

          setRamzanStart(firstDate);
          setSelectedDate(firstDate);
        }
      })
      .catch((e) => {
        console.error(e);
        setError(e.message || "Something went wrong");
        setStatus("error");
      });
  }, [location]);

  const selectedDay = useMemo<AladhanCalendarDay | undefined>(() => {
    if (!selectedDate || days.length === 0) return undefined;
    return days.find((d) => dayMatches(selectedDate, d));
  }, [selectedDate, days]);

  const locationLabel =
    (location as any)?.displayName ||
    (location as any)?.label ||
    `${(location as any)?.city ?? ""} ${
      (location as any)?.country ?? ""
    }`.trim();

  const TIMING_KEYS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

  const getTiming = (day: AladhanCalendarDay, key: string) =>
    (day.timings as Record<string, string>)[key] ?? "-";

  // Reusable: timetable card (right side in calendar view)
  const timetableCard = (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Full Ramzan timetable</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[480px] overflow-auto">
        {status === "loading" && (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        )}

        {status === "success" && days.length > 0 && (
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="py-1 pr-2">#</th>
                <th className="py-1 pr-2">Date</th>
                <th className="py-1 pr-2">Fajr</th>
                <th className="py-1 pr-2">Dhuhr</th>
                <th className="py-1 pr-2">Asr</th>
                <th className="py-1 pr-2">Maghrib</th>
                <th className="py-1 pr-2">Isha</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day, idx) => {
                const isSelected =
                  selectedDate && dayMatches(selectedDate, day);
                const [dd, mm, yyyy] = day.date.gregorian.date
                  .split("-")
                  .map(Number);
                return (
                  <tr
                    key={day.date.gregorian.date}
                    className={`border-b cursor-pointer ${
                      isSelected ? "bg-muted" : ""
                    }`}
                    onClick={() => {
                      setSelectedDate(new Date(yyyy, mm - 1, dd));
                    }}
                  >
                    <td className="py-1 pr-2 align-middle font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-1 pr-2 align-middle">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-medium">
                          {day.date.hijri.date}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {day.date.gregorian.date}
                        </span>
                      </div>
                    </td>
                    <td className="py-1 pr-2 align-middle">
                      {(day.timings as Record<string, string>)["Fajr"]}
                    </td>
                    <td className="py-1 pr-2 align-middle">
                      {(day.timings as Record<string, string>)["Dhuhr"]}
                    </td>
                    <td className="py-1 pr-2 align-middle">
                      {(day.timings as Record<string, string>)["Asr"]}
                    </td>
                    <td className="py-1 pr-2 align-middle">
                      {(day.timings as Record<string, string>)["Maghrib"]}
                    </td>
                    <td className="py-1 pr-2 align-middle">
                      {(day.timings as Record<string, string>)["Isha"]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {status === "success" && days.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No Ramzan days returned for this year/location.
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto max-w-5xl px-4 py-4 space-y-4">
      {/* Header + view mode switch */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Ramzan Calendar
          </h1>
          <p className="text-sm text-muted-foreground">
            Sehri &amp; Iftar times for{" "}
            <span className="font-medium">
              {locationLabel || "your location"}
            </span>{" "}
            based on Aladhan Hijri calendar.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs sm:self-auto">
          <Label htmlFor="view-mode-switch" className="cursor-pointer">
            {viewMode === "calendar" ? "Calendar view" : "Cards view"}
          </Label>
          <Switch
            id="view-mode-switch"
            checked={viewMode === "cards"}
            onCheckedChange={(checked) =>
              setViewMode(checked ? "cards" : "calendar")
            }
          />
        </div>
      </div>

      {!location && (
        <p className="text-sm text-destructive">
          Please select a location first to view the Ramzan calendar.
        </p>
      )}

      {/* CALENDAR VIEW */}
      {viewMode === "calendar" && (
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          {/* BEFORE RAMZAN: countdown (left) + table (right) */}
          {ramzanStart &&
          ramzanStart.getTime() > now.getTime() &&
          status === "success" ? (
            <>
              <Card className="flex flex-col items-center justify-center text-center">
                <CardHeader>
                  <CardTitle>Ramzan begins soon</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    First fast starts on:
                  </p>
                  <p className="text-lg font-medium">
                    {ramzanStart.toLocaleDateString()}
                  </p>
                  <div className="text-xl font-semibold bg-muted px-4 py-2 rounded-lg">
                    {getCountdownText(ramzanStart)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The calendar will unlock automatically when Ramzan begins.
                  </p>
                </CardContent>
              </Card>

              {timetableCard}
            </>
          ) : (
            <>
              {/* DURING/AFTER RAMZAN (or while loading / no start yet):
                  calendar + selected-day card (left) + timetable (right) */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Pick a Ramzan date</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {status === "loading" && (
                    <div className="flex flex-col gap-3">
                      <Skeleton className="h-72 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  )}

                  {status === "error" && (
                    <p className="text-sm text-destructive">
                      Failed to load Ramzan calendar: {error}
                    </p>
                  )}

                  {status === "success" && days.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No Ramzan days returned for this year/location.
                    </p>
                  )}

                  {status === "success" && days.length > 0 && (
                    <>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                        disabled={(date) =>
                          !days.some((d) => dayMatches(date, d))
                        }
                      />

                      {selectedDay && (
                        <div className="mt-2 space-y-2 text-sm">
                          <div className="font-medium">
                            {selectedDay.date.hijri.weekday.en},{" "}
                            {selectedDay.date.hijri.date} (Hijri)
                          </div>
                          <div className="text-muted-foreground">
                            {(() => {
                              const [dd, mm, yyyy] =
                                selectedDay.date.gregorian.date
                                  .split("-")
                                  .map(Number);
                              return new Date(
                                yyyy,
                                mm - 1,
                                dd
                              ).toLocaleDateString();
                            })()}{" "}
                            (Gregorian)
                          </div>

                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <div className="rounded-lg border p-3">
                              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Sehri
                              </div>
                              <div className="mt-1 text-lg font-semibold">
                                {(selectedDay.timings as Record<string, string>)[
                                  "Imsak"
                                ] ||
                                  (selectedDay.timings as Record<string, string>)[
                                    "Fajr"
                                  ]}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Imsak / Fajr
                              </div>
                            </div>

                            <div className="rounded-lg border p-3">
                              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Iftar
                              </div>
                              <div className="mt-1 text-lg font-semibold">
                                {
                                  (selectedDay.timings as Record<string, string>)[
                                    "Maghrib"
                                  ]
                                }
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Maghrib
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
                            {TIMING_KEYS.map((key) => (
                              <div
                                key={key}
                                className="flex items-center justify-between rounded border px-2 py-1"
                              >
                                <span className="font-medium">
                                  {formatTimeLabel(key)}
                                </span>
                                <span>{getTiming(selectedDay, key)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!selectedDay && (
                        <p className="text-xs text-muted-foreground">
                          Select any highlighted date in the calendar to view
                          its Sehri &amp; Iftar timings.
                        </p>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {timetableCard}
            </>
          )}
        </div>
      )}

      {/* CARDS VIEW – only after Ramzan starts */}
      {ramzanStart &&
        ramzanStart.getTime() <= now.getTime() &&
        viewMode === "cards" && (
          <div className="space-y-3">
            {status === "loading" && (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            )}

            {status === "error" && (
              <p className="text-sm text-destructive">
                Failed to load Ramzan calendar: {error}
              </p>
            )}

            {status === "success" && days.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No Ramzan days returned for this year/location.
              </p>
            )}

            {status === "success" && days.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {days.map((day) => {
                  const [dd, mm, yyyy] = day.date.gregorian.date
                    .split("-")
                    .map(Number);
                  const isSelected =
                    selectedDate && dayMatches(selectedDate, day);

                  return (
                    <Card
                      key={day.date.gregorian.date}
                      className={`flex flex-col justify-between transition hover:shadow-md ${
                        isSelected ? "border-primary/70" : ""
                      }`}
                      onClick={() =>
                        setSelectedDate(new Date(yyyy, mm - 1, dd))
                      }
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          {day.date.hijri.date} –{" "}
                          <span className="font-normal text-muted-foreground">
                            {day.date.gregorian.date}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        <div className="flex items-center justify-between rounded-md bg-muted px-2 py-1">
                          <span className="font-medium">Sehri</span>
                          <span>
                            {(day.timings as Record<string, string>)["Imsak"] ||
                              (day.timings as Record<string, string>)["Fajr"]}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-md bg-muted px-2 py-1">
                          <span className="font-medium">Iftar</span>
                          <span>
                            {(day.timings as Record<string, string>)["Maghrib"]}
                          </span>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-1">
                          {TIMING_KEYS.map((key) => (
                            <div
                              key={key}
                              className="flex items-center justify-between rounded border px-2 py-1"
                            >
                              <span className="text-[11px] font-medium">
                                {key}
                              </span>
                              <span className="text-[11px]">
                                {getTiming(day, key)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

      <p className="text-xs text-muted-foreground">
        Future idea: once you add user accounts, you can track whether the user
        has prayed all 5 salah for each Ramzan day and show a simple checklist
        here, stored in your backend.
      </p>
    </div>
  );
}