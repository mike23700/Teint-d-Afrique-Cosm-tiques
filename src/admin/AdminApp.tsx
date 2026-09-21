import { useEffect, useState } from 'react'
import { useAuth } from '@/admin/hooks/useAuth'
import Layout, { type Tab } from '@/admin/components/Layout'
import LoginPage from '@/admin/pages/LoginPage'
import GammesPage from '@/admin/pages/GammesPage'
import ContentPage from '@/admin/pages/ContentPage'
import MediaPage from '@/admin/pages/MediaPage'
import SettingsPage from '@/admin/pages/SettingsPage'

/**
 * Point d'entrée de l'admin, monté sous /admin dans src/routes.tsx (chargé en lazy pour ne pas
 * alourdir le bundle du site public). Gère lui-même sa navigation interne (onglets) sans
 * react-router imbriqué, puisqu'il n'a pas besoin d'URL profondes pour l'instant.
 */
export default function AdminApp() {
  const { status, login, logout } = useAuth()
  const [tab, setTab] = useState<Tab>('gammes')

  useEffect(() => {
    const previousTitle = document.title
    document.title = "Admin — Teint d'Afrique Cosmétiques"

    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)

    return () => {
      document.title = previousTitle
      document.head.removeChild(meta)
    }
  }, [])

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[#3B1705]/50">
        Chargement...
      </div>
    )
  }

  if (status === 'anonymous') {
    return <LoginPage onLogin={login} />
  }

  return (
    <Layout active={tab} onTabChange={setTab} onLogout={logout}>
      {tab === 'gammes' && <GammesPage />}
      {tab === 'contenu' && <ContentPage />}
      {tab === 'media' && <MediaPage />}
      {tab === 'reglages' && <SettingsPage />}
    </Layout>
  )
}
