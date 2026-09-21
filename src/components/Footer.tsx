import { Link } from 'react-router'
import logo from '@/imports/TDA_LogoExe_CMJN.png'
import { useGammes } from '@/hooks/useGammes'
import { useSettings } from '@/hooks/useSettings'

export default function Footer() {
  const GAMMES = useGammes()
  const settings = useSettings()
  const whatsappHref = settings.whatsapp_number || 'https://wa.me/237000000000'

  return (
    <footer
      className="bg-[#2A1006] pt-16 pb-8"
      style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#FAF6EF]/8">

          {/* Brand */}
          <div>
            <img
              src={logo}
              alt="Teint d'Afrique Cosmétiques"
              className="h-8 object-contain mb-5"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <p className="text-[#FAF6EF]/50 text-sm leading-relaxed mb-6">
              Marque camerounaise de cosmétiques naturels, pensée pour célébrer et sublimer
              la beauté naturelle de la peau noire et métissée.
            </p>
            <div className="flex gap-3">
              <a
                href={settings.facebook_url || '#'}
                target={settings.facebook_url ? '_blank' : undefined}
                rel={settings.facebook_url ? 'noopener noreferrer' : undefined}
                aria-label="Facebook"
                className="w-9 h-9 border border-[#FAF6EF]/15 flex items-center justify-center text-[#FAF6EF]/50 text-[11px] uppercase tracking-widest hover:bg-[#FAF6EF]/10 hover:text-[#FAF6EF] transition-all"
              >
                fb
              </a>
              <a
                href={settings.instagram_url || '#'}
                target={settings.instagram_url ? '_blank' : undefined}
                rel={settings.instagram_url ? 'noopener noreferrer' : undefined}
                aria-label="Instagram"
                className="w-9 h-9 border border-[#FAF6EF]/15 flex items-center justify-center text-[#FAF6EF]/50 text-[11px] uppercase tracking-widest hover:bg-[#FAF6EF]/10 hover:text-[#FAF6EF] transition-all"
              >
                ig
              </a>
              <a
                href={whatsappHref}
                aria-label="WhatsApp"
                className="w-9 h-9 flex items-center justify-center text-white text-[11px] uppercase tracking-widest hover:opacity-80 transition-opacity"
                style={{ background: '#25D366' }}
              >
                wa
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[#C97B1A] text-[9px] tracking-[0.3em] uppercase mb-5">Navigation</p>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Accueil', to: '/' },
                { label: 'Présentation', to: '/presentation' },
                { label: 'Notre Histoire', to: '/histoire' },
                { label: 'Boutique', to: '/boutique' },
                { label: 'Contact', to: '/contact' },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-[#FAF6EF]/50 text-sm hover:text-[#FAF6EF] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Gammes */}
          <div>
            <p className="text-[#C97B1A] text-[9px] tracking-[0.3em] uppercase mb-5">Nos Gammes</p>
            <div className="flex flex-col gap-3">
              {GAMMES.map(g => (
                <Link
                  key={g.id}
                  to={`/boutique/${g.id}`}
                  className="flex items-center gap-2 text-[#FAF6EF]/50 text-sm hover:text-[#FAF6EF] transition-colors group"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform"
                    style={{ background: g.color }}
                  />
                  <span>{g.nom}</span>
                  <span className="text-[#FAF6EF]/25 text-[11px] ml-auto hidden lg:block">
                    {g.ingredients.split('&')[0].trim()}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[#C97B1A] text-[9px] tracking-[0.3em] uppercase mb-5">Contact</p>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-[#FAF6EF]/30 text-[10px] tracking-[0.2em] uppercase mb-1">Adresse</p>
                <p className="text-[#FAF6EF]/65 text-sm">{settings.contact_address}</p>
              </div>
              <div>
                <p className="text-[#FAF6EF]/30 text-[10px] tracking-[0.2em] uppercase mb-1">Email</p>
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="text-[#FAF6EF]/65 text-sm hover:text-[#C97B1A] transition-colors break-all"
                >
                  {settings.contact_email}
                </a>
              </div>
              <div>
                <p className="text-[#FAF6EF]/30 text-[10px] tracking-[0.2em] uppercase mb-2">WhatsApp</p>
                <a
                  href={`${whatsappHref}?text=Bonjour%20Teint%20d'Afrique%20Cosmétiques%2C%20je%20souhaite%20avoir%20des%20informations.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-white text-[11px] tracking-[0.15em] uppercase hover:opacity-85 transition-opacity"
                  style={{ background: '#25D366' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Écrire sur WhatsApp
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#FAF6EF]/30 text-[11px] text-center">
            © 2026 Teint d'Afrique Cosmétiques · Douala, Cameroun · Tous droits réservés
          </p>
          <p className="text-[#C97B1A] text-[9px] tracking-[0.3em] uppercase">
            #VOTRE_PEAU_VAUT_DE_LOR
          </p>
        </div>
      </div>
    </footer>
  )
}
