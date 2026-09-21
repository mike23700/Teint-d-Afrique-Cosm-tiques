import { useEffect, useRef, useState } from 'react'
import {
  ApiError,
  fetchContent,
  updateContent,
  uploadMedia,
  type ContentBlock,
  type MediaItem,
} from '@/admin/api'
import { Banner, Button, Field, TextArea } from '@/admin/components/ui'

const PAGES: { id: string; label: string }[] = [
  { id: 'accueil', label: 'Accueil' },
  { id: 'presentation', label: 'Présentation' },
  { id: 'histoire', label: 'Notre Histoire' },
  { id: 'contact', label: 'Contact' },
]

export default function ContentPage() {
  const [page, setPage] = useState('accueil')
  const [blocks, setBlocks] = useState<ContentBlock[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    setBlocks(null)
    setLoadError(null)
    fetchContent(page)
      .then(setBlocks)
      .catch(() => setLoadError('Impossible de charger le contenu de cette page.'))
  }, [page])

  return (
    <div className="space-y-8">
      <div className="flex gap-2 flex-wrap">
        {PAGES.map(p => (
          <button
            key={p.id}
            onClick={() => setPage(p.id)}
            className={`px-4 py-2 text-[11px] tracking-[0.15em] uppercase border transition-colors ${
              page === p.id
                ? 'border-[#3B1705] bg-[#3B1705] text-[#FAF6EF]'
                : 'border-[#3B1705]/20 text-[#3B1705] hover:bg-[#3B1705]/5'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loadError && <Banner kind="error">{loadError}</Banner>}
      {!loadError && blocks === null && <p className="text-sm text-[#3B1705]/50">Chargement...</p>}
      {blocks !== null && blocks.length === 0 && (
        <p className="text-sm text-[#3B1705]/50">Aucun bloc de contenu pour cette page.</p>
      )}

      {blocks !== null && blocks.length > 0 && (
        <div className="space-y-4">
          {blocks.map(block => (
            <BlockEditor key={block.blockKey} page={page} block={block} />
          ))}
        </div>
      )}
    </div>
  )
}

function BlockEditor({ page, block }: { page: string; block: ContentBlock }) {
  const [value, setValue] = useState(block.value)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Blocs de type "image" : import direct depuis l'ordinateur (comme gammes/produits).
  const [imageSaving, setImageSaving] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function importImage(file: File) {
    setImageSaving(true)
    setImageError(null)
    setSuccess(false)
    try {
      const { id } = await uploadMedia(file, '')
      await updateContent(page, block.blockKey, String(id))
      setSuccess(true)
      setValue(String(id))
      // Recharge les blocs pour résoudre la nouvelle imageUrl affichée.
      window.dispatchEvent(new CustomEvent('content-updated'))
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'erreur_inconnue'
      setImageError(
        code === 'file_too_large'
          ? 'Image trop lourde (5 Mo maximum).'
          : code === 'unsupported_file_type'
            ? 'Format non supporté (jpeg, png ou webp uniquement).'
            : `Erreur : ${code}`
      )
    } finally {
      setImageSaving(false)
    }
  }

  async function removeImage() {
    setImageSaving(true)
    setImageError(null)
    try {
      await updateContent(page, block.blockKey, '')
      setSuccess(true)
      setValue('')
      window.dispatchEvent(new CustomEvent('content-updated'))
    } catch (err) {
      setImageError(err instanceof ApiError ? `Erreur : ${err.code}` : 'Erreur inattendue.')
    } finally {
      setImageSaving(false)
    }
  }

  if (block.blockType === 'image') {
    return (
      <div className="bg-white border border-[#3B1705]/10 p-5 space-y-3">
        <p className="text-[11px] tracking-[0.15em] uppercase text-[#3B1705]/60">{block.blockKey}</p>
        {block.imageUrl && (
          <img src={block.imageUrl} alt="" className="w-40 object-cover border border-[#3B1705]/10" />
        )}
        <div
          onDragOver={e => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault()
            setDragOver(false)
            const file = e.dataTransfer.files?.[0]
            if (file && !imageSaving) importImage(file)
          }}
          className={`border border-dashed p-4 text-center transition-colors ${
            dragOver ? 'border-[#C97B1A] bg-[#C97B1A]/5' : 'border-[#3B1705]/25'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file && !imageSaving) importImage(file)
              if (inputRef.current) inputRef.current.value = ''
            }}
          />
          {imageSaving ? (
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
        {block.imageUrl && (
          <Button type="button" variant="secondary" disabled={imageSaving} onClick={removeImage}>
            Retirer l'image
          </Button>
        )}
        {imageError && <p className="text-xs text-red-700">{imageError}</p>}
        {success && <p className="text-xs text-emerald-700">Enregistré.</p>}
      </div>
    )
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await updateContent(page, block.blockKey, value)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof ApiError ? `Erreur : ${err.code}` : 'Erreur inattendue.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white border border-[#3B1705]/10 p-5 space-y-3">
      <Field label={`${block.blockKey} (${block.blockType})`}>
        <TextArea
          rows={block.blockType === 'richtext' ? 4 : 2}
          value={value}
          onChange={e => {
            setValue(e.target.value)
            setSuccess(false)
          }}
        />
      </Field>
      {block.blockType === 'richtext' && (
        <p className="text-xs text-[#3B1705]/40">
          Balises HTML autorisées : &lt;p&gt; &lt;strong&gt; &lt;em&gt; &lt;br&gt; &lt;ul&gt; &lt;li&gt; &lt;a&gt; — le
          reste est retiré automatiquement.
        </p>
      )}
      {error && <p className="text-xs text-red-700">{error}</p>}
      {success && <p className="text-xs text-emerald-700">Enregistré.</p>}
      <Button variant="secondary" onClick={handleSave} disabled={saving || value === block.value}>
        {saving ? 'Enregistrement...' : 'Enregistrer'}
      </Button>
    </div>
  )
}
