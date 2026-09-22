import { useEffect, useRef, useState } from 'react'
import {
  ApiError,
  createGamme,
  createProduit,
  deleteGamme,
  deleteProduit,
  fetchGammes,
  updateGamme,
  updateProduit,
  reorderProduits,
  reorderGammes,
  type Gamme,
  type Product,
} from '@/admin/api'
import ImagePicker from '@/admin/components/ImagePicker'
import { Banner, Button, ColorInput, Field, TextArea, TextInput, useConfirm } from '@/admin/components/ui'
import { defaultGammeImage } from '@/hooks/useGammes'

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
  // Glisser-déposer des onglets gammes.
  const [dragGammeId, setDragGammeId] = useState<string | null>(null)
  const [overGammeId, setOverGammeId] = useState<string | null>(null)
  // Erreurs de la barre d'onglets (réordonnancement, création) : affichées au-dessus de l'éditeur,
  // sans masquer la page comme le ferait loadError.
  const [tabsError, setTabsError] = useState<string | null>(null)
  const [newGammeNom, setNewGammeNom] = useState('')
  const [creating, setCreating] = useState(false)

  function handleGammeDrop(targetId: string) {
    const source = dragGammeId
    setDragGammeId(null)
    setOverGammeId(null)
    if (!source || source === targetId) return
    const previous = gammes
    const from = previous.findIndex(g => g.id === source)
    const to = previous.findIndex(g => g.id === targetId)
    if (from < 0 || to < 0) return
    const next = [...previous]
    next.splice(from, 1)
    next.splice(to, 0, previous[from])
    setGammes(next)
    setTabsError(null)
    reorderGammes(next.map(g => g.id)).catch(err => {
      // Rollback visuel : on revient à l'ordre précédent.
      setGammes(previous)
      setTabsError(
        err instanceof ApiError
          ? `Impossible de réordonner les gammes (${err.code}).`
          : 'Impossible de réordonner les gammes.'
      )
    })
  }

  async function handleCreateGamme() {
    const nom = newGammeNom.trim()
    if (!nom) return
    setCreating(true)
    setTabsError(null)
    try {
      const gamme = await createGamme(nom)
      setGammes(prev => [...prev, gamme])
      setSelectedId(gamme.id)
      setNewGammeNom('')
    } catch (err) {
      setTabsError(err instanceof ApiError ? `Impossible de créer la gamme (${err.code}).` : 'Impossible de créer la gamme.')
    } finally {
      setCreating(false)
    }
  }

  function handleGammeDeleted(id: string) {
    const remaining = gammes.filter(g => g.id !== id)
    setGammes(remaining)
    setSelectedId(remaining[0]?.id ?? null)
    setOrdre(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

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
            draggable
            onDragStart={e => {
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('text/plain', g.id)
              setDragGammeId(g.id)
            }}
            onDragEnd={() => {
              setDragGammeId(null)
              setOverGammeId(null)
            }}
            onDragOver={e => {
              e.preventDefault()
              setOverGammeId(g.id)
            }}
            onDrop={e => {
              e.preventDefault()
              handleGammeDrop(g.id)
            }}
            onClick={() => setSelectedId(g.id)}
            title="Glisser pour réordonner les gammes"
            className={`flex items-center gap-2 px-4 py-2 text-[11px] tracking-[0.15em] uppercase border transition-colors ${
              selectedId === g.id ? 'border-[#3B1705] bg-[#3B1705] text-[#FAF6EF]' : 'border-[#3B1705]/20 text-[#3B1705] hover:bg-[#3B1705]/5'
            } ${dragGammeId === g.id ? 'opacity-40' : ''} ${dragGammeId && overGammeId === g.id && dragGammeId !== g.id ? 'ring-2 ring-[#C97B1A]' : ''}`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: g.color }}
            />
            {g.nom}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-[#3B1705]/35 -mt-4">
        Astuce : glissez-déposez les onglets pour changer l'ordre des gammes sur la boutique.
      </p>

      <form
        className="flex gap-2 items-center -mt-2"
        onSubmit={e => {
          e.preventDefault()
          handleCreateGamme()
        }}
      >
        <div className="w-64">
          <TextInput
            value={newGammeNom}
            onChange={e => setNewGammeNom(e.target.value)}
            placeholder="Nom de la nouvelle gamme"
            maxLength={100}
          />
        </div>
        <Button type="submit" variant="secondary" disabled={creating || !newGammeNom.trim()}>
          {creating ? 'Création...' : '+ Nouvelle gamme'}
        </Button>
      </form>

      {tabsError && <Banner kind="error">{tabsError}</Banner>}

      {selected && (
        <GammeEditor
          key={selected.id}
          gamme={selected}
          onGammeSaved={form => handleGammeSaved(selected.id, form)}
          onGammeDeleted={() => handleGammeDeleted(selected.id)}
          canDelete={gammes.length > 1}
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
  onGammeDeleted,
  canDelete,
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
  onGammeDeleted: () => void
  canDelete: boolean
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
  const [deleting, setDeleting] = useState(false)
  const [confirm, confirmModal] = useConfirm()
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
    // Même règle que api/gammes/update.php, vérifiée ici pour afficher un message clair.
    const couleurs = [
      ['Couleur', form.color],
      ['Couleur claire', form.colorLight],
      ['Couleur foncée', form.colorDark],
    ] as const
    const invalide = couleurs.find(([, v]) => !/^#[0-9A-Fa-f]{6}$/.test(v))
    if (invalide) {
      setSuccess(false)
      setError(`« ${invalide[0]} » doit être au format #RRGGBB (ex. #C97B1A).`)
      return
    }

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

  async function handleDeleteGamme() {
    const n = gamme.products.length
    const ok = await confirm({
      title: 'Supprimer la gamme ?',
      message: (
        <>
          La gamme <strong>« {gamme.nom} »</strong>
          {n > 0 && <> et ses <strong>{n} produit{n > 1 ? 's' : ''}</strong></>} seront supprimés
          du site. Cette action est définitive.
        </>
      ),
      confirmLabel: 'Supprimer la gamme',
    })
    if (!ok) return
    setDeleting(true)
    setError(null)
    try {
      await deleteGamme(gamme.id)
      onGammeDeleted()
    } catch (err) {
      setError(
        err instanceof ApiError && err.code === 'last_gamme'
          ? 'Impossible de supprimer la dernière gamme.'
          : err instanceof ApiError ? `Erreur : ${err.code}` : 'Erreur inattendue.'
      )
      setDeleting(false)
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
    const ok = await confirm({
      title: 'Supprimer le produit ?',
      message: (
        <>
          Le produit <strong>« {produit.type} »</strong> sera retiré de la gamme {gamme.nom}. Cette
          action est définitive.
        </>
      ),
      confirmLabel: 'Supprimer le produit',
    })
    if (!ok) return
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
      {confirmModal}
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

        <ImagePicker
          label="Image de la gamme"
          currentImage={gamme.image}
          fallbackImage={defaultGammeImage(gamme)}
          onPick={async media => {
            await updateGamme(gamme.id, { imageId: media?.id ?? null })
            onImageChanged(media?.url ?? null)
          }}
        />

        {error && <Banner kind="error">{error}</Banner>}
        {success && <Banner kind="success">Gamme enregistrée.</Banner>}

        <div className="flex items-center justify-between gap-4">
          <Button onClick={handleSave} disabled={saving || deleting}>
            {saving ? 'Enregistrement...' : 'Enregistrer la gamme'}
          </Button>
          {canDelete && (
            <Button variant="danger" onClick={handleDeleteGamme} disabled={saving || deleting}>
              {deleting ? 'Suppression...' : 'Supprimer la gamme'}
            </Button>
          )}
        </div>
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
                gammeImage={gamme.image ?? defaultGammeImage(gamme)}
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

function ProduitEditor({
  product,
  gammeImage,
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
  /** Image affichée par le site pour ce produit tant qu'il n'a pas la sienne. */
  gammeImage: string
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

      <ImagePicker
        label="Image du produit"
        currentImage={product.image}
        fallbackImage={gammeImage}
        fallbackLabel="Image de la gamme"
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