import { useRef, useState } from 'react'
import { ApiError, uploadMedia } from '@/admin/api'
import { Button, useConfirm } from '@/admin/components/ui'

const ERROR_MESSAGES: Record<string, string> = {
  file_too_large: 'Image trop lourde (5 Mo maximum).',
  unsupported_file_type: 'Format non supporté (jpeg, png ou webp uniquement).',
  invalid_image: "Le fichier n'est pas une image valide.",
  upload_failed: "L'envoi a échoué, réessayez.",
}

/**
 * Emplacement d'image de l'admin (gammes, produits, blocs image des pages).
 * Montre d'abord l'image réellement affichée sur le site public — l'image importée, sinon
 * `fallbackImage` (visuel par défaut du site) — puis propose de la remplacer.
 * L'import se fait directement depuis l'ordinateur (bouton ou glisser-déposer sur l'aperçu).
 */
export default function ImagePicker({
  label,
  currentImage,
  fallbackImage,
  fallbackLabel = 'Image par défaut du site',
  onPick,
}: {
  label: string
  /** Image importée via l'admin (null si aucune). */
  currentImage: string | null
  /** Ce que le site affiche quand aucune image n'est importée. */
  fallbackImage?: string
  fallbackLabel?: string
  /** Associe l'image téléversée (ou la retire avec null). */
  onPick: (media: { id: number; url: string } | null) => Promise<void>
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [confirm, confirmModal] = useConfirm()

  const shownImage = currentImage || fallbackImage || null
  const isFallback = !currentImage && !!fallbackImage

  async function importFile(file: File) {
    setSaving(true)
    setError(null)
    try {
      // Téléverse l'image puis l'associe en un seul geste.
      const media = await uploadMedia(file, '')
      await onPick(media)
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'erreur_inconnue'
      setError(ERROR_MESSAGES[code] ?? `Erreur : ${code}`)
    } finally {
      setSaving(false)
    }
  }

  async function removeImage() {
    const ok = await confirm({
      title: "Retirer l'image ?",
      message: fallbackImage
        ? "Le site affichera de nouveau l'image par défaut à cet emplacement."
        : "Cet emplacement n'aura plus d'image sur le site.",
      confirmLabel: "Retirer l'image",
    })
    if (!ok) return
    setSaving(true)
    setError(null)
    try {
      await onPick(null)
    } catch (err) {
      setError(err instanceof ApiError ? `Erreur : ${err.code}` : 'Erreur inattendue.')
    } finally {
      setSaving(false)
    }
  }

  const dropProps = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(true)
    },
    onDragLeave: () => setDragOver(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files?.[0]
      if (file && !saving) importFile(file)
    },
  }

  return (
    <div>
      {confirmModal}
      <p className="block text-[11px] tracking-[0.15em] uppercase text-[#3B1705]/60 mb-2">{label}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file && !saving) importFile(file)
          if (inputRef.current) inputRef.current.value = ''
        }}
      />

      {shownImage ? (
        <div className="space-y-3">
          <div
            {...dropProps}
            className={`relative w-full max-w-sm aspect-[4/3] overflow-hidden border bg-[#FAF6EF] ${
              dragOver ? 'border-[#C97B1A] ring-2 ring-[#C97B1A]' : 'border-[#3B1705]/10'
            }`}
          >
            <img src={shownImage} alt="" className={`w-full h-full object-cover ${saving ? 'opacity-40' : ''}`} />
            {isFallback && (
              <span className="absolute top-2 left-2 bg-[#3B1705]/80 text-[#FAF6EF] text-[10px] tracking-[0.1em] uppercase px-2 py-1">
                {fallbackLabel}
              </span>
            )}
            {(saving || dragOver) && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-[#3B1705]">
                {saving ? 'Import en cours...' : "Déposez l'image pour remplacer"}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" disabled={saving} onClick={() => inputRef.current?.click()}>
              Remplacer l'image
            </Button>
            {currentImage && (
              <Button type="button" variant="danger" disabled={saving} onClick={removeImage}>
                Retirer
              </Button>
            )}
          </div>
          <p className="text-[11px] text-[#3B1705]/40">
            Jpeg, png ou webp — 5 Mo max. Vous pouvez aussi glisser une image sur l'aperçu.
          </p>
        </div>
      ) : (
        <div
          {...dropProps}
          className={`border border-dashed p-4 text-center transition-colors ${
            dragOver ? 'border-[#C97B1A] bg-[#C97B1A]/5' : 'border-[#3B1705]/25'
          }`}
        >
          {saving ? (
            <p className="text-sm text-[#3B1705]/60">Import en cours...</p>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
                Importer depuis l'ordinateur
              </Button>
              <p className="text-[11px] text-[#3B1705]/40 mt-2">
                ou glissez-déposez une image ici (jpeg, png, webp — 5 Mo max)
              </p>
            </>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-700 mt-2">{error}</p>}
    </div>
  )
}
