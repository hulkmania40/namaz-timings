import { Card } from '@/components/ui/card'
import { usePrayerTimes, type Location } from '../../hooks/usePrayerTimes'

type Props = {
  location?: Location
  method?: number
  school?: number
}

export function NextPrayerCountdown({ location, method, school }: Props) {
  const { nextPrayer, loading, error } = usePrayerTimes(location, {
    method,
    school,
  })

  if (!location) return null
  if (loading) {
    return (
      <Card className="p-3 text-sm flex justify-between items-center animate-pulse">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="h-3 w-16 rounded bg-muted" />
      </Card>
    )
  }
  if (error || !nextPrayer) return null

  return (
    <Card className="p-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
      <div className="flex items-baseline gap-1">
        <span className="font-medium">Next:</span>
        <span className="font-semibold">{nextPrayer.name}</span>
        <span className="font-mono text-xs text-muted-foreground">
          ({nextPrayer.time})
        </span>
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground">
        In {nextPrayer.countdownText}
      </div>
    </Card>
  )
}
