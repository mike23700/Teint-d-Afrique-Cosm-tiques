import { useEffect, useState } from 'react'
import {
  ApiError,
  fetchGammes,
  fetchMedia,
  updateGamme,
  updateProduit,
  type Gamme,
  type MediaItem,
  type Product,
} from '@/admin/api'
import { Banner, Button, ColorInput, Field, TextArea, TextInput } from '@/admin/components/ui'

type GammeForm = {
  nom: string
  tagline: string
  ingredients: string
  color: string
  colorLight: string
  colorDark: string
  description: string
  ingredientsDetail: string
}

function toForm(g: Gamme): GammeForm {
  return {
    nom: g.nom,
    tagline: g.tagline,
    ingredients: g.ingredients,
    color: g.color,
    colorLight: g.colorLight,
    colorDark: g.colorDark,
    description: g.description,
    ingredientsDetail: g.ingredientsDetail,
  }
}

export default function GammesPage() {
  const [gammes, setGammes] = useState<Gamme[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    fetchGammes()
      .then(data => {
        setGammes(data)
        setSelectedId(data[0]?.id ?? null)
      })
      .catch(() => setLoadError("Impossible de charger les gammes."))
      .finally(() => setLoading(false))
  }, [])

  function handleGammeSaved(id: string, form: GammeForm) {
    setGammes(prev => prev.map(g => (g.id === id ? { ...g, ...form } : g)))
  }

  function handleImageChanged(id: string, image: string | null) {
    setGammes(prev => prev.map(g => (g.id === id ? { ...g, image } : g)))
  }

  function handleProduitSaved(gammeId: string, produitId: number, fields: Partial<Product>) {
    setGammes(prev =>
      prev.map(g =>
        g.id !== gammeId
          ? g
          : { ...g, products: g.products.map(p => (p.id === produitId ? { ...p, ...fields } : p)) }
      )
    )
  }

  if (loading) return <p className="text-sm text-[#3B1705]/50">Chargement des gammes...</p>
  if (loadError) return <Banner kind="error">{loadError}</Banner>

  const selected = gammes.find(g => g.id === selectedId) ?? null

  return (
    <div className="space-y-8">
      <div className="flex gap-2 flex-wrap">
        {gammes.map(g => (
          <button
            key={g.id}
            onClick={() => setSelectedId(g.id)}
            className={`flex items-center gap-2 px-4 py-2 text-[11px] tracking-[0.15em] uppercase border transition-colors ${
              selectedId === g.id ? 'border-[#3B1705] bg-[#3B1705] text-[#FAF6EF]' : 'border-[#3B1705]/20 text-[#3B1705] hover:bg-[#3B1705]/5'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: g.color }} />
            {g.nom}
          </button>
        ))}
      </div>

      {selected && (
        <GammeEditor
          key={selected.id}
          gamme={selected}
          onGammeSaved={form => handleGammeSaved(selected.id, form)}
          onImageChanged={image => handleImageChanged(selected.id, image)}
          onProduitSaved={(produitId, fields) => handleProduitSaved(selected.id, produitId, fields)}
        />
      )}
    </div>
  )
}

function GammeEditor({
  gamme,
  onGammeSaved,
  onImageChanged,
  onProduitSaved,
}: {
  gamme: Gamme
  onGammeSaved: (form: GammeForm) => void
  onImageChanged: (image: string | null) => void
  onProduitSaved: (produitId: number, fields: Partial<Product>) => void
}) {
  const [form, setForm] = useState<GammeForm>(toForm(gamme))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function set<K extends keyof GammeForm>(key: K, value: GammeForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    setSuccess(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await updateGamme(gamme.id, form)
      onGammeSaved(form)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof ApiError ? `Erreur : ${err.code}` : 'Erreur inattendue.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <section className="bg-white border border-[#3B1705]/10 p-6 space-y-5">
        <h2 className="text-xl" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
          Gamme {gamme.nom}
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Nom">
            <TextInput value={form.nom} onChange={e => set('nom', e.target.value)} />
          </Field>
          <Field label="Accroche (tagline)">
            <TextInput value={form.tagline} onChange={e => set('tagline', e.target.value)} />
          </Field>
          <Field label="Ingrédients (résumé)">
            <TextInput value={form.ingredients} onChange={e => set('ingredients', e.target.value)} />
          </Field>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <ColorInput label="Couleur" value={form.color} onChange={v => set('color', v)} />
          <ColorInput label="Couleur claire" value={form.colorLight} onChange={v => set('colorLight', v)} />
          <ColorInput label="Couleur foncée" value={form.colorDark} onChange={v => set('colorDark', v)} />
        </div>

        <Field label="Description">
          <TextArea rows={4} value={form.description} onChange={e => set('description', e.target.value)} />
        </Field>
        <Field label="Détail des ingrédients">
          <TextArea rows={3} value={form.ingredientsDetail} onChange={e => set('ingredientsDetail', e.target.value)} />
        </Field>

        <ImagePicker gamme={gamme} onImageChanged={onImageChanged} />

        {error && <Banner kind="error">{error}</Banner>}
        {success && <Banner kind="success">Gamme enregistrée.</Banner>}

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer la gamme'}
        </Button>
      </section>

      <section>
        <h3 className="text-[11px] tracking-[0.2em] uppercase text-[#3B1705]/60 mb-4">Les 4 produits</h3>
        <div className="grid md:grid-cols-2 gap-5">
          {gamme.products.map(product => (
            <ProduitEditor key={product.id} product={product} onSaved={fields => onProduitSaved(product.id, fields)} />
          ))}
        </div>
      </section>
    </div>
  )
}

function ImagePicker({ gamme, onImageChanged }: { gamme: Gamme; onImageChanged: (image: string | null) => void }) {
  const [media, setMedia] = useState<MediaItem[] | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentImage = gamme.image

  useEffect(() => {
    fetchMedia()
      .then(setMedia)
      .catch(() => setMedia([]))
  }, [])

  async function pick(mediaItem: MediaItem | null) {
    setSaving(true)
    setError(null)
    try {
      await updateGamme(gamme.id, { imageId: mediaItem?.id ?? null })
      onImageChanged(mediaItem?.url ?? null)
    } catch (err) {
      setError(err instanceof ApiError ? `Erreur : ${err.code}` : 'Erreur inattendue.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <p className="block text-[11px] tracking-[0.15em] uppercase text-[#3B1705]/60 mb-2">
        Image (depuis la médiathèque)
      </p>
      {currentImage && (
        <img src={currentImage} alt="" className="w-32 h-24 object-cover border border-[#3B1705]/10 mb-3" />
      )}
      {media === null ? (
        <p className="text-xs text-[#3B1705]/40">Chargement de la médiathèque...</p>
      ) : media.length === 0 ? (
        <p className="text-xs text-[#3B1705]/40">
          Aucune image dans la médiathèque pour l'instant — téléversez-en une dans l'onglet « Médiathèque ».
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {media.map(m => (
            <button
              key={m.id}
              type="button"
              disabled={saving}
              onClick={() => pick(m)}
              className="w-16 h-16 border-2 border-transparent hover:border-[#C97B1A] transition-colors disabled:opacity-50"
            >
              <img src={m.url} alt={m.altText} className="w-full h-full object-cover" />
            </button>
          ))}
          {currentImage && (
            <Button type="button" variant="secondary" disabled={saving} onClick={() => pick(null)}>
              Retirer l'image
            </Button>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-700 mt-2">{error}</p>}
    </div>
  )
}

function ProduitEditor({ product, onSaved }: { product: Product; onSaved: (fields: Partial<Product>) => void }) {
  const [form, setForm] = useState({
    type: product.type,
    poids: product.poids,
    symbol: product.symbol,
    description: product.description,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    setSuccess(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await updateProduit(product.id, form)
      onSaved(form)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof ApiError ? `Erreur : ${err.code}` : 'Erreur inattendue.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white border border-[#3B1705]/10 p-5 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <Field label="Type">
          <TextInput value={form.type} onChange={e => set('type', e.target.value)} />
        </Field>
        <Field label="Poids">
          <TextInput value={form.poids} onChange={e => set('poids', e.target.value)} />
        </Field>
        <Field label="Symbole">
          <TextInput value={form.symbol} onChange={e => set('symbol', e.target.value)} />
        </Field>
      </div>
      <Field label="Description">
        <TextArea rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
      </Field>
      {error && <p className="text-xs text-red-700">{error}</p>}
      {success && <p className="text-xs text-emerald-700">Enregistré.</p>}
      <Button variant="secondary" onClick={handleSave} disabled={saving}>
        {saving ? 'Enregistrement...' : 'Enregistrer ce produit'}
      </Button>
    </div>
  )
}
