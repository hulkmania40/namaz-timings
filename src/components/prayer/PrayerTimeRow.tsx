import { Badge } from '@/components/ui/badge'

interface PrayerTimeRowProps {
  name: string
  time: string
  isNext?: boolean
}

export function PrayerTimeRow({ name, time, isNext }: PrayerTimeRowProps) {
  const rowClasses = isNext
    ? 'bg-primary/10 dark:bg-primary/15'
    : 'hover:bg-muted/60 dark:hover:bg-muted/40'

  return (
    <div
      className={
        'flex items-center justify-between px-3 py-2 text-sm transition-colors ' +
        rowClasses
      }
    >
      <div className="flex flex-col">
        <span className="font-medium">{name}</span>
        {isNext && (
          <span className="text-[10px] uppercase tracking-wide text-primary/80 dark:text-primary/90">
            Upcoming
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">{time}</span>
        {isNext && (
          <Badge
            variant="default"
            className="text-[10px] px-2 py-0.5 rounded-full"
          >
            Next
          </Badge>
        )}
      </div>
    </div>
  )
}
