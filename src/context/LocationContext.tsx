import { createContext, useContext, useState, type ReactNode } from 'react'

type Coords = { lat: number; lon: number }

interface LocationContextValue {
  coords: Coords | null
  locationName: string | null
  setCoordsFromBrowser?: () => void
  setLocationByName?: (name: string) => void
}

const LocationContext = createContext<LocationContextValue>({
  coords: null,
  locationName: null,
})

export function LocationProvider({ children }: { children: ReactNode }) {
  const [coords, setCoords] = useState<Coords | null>(null)
  const [locationName, setLocationName] = useState<string | null>(null)

  const setCoordsFromBrowser = () => {
    // implementation later
  }

  const setLocationByName = (name: string) => {
    setLocationName(name)
    // later: call geocoding API and set coords as well
  }

  return (
    <LocationContext.Provider
      value={{ coords, locationName, setCoordsFromBrowser, setLocationByName }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => useContext(LocationContext)
