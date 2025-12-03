import { NextPrayerCountdown } from "@/components/prayer/NextPrayerCountdown";
import { PrayerTimesCard } from "@/components/prayer/PrayerTimesCard";
import { useLocation } from "@/context/LocationContext";

function TodayPage() {
  const { location } = useLocation();

  return (
    <div className="container mx-auto max-w-2xl px-4 space-y-4">
      <NextPrayerCountdown location={location ?? undefined} method={1} school={0} />
      <PrayerTimesCard location={location ?? undefined} method={1} school={0} />
    </div>
  );
}
export default TodayPage;