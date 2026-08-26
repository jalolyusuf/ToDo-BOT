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
      const res = await fetch(`/api/v1/media/${attachmentId}/play`, {
        method: 'POST',
        headers: { 'X-Telegram-User-ID': userId.toString() }
      })
      if (res.ok) alert('Telegram ga yuborildi!')
    } catch (e) { console.error(e) }
    setSendingMedia(null)
  }

  const formatDuration = (sec: number) => `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`
  const formatDate = (d: string | null, t: string | null) => d ? `${d.split('-').reverse().slice(0,2).join('.')}${t ? ' ' + t : ''}` : null

  const getMediaIcons = (atts: Attachment[]) => {
    const icons: string[] = []
    if (atts.some(a => a.file_type === 'photo')) icons.push('🖼️')
    if (atts.some(a => a.file_type === 'video')) icons.push('🎬')
    if (atts.some(a => a.file_type === 'voice')) icons.push('🎤')
    if (atts.some(a => a.file_type === 'audio')) icons.push('🎵')
    if (atts.some(a => a.file_type === 'document')) icons.push('📄')
    return icons.join(' ')
  }

  const renderAttachment = (att: Attachment) => {
    const baseUrl = window.location.origin
    const isSending = sendingMedia === att.id

    // Photo - show image
    if (att.file_type === 'photo') {
      return (
        <img
          key={att.id}
          src={`${baseUrl}${att.file_url}`}
          alt=""
          className="w-full max-h-52 object-cover rounded-lg"
          onClick={(e) => { e.stopPropagation(); window.open(`${baseUrl}${att.file_url}`, '_blank') }}
        />
      )
    }

    // Video - thumbnail with play button
    if (att.file_type === 'video') {
      return (
        <div
          key={att.id}
          onClick={(e) => sendMedia(att.id, e)}
          className="relative rounded-lg overflow-hidden cursor-pointer bg-gray-800"
        >
          {att.thumbnail_url ? (
            <img src={`${baseUrl}${att.thumbnail_url}`} alt="" className="w-full h-40 object-cover" />
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center">
              <span className="text-4xl">🎬</span>
            </div>
          )}
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className={`w-14 h-14 rounded-full bg-white/90 flex items-center justify-center ${isSending ? 'animate-pulse' : ''}`}>
              {isSending ? (
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-7 h-7 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
          </div>
          {att.duration && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-xs text-white">
              {formatDuration(att.duration)}
            </div>
          )}
        </div>
      )
    }

    // Voice - Telegram style
    if (att.file_type === 'voice') {
      return (
        <div
          key={att.id}
          onClick={(e) => sendMedia(att.id, e)}
          className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl cursor-pointer"
        >
          <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 ${isSending ? 'animate-pulse' : ''}`}>
            {isSending ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 text-blue-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
          {/* Waveform placeholder */}
          <div className="flex-1 flex items-center gap-0.5 h-8">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-white/80 rounded-full"
                style={{ height: `${Math.random() * 100}%`, minHeight: '20%' }}
              />
            ))}
          </div>
          {att.duration && (
            <span className="text-white text-sm font-medium">{formatDuration(att.duration)}</span>
          )}
        </div>
      )
    }

    // Audio - music style
    if (att.file_type === 'audio') {
      return (
        <div
          key={att.id}
          onClick={(e) => sendMedia(att.id, e)}
          className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl cursor-pointer border border-gray-700"
        >
          <div className={`w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0 ${isSending ? 'animate-pulse' : ''}`}>
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-xl">🎵</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{att.file_name}</p>
            {att.duration && <p className="text-gray-400 text-sm">{formatDuration(att.duration)}</p>}
          </div>
          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      )
    }

    // Document
    if (att.file_type === 'document') {
      return (
        <div
          key={att.id}
          onClick={(e) => sendMedia(att.id, e)}
          className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl cursor-pointer border border-gray-700"
        >
          <div className={`w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0 ${isSending ? 'animate-pulse' : ''}`}>
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-xl">📄</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{att.file_name}</p>
            <p className="text-gray-400 text-sm">Telegram ga yuborish</p>
          </div>
        </div>
      )
    }

    return null
  }

  if (!isTelegram) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-white mb-2">Faqat Telegram orqali</h1>
          <a href="https://t.me/td_ls_bot" className="px-4 py-2 bg-blue-600 text-white rounded-lg inline-block mt-4">
            Botni ochish
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-4">
      <div className="max-w-lg mx-auto px-3 py-3">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl">📋</div>
            <div>
              <h1 className="text-lg font-bold">Vazifalar</h1>
              {telegramUser && <p className="text-sm text-gray-400">{telegramUser.first_name}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            {(['pending', 'done', 'all'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  filterStatus === s
                    ? s === 'pending' ? 'bg-yellow-600' : s === 'done' ? 'bg-green-600' : 'bg-blue-600'
                    : 'bg-gray-700'
                }`}
              >
                {s === 'pending' ? 'Kutilmoqda' : s === 'done' ? 'Bajarilgan' : 'Barchasi'}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <p>Vazifa yo'q</p>
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
                  className={`rounded-xl p-3 cursor-pointer transition-all ${
                    task.status === 'done' ? 'bg-green-900/20 border border-green-800' : 'bg-gray-800 border border-gray-700'
                  }`}
                >
                  {/* Collapsed */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium truncate ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
                          {task.task_text}
                        </p>
                        {mediaIcons && <span className="flex-shrink-0">{mediaIcons}</span>}
                      </div>
                      {dateStr && <p className="text-sm text-gray-400 mt-1">📅 {dateStr}</p>}
                    </div>
                    <span className="text-gray-500">{isExpanded ? '▲' : '▼'}</span>
                  </div>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      {task.original_text && task.original_text !== task.task_text && (
                        <p className="text-sm text-gray-300 mb-3">{task.original_text}</p>
                      )}
                      {task.attachments.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {task.attachments.map(renderAttachment)}
                        </div>
                      )}
                      <div className="flex gap-2">
                        {task.status === 'pending' && (
                          <button onClick={(e) => markDone(task.id, e)} className="flex-1 py-2 bg-green-600 rounded-lg text-sm font-medium">
                            ✅ Bajarildi
                          </button>
                        )}
                        <button onClick={(e) => deleteTask(task.id, e)} className="px-4 py-2 bg-red-600 rounded-lg text-sm font-medium">
                          🗑️
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">#{task.id}</p>
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
