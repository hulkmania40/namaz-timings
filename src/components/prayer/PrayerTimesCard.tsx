import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { usePrayerTimes, type Location } from '../../hooks/usePrayerTimes'

type Props = {
  location?: Location
  method?: number
  school?: number
}

export function PrayerTimesCard({ location, method, school }: Props) {
  const { timings, dateLabel, loading, error, order } = usePrayerTimes(location, {
    method,
    school,
  })

  if (!location) {
    return (
      <Card className="shadow-sm border border-dashed">
        <CardContent className="py-4 text-sm text-muted-foreground">
          Select a location to view today&apos;s namaz timings.
        </CardContent>
      </Card>
    )
  }

  // Loading skeleton
  if (loading) {
    return (
      <Card className="shadow-sm border border-border bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Today&apos;s Namaz Timings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-3 w-40 rounded bg-muted animate-pulse mb-2" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between text-sm animate-pulse rounded-md border border-border/60 px-3 py-2"
            >
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-3 w-12 rounded bg-muted" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="border-destructive/60 bg-destructive/5">
        <CardContent className="py-3 text-sm text-destructive">
          {error}
        </CardContent>
      </Card>
    )
  }

  if (!timings) {
    return (
      <Card className="shadow-sm border">
        <CardContent className="py-4 text-sm text-muted-foreground">
          No timings to display.
        </CardContent>
      </Card>
    )
  }

  const primaryLabel =
    location.city ?? location.region ?? location.country ?? 'Selected location'

  const coordsLabel =
    location.lat != null && location.lon != null
      ? `${location.lat.toFixed(3)}, ${location.lon.toFixed(3)}`
      : ''

  const orderedKeys = order.filter((k) => timings[k])
  const extraKeys = Object.keys(timings).filter((k) => !order.includes(k))

  return (
    <Card className="shadow-sm border border-border bg-card/80 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg space-y-1">
          <div className="flex items-baseline justify-between gap-2">
            <span>Today&apos;s Namaz Timings</span>
            {dateLabel && (
              <span className="text-xs text-muted-foreground">{dateLabel}</span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{primaryLabel}</span>
            {coordsLabel && (
              <span className="font-mono">{coordsLabel}</span>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-1 pt-2">
        <div className="rounded-md border border-border/60 divide-y divide-border/60">
          {orderedKeys.map((k) => (
            <div
              key={k}
              className="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/60 dark:hover:bg-muted/40 transition-colors"
            >
              <span className="font-medium">{k}</span>
              <span className="font-mono text-sm">{timings[k]}</span>
            </div>
          ))}

          {extraKeys.map((k) => (
            <div
              key={k}
              className="flex items-center justify-between px-3 py-2 text-xs sm:text-sm text-muted-foreground hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors"
            >
              <span className="font-medium">{k}</span>
              <span className="font-mono text-[11px] sm:text-xs">
                {timings[k]}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
