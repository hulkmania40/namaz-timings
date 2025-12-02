import { createContext, useContext, useState, type ReactNode } from 'react'

interface Settings {
  method: string // "ISNA", "MWL", etc.
  madhab: 'hanafi' | 'shafi'
}

interface SettingsContextValue extends Settings {
  setSettings: (s: Settings) => void
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    method: 'MWL',
    madhab: 'hanafi',
  })

  return (
    <SettingsContext.Provider value={{ ...settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
