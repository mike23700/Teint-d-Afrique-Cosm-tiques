import type { Gamme } from '@/data'

/**
 * Client de l'API du panneau d'administration (voir api/README.md pour le contrat complet).
 * En développement, Vite proxifie /api et /uploads vers le serveur PHP local (voir vite.config.ts).
 * En production, le site et l'API sont servis depuis le même domaine (voir docs/host.md), donc les
 * chemins relatifs fonctionnent sans configuration CORS particulière.
 */

export interface ApiGamme extends Omit<Gamme, 'image'> {
  image: string | null
}

export interface ContentBlock {
  blockKey: string
  blockType: 'text' | 'richtext' | 'image'
  value: string
  /** Résolu pour les blocs de type "image" (null si aucun média associé). */
  imageUrl?: string | null
}

export interface Settings {
  contact_phone: string
  contact_email: string
  contact_address: string
  whatsapp_number: string
  facebook_url: string
  instagram_url: string
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: 'include' })
  const body = await res.json().catch(() => null)
  if (!res.ok || !body?.success) {
    throw new Error(body?.error ?? `api_error_${res.status}`)
  }
  return body.data as T
}

export function fetchGammes(): Promise<ApiGamme[]> {
  return apiGet<ApiGamme[]>('/api/gammes/list.php')
}

export function fetchContent(page: string): Promise<ContentBlock[]> {
  return apiGet<ContentBlock[]>(`/api/content/list.php?page=${encodeURIComponent(page)}`)
}

export function fetchSettings(): Promise<Settings> {
  return apiGet<Settings>('/api/settings/list.php')
}
