import { useEffect, useState } from 'react'
import { GAMMES as STATIC_GAMMES, type Gamme } from '@/data'
import { fetchGammes } from '@/lib/api'

/**
 * Charge les gammes depuis l'API du panneau d'admin ; si l'API est indisponible ou renvoie
 * une liste vide, on garde le contenu statique de secours (src/data.ts) — le site ne doit
 * jamais se retrouver sans données (voir docs/plan.md §6.2).
 *
 * Tant qu'aucune image n'a été téléversée pour une gamme via la médiathèque de l'admin,
 * `image` vaut `null` côté API : on retombe alors sur l'image statique correspondante.
 */
export function useGammes(): Gamme[] {
  const [gammes, setGammes] = useState<Gamme[]>(STATIC_GAMMES)

  useEffect(() => {
    let cancelled = false

    fetchGammes()
      .then(apiGammes => {
        if (cancelled || apiGammes.length === 0) return
        const merged = apiGammes.map(g => ({
          ...g,
          image: g.image ?? STATIC_GAMMES.find(s => s.id === g.id)?.image ?? '',
        }))
        setGammes(merged)
      })
      .catch(() => {
        // API indisponible : on reste sur les données statiques déjà en place.
      })

    return () => {
      cancelled = true
    }
  }, [])

  return gammes
}
