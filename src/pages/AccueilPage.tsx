import { Link } from 'react-router'
import { useGammes } from '@/hooks/useGammes'
import { useContent } from '@/hooks/useContent'
import { useRichContent } from '@/hooks/useRichContent'

export default function AccueilPage() {
  const GAMMES = useGammes()
  const content = useContent('accueil', {
    hero_subtitle:
      "Des soins naturels pensés pour célébrer, nourrir et révéler la beauté authentique de la peau noire — sans jamais chercher à la changer.",
    intro_title: 'Une femme, une conviction, une marque.',
    intro_paragraph_2:
      "Femme de caractère, fervente défenseur de la peau noire et farouche opposante à la dénaturation de la peau noire, Minette est, avant tout, une femme dévouée qui déborde d'ambition pour la génération féminine actuelle et celles à venir.",
  })
  const fondatrice = useContent('presentation', {
    fondatrice_nom: 'Minette KAMDEM',
  })
  const rich = useRichContent('accueil', {
    intro_paragraph_1:
      "<p>Créatrice de la marque <strong>#TeintdAfriqueCosmetiques</strong>, épouse et mère, <strong>Minette KAMDEM</strong> est une Femme Camerounaise qui rêve de restaurer l'identité et l'image de la femme africaine en s'impliquant activement sur les sujets tels que l'Acceptation de soi, la Dignité africaine et la Diversité Culturelle.</p>",
  })

  return (
    <div style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>

      {/* ── HERO ── */}
      <section className="relative min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1577746838851-816a43ca8733?w=1600&h=1000&fit=crop&auto=format"
            alt="Femme africaine, beauté naturelle et rayonnante"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2A1006]/92 via-[#3B1705]/70 to-[#3B1705]/20" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-5 gap-12 items-center w-full">
          <div className="md:col-span-3">
            <p className="text-[#C97B1A] tracking-[0.35em] text-[10px] uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-px bg-[#C97B1A]" />
              Cosmétiques Naturels · Douala, Cameroun
            </p>
            <h1
              className="text-[#FAF6EF] leading-[0.88] mb-8"
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 'clamp(3rem, 8vw, 7rem)',
              }}
            >
              VOTRE PEAU<br />
              <span style={{ color: '#C97B1A' }}>VAUT</span><br />
              DE L'OR.
            </h1>
            <p className="text-[#FAF6EF]/75 text-base md:text-lg leading-relaxed mb-10 max-w-lg">
              {content.hero_subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/boutique"
                className="bg-[#C97B1A] text-white px-8 py-4 text-[11px] tracking-[0.25em] uppercase hover:bg-[#A85E0F] transition-colors"
              >
                Découvrir nos gammes
              </Link>
              <Link
                to="/histoire"
                className="border border-[#FAF6EF]/40 text-[#FAF6EF] px-8 py-4 text-[11px] tracking-[0.25em] uppercase hover:bg-[#FAF6EF]/10 transition-colors"
              >
                Notre histoire
              </Link>
            </div>
          </div>
          {/* Gamme teasers — desktop */}
          <div className="md:col-span-2 hidden md:flex flex-col gap-3">
            {GAMMES.map(g => (
              <Link
                key={g.id}
                to={`/boutique/${g.id}`}
                className="flex items-center gap-4 px-5 py-3 bg-white/8 backdrop-blur-sm border border-white/15 hover:bg-white/18 transition-all group"
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: g.color }} />
                <div>
                  <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: g.color }}>
                    {g.nom}
                  </div>
                  <div className="text-white/60 text-[11px]">{g.ingredients}</div>
                </div>
                <span className="ml-auto text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all text-sm">→</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#FAF6EF]/40">
          <span className="text-[9px] tracking-[0.3em] uppercase">Défiler</span>
          <div className="w-px h-10 bg-[#FAF6EF]/25 animate-pulse" />
        </div>
      </section>

      {/* ── VALUES STRIP ── */}
      <div className="bg-[#3B1705] py-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-6 flex justify-center gap-6 md:gap-14 text-[9px] tracking-[0.35em] uppercase whitespace-nowrap">
          {['#AUTHENTIQUE', '#PLURIELLE', '#INCLUSIVE', '#NATURELLE'].map((v, i) => (
            <span key={v} className={i % 2 === 0 ? 'text-[#FAF6EF]/70' : 'text-[#C97B1A]'}>
              {v}
            </span>
          ))}
        </div>
      </div>

      {/* ── PRÉSENTATION INTRO ── */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            {/* Photo */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 border border-[#C97B1A]/25 pointer-events-none" />
              <img
                src="https://images.unsplash.com/photo-1632765866070-3fadf25d3d5b?w=700&h=850&fit=crop&auto=format"
                alt="Minette KAMDEM, fondatrice de Teint d'Afrique Cosmétiques"
                className="w-full h-[420px] object-cover object-top"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2A1006]/65 to-transparent px-5 py-6">
                <p className="text-white text-xl" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                  {fondatrice.fondatrice_nom}
                </p>
                <p className="text-[#C97B1A] text-[9px] tracking-[0.3em] uppercase mt-1">
                  Fondatrice & Créatrice
                </p>
              </div>
            </div>

            {/* Text */}
            <div>
              <p className="text-[#C97B1A] tracking-[0.3em] text-[10px] uppercase mb-4 flex items-center gap-3">
                <span className="w-6 h-px bg-[#C97B1A]" />
                Présentation
              </p>
              <h2
                className="text-[#3B1705] leading-tight mb-7"
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                }}
              >
                {content.intro_title}
              </h2>
              <div className="rich-text text-[#2A1006]/75 leading-relaxed text-[15px] mb-5">
                <div dangerouslySetInnerHTML={rich.intro_paragraph_1} />
              </div>
              <p className="text-[#2A1006]/75 leading-relaxed text-[15px] mb-8">
                {content.intro_paragraph_2}
              </p>
              <Link
                to="/presentation"
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[#C97B1A] border border-[#C97B1A]/40 px-6 py-3 hover:bg-[#C97B1A] hover:text-white transition-all group"
              >
                Lire la présentation complète
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── GAMMES — style boutique ── */}
      <section className="py-20 md:py-28 bg-[#3B1705]/3">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <p className="text-[#C97B1A] tracking-[0.3em] text-[10px] uppercase mb-4 flex items-center gap-3">
                <span className="w-6 h-px bg-[#C97B1A]" />
                Boutique
              </p>
              <h2
                className="text-[#3B1705] leading-tight"
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                }}
              >
                Nos Gammes de Soins
              </h2>
            </div>
            <Link
              to="/boutique"
              className="self-start md:self-auto text-[11px] tracking-[0.2em] uppercase text-[#C97B1A] border border-[#C97B1A]/40 px-5 py-2.5 hover:bg-[#C97B1A] hover:text-white transition-all whitespace-nowrap"
            >
              Voir toutes les gammes →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {GAMMES.map(g => (
              <Link
                key={g.id}
                to={`/boutique/${g.id}`}
                className="group block overflow-hidden border border-[#3B1705]/8 bg-white hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={g.image}
                    alt={`Ingrédients gamme ${g.nom}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, ${g.color}CC 0%, transparent 60%)` }}
                  />
                  <div className="absolute top-5 left-5">
                    <p
                      className="text-white text-4xl"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    >
                      {g.nom}
                    </p>
                    <p className="text-white/70 text-[10px] tracking-[0.25em] uppercase mt-1">
                      {g.ingredients}
                    </p>
                  </div>
                  <div
                    className="absolute bottom-4 right-4 px-3 py-1 text-white text-[9px] tracking-[0.2em] uppercase"
                    style={{ background: g.color }}
                  >
                    {g.products.length} produit{g.products.length > 1 ? 's' : ''}
                  </div>
                </div>

                {/* Body */}
                <div className="p-6" style={{ background: g.colorLight }}>
                  <p
                    className="text-base mb-3 italic"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: g.colorDark }}
                  >
                    {g.tagline}
                  </p>
                  <p className="text-[13px] leading-relaxed mb-5" style={{ color: g.colorDark + 'CC' }}>
                    {g.description.slice(0, 180)}…
                  </p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {g.products.map(p => (
                      <span
                        key={p.id ?? p.type}
                        className="text-[10px] tracking-[0.1em] px-3 py-1 border"
                        style={{ color: g.colorDark, borderColor: g.color + '50' }}
                      >
                        {p.poids ? `${p.type} · ${p.poids}` : p.type}
                      </span>
                    ))}
                  </div>
                  <div
                    className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase font-medium group-hover:gap-3 transition-all"
                    style={{ color: g.color }}
                  >
                    Découvrir la gamme →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
