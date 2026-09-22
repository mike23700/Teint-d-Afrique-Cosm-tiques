import type { ReactNode } from 'react'
import { Button } from './ui'

export type Tab = 'gammes' | 'contenu' | 'reglages'

const TABS: { id: Tab; label: string }[] = [
  { id: 'gammes', label: 'Gammes' },
  { id: 'contenu', label: 'Pages' },
  { id: 'reglages', label: 'Coordonnées' },
]

export default function Layout({
  active,
  onTabChange,
  onLogout,
  children,
}: {
  active: Tab
  onTabChange: (tab: Tab) => void
  onLogout: () => void
  children: ReactNode
}) {
  return (
    <div className="min-h-screen">
      <header className="bg-[#3B1705] text-[#FAF6EF]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C97B1A]">Teint d'Afrique Cosmétiques</p>
            <p className="text-lg" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Panneau d'administration
            </p>
          </div>
          <Button
            variant="secondary"
            className="!border-[#FAF6EF]/30 !text-[#FAF6EF] hover:!bg-[#FAF6EF]/10"
            onClick={onLogout}
          >
            Déconnexion
          </Button>
        </div>
        <nav className="max-w-6xl mx-auto px-6 flex gap-1 border-t border-[#FAF6EF]/10">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-3 text-[11px] tracking-[0.15em] uppercase transition-colors border-b-2 ${
                active === tab.id
                  ? 'border-[#C97B1A] text-[#FAF6EF]'
                  : 'border-transparent text-[#FAF6EF]/50 hover:text-[#FAF6EF]/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  )
}
