import { useState } from 'react'
import { ApiError } from '@/admin/api'
import { Banner, Button, Field, TextInput } from '@/admin/components/ui'

const ERROR_MESSAGES: Record<string, string> = {
  missing_credentials: 'Email et mot de passe requis.',
  invalid_credentials: 'Email ou mot de passe incorrect.',
  too_many_attempts: 'Trop de tentatives. Réessayez dans quelques minutes.',
}

export default function LoginPage({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onLogin(email, password)
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'erreur_inconnue'
      setError(ERROR_MESSAGES[code] ?? "Une erreur est survenue, réessayez.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-[#3B1705]/10 p-8">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#C97B1A] mb-2">Teint d'Afrique Cosmétiques</p>
        <h1 className="text-2xl mb-6" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
          Connexion admin
        </h1>

        <div className="space-y-4">
          <Field label="Email">
            <TextInput
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Mot de passe">
            <TextInput
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </Field>

          {error && <Banner kind="error">{error}</Banner>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </div>
      </form>
    </div>
  )
}
