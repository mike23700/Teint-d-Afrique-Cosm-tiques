import { useEffect, useState } from 'react'
import { fetchContent } from '@/lib/api'

/**
 * Charge un bloc de contenu de type "image" (la valeur en base est l'id du média)
 * et renvoie l'URL prête à l'emploi. Repli sur `fallback` tant que rien n'est
 * associé ou si l'API est indisponible — la page ne doit jamais perdre son image
 * (voir docs/plan.md §6.2).
 */
export function useContentImage(page: string, blockKey: string, fallback: string): string {
  const [url, setUrl] = useState(fallback)

  useEffect(() => {
    let cancelled = false

    fetchContent(page)
      .then(data => {
        if (cancelled) return
        const block = data.find(b => b.blockKey === blockKey && b.blockType === 'image')
        if (block?.imageUrl) setUrl(block.imageUrl)
      })
      .catch(() => {
        // API indisponible : on garde l'image statique.
      })

    return () => {
      cancelled = true
    }
  }, [page, blockKey])

  return url
}
