import { useEffect, useState } from 'react'
import {
  ApiError,
  deleteContactMessage,
  fetchContactMessages,
  setContactMessageRead,
  type ContactMessage,
} from '@/admin/api'
import { Banner, Button } from '@/admin/components/ui'

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'tous' | 'non-lus'>('tous')

  function reload() {
    fetchContactMessages()
      .then(setMessages)
      .catch(() => setLoadError('Impossible de charger les messages.'))
  }

  useEffect(reload, [])

  async function toggleRead(message: ContactMessage) {
    const isRead = !(message.isRead === true || message.isRead === 1)
    try {
      await setContactMessageRead(message.id, isRead)
      setMessages(prev =>
        prev ? prev.map(m => (m.id === message.id ? { ...m, isRead: isRead ? 1 : 0 } : m)) : prev
      )
    } catch (err) {
      alert(err instanceof ApiError ? `Erreur : ${err.code}` : 'Erreur inattendue.')
    }
  }

  async function handleDelete(message: ContactMessage) {
    if (!window.confirm(`Supprimer le message de « ${message.name} » ? Cette action est définitive.`)) return
    try {
      await deleteContactMessage(message.id)
      setMessages(prev => (prev ? prev.filter(m => m.id !== message.id) : prev))
    } catch (err) {
      alert(err instanceof ApiError ? `Erreur : ${err.code}` : 'Erreur inattendue.')
    }
  }

  const visible = (messages ?? []).filter(m =>
    filter === 'non-lus' ? !(m.isRead === true || m.isRead === 1) : true
  )
  const unreadCount = (messages ?? []).filter(m => !(m.isRead === true || m.isRead === 1)).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          {(['tous', 'non-lus'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-[11px] tracking-[0.15em] uppercase border transition-colors ${
                filter === f
                  ? 'border-[#3B1705] bg-[#3B1705] text-[#FAF6EF]'
                  : 'border-[#3B1705]/20 text-[#3B1705] hover:bg-[#3B1705]/5'
              }`}
            >
              {f === 'tous' ? 'Tous' : `Non lus (${unreadCount})`}
            </button>
          ))}
        </div>
        <Button variant="secondary" onClick={reload}>
          Actualiser
        </Button>
      </div>

      {loadError && <Banner kind="error">{loadError}</Banner>}
      {!loadError && messages === null && <p className="text-sm text-[#3B1705]/50">Chargement...</p>}
      {messages !== null && visible.length === 0 && (
        <p className="text-sm text-[#3B1705]/50">
          {filter === 'non-lus' ? 'Aucun message non lu.' : 'Aucun message reçu pour le moment.'}
        </p>
      )}

      <div className="space-y-4">
        {visible.map(message => {
          const isUnread = !(message.isRead === true || message.isRead === 1)
          return (
            <div
              key={message.id}
              className={`bg-white border p-5 space-y-3 ${
                isUnread ? 'border-[#C97B1A]/50 border-l-4 border-l-[#C97B1A]' : 'border-[#3B1705]/10'
              }`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-medium text-[#3B1705]">
                    {message.name}
                    {isUnread && (
                      <span className="ml-2 text-[9px] tracking-[0.15em] uppercase text-[#C97B1A]">
                        Nouveau
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[#3B1705]/50 mt-0.5">
                    <a href={`mailto:${message.email}`} className="hover:text-[#C97B1A]">
                      {message.email}
                    </a>
                    {message.phone && <span> · {message.phone}</span>}
                    {' · '}
                    {new Date(message.createdAt.replace(' ', 'T')).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => toggleRead(message)}>
                    {isUnread ? 'Marquer lu' : 'Marquer non lu'}
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(message)}>
                    Supprimer
                  </Button>
                </div>
              </div>
              <p className="text-sm text-[#2A1006]/80 leading-relaxed whitespace-pre-wrap">
                {message.message}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
