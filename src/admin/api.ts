/**
 * Client de l'API du panneau d'admin (voir ../../api/README.md pour le contrat complet).
 * Le jeton CSRF est gardé en mémoire (jamais en localStorage, voir docs/plan.md §6.1) et rejoué
 * sur chaque requête de modification via le header X-CSRF-Token.
 */

export interface Product {
  id: number
  type: string
  poids: string
  symbol: string
  description: string
}

export interface Gamme {
  id: string
  nom: string
  tagline: string
  ingredients: string
  color: string
  colorLight: string
  colorDark: string
  description: string
  ingredientsDetail: string
  hasPdfLabel: boolean
  image: string | null
  products: Product[]
}

export interface ContentBlock {
  blockKey: string
  blockType: 'text' | 'richtext' | 'image'
  value: string
}

export interface Settings {
  contact_phone: string
  contact_email: string
  contact_address: string
  whatsapp_number: string
  facebook_url: string
  instagram_url: string
}

export interface MediaItem {
  id: number
  url: string
  originalName: string
  mimeType: string
  sizeBytes: number
  altText: string
  createdAt: string
}

export interface GammeUpdateFields {
  nom?: string
  tagline?: string
  ingredients?: string
  color?: string
  colorLight?: string
  colorDark?: string
  description?: string
  ingredientsDetail?: string
  imageId?: number | null
}

export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number
  ) {
    super(code)
  }
}

let csrfToken: string | null = null

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData
  const res = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      ...options.headers,
    },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok || !body?.success) {
    throw new ApiError(body?.error ?? `api_error_${res.status}`, res.status)
  }
  return body.data as T
}

// --- Authentification ---

export async function checkSession(): Promise<boolean> {
  const data = await request<{ authenticated: boolean; csrfToken?: string }>('/api/auth/session.php')
  if (data.authenticated && data.csrfToken) {
    csrfToken = data.csrfToken
  }
  return data.authenticated
}

export async function login(email: string, password: string): Promise<void> {
  const data = await request<{ csrfToken: string }>('/api/auth/login.php', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  csrfToken = data.csrfToken
}

export async function logout(): Promise<void> {
  await request('/api/auth/logout.php', { method: 'POST' })
  csrfToken = null
}

// --- Gammes & produits ---

export function fetchGammes(): Promise<Gamme[]> {
  return request<Gamme[]>('/api/gammes/list.php')
}

export function updateGamme(id: string, fields: GammeUpdateFields): Promise<void> {
  return request('/api/gammes/update.php', {
    method: 'POST',
    body: JSON.stringify({ id, ...fields }),
  })
}

export function updateProduit(id: number, fields: Partial<Omit<Product, 'id'>>): Promise<void> {
  return request('/api/produits/update.php', {
    method: 'POST',
    body: JSON.stringify({ id, ...fields }),
  })
}

// --- Contenu de pages ---

export function fetchContent(page: string): Promise<ContentBlock[]> {
  return request<ContentBlock[]>(`/api/content/list.php?page=${encodeURIComponent(page)}`)
}

export function updateContent(page: string, blockKey: string, value: string, blockType?: string): Promise<void> {
  return request('/api/content/update.php', {
    method: 'POST',
    body: JSON.stringify({ page, blockKey, value, blockType }),
  })
}

// --- Réglages (coordonnées & réseaux sociaux) ---

export function fetchSettings(): Promise<Settings> {
  return request<Settings>('/api/settings/list.php')
}

export function updateSetting(key: keyof Settings, value: string): Promise<void> {
  return request('/api/settings/update.php', {
    method: 'POST',
    body: JSON.stringify({ key, value }),
  })
}

// --- Médiathèque ---

export function fetchMedia(): Promise<MediaItem[]> {
  return request<MediaItem[]>('/api/media/list.php')
}

export function uploadMedia(file: File, altText: string): Promise<{ id: number; url: string }> {
  const form = new FormData()
  form.append('file', file)
  form.append('altText', altText)
  return request('/api/media/upload.php', { method: 'POST', body: form })
}

export function deleteMedia(id: number): Promise<void> {
  return request('/api/media/delete.php', {
    method: 'POST',
    body: JSON.stringify({ id }),
  })
}
