import { useEffect, useState } from 'react'

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string
        initDataUnsafe: { user?: { id: number; first_name: string } }
        ready: () => void
        expand: () => void
      }
    }
  }
}

// Modern SVG Icons
const Icons = {
  play: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  trash: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  calendar: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  photo: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  video: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  mic: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  ),
  music: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  ),
  document: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  chevronDown: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  chevronUp: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  ),
  clipboard: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  inbox: (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
  lock: (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  send: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
}

interface Attachment {
  id: number
  file_type: string
  file_name: string
  file_url: string
  thumbnail_url: string | null
  duration: number | null
}

interface Task {
  id: number
  task_text: string
  due_date: string | null
  due_time: string | null
  status: string
  original_text: string | null
  created_at: string
  attachments: Attachment[]
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [filterStatus, setFilterStatus] = useState<'pending' | 'done' | 'all'>('pending')
  const [isTelegram, setIsTelegram] = useState(false)
  const [telegramUser, setTelegramUser] = useState<any>(null)
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null)
  const [sendingMedia, setSendingMedia] = useState<number | null>(null)

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg && tg.initData) {
      setIsTelegram(true)
      setTelegramUser(tg.initDataUnsafe.user)
      tg.ready()
      tg.expand()
      fetchTasks()
    }
  }, [])

  useEffect(() => {
    let filtered = allTasks.filter(t => t.status !== 'deleted')
    if (filterStatus !== 'all') filtered = filtered.filter(t => t.status === filterStatus)
    setTasks(filtered)
  }, [filterStatus, allTasks])

  const fetchTasks = async () => {
    try {
      const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id
      if (!userId) return
      const res = await fetch('/api/v1/tasks', { headers: { 'X-Telegram-User-ID': userId.toString() } })
      setAllTasks(await res.json())
    } catch (e) { console.error(e) }
  }

  const deleteTask = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("O'chirmoqchimisiz?")) return
    const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id
    if (!userId) return
    const res = await fetch(`/api/v1/tasks/${id}`, { method: 'DELETE', headers: { 'X-Telegram-User-ID': userId.toString() } })
    if (res.ok) { setExpandedTaskId(null); fetchTasks() }
  }

  const markDone = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id
    if (!userId) return
    const res = await fetch(`/api/v1/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Telegram-User-ID': userId.toString() },
      body: JSON.stringify({ status: 'done' })
    })
    if (res.ok) fetchTasks()
  }

  const sendMedia = async (attachmentId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setSendingMedia(attachmentId)
    try {
      const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id
      if (!userId) return
      await fetch(`/api/v1/media/${attachmentId}/play`, {
        method: 'POST',
        headers: { 'X-Telegram-User-ID': userId.toString() }
      })
    } catch (e) { console.error(e) }
    setSendingMedia(null)
  }

  const formatDuration = (sec: number) => `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`
  const formatDate = (d: string | null, t: string | null) => d ? `${d.split('-').reverse().slice(0,2).join('.')}${t ? ' ' + t : ''}` : null

  const getMediaIcons = (atts: Attachment[]) => {
    const icons: JSX.Element[] = []
    if (atts.some(a => a.file_type === 'photo')) icons.push(<span key="p" className="text-blue-400">{Icons.photo}</span>)
    if (atts.some(a => a.file_type === 'video')) icons.push(<span key="v" className="text-purple-400">{Icons.video}</span>)
    if (atts.some(a => a.file_type === 'voice')) icons.push(<span key="m" className="text-green-400">{Icons.mic}</span>)
    if (atts.some(a => a.file_type === 'audio')) icons.push(<span key="a" className="text-pink-400">{Icons.music}</span>)
    if (atts.some(a => a.file_type === 'document')) icons.push(<span key="d" className="text-orange-400">{Icons.document}</span>)
    return icons
  }

  const Spinner = () => (
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
  )

  const renderAttachment = (att: Attachment) => {
    const baseUrl = window.location.origin
    const isSending = sendingMedia === att.id

    if (att.file_type === 'photo') {
      return (
        <div key={att.id} className="relative group rounded-xl overflow-hidden">
          <img
            src={`${baseUrl}${att.file_url}`}
            alt=""
            className="w-full max-h-52 object-cover"
            onClick={(e) => { e.stopPropagation(); window.open(`${baseUrl}${att.file_url}`, '_blank') }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
        </div>
      )
    }

    if (att.file_type === 'video') {
      return (
        <div
          key={att.id}
          onClick={(e) => sendMedia(att.id, e)}
          className="relative rounded-xl overflow-hidden cursor-pointer group"
        >
          {att.thumbnail_url ? (
            <img src={`${baseUrl}${att.thumbnail_url}`} alt="" className="w-full h-44 object-cover" />
          ) : (
            <div className="w-full h-44 bg-gradient-to-br from-purple-900/50 to-indigo-900/50 flex items-center justify-center">
              <div className="text-purple-300">{Icons.video}</div>
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all flex items-center justify-center">
            <div className={`w-16 h-16 rounded-full bg-white/95 shadow-xl flex items-center justify-center transform group-hover:scale-110 transition-transform ${isSending ? 'animate-pulse' : ''}`}>
              {isSending ? <Spinner /> : <div className="text-purple-600 ml-1">{Icons.play}</div>}
            </div>
          </div>
          {att.duration && (
            <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-xs text-white font-medium">
              {formatDuration(att.duration)}
            </div>
          )}
        </div>
      )
    }

    if (att.file_type === 'voice') {
      return (
        <div
          key={att.id}
          onClick={(e) => sendMedia(att.id, e)}
          className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl cursor-pointer hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg"
        >
          <div className={`w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0 ${isSending ? 'animate-pulse' : ''}`}>
            {isSending ? <Spinner /> : <div className="text-white ml-0.5">{Icons.play}</div>}
          </div>
          <div className="flex-1 flex items-center gap-0.5 h-8">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-white/70 rounded-full transition-all"
                style={{ height: `${20 + Math.sin(i * 0.5) * 30 + Math.random() * 30}%` }}
              />
            ))}
          </div>
          {att.duration && (
            <span className="text-white/90 text-sm font-medium tabular-nums">{formatDuration(att.duration)}</span>
          )}
        </div>
      )
    }

    if (att.file_type === 'audio') {
      return (
        <div
          key={att.id}
          onClick={(e) => sendMedia(att.id, e)}
          className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-xl cursor-pointer border border-gray-700/50 hover:border-pink-500/30 transition-all group"
        >
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-pink-500/25 transition-all ${isSending ? 'animate-pulse' : ''}`}>
            {isSending ? <Spinner /> : <div className="text-white">{Icons.music}</div>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{att.file_name}</p>
            {att.duration && <p className="text-gray-400 text-sm mt-0.5">{formatDuration(att.duration)}</p>}
          </div>
          <div className="text-gray-500 group-hover:text-pink-400 transition-colors">{Icons.send}</div>
        </div>
      )
    }

    if (att.file_type === 'document') {
      return (
        <div
          key={att.id}
          onClick={(e) => sendMedia(att.id, e)}
          className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-xl cursor-pointer border border-gray-700/50 hover:border-orange-500/30 transition-all group"
        >
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-orange-500/25 transition-all ${isSending ? 'animate-pulse' : ''}`}>
            {isSending ? <Spinner /> : <div className="text-white">{Icons.document}</div>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{att.file_name}</p>
            <p className="text-gray-400 text-sm mt-0.5">Telegram ga yuborish</p>
          </div>
          <div className="text-gray-500 group-hover:text-orange-400 transition-colors">{Icons.send}</div>
        </div>
      )
    }

    return null
  }

  if (!isTelegram) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-gray-600 mb-6 flex justify-center">{Icons.lock}</div>
          <h1 className="text-2xl font-bold text-white mb-3">Kirish cheklangan</h1>
          <p className="text-gray-400 mb-6">Faqat Telegram orqali kiring</p>
          <a href="https://t.me/td_ls_bot" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/25">
            Botni ochish
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-6">
      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 mb-5 border border-gray-700/50">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              {Icons.clipboard}
            </div>
            <div>
              <h1 className="text-xl font-bold">Vazifalar</h1>
              {telegramUser && <p className="text-sm text-gray-400">{telegramUser.first_name}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            {(['pending', 'done', 'all'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  filterStatus === s
                    ? s === 'pending'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25'
                      : s === 'done'
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/25'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/25'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {s === 'pending' ? 'Kutilmoqda' : s === 'done' ? 'Bajarilgan' : 'Barchasi'}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-600 mb-4 flex justify-center">{Icons.inbox}</div>
              <p className="text-gray-400">Vazifa yo'q</p>
            </div>
          ) : (
            tasks.map(task => {
              const isExpanded = expandedTaskId === task.id
              const dateStr = formatDate(task.due_date, task.due_time)
              const mediaIcons = getMediaIcons(task.attachments)

              return (
                <div
                  key={task.id}
                  onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                  className={`rounded-2xl p-4 cursor-pointer transition-all border ${
                    task.status === 'done'
                      ? 'bg-emerald-900/20 border-emerald-700/30'
                      : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium truncate ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
                          {task.task_text}
                        </p>
                        {mediaIcons.length > 0 && <div className="flex gap-1 flex-shrink-0">{mediaIcons}</div>}
                      </div>
                      {dateStr && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-gray-400">
                          {Icons.calendar}
                          <span className="text-sm">{dateStr}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-gray-500">{isExpanded ? Icons.chevronUp : Icons.chevronDown}</div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                      {task.original_text && task.original_text !== task.task_text && (
                        <p className="text-sm text-gray-300 mb-4 leading-relaxed">{task.original_text}</p>
                      )}
                      {task.attachments.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {task.attachments.map(renderAttachment)}
                        </div>
                      )}
                      <div className="flex gap-2">
                        {task.status === 'pending' && (
                          <button
                            onClick={(e) => markDone(task.id, e)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl text-sm font-medium shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-green-400 transition-all"
                          >
                            {Icons.check}
                            <span>Bajarildi</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => deleteTask(task.id, e)}
                          className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl text-sm font-medium shadow-lg shadow-red-500/25 hover:from-red-400 hover:to-rose-400 transition-all"
                        >
                          {Icons.trash}
                        </button>
                      </div>
                      <p className="mt-3 text-xs text-gray-500">ID: {task.id}</p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
