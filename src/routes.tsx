import { createBrowserRouter } from 'react-router'
import Layout from '@/components/Layout'
import AccueilPage from '@/pages/AccueilPage'
import PresentationPage from '@/pages/PresentationPage'
import HistoirePage from '@/pages/HistoirePage'
import BoutiquePage from '@/pages/BoutiquePage'
import GammePage from '@/pages/GammePage'
import ContactPage from '@/pages/ContactPage'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: AccueilPage },
      { path: 'presentation', Component: PresentationPage },
      { path: 'histoire', Component: HistoirePage },
      { path: 'boutique', Component: BoutiquePage },
      { path: 'boutique/:gammeId', Component: GammePage },
      { path: 'contact', Component: ContactPage },
      {
        path: '*',
        Component: () => (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-6">
            <p
              className="text-[#3B1705] text-5xl"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              404
            </p>
            <p className="text-[#2A1006]/60">Page introuvable</p>
            <a
              href="/"
              className="text-[#C97B1A] text-[11px] tracking-[0.2em] uppercase underline"
            >
              Retour à l'accueil
            </a>
          </div>
        ),
      },
    ],
  },
])
