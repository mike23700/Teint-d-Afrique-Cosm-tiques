import { useEffect, useState } from 'react'
import {
  ApiError,
  createProduit,
  deleteProduit,
  fetchGammes,
  fetchMedia,
  updateGamme,
  updateProduit,
  reorderProduits,
  type Gamme,
  type MediaItem,
  type Product,
} from '@/admin/api'
import { Banner, Button, ColorInput, Field, TextArea, TextInput } from '@/admin/components/ui'

/** Ordre local des produits par gamme (ids) ; source de vérité pour l'affichage des cartes. */
type OrdreParGamme = Record<string, number[]>

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

type ProduitForm = {
  type: string
  poids: string
  symbol: string
  description: string
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
  const [ordre, setOrdre] = useState<OrdreParGamme>({})

  // Initialise/synchronise l'ordre local avec les produits chargés.
  useEffect(() => {
    setOrdre(prev => {
      const next: OrdreParGamme = { ...prev }
      for (const g of gammes) {
        const connus = new Set(next[g.id] ?? [])
        const ids = g.products.map(p => p.id)
        if (next[g.id] === undefined || ids.some(id => !connus.has(id))) {
          next[g.id] = ids
        }
      }
      return next
    })
  }, [gammes])

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

  function handleProduitImageChanged(gammeId: string, produitId: number, image: string | null) {
    setGammes(prev =>
      prev.map(g =>
        g.id !== gammeId
          ? g
          : { ...g, products: g.products.map(p => (p.id === produitId ? { ...p, image } : p)) }
      )
    )
  }

  function handleProduitAdded(gammeId: string, produit: Product) {
    setGammes(prev => prev.map(g => (g.id === gammeId ? { ...g, products: [...g.products, produit] } : g)))
    setOrdre(prev => ({
      ...prev,
      [gammeId]: [...(prev[gammeId] ?? []), produit.id],
    }))
  }

  function handleProduitRemoved(gammeId: string, produitId: number) {
    setGammes(prev =>
      prev.map(g =>
        g.id === gammeId ? { ...g, products: g.products.filter(p => p.id !== produitId) } : g
      )
    )
    setOrdre(prev => ({
      ...prev,
      [gammeId]: (prev[gammeId] ?? []).filter(id => id !== produitId),
    }))
  }

  function handleOrdreChanged(gammeId: string, ids: number[]) {
    setOrdre(prev => ({ ...prev, [gammeId]: ids }))
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
          onProduitImageChanged={(produitId, image) => handleProduitImageChanged(selected.id, produitId, image)}
          onProduitAdded={produit => handleProduitAdded(selected.id, produit)}
          onProduitRemoved={produitId => handleProduitRemoved(selected.id, produitId)}
          ordre={ordre[selected.id] ?? selected.products.map(p => p.id)}
          onOrdreChanged={ids => handleOrdreChanged(selected.id, ids)}
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
  onProduitImageChanged,
  onProduitAdded,
  onProduitRemoved,
  ordre,
  onOrdreChanged,
}: {
  gamme: Gamme
  onGammeSaved: (form: GammeForm) => void
  onImageChanged: (image: string | null) => void
  onProduitSaved: (produitId: number, fields: Partial<Product>) => void
  onProduitImageChanged: (produitId: number, image: string | null) => void
  onProduitAdded: (produit: Product) => void
  onProduitRemoved: (produitId: number) => void
  ordre: number[]
  onOrdreChanged: (ids: number[]) => void
}) {
  const [form, setForm] = useState<GammeForm>(toForm(gamme))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [adding, setAdding] = useState(false)
  const [productsError, setProductsError] = useState<string | null>(null)

  const produitsOrdonnes = ordre
    .map(id => gamme.products.find(p => p.id === id))
    .filter((p): p is Product => p !== undefined)

  async function deplacer(produit: Product, direction: -1 | 1) {
    const ids = [...ordre]
    const i = ids.indexOf(produit.id)
    const j = i + direction
    if (i < 0 || j < 0 || j >= ids.length) return
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
    onOrdreChanged(ids)
    setProductsError(null)
    try {
      await reorderProduits(gamme.id, ids)
    } catch (err) {
      // Rollback visuel : on revient à l'ordre précédent.
      onOrdreChanged(ordre)
      setProductsError(err instanceof ApiError ? `Erreur : ${err.code}` : 'Erreur inattendue.')
    }
  }

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

  async function handleAddProduit() {
    setAdding(true)
    setProductsError(null)
    try {
      const produit = await createProduit(gamme.id, {
        type: 'Nouveau produit',
        poids: '',
        symbol: '❖',
        description: "Décrivez ce produit avant de le mettre en ligne.",
      })
      onProduitAdded(produit)
    } catch (err) {
      setProductsError(err instanceof ApiError ? `Erreur : ${err.code}` : 'Erreur inattendue.')
    } finally {
      setAdding(false)
    }
  }

  async function handleDeleteProduit(produit: Product) {
    if (!window.confirm(`Supprimer « ${produit.type} » de la gamme ? Cette action est immédiate.`)) return
    setProductsError(null)
    try {
      await deleteProduit(produit.id)
      onProduitRemoved(produit.id)
    } catch (err) {
      setProductsError(err instanceof ApiError ? `Erreur : ${err.code}` : 'Erreur inattendue.')
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

        <MediaPicker
          label="Image (depuis la médiathèque)"
          currentImage={gamme.image}
          activeImageId={gamme.imageId}
          onPick={async media => {
            await updateGamme(gamme.id, { imageId: media?.id ?? null })
            onImageChanged(media?.url ?? null)
          }}
        />

        {error && <Banner kind="error">{error}</Banner>}
        {success && <Banner kind="success">Gamme enregistrée.</Banner>}

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer la gamme'}
        </Button>
      </section>

      <section>
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-[11px] tracking-[0.2em] uppercase text-[#3B1705]/60">
            Produits ({gamme.products.length})
          </h3>
          <Button variant="secondary" onClick={handleAddProduit} disabled={adding}>
            {adding ? 'Ajout...' : '+ Ajouter un produit'}
          </Button>
        </div>

        {productsError && <div className="mb-4"><Banner kind="error">{productsError}</Banner></div>}

        {gamme.products.length === 0 ? (
          <p className="text-sm text-[#3B1705]/40">Aucun produit dans cette gamme pour l'instant.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {produitsOrdonnes.map(product => (
              <ProduitEditor
                key={product.id}
                product={product}
                onSaved={fields => onProduitSaved(product.id, fields)}
                onImageChanged={image => onProduitImageChanged(product.id, image)}
                onDelete={() => handleDeleteProduit(product)}
                onMoveUp={() => deplacer(product, -1)}
                onMoveDown={() => deplacer(product, 1)}
                isFirst={product.id === ordre[0]}
                isLast={product.id === ordre[ordre.length - 1]}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function MediaPicker({
  label,
  currentImage,
  activeImageId,
  onPick,
}: {
  label: string
  currentImage: string | null
  activeImageId: number | null
  onPick: (media: MediaItem | null) => Promise<void>
}) {
  const [media, setMedia] = useState<MediaItem[] | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMedia()
      .then(setMedia)
      .catch(() => setMedia([]))
  }, [])

  async function pick(mediaItem: MediaItem | null) {
    setSaving(true)
    setError(null)
    try {
      await onPick(mediaItem)
    } catch (err) {
      setError(err instanceof ApiError ? `Erreur : ${err.code}` : 'Erreur inattendue.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <p className="block text-[11px] tracking-[0.15em] uppercase text-[#3B1705]/60 mb-2">{label}</p>
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
        <div>
          <div className="flex flex-wrap gap-2">
            {media.map(m => (
              <button
                key={m.id}
                type="button"
                disabled={saving}
                onClick={() => pick(m)}
                className={`w-16 h-16 border-2 transition-colors disabled:opacity-50 ${
                  m.id === activeImageId ? 'border-[#C97B1A]' : 'border-transparent hover:border-[#C97B1A]'
                }`}
              >
                <img src={m.url} alt={m.altText} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          {currentImage && (
            <Button type="button" variant="secondary" disabled={saving} onClick={() => pick(null)} className="mt-2">
              Retirer l'image
            </Button>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-700 mt-2">{error}</p>}
    </div>
  )
}

function ProduitEditor({
  product,
  onSaved,
  onImageChanged,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  product: Product
  onSaved: (fields: Partial<Product>) => void
  onImageChanged: (image: string | null) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
}) {
  const [form, setForm] = useState<ProduitForm>({
    type: product.type,
    poids: product.poids,
    symbol: product.symbol,
    description: product.description,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function set<K extends keyof ProduitForm>(key: K, value: ProduitForm[K]) {
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
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] tracking-[0.15em] uppercase text-[#3B1705]/60 truncate">
          {product.type || 'Nouveau produit'}
        </p>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            title="Monter"
            aria-label="Monter ce produit"
            className="w-7 h-7 border border-[#3B1705]/25 text-[#3B1705] hover:bg-[#3B1705]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            title="Descendre"
            aria-label="Descendre ce produit"
            className="w-7 h-7 border border-[#3B1705]/25 text-[#3B1705] hover:bg-[#3B1705]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
          >
            ▼
          </button>
          <Button variant="danger" onClick={onDelete}>
            Supprimer
          </Button>
        </div>
      </div>

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

      <MediaPicker
        label="Image du produit (depuis la médiathèque)"
        currentImage={product.image}
        activeImageId={product.imageId}
        onPick={async media => {
          await updateProduit(product.id, { imageId: media?.id ?? null })
          onImageChanged(media?.url ?? null)
        }}
      />

      {error && <Banner kind="error">{error}</Banner>}
      {success && <Banner kind="success">Produit enregistré.</Banner>}

      <Button variant="secondary" onClick={handleSave} disabled={saving}>
        {saving ? 'Enregistrement...' : 'Enregistrer ce produit'}
      </Button>
    </div>
  )
}