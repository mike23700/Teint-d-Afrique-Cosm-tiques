import { useEffect, useState } from 'react'
import { ApiError, fetchContent, updateContent, type ContentBlock } from '@/admin/api'
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
