import { useEffect, useState } from 'react'
import { ApiError, fetchSettings, updateSetting, type Settings } from '@/admin/api'
import { Banner, Button, Field, TextInput } from '@/admin/components/ui'

const FIELDS: { key: keyof Settings; label: string; placeholder: string }[] = [
  { key: 'contact_phone', label: 'Téléphone', placeholder: '+237 6XX XXX XXX' },
  { key: 'contact_email', label: 'Email', placeholder: 'contact@teintdafrique.com' },
  { key: 'contact_address', label: 'Adresse', placeholder: 'Douala, Cameroun' },
  { key: 'whatsapp_number', label: 'Lien WhatsApp', placeholder: 'https://wa.me/237XXXXXXXXX' },
  { key: 'facebook_url', label: 'Lien Facebook', placeholder: 'https://facebook.com/...' },
  { key: 'instagram_url', label: 'Lien Instagram', placeholder: 'https://instagram.com/...' },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
      .then(setSettings)
      .catch(() => setLoadError('Impossible de charger les coordonnées.'))
  }, [])

  if (loadError) return <Banner kind="error">{loadError}</Banner>
  if (!settings) return <p className="text-sm text-[#3B1705]/50">Chargement...</p>

  return (
    <div className="bg-white border border-[#3B1705]/10 p-6 space-y-5 max-w-2xl">
      <h2 className="text-xl" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
        Coordonnées & réseaux sociaux
      </h2>
      {FIELDS.map(f => (
        <SettingField key={f.key} field={f} value={settings[f.key]} />
      ))}
    </div>
  )
}

function SettingField({
  field,
  value,
}: {
  field: { key: keyof Settings; label: string; placeholder: string }
  value: string
}) {
  const [current, setCurrent] = useState(value)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const ERROR_MESSAGES: Record<string, string> = {
    invalid_url: 'URL invalide.',
    invalid_email: 'Email invalide.',
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await updateSetting(field.key, current)
      setSuccess(true)
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'erreur_inconnue'
      setError(ERROR_MESSAGES[code] ?? `Erreur : ${code}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex gap-3 items-end">
      <div className="flex-1">
        <Field label={field.label}>
          <TextInput
            value={current}
            placeholder={field.placeholder}
            onChange={e => {
              setCurrent(e.target.value)
              setSuccess(false)
            }}
          />
        </Field>
        {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
        {success && <p className="text-xs text-emerald-700 mt-1">Enregistré.</p>}
      </div>
      <Button variant="secondary" onClick={handleSave} disabled={saving || current === value}>
        {saving ? '...' : 'Enregistrer'}
      </Button>
    </div>
  )
}
