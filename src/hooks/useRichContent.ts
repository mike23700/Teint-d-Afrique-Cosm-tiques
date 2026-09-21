import { useEffect, useState } from 'react'

import { fetchContent } from '@/lib/api'

type Dangerous = { __html: string }

export type RichContent<Keys extends string> = Record<Keys, Dangerous>

/** Convertit le texte statique de repli en objets { __html } prêts pour dangerouslySetInnerHTML. */
function toDangerous<Keys extends string>(fallback: Record<Keys, string>): RichContent<Keys> {
  const out = {} as RichContent<Keys>
  for (const key of Object.keys(fallback) as Keys[]) {
    out[key] = { __html: fallback[key] }
  }
  return out
}

/**
 * Comme useContent, mais pour les blocs de type "richtext" : rend le HTML déjà sanitisé
 * côté serveur (api/bootstrap.php, liste blanche de balises) via dangerouslySetInnerHTML.
 *
 * ⚠️ Ne s'utilise que pour des blocs déclarés "richtext" en base, et dont le contenu provient
 * de l'API (ou du repli statique fourni ici) — le HTML n'est jamais construit dans le navigateur.
 */
export function useRichContent<Keys extends string>(
  page: string,
  fallback: Record<Keys, string>
): RichContent<Keys> {
  const [content, setContent] = useState<RichContent<Keys>>(() => toDangerous(fallback))

  useEffect(() => {
    let cancelled = false

    fetchContent(page)
      .then(data => {
        if (cancelled || data.length === 0) return
        setContent(prev => {
          const next = { ...prev }
          for (const block of data) {
            if (block.blockKey in next && block.blockType === 'richtext') {
              next[block.blockKey as Keys] = { __html: block.value }
            }
          }
          return next
        })
      })
      .catch(() => {
        // API indisponible : on reste sur le HTML statique déjà en place.
      })

    return () => {
      cancelled = true
    }
  }, [page])

  return content
}