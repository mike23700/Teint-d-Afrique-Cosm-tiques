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
/**
 * Visuel de remplacement pour une gamme créée depuis l'admin sans image ni équivalent statique :
 * un aplat aux couleurs de la gamme avec son nom, plutôt qu'une image cassée.
 */
function placeholderImage(g: Pick<Gamme, 'nom' | 'colorLight' | 'colorDark'>): string {
  const nom = g.nom.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect width="800" height="600" fill="${g.colorLight}"/><text x="400" y="300" text-anchor="middle" dominant-baseline="middle" font-family="Georgia, serif" font-size="64" letter-spacing="8" fill="${g.colorDark}">${nom}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** Image affichée par le site pour une gamme sans image importée : visuel statique, sinon aplat. */
export function defaultGammeImage(g: Pick<Gamme, 'id' | 'nom' | 'colorLight' | 'colorDark'>): string {
  return STATIC_GAMMES.find(s => s.id === g.id)?.image ?? placeholderImage(g)
}

export function useGammes(): Gamme[] {
  const [gammes, setGammes] = useState<Gamme[]>(STATIC_GAMMES)

  useEffect(() => {
    let cancelled = false

    fetchGammes()
      .then(apiGammes => {
        if (cancelled || apiGammes.length === 0) return
        const merged = apiGammes.map(g => ({
          ...g,
          image: g.image ?? defaultGammeImage(g),
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
