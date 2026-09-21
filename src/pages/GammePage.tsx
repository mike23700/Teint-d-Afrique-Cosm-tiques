import { Link, useParams } from 'react-router'
import type { Gamme, Product } from '@/data'
import { useGammes } from '@/hooks/useGammes'
import { useSettings } from '@/hooks/useSettings'
import eclatLabelPdf from '@/imports/260821_EtiquetteFacing_Eclat_Lotion.pdf'
import nutritionLabelPdf from '@/imports/260821_EtiquetteFacing_Nourrissante_Creme.pdf'

function WhatsAppOrderButton({
  product,
  gamme,
  whatsappNumber,
}: {
  product: Product
  gamme: Gamme
  whatsappNumber: string
}) {
  const message = encodeURIComponent(
    `Bonjour Teint d'Afrique Cosmétiques, je souhaite commander le ${product.type} (${product.poids}) de la gamme ${gamme.nom} — ${gamme.ingredients}. Pouvez-vous m'indiquer la disponibilité et les modalités de commande ? Merci.`
  )
  return (
    <a
      href={`${whatsappNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full py-3 text-white text-[11px] tracking-[0.15em] uppercase font-medium hover:opacity-85 active:scale-[0.98] transition-all mt-4"
      style={{ background: '#25D366', fontFamily: 'Outfit, system-ui, sans-serif' }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      Commander
    </a>
  )
}

function ProductCard({
  product,
  gamme,
  pdfSrc,
  whatsappNumber,
}: {
  product: Product
  gamme: Gamme
  pdfSrc?: string
  whatsappNumber: string
}) {
  return (
    <div
      className="bg-white overflow-hidden hover:shadow-lg transition-shadow group flex flex-col"
      style={{ borderTop: `3px solid ${gamme.color}` }}
    >
      {/* Cover: PDF label or ingredient photo */}
      <div
        className="relative h-52 overflow-hidden"
        style={{ background: gamme.colorLight }}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={`${gamme.nom} — ${product.type}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : pdfSrc ? (
          <iframe
            src={`${pdfSrc}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            title={`Étiquette ${gamme.nom} — ${product.type}`}
            className="w-full h-full"
            style={{ border: 'none', pointerEvents: 'none' }}
          />
        ) : (
          <img
            src={gamme.image}
            alt={`${gamme.nom} — ${product.type}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
          style={{ background: `linear-gradient(to top, ${gamme.colorLight}, transparent)` }} />
      </div>

      {/* Card body */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3
              className="text-xl mb-0.5"
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                color: gamme.colorDark,
              }}
            >
              {product.type}
            </h3>
            <span
              className="text-[9px] tracking-[0.25em] uppercase"
              style={{ color: gamme.color }}
            >
              {product.poids}
            </span>
          </div>
          <span className="text-3xl mt-1 flex-shrink-0" style={{ color: gamme.color }}>
            {product.symbol}
          </span>
        </div>
        <p className="text-[13px] text-[#2A1006]/65 leading-relaxed flex-1">{product.description}</p>
        <WhatsAppOrderButton product={product} gamme={gamme} whatsappNumber={whatsappNumber} />
      </div>
    </div>
  )
}

export default function GammePage() {
  const { gammeId } = useParams<{ gammeId: string }>()
  const GAMMES = useGammes()
  const settings = useSettings()
  const whatsappNumber = settings.whatsapp_number || 'https://wa.me/237000000000'
  const gamme = GAMMES.find(g => g.id === gammeId)

  if (!gamme) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#3B1705] text-2xl mb-4"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Gamme introuvable
          </p>
          <Link to="/boutique" className="text-[#C97B1A] text-sm underline">
            ← Retour à la boutique
          </Link>
        </div>
      </div>
    )
  }

  const pdfSrc = gamme.id === 'eclat'
    ? eclatLabelPdf
    : gamme.id === 'nutrition'
    ? nutritionLabelPdf
    : undefined

  const otherGammes = GAMMES.filter(g => g.id !== gamme.id)

  return (
    <div style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
      {/* ── GAMME HERO ── */}
      <div
        className="py-16 md:py-20"
        style={{ background: gamme.color }}
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-white/60 text-[9px] tracking-[0.35em] uppercase mb-3">
              Boutique · Teint d'Afrique Cosmétiques
            </p>
            <h1
              className="text-white leading-none mb-3"
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 'clamp(3rem, 8vw, 6rem)',
              }}
            >
              {gamme.nom}
            </h1>
            <p className="text-white/80 text-base tracking-wide italic"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              {gamme.tagline}
            </p>
            <p className="text-white/60 text-[11px] tracking-[0.2em] uppercase mt-3">
              {gamme.ingredients}
            </p>
          </div>
          <Link
            to="/boutique"
            className="self-start md:self-auto flex items-center gap-2 text-white/70 hover:text-white text-[11px] tracking-[0.2em] uppercase transition-colors border border-white/25 px-5 py-2.5 hover:bg-white/10 flex-shrink-0"
          >
            ← Toutes les gammes
          </Link>
        </div>
      </div>

      {/* ── DESCRIPTION + ACTIFS ── */}
      <section className="py-16 md:py-20" style={{ background: gamme.colorLight }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <p className="leading-relaxed text-[#2A1006]/80 text-[15px] mb-8">
                {gamme.description}
              </p>
              <div
                className="p-6 border-l-4"
                style={{ borderColor: gamme.color, background: `${gamme.color}15` }}
              >
                <p
                  className="text-[9px] tracking-[0.3em] uppercase mb-3"
                  style={{ color: gamme.colorDark }}
                >
                  Actifs Clés
                </p>
                <p className="text-sm leading-relaxed" style={{ color: gamme.colorDark }}>
                  {gamme.ingredientsDetail}
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src={gamme.image}
                alt={`Actifs botaniques — ${gamme.nom}`}
                className="w-full h-72 md:h-80 object-cover"
              />
              <div
                className="absolute bottom-4 right-4 px-4 py-2 text-white text-[9px] tracking-[0.2em] uppercase"
                style={{ background: gamme.color }}
              >
                {gamme.ingredients}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section className="py-16 md:py-20 bg-[#FAF6EF]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between gap-6 mb-10">
            <div>
              <p
                className="text-[9px] tracking-[0.3em] uppercase mb-2"
                style={{ color: gamme.color }}
              >
                Gamme {gamme.nom}
              </p>
              <h2
                className="text-3xl md:text-4xl"
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  color: gamme.colorDark,
                }}
              >
                {gamme.products.length > 1 ? `Les ${gamme.products.length} Produits` : 'Le Produit'}
              </h2>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              {gamme.products.map(p => (
                <span
                  key={p.id ?? p.type}
                  className="text-[10px] tracking-[0.1em] uppercase px-3 py-1 border"
                  style={{ color: gamme.colorDark, borderColor: gamme.color + '50' }}
                >
                  {p.type}
                </span>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {gamme.products.map(product => (
              <ProductCard
                key={product.id ?? product.type}
                product={product}
                gamme={gamme}
                pdfSrc={pdfSrc}
                whatsappNumber={whatsappNumber}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── OTHER GAMMES ── */}
      <section className="py-16 md:py-20" style={{ background: gamme.colorLight }}>
        <div className="max-w-7xl mx-auto px-6">
          <p
            className="text-[9px] tracking-[0.3em] uppercase mb-8"
            style={{ color: gamme.colorDark }}
          >
            Explorer d'autres gammes
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            {otherGammes.map(g => (
              <Link
                key={g.id}
                to={`/boutique/${g.id}`}
                className="group flex items-center gap-4 p-5 bg-white border border-[#3B1705]/8 hover:shadow-md transition-all"
              >
                <div className="relative h-16 w-16 overflow-hidden flex-shrink-0">
                  <img
                    src={g.image}
                    alt={`Gamme ${g.nom}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div
                    className="absolute inset-0 opacity-60"
                    style={{ background: g.color }}
                  />
                  <p
                    className="absolute inset-0 flex items-center justify-center text-white text-[10px] tracking-wider font-bold"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '11px' }}
                  >
                    {g.nom}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-[#3B1705] truncate">{g.tagline}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: g.color }}>{g.ingredients}</p>
                </div>
                <span className="ml-auto text-[#3B1705]/30 group-hover:text-[#C97B1A] group-hover:translate-x-1 transition-all flex-shrink-0">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
