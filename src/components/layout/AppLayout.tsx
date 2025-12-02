import Footer from './Footer'
import type { ReactNode } from 'react'
import Header from './Header'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-6">
        {children}
      </main>
      <Footer />
    </div>
  )
}
