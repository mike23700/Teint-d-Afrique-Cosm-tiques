import { useEffect, useRef, useState } from 'react'
import { ApiError, deleteMedia, fetchMedia, uploadMedia, type MediaItem } from '@/admin/api'
import { Banner, Button, Field, TextInput } from '@/admin/components/ui'

const ERROR_MESSAGES: Record<string, string> = {
  missing_file: 'Choisissez une image.',
  file_too_large: 'Image trop lourde (5 Mo maximum).',
  unsupported_file_type: 'Format non supporté (jpeg, png ou webp uniquement).',
  invalid_image: "Le fichier n'est pas une image valide.",
  media_in_use: 'Cette image est utilisée par une gamme : retirez-la de la gamme avant de la supprimer.',
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [altText, setAltText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function reload() {
    fetchMedia()
      .then(setItems)
      .catch(() => setLoadError('Impossible de charger la médiathèque.'))
  }

  useEffect(reload, [])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    const file = fileInputRef.current?.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)
    try {
      await uploadMedia(file, altText)
      setAltText('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      reload()
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'erreur_inconnue'
      setUploadError(ERROR_MESSAGES[code] ?? "Une erreur est survenue, réessayez.")
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(item: MediaItem) {
    if (!confirm(`Supprimer « ${item.originalName} » ?`)) return
    try {
      await deleteMedia(item.id)
      setItems(prev => (prev ? prev.filter(m => m.id !== item.id) : prev))
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'erreur_inconnue'
      alert(ERROR_MESSAGES[code] ?? "Impossible de supprimer cette image.")
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleUpload} className="bg-white border border-[#3B1705]/10 p-6 space-y-4">
        <h2 className="text-xl" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
          Ajouter une image
        </h2>
        <div className="grid md:grid-cols-2 gap-4 items-end">
          <Field label="Fichier (jpeg, png, webp — 5 Mo max)">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              className="block w-full text-sm"
            />
          </Field>
          <Field label="Texte alternatif (accessibilité)">
            <TextInput value={altText} onChange={e => setAltText(e.target.value)} placeholder="Description de l'image" />
          </Field>
        </div>
        {uploadError && <Banner kind="error">{uploadError}</Banner>}
        <Button type="submit" disabled={uploading}>
          {uploading ? 'Envoi...' : 'Téléverser'}
        </Button>
      </form>

      {loadError && <Banner kind="error">{loadError}</Banner>}
      {!loadError && items === null && <p className="text-sm text-[#3B1705]/50">Chargement...</p>}
      {items !== null && items.length === 0 && (
        <p className="text-sm text-[#3B1705]/50">Aucune image dans la médiathèque pour l'instant.</p>
      )}

      {items !== null && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white border border-[#3B1705]/10 overflow-hidden">
              <img src={item.url} alt={item.altText} className="w-full h-32 object-cover" />
              <div className="p-3 space-y-2">
                <p className="text-xs text-[#3B1705] truncate" title={item.originalName}>
                  {item.originalName}
                </p>
                <p className="text-[10px] text-[#3B1705]/40">{(item.sizeBytes / 1024).toFixed(0)} Ko</p>
                <Button variant="danger" onClick={() => handleDelete(item)} className="w-full">
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
