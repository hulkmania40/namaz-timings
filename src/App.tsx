import { useState } from "react";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { PrayerTimesCard } from "./components/prayer/PrayerTimesCard";
import { NextPrayerCountdown } from "./components/prayer/NextPrayerCountdown";

type Location = {
  city?: string;
  region?: string;
  country?: string;
  lat?: number;
  lon?: number;
};

export default function App() {
  const [location, setLocation] = useState<Location | undefined>(undefined);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header value={location} onChange={setLocation} />
      <main style={{ flex: 1, paddingTop: 16 }}>
        <div className="space-y-4">
          <NextPrayerCountdown location={location} method={2} school={1} />
          <PrayerTimesCard location={location} method={2} school={1} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
