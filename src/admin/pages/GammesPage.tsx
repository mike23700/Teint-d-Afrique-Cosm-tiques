import { useEffect, useRef, useState } from 'react'
import {
  ApiError,
  createProduit,
  deleteProduit,
  fetchGammes,
  updateGamme,
  updateProduit,
  reorderProduits,
  uploadMedia,
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
  // Glisser-déposer : id du produit en cours de déplacement + id de la carte survolée.
  const [dragId, setDragId] = useState<number | null>(null)
  const [overId, setOverId] = useState<number | null>(null)

  const produitsOrdonnes = ordre
    .map(id => gamme.products.find(p => p.id === id))
    .filter((p): p is Product => p !== undefined)

  function reordonner(ids: number[]) {
    onOrdreChanged(ids)
    setProductsError(null)
    reorderProduits(gamme.id, ids).catch(err => {
      // Rollback visuel : on revient à l'ordre précédent.
      onOrdreChanged(ordre)
      setProductsError(err instanceof ApiError ? `Erreur : ${err.code}` : 'Erreur inattendue.')
    })
  }

  function handleDrop(targetId: number) {
    const source = dragId
    setDragId(null)
    setOverId(null)
    if (source === null || source === targetId) return
    const ids = [...ordre]
    const from = ids.indexOf(source)
    const to = ids.indexOf(targetId)
    if (from < 0 || to < 0) return
    // On retire la source puis on réinsère à la position d'origine de la cible :
    // déplacer vers le haut insère avant la cible, vers le bas après — comportement attendu.
    ids.splice(from, 1)
    ids.splice(to, 0, source)
    reordonner(ids)
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
          label="Image (import direct depuis l'ordinateur)"
          currentImage={gamme.image}
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
                onDragStart={() => setDragId(product.id)}
                onDragEnd={() => {
                  setDragId(null)
                  setOverId(null)
                }}
                onDragOver={() => setOverId(product.id)}
                onDrop={() => handleDrop(product.id)}
                isDragSource={dragId === product.id}
                isDropTarget={dragId !== null && overId === product.id && dragId !== product.id}
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
  onPick,
}: {
  label: string
  currentImage: string | null
  onPick: (media: MediaItem | null) => Promise<void>
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const ERROR_MESSAGES: Record<string, string> = {
    file_too_large: 'Image trop lourde (5 Mo maximum).',
    unsupported_file_type: 'Format non supporté (jpeg, png ou webp uniquement).',
    invalid_image: "Le fichier n'est pas une image valide.",
    upload_failed: "L'envoi a échoué, réessayez.",
  }

  async function importFile(file: File) {
    setSaving(true)
    setError(null)
    try {
      // Import direct depuis le PC : téléverse l'image puis l'associe en un seul geste.
      const { id, url } = await uploadMedia(file, '')
      await onPick({
        id,
        url,
        originalName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        altText: '',
        createdAt: new Date().toISOString(),
      })
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'erreur_inconnue'
      setError(ERROR_MESSAGES[code] ?? 'Une erreur est survenue, réessayez.')
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
      <div
        onDragOver={e => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault()
          setDragOver(false)
          if (saving) return
          const file = e.dataTransfer.files?.[0]
          if (file) importFile(file)
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
            if (file && !saving) importFile(file)
            if (inputRef.current) inputRef.current.value = ''
          }}
        />
        {saving ? (
          <p className="text-sm text-[#3B1705]/60">Import en cours...</p>
        ) : (
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
            >
              Importer depuis l'ordinateur
            </Button>
            <p className="text-[11px] text-[#3B1705]/40 mt-2">
              ou glissez-déposez une image ici (jpeg, png, webp — 5 Mo max)
            </p>
          </>
        )}
      </div>
      {currentImage && (
        <Button
          type="button"
          variant="secondary"
          disabled={saving}
          onClick={() => {
            setError(null)
            onPick(null).catch(err =>
              setError(err instanceof ApiError ? `Erreur : ${err.code}` : 'Erreur inattendue.')
            )
          }}
          className="mt-2"
        >
          Retirer l'image
        </Button>
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
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragSource,
  isDropTarget,
}: {
  product: Product
  onSaved: (fields: Partial<Product>) => void
  onImageChanged: (image: string | null) => void
  onDelete: () => void
  onDragStart: () => void
  onDragEnd: () => void
  onDragOver: () => void
  onDrop: () => void
  isDragSource: boolean
  isDropTarget: boolean
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

  const cardRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={cardRef}
      onDragOver={e => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        onDragOver()
      }}
      onDrop={e => {
        e.preventDefault()
        onDrop()
      }}
      className={`bg-white border border-[#3B1705]/10 p-5 space-y-3 ${isDropTarget ? 'ring-2 ring-[#C97B1A]' : ''} ${isDragSource ? 'opacity-40' : ''}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            draggable
            onDragStart={e => {
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('text/plain', String(product.id))
              if (cardRef.current) e.dataTransfer.setDragImage(cardRef.current, 20, 20)
              onDragStart()
            }}
            onDragEnd={onDragEnd}
            title="Glisser pour réordonner"
            aria-label={`Réordonner ${product.type || 'ce produit'} par glisser-déposer`}
            className="cursor-grab active:cursor-grabbing text-[#3B1705]/40 hover:text-[#C97B1A] text-base leading-none flex-shrink-0 select-none px-0.5"
          >
            ⠿
          </span>
          <p className="text-[11px] tracking-[0.15em] uppercase text-[#3B1705]/60 truncate">
            {product.type || 'Nouveau produit'}
          </p>
        </div>
        <Button variant="danger" onClick={onDelete}>
          Supprimer
        </Button>
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
        label="Image du produit (import direct depuis l'ordinateur)"
        currentImage={product.image}
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