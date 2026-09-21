import { useState } from 'react'
import { useContent } from '@/hooks/useContent'
import { useSettings } from '@/hooks/useSettings'

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const settings = useSettings()
  const content = useContent('contact', {
    intro_text:
      "Nous sommes à votre écoute. Écrivez-nous, appelez-nous ou retrouvez-nous sur les réseaux sociaux.",
    form_title: "Envoyez-nous un message",
    form_success_message: "Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.",
  })
  const whatsappHref = settings.whatsapp_number || 'https://wa.me/237000000000'

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
            Contact
          </h1>
          <p className="text-[#FAF6EF]/60 max-w-md">{content.intro_text}</p>
        </div>
      </div>

      {/* ── CONTACT GRID ── */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16">

            {/* Info */}
            <div>
              <h2
                className="text-[#3B1705] leading-tight mb-10"
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                }}
              >
                Parlons de<br />votre beauté.
              </h2>

              <div className="space-y-8 mb-12">
                {[
                  {
                    label: 'Adresse',
                    icon: '◈',
                    lines: [settings.contact_address],
                    href: undefined,
                  },
                  {
                    label: 'Email',
                    icon: '◉',
                    lines: [settings.contact_email],
                    href: `mailto:${settings.contact_email}`,
                  },
                  {
                    label: 'WhatsApp',
                    icon: '◎',
                    lines: ['Nous écrire sur WhatsApp'],
                    href: whatsappHref,
                  },
                ].map(item => (
                  <div key={item.label} className="flex gap-5 items-start">
                    <div
                      className="w-11 h-11 flex items-center justify-center flex-shrink-0 text-[#C97B1A] text-xl"
                      style={{ background: '#3B170508' }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[9px] tracking-[0.3em] uppercase text-[#C97B1A] mb-1">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-[#3B1705] font-medium hover:text-[#C97B1A] transition-colors"
                        >
                          {item.lines[0]}
                        </a>
                      ) : (
                        item.lines.map((l, i) => (
                          <p key={i} className="text-[#3B1705] font-medium">
                            {l}
                          </p>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social */}
              <div>
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#C97B1A] mb-5">
                  Réseaux Sociaux
                </p>
                <div className="flex gap-3">
                  <a
                    href={settings.facebook_url || '#'}
                    target={settings.facebook_url ? '_blank' : undefined}
                    rel={settings.facebook_url ? 'noopener noreferrer' : undefined}
                    aria-label="Facebook"
                    className="w-11 h-11 border border-[#3B1705]/20 flex items-center justify-center text-[#3B1705] text-[11px] uppercase tracking-widest hover:bg-[#3B1705] hover:text-white hover:border-[#3B1705] transition-all"
                  >
                    fb
                  </a>
                  <a
                    href={settings.instagram_url || '#'}
                    target={settings.instagram_url ? '_blank' : undefined}
                    rel={settings.instagram_url ? 'noopener noreferrer' : undefined}
                    aria-label="Instagram"
                    className="w-11 h-11 border border-[#3B1705]/20 flex items-center justify-center text-[#3B1705] text-[11px] uppercase tracking-widest hover:bg-[#3B1705] hover:text-white hover:border-[#3B1705] transition-all"
                  >
                    ig
                  </a>
                  <a
                    href={whatsappHref}
                    aria-label="WhatsApp"
                    className="w-11 h-11 flex items-center justify-center text-white text-[11px] uppercase tracking-widest hover:opacity-85 transition-opacity"
                    style={{ background: '#25D366' }}
                  >
                    wa
                  </a>
                </div>
              </div>

              {/* Map / location visual */}
              <div className="mt-10 p-6 border border-[#3B1705]/10 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ background: '#3B1705' }} />
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#C97B1A] mb-2">
                  Localisation
                </p>
                <p
                  className="text-[#3B1705] text-2xl"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Douala
                </p>
                <p className="text-[#2A1006]/55 text-sm">Cameroun, Afrique Centrale</p>
              </div>
            </div>

            {/* Form */}
            <div className="bg-[#3B1705] p-8 md:p-10">
              {sent ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-6 py-16">
                  <div
                    className="text-[#C97B1A] text-5xl"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                  >
                    ✓
                  </div>
                  <h3
                    className="text-[#FAF6EF] text-2xl"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                  >
                    Message envoyé !
                  </h3>
                  <p className="text-[#FAF6EF]/60 text-sm leading-relaxed max-w-xs">
                    {content.form_success_message}
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-4 border border-[#FAF6EF]/20 text-[#FAF6EF]/70 px-6 py-2.5 text-[11px] tracking-[0.2em] uppercase hover:bg-[#FAF6EF]/10 transition-colors"
                  >
                    Nouveau message
                  </button>
                </div>
              ) : (
                <>
                  <h3
                    className="text-[#FAF6EF] text-2xl mb-8"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                  >
                    {content.form_title}
                  </h3>
                  <form
                    className="space-y-5"
                    onSubmit={e => {
                      e.preventDefault()
                      setSent(true)
                    }}
                  >
                    {[
                      { label: 'Nom complet', type: 'text', placeholder: 'Votre nom', required: true },
                      { label: 'Email', type: 'email', placeholder: 'votre@email.com', required: true },
                      { label: 'Téléphone', type: 'tel', placeholder: '+237 6XX XXX XXX', required: false },
                    ].map(f => (
                      <div key={f.label}>
                        <label className="text-[9px] tracking-[0.3em] uppercase text-[#FAF6EF]/55 block mb-2">
                          {f.label} {f.required && <span className="text-[#C97B1A]">*</span>}
                        </label>
                        <input
                          type={f.type}
                          placeholder={f.placeholder}
                          required={f.required}
                          className="w-full bg-[#FAF6EF]/8 border border-[#FAF6EF]/18 text-[#FAF6EF] placeholder:text-[#FAF6EF]/28 px-4 py-3 text-sm focus:outline-none focus:border-[#C97B1A] transition-colors"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-[9px] tracking-[0.3em] uppercase text-[#FAF6EF]/55 block mb-2">
                        Message <span className="text-[#C97B1A]">*</span>
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Votre message, votre demande..."
                        required
                        className="w-full bg-[#FAF6EF]/8 border border-[#FAF6EF]/18 text-[#FAF6EF] placeholder:text-[#FAF6EF]/28 px-4 py-3 text-sm focus:outline-none focus:border-[#C97B1A] transition-colors resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#C97B1A] text-white py-4 text-[11px] tracking-[0.25em] uppercase hover:bg-[#A85E0F] transition-colors"
                    >
                      Envoyer le Message
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
