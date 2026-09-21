import { useEffect, useState } from 'react'
import { fetchContent } from '@/lib/api'

/**
 * Charge les blocs de contenu éditables d'une page depuis l'API, avec repli sur le texte
 * `fallback` (le texte actuel des pages, toujours fourni par l'appelant) si l'API est
 * indisponible ou ne renvoie rien pour un bloc donné.
 *
 * N'utiliser que pour des blocs de texte simple (pas de HTML) : ce hook rend le contenu
 * tel quel via React (donc toujours échappé), il ne doit pas servir à injecter du richtext.
 */
export function useContent<Keys extends string>(
  page: string,
  fallback: Record<Keys, string>
): Record<Keys, string> {
  const [blocks, setBlocks] = useState<Record<Keys, string>>(fallback)

  useEffect(() => {
    let cancelled = false

    fetchContent(page)
      .then(data => {
        if (cancelled || data.length === 0) return
        setBlocks(prev => {
          const next = { ...prev }
          for (const block of data) {
            if (block.blockKey in next) {
              next[block.blockKey as Keys] = block.value
            }
          }
          return next
        })
      })
      .catch(() => {
        // API indisponible : on reste sur le texte statique déjà en place.
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fallback est un littéral stable défini par l'appelant
  }, [page])

  return blocks
}
