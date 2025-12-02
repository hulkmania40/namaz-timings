import LocationDisplay from "../location/LocationDisplay";
import ThemeToggle from "./ThemeToggle";

type Location = {
  city?: string;
  region?: string;
  country?: string;
  lat?: number;
  lon?: number;
};

type Props = {
  value?: Location;
  onChange?: (loc: Location) => void;
};

export default function Header({ value, onChange }: Props) {
  return (
    <header className="border-b">
      <div className="container mx-auto max-w-2xl px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Top row: title + theme toggle (on mobile) */}
        <div className="flex items-center justify-between gap-2">
          <div className="font-semibold text-base sm:text-lg">
            Namaz Times
          </div>
          {/* Show theme toggle here only on mobile */}
          <div className="sm:hidden">
            <ThemeToggle />
          </div>
        </div>

        {/* Second row: location + theme toggle (on larger screens) */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <LocationDisplay
            value={value}
            onChange={onChange}
            className="flex-1 min-w-0"
          />
          {/* Show theme toggle on the right on larger screens */}
          <div className="hidden sm:block shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
