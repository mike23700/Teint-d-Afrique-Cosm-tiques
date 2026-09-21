import { Link } from 'react-router'
import paBadge from '@/imports/PA_StatementEXE_CMJN.jpg'

export default function BlackSkinsBanner() {
  return (
    <div
      className="relative overflow-hidden"
      style={{ background: '#C97B1A' }}
    >
      {/* Decorative background text */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none"
        aria-hidden="true"
      >
        <span
          className="text-white/8 font-bold leading-none whitespace-nowrap"
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 'clamp(6rem, 18vw, 18rem)',
          }}
        >
          BEAUTÉ
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

          {/* Badge */}
          <div className="flex-shrink-0">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-white/15 flex items-center justify-center p-4">
              <img
                src={paBadge}
                alt="Black Skins = Beautiful Skins"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
          </div>

          {/* Text */}
          <div className="text-center md:text-left">
            <p
              className="text-white/70 text-[10px] tracking-[0.4em] uppercase mb-4"
              style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
            >
              Notre engagement
            </p>
            <h2
              className="text-white leading-tight mb-5 whitespace-nowrap"
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 'clamp(1.2rem, 4.5vw, 3.5rem)',
              }}
            >
              Black Skins = Beautiful Skins
            </h2>
            <p
              className="text-white/80 leading-relaxed max-w-2xl mb-8"
              style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '15px' }}
            >
              Nous croyons que chaque teint est une beauté à part entière. Teint d'Afrique
              Cosmétiques s'engage à formuler des soins qui révèlent, nourrissent et célèbrent la
              peau noire — sans jamais chercher à l'altérer. Parce que{' '}
              <strong className="text-white">#VOTRE_PEAU_VAUT_DE_LOR</strong>.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link
                to="/boutique"
                className="bg-[#3B1705] text-[#FAF6EF] px-7 py-3.5 text-[11px] tracking-[0.2em] uppercase hover:bg-[#2A1006] transition-colors"
                style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
              >
                Voir nos soins →
              </Link>
              <Link
                to="/histoire"
                className="border border-white/50 text-white px-7 py-3.5 text-[11px] tracking-[0.2em] uppercase hover:bg-white/15 transition-colors"
                style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
              >
                Notre histoire
              </Link>
            </div>
          </div>

          {/* Stats — desktop only */}
          <div className="hidden lg:flex flex-col gap-5 flex-shrink-0 ml-auto">
            {[
              { n: '4', label: 'Gammes exclusives' },
              { n: '16', label: 'Produits naturels' },
              { n: '100%', label: 'Ingrédients naturels' },
            ].map(s => (
              <div key={s.label} className="text-center bg-white/15 px-6 py-4">
                <div
                  className="text-white text-3xl leading-none"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  {s.n}
                </div>
                <div
                  className="text-white/70 text-[10px] tracking-[0.15em] uppercase mt-1"
                  style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
