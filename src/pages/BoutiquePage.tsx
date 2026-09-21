import { Link } from 'react-router'
import { GAMMES } from '@/data'

export default function BoutiquePage() {
  return (
    <div style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
      {/* ── PAGE BANNER ── */}
      <div className="bg-[#3B1705] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[#C97B1A] tracking-[0.35em] text-[10px] uppercase mb-4 flex items-center gap-3">
            <span className="w-8 h-px bg-[#C97B1A]" />
            Teint d'Afrique Cosmétiques
          </p>
          <h1
            className="text-[#FAF6EF] leading-tight mb-4"
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            }}
          >
            Boutique
          </h1>
          <p className="text-[#FAF6EF]/60 max-w-lg leading-relaxed">
            Chaque gamme possède son univers, ses actifs botaniques et ses formules exclusives.
            4 produits par gamme, pensés pour les peaux noires et métissées.
          </p>
        </div>
      </div>

      {/* ── GAMMES GRID ── */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10">
            {GAMMES.map(g => (
              <Link
                key={g.id}
                to={`/boutique/${g.id}`}
                className="group block overflow-hidden border border-[#3B1705]/8 hover:border-current transition-colors"
                style={{ '--tw-border-opacity': '1' } as React.CSSProperties}
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={g.image}
                    alt={`Ingrédients gamme ${g.nom}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, ${g.color}CC 0%, transparent 60%)` }}
                  />
                  {/* Gamme name */}
                  <div className="absolute top-6 left-6">
                    <p
                      className="text-white text-4xl md:text-5xl"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    >
                      {g.nom}
                    </p>
                    <p className="text-white/70 text-[10px] tracking-[0.25em] uppercase mt-1">
                      {g.ingredients}
                    </p>
                  </div>
                  {/* Product count badge */}
                  <div
                    className="absolute bottom-4 right-4 px-3 py-1 text-white text-[9px] tracking-[0.2em] uppercase"
                    style={{ background: g.color }}
                  >
                    4 produits
                  </div>
                </div>

                {/* Card body */}
                <div className="p-6" style={{ background: g.colorLight }}>
                  <p
                    className="text-base mb-3 italic"
                    style={{
                      fontFamily: "'DM Serif Display', Georgia, serif",
                      color: g.colorDark,
                    }}
                  >
                    {g.tagline}
                  </p>
                  <p
                    className="text-[13px] leading-relaxed mb-5"
                    style={{ color: g.colorDark + 'CC' }}
                  >
                    {g.description.slice(0, 160)}…
                  </p>
                  {/* Products list */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {['Savon', 'Lotion', 'Crème', 'Lait'].map(p => (
                      <span
                        key={p}
                        className="text-[10px] tracking-[0.1em] uppercase px-3 py-1 border"
                        style={{ color: g.colorDark, borderColor: g.color + '50' }}
                      >
                        {p}
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

      {/* ── PROMISE ── */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#3B1705] p-10 md:p-16 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <p className="text-[#C97B1A] text-[9px] tracking-[0.3em] uppercase mb-4">
                Notre engagement produit
              </p>
              <h2
                className="text-[#FAF6EF] leading-tight mb-5"
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                }}
              >
                100% naturel, formules uniques,<br />adaptées à votre peau.
              </h2>
              <p className="text-[#FAF6EF]/65 leading-relaxed text-sm max-w-lg">
                Pour chaque produit, nous relevons le défi de créer des formules uniques et
                innovantes en utilisant exclusivement des options naturelles. Chaque gamme comprend
                un savon (180 g), une lotion (100 ml), une crème de visage (100 ml) et un lait
                corps (500 ml).
              </p>
            </div>
            <div className="flex flex-col justify-center gap-4">
              {[
                { label: '4 Gammes', desc: 'Éclat · Réparation · Hydratation · Nutrition' },
                { label: '16 Produits', desc: '4 produits par gamme, formulés exclusivement' },
                { label: '100% Naturel', desc: "Ingrédients botaniques de la plus haute qualité" },
              ].map(stat => (
                <div key={stat.label} className="border-l-2 border-[#C97B1A] pl-4">
                  <div
                    className="text-[#FAF6EF] text-lg"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                  >
                    {stat.label}
                  </div>
                  <div className="text-[#FAF6EF]/45 text-[11px] mt-0.5">{stat.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
