import { useEffect, useRef, useState } from 'react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

/** Petits composants de formulaire partagés entre les écrans de l'admin, pour rester cohérent
 * sans dupliquer les mêmes classes Tailwind dans chaque page. */

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] tracking-[0.15em] uppercase text-[#3B1705]/60 mb-1.5">{label}</span>
      {children}
    </label>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full border border-[#3B1705]/20 px-3 py-2 text-sm focus:outline-none focus:border-[#C97B1A] transition-colors ${props.className ?? ''}`}
    />
  )
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full border border-[#3B1705]/20 px-3 py-2 text-sm focus:outline-none focus:border-[#C97B1A] transition-colors resize-y ${props.className ?? ''}`}
    />
  )
}

export function ColorInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#000000'}
          onChange={e => onChange(e.target.value)}
          className="w-9 h-9 border border-[#3B1705]/20 cursor-pointer flex-shrink-0"
        />
        <TextInput value={value} onChange={e => onChange(e.target.value)} placeholder="#RRGGBB" />
      </div>
    </Field>
  )
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }) {
  const styles = {
    primary: 'bg-[#3B1705] text-[#FAF6EF] hover:bg-[#C97B1A] disabled:bg-[#3B1705]/40',
    secondary: 'border border-[#3B1705]/25 text-[#3B1705] hover:bg-[#3B1705]/5 disabled:opacity-40',
    danger: 'border border-red-700/30 text-red-700 hover:bg-red-50 disabled:opacity-40',
  }[variant]

  return (
    <button
      {...props}
      className={`px-4 py-2 text-[11px] tracking-[0.15em] uppercase transition-colors disabled:cursor-not-allowed ${styles} ${className}`}
    />
  )
}

export function Banner({ kind, children }: { kind: 'error' | 'success'; children: React.ReactNode }) {
  const styles =
    kind === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
  return <div className={`border px-4 py-2.5 text-sm ${styles}`}>{children}</div>
}

type ConfirmOptions = {
  title: string
  message: ReactNode
  confirmLabel?: string
}

/**
 * Modale de confirmation (remplace window.confirm) pour les actions destructrices.
 * Usage : `const [confirm, confirmModal] = useConfirm()`, rendre `{confirmModal}` dans le JSX,
 * puis `if (!(await confirm({ title, message }))) return`.
 */
export function useConfirm(): [(options: ConfirmOptions) => Promise<boolean>, ReactNode] {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolverRef = useRef<((ok: boolean) => void) | null>(null)

  function confirm(next: ConfirmOptions): Promise<boolean> {
    resolverRef.current?.(false)
    setOptions(next)
    return new Promise(resolve => {
      resolverRef.current = resolve
    })
  }

  function close(ok: boolean) {
    resolverRef.current?.(ok)
    resolverRef.current = null
    setOptions(null)
  }

  const modal = options ? <ConfirmModal {...options} onClose={close} /> : null
  return [confirm, modal]
}

function ConfirmModal({
  title,
  message,
  confirmLabel = 'Supprimer',
  onClose,
}: ConfirmOptions & { onClose: (ok: boolean) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A1006]/50 px-4"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose(false)
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="w-full max-w-md bg-[#FAF6EF] border border-[#3B1705]/15 shadow-xl p-6 space-y-4"
      >
        <h2
          id="confirm-modal-title"
          className="text-xl text-[#3B1705]"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          {title}
        </h2>
        <div className="text-sm text-[#3B1705]/75 leading-relaxed">{message}</div>
        <div className="flex justify-end gap-2 pt-2">
          {/* Focus sur « Annuler » : une validation au clavier par erreur ne supprime rien. */}
          <Button autoFocus variant="secondary" onClick={() => onClose(false)}>
            Annuler
          </Button>
          <Button variant="danger" className="!bg-red-700 !text-white hover:!bg-red-800" onClick={() => onClose(true)}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
