import { useContent } from '@/hooks/useContent'
import { useRichContent } from '@/hooks/useRichContent'

export default function PresentationPage() {
  const content = useContent('presentation', {
    fondatrice_nom: 'Minette KAMDEM',
    fondatrice_titre: 'Fondatrice & Créatrice — #TeintdAfriqueCosmetiques',
    bio_paragraph_2:
      "Femme de caractère, fervente défenseur de la peau noire et farouche opposante à la dénaturation de la peau noire, Minette est, avant tout, une femme dévouée qui déborde d'ambition pour la génération féminine actuelle et celles à venir.",
    bio_paragraph_3:
      "Diplômée de l'École Supérieure de Commerce de Paris (ISC Paris Business School) où elle a obtenu un Master avant de décrocher un MBA en Stratégie digitale à l'Institut Européen du Digital, Minette a également acquis les fondamentaux en cosmétologie de façon à pouvoir collaborer efficacement avec différents laboratoires spécialisés en cosmétiques naturels.",
    quote: "« La blancheur a été érigée en norme universelle de progrès. »",
  })
  const rich = useRichContent('presentation', {
    bio_paragraph_1:
      "<p>Créatrice de la marque <strong>#TeintdAfriqueCosmetiques</strong>, épouse et mère, <strong>Minette KAMDEM</strong> est une Femme Camerounaise qui rêve de restaurer l'identité et l'image de la femme africaine en s'impliquant activement sur les sujets tels que l'Acceptation de soi, la Dignité africaine et la Diversité Culturelle.</p>",
    bio_paragraph_4:
      "<p>Aujourd'hui, à travers <strong>#TeintdAfriqueCosmetiques</strong>, elle souhaite cristalliser son ambition, son rêve. Un rêve né d'un constat, mieux d'une frustration. Car elle a constaté que bon nombre de produits cosmétiques existants et destinés à la peau noire conduisent à l'éclaircissement forcé de celle-ci et par ricochet, à sa dégradation.</p>",
    bio_paragraph_5:
      "<p>Pour Minette, nous devons conserver notre authenticité quelle que soit notre carnation comme le dit le slogan de la marque, <strong>« #VOTRE_PEAU_VAUT_DE_LOR »</strong>. Après maintes réflexions, elle décide, il y a 3 ans, d'agir pour opérer une déconstruction. La mission de <strong>#Teint_dAfrique_Cosmétiques</strong> consiste justement à changer les mentalités et contribuer à la révolution en marche de la beauté noire.</p>",
    bio_paragraph_6:
      "<p><strong>#Teint_dAfrique_Cosmétiques</strong>, est la marque de produits cosmétiques naturels qui s'engage à respecter votre couleur de peau et à ennoblir votre beauté grâce à des ingrédients botaniques et végétaux de la plus haute qualité et à des prix défiants toute concurrence ! Ses produits naturels sont adaptés pour tous les types de peau.</p>",
    bio_paragraph_7:
      "<p>Pour chaque produit, nous relevons le défi de créer des formules uniques et innovantes en utilisant exclusivement des options naturelles. En trois mots, <strong>#TeintdAfriqueCosmetiques</strong> se veut être une marque <strong>#AUTHENTIQUE</strong>, <strong>#PLURIELLE</strong> et <strong>#INCLUSIVE</strong>.</p>",
  })

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
            Présentation
          </h1>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">

            {/* Photo */}
            <div className="relative order-2 md:order-1 md:sticky md:top-28">
              <div className="absolute -top-5 -left-5 w-28 h-28 border border-[#C97B1A]/25 pointer-events-none z-10" />
              <img
                src="https://images.unsplash.com/photo-1632765866070-3fadf25d3d5b?w=700&h=900&fit=crop&auto=format"
                alt="Minette KAMDEM, fondatrice de Teint d'Afrique Cosmétiques"
                className="w-full h-[500px] md:h-[640px] object-cover object-top"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2A1006]/70 to-transparent px-6 py-8">
                <p
                  className="text-white text-2xl"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {content.fondatrice_nom}
                </p>
                <p className="text-[#C97B1A] text-[9px] tracking-[0.3em] uppercase mt-1">
                  {content.fondatrice_titre}
                </p>
              </div>
            </div>

            {/* Verbatim text from brief */}
            <div className="order-1 md:order-2 space-y-6 text-[#2A1006]/80 leading-relaxed text-[15px] md:text-base">
              <div className="rich-text" dangerouslySetInnerHTML={rich.bio_paragraph_1} />

              <p>{content.bio_paragraph_2}</p>

              <p>{content.bio_paragraph_3}</p>

              <div className="rich-text" dangerouslySetInnerHTML={rich.bio_paragraph_4} />

              <blockquote className="pl-5 border-l-2 border-[#C97B1A] my-8">
                <p
                  className="text-[#3B1705] text-lg italic"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {content.quote}
                </p>
              </blockquote>

              <div className="rich-text" dangerouslySetInnerHTML={rich.bio_paragraph_5} />

              <div className="rich-text" dangerouslySetInnerHTML={rich.bio_paragraph_6} />

              <div className="rich-text" dangerouslySetInnerHTML={rich.bio_paragraph_7} />

              {/* Credentials */}
              <div className="pt-6 border-t border-[#3B1705]/10">
                <p className="text-[#C97B1A] text-[9px] tracking-[0.3em] uppercase mb-5">
                  Parcours académique
                </p>
                <div className="space-y-4">
                  {[
                    {
                      school: 'ISC Paris Business School',
                      degree: "Master — École Supérieure de Commerce de Paris",
                    },
                    {
                      school: "Institut Européen du Digital",
                      degree: "MBA en Stratégie Digitale",
                    },
                    {
                      school: "Laboratoires spécialisés",
                      degree: "Fondamentaux en Cosmétologie",
                    },
                  ].map(c => (
                    <div key={c.school} className="flex gap-4 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C97B1A] mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-[#3B1705] font-medium text-sm">{c.school}</p>
                        <p className="text-[#2A1006]/55 text-xs">{c.degree}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 pillars */}
              <div className="pt-6 grid grid-cols-3 gap-3">
                {[
                  { label: 'Authentique', desc: 'Formules uniques, 100% naturelles' },
                  { label: 'Plurielle', desc: 'Pour tous les types de peau noire' },
                  { label: 'Inclusive', desc: 'Prix accessibles, beauté pour toutes' },
                ].map(v => (
                  <div key={v.label} className="text-center py-5 px-3" style={{ background: '#3B170508' }}>
                    <div
                      className="text-[#C97B1A] text-base mb-1"
                      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    >
                      {v.label}
                    </div>
                    <p className="text-[#2A1006]/50 text-[11px] leading-tight">{v.desc}</p>
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
