import { useEffect, useState } from 'react'
import { fetchSettings, type Settings } from '@/lib/api'

const FALLBACK_SETTINGS: Settings = {
  contact_phone: '',
  contact_email: 'contact@teintdafrique.com',
  contact_address: 'Douala, Cameroun',
  whatsapp_number: 'https://wa.me/237000000000',
  facebook_url: '',
  instagram_url: '',
}

/**
 * Charge les coordonnées & réseaux sociaux depuis l'API, avec repli sur les valeurs
 * actuellement codées en dur dans le site si l'API est indisponible.
 */
export function useSettings(): Settings {
  const [settings, setSettings] = useState<Settings>(FALLBACK_SETTINGS)

  useEffect(() => {
    let cancelled = false

    fetchSettings()
      .then(data => {
        if (cancelled) return
        setSettings(prev => ({ ...prev, ...data }))
      })
      .catch(() => {
        // API indisponible : on reste sur les coordonnées statiques déjà en place.
      })

    return () => {
      cancelled = true
    }
  }, [])

  return settings
}
