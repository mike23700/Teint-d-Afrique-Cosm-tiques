export default function HistoirePage() {
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
            className="text-[#FAF6EF] leading-tight"
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            }}
          >
            Notre Histoire
          </h1>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">

            {/* Verbatim text */}
            <div className="space-y-6 text-[#2A1006]/80 leading-relaxed text-[15px] md:text-base">
              <p className="text-[#3B1705] font-medium text-lg leading-relaxed"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                Teint d'Afrique Cosmétiques est une marque camerounaise de cosmétiques naturels,
                née d'une conviction simple et ferme : nous n'avons pas besoin d'éclaircir notre
                peau pour nous sentir belles.
              </p>

              <p>
                Tout est parti d'un constat que nous ne pouvions plus ignorer. Trop de femmes
                abîment leur peau avec des produits éclaircissants, dans l'espoir d'un teint plus
                uniforme, plus lumineux — pour répondre à une idée de la beauté qui n'est pas la
                nôtre. Nous avons décidé d'ouvrir une autre voie.
              </p>

              <p>
                Une cosmétique pensée pour les peaux noires et métissées. Qui les soigne, les
                nourrit, les révèle — sans jamais chercher à changer leur couleur.
              </p>

              <p>
                Nous formulons nos soins à partir d'ingrédients naturels, puisés dans les richesses
                de notre terre : aloe vera, curcuma, carotte, citron, miel, beurre de karité. Chaque
                produit répond à un besoin réel de la peau : nettoyer, nourrir, hydrater, unifier le
                teint et révéler l'éclat naturel.
              </p>

              <p>
                Nous avons commencé avec des moyens modestes et une exigence intacte. Cette exigence
                n'a jamais baissé. De là est née une marque qui grandit, portée par une ambition qui
                dépasse la cosmétique.
              </p>

              <p>
                Car notre projet est aussi un projet de dignité : changer le regard porté sur la
                peau noire, encourager les femmes à prendre soin d'elles sans se dépigmenter, et
                prouver qu'on peut créer, en Afrique, des produits d'excellence inspirés de nos
                ressources, de nos besoins et de notre identité.
              </p>

              <div className="py-8 px-6 my-8" style={{ background: '#3B170508', borderLeft: '3px solid #C97B1A' }}>
                <p
                  className="text-[#3B1705] text-lg leading-relaxed"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Notre peau n'a pas besoin de devenir plus claire pour être belle.
                </p>
                <p
                  className="text-[#3B1705] text-lg leading-relaxed mt-2"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Elle a besoin d'être comprise, respectée et bien entretenue.
                </p>
                <p className="text-[#C97B1A] text-sm mt-4">
                  C'est la vision que nous défendons, chaque jour, à travers Teint d'Afrique
                  Cosmétiques.
                </p>
              </div>
            </div>

            {/* Image + values */}
            <div className="space-y-8">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1527203561188-dae1bc1a417f?w=700&h=500&fit=crop&auto=format"
                  alt="Femme africaine aux cheveux tressés, naturellement belle"
                  className="w-full h-72 object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 flex-wrap">
                  {['Authenticité', 'Dignité', 'Excellence'].map(tag => (
                    <span
                      key={tag}
                      className="bg-[#3B1705]/80 backdrop-blur-sm text-[#C97B1A] text-[9px] tracking-[0.2em] uppercase px-3 py-1.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ingredients we use */}
              <div>
                <p className="text-[#C97B1A] text-[9px] tracking-[0.3em] uppercase mb-5">
                  Nos ingrédients naturels
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: 'Aloe Vera', color: '#2A7A4F' },
                    { name: 'Curcuma', color: '#C97B1A' },
                    { name: 'Carotte', color: '#D4600A' },
                    { name: 'Beurre de Karité', color: '#8B6914' },
                    { name: 'Miel', color: '#C4960A' },
                    { name: 'Citron', color: '#8B8B14' },
                  ].map(ing => (
                    <div
                      key={ing.name}
                      className="py-3 px-2 text-center text-[11px] font-medium leading-tight"
                      style={{ background: ing.color + '18', color: ing.color }}
                    >
                      {ing.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 values grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: 'Qualité',
                    desc: 'Des formules uniques avec des ingrédients botaniques de la plus haute qualité.',
                  },
                  {
                    label: 'Naturel',
                    desc: 'Exclusivement des options naturelles — aucun produit éclaircissant.',
                  },
                  {
                    label: 'Dignité',
                    desc: 'Changer le regard sur la peau noire et encourager son acceptation pleine.',
                  },
                  {
                    label: 'Excellence',
                    desc: "Prouver qu'on peut créer en Afrique des produits d'exception.",
                  },
                ].map(v => (
                  <div
                    key={v.label}
                    className="border border-[#3B1705]/10 p-4 hover:border-[#C97B1A]/40 transition-colors"
                  >
                    <div
                      className="text-[#C97B1A] text-base mb-2"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    >
                      {v.label}
                    </div>
                    <div className="text-[#2A1006]/55 text-[12px] leading-relaxed">{v.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
