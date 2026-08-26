import { useEffect, useState } from 'react'

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
          }
        }
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
  file_size: number | null
  mime_type: string | null
  duration: number | null
}

interface Task {
  id: number
  task_text: string
  due_date: string | null
  due_time: string | null
  status: string
  source: string
  original_text: string | null
  created_at: string
  attachments: Attachment[]
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'done'>('pending')
  const [isTelegram, setIsTelegram] = useState(false)
  const [telegramUser, setTelegramUser] = useState<any>(null)
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null)

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg && tg.initData) {
      setIsTelegram(true)
      setTelegramUser(tg.initDataUnsafe.user)
      tg.ready()
      tg.expand()
      fetchTasks()
    } else {
      setIsTelegram(false)
    }
  }, [])

  useEffect(() => {
    filterTasks()
  }, [filterStatus, allTasks])

  const fetchTasks = async () => {
    try {
      const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id
      if (!telegramUserId) return

      const response = await fetch('/api/v1/tasks', {
        headers: { 'X-Telegram-User-ID': telegramUserId.toString() }
      })
      const data = await response.json()
      setAllTasks(data)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    }
  }

  const filterTasks = () => {
    let filtered = allTasks.filter(t => t.status !== 'deleted')
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus)
    }
    setTasks(filtered)
  }

  const deleteTask = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Vazifani o\'chirmoqchimisiz?')) return

    try {
      const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id
      if (!telegramUserId) return

      const response = await fetch(`/api/v1/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'X-Telegram-User-ID': telegramUserId.toString() }
      })
      if (response.ok) {
        setExpandedTaskId(null)
        await fetchTasks()
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const markDone = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id
      if (!telegramUserId) return

      const response = await fetch(`/api/v1/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-User-ID': telegramUserId.toString()
        },
        body: JSON.stringify({ status: 'done' }),
      })
      if (response.ok) await fetchTasks()
    } catch (error) {
      console.error('Failed to mark task done:', error)
    }
  }

  const playMedia = async (attachmentId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id
      if (!telegramUserId) return

      const response = await fetch(`/api/v1/media/${attachmentId}/play`, {
        method: 'POST',
        headers: { 'X-Telegram-User-ID': telegramUserId.toString() }
      })
      if (response.ok) {
        alert('Media Telegram ga yuborildi!')
      }
    } catch (error) {
      console.error('Failed to play media:', error)
    }
  }

  const getAttachmentIcons = (attachments: Attachment[]) => {
    const icons: JSX.Element[] = []
    const hasPhoto = attachments.some(a => a.file_type === 'photo')
    const hasVideo = attachments.some(a => a.file_type === 'video')
    const hasVoice = attachments.some(a => a.file_type === 'voice' || a.file_type === 'audio')
    const hasDoc = attachments.some(a => a.file_type === 'document')

    if (hasPhoto) icons.push(<span key="photo" title="Rasm">🖼️</span>)
    if (hasVideo) icons.push(<span key="video" title="Video">🎬</span>)
    if (hasVoice) icons.push(<span key="voice" title="Ovoz">🎤</span>)
    if (hasDoc) icons.push(<span key="doc" title="Fayl">📄</span>)

    return icons
  }

  const formatDate = (dateStr: string | null, timeStr: string | null) => {
    if (!dateStr) return null
    const parts = dateStr.split('-')
    const date = `${parts[2]}.${parts[1]}`
    return timeStr ? `${date} ${timeStr}` : date
  }

  const renderAttachment = (att: Attachment) => {
    const baseUrl = window.location.origin

    if (att.file_type === 'photo') {
      return (
        <img
          key={att.id}
          src={`${baseUrl}${att.file_url}`}
          alt=""
          className="w-full max-h-48 object-cover rounded-lg cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            window.open(`${baseUrl}${att.file_url}`, '_blank')
          }}
        />
      )
    }

    if (att.file_type === 'voice' || att.file_type === 'audio') {
      return (
        <button
          key={att.id}
          onClick={(e) => playMedia(att.id, e)}
          className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-sm"
        >
          <span>▶️</span>
          <span>Ovozli xabar</span>
          {att.duration && <span className="text-xs text-gray-400">({Math.floor(att.duration / 60)}:{(att.duration % 60).toString().padStart(2, '0')})</span>}
        </button>
      )
    }

    if (att.file_type === 'video') {
      return (
        <button
          key={att.id}
          onClick={(e) => playMedia(att.id, e)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-sm"
        >
          <span>🎬</span>
          <span>Video</span>
          {att.duration && <span className="text-xs text-gray-400">({Math.floor(att.duration / 60)}:{(att.duration % 60).toString().padStart(2, '0')})</span>}
        </button>
      )
    }

    if (att.file_type === 'document') {
      return (
        <a
          key={att.id}
          href={`${baseUrl}${att.file_url}`}
          download={att.file_name}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 px-3 py-2 bg-gray-600/20 border border-gray-500/30 rounded-lg text-sm"
        >
          <span>📄</span>
          <span className="truncate">{att.file_name}</span>
        </a>
      )
    }

    return null
  }

  if (!isTelegram) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-white mb-2">Kirish Taqiqlangan</h1>
          <p className="text-gray-400 mb-4">Faqat Telegram orqali kiring</p>
          <a href="https://t.me/td_ls_bot" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
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

          {/* Filters */}
          <div className="flex gap-2">
            {(['pending', 'done', 'all'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  filterStatus === status
                    ? status === 'pending' ? 'bg-yellow-600' : status === 'done' ? 'bg-green-600' : 'bg-blue-600'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {status === 'pending' ? 'Kutilmoqda' : status === 'done' ? 'Bajarilgan' : 'Barchasi'}
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
            tasks.map((task) => {
              const isExpanded = expandedTaskId === task.id
              const dateDisplay = formatDate(task.due_date, task.due_time)
              const attachmentIcons = getAttachmentIcons(task.attachments)

              return (
                <div
                  key={task.id}
                  onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                  className={`rounded-xl p-3 cursor-pointer transition-all ${
                    task.status === 'done'
                      ? 'bg-green-900/20 border border-green-700/30'
                      : 'bg-gray-800 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {/* Collapsed View */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium truncate ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
                          {task.task_text}
                        </p>
                        {attachmentIcons.length > 0 && (
                          <div className="flex gap-1 flex-shrink-0">{attachmentIcons}</div>
                        )}
                      </div>
                      {dateDisplay && (
                        <p className="text-sm text-gray-400 mt-1">📅 {dateDisplay}</p>
                      )}
                    </div>
                    <div className="text-gray-500 text-lg">
                      {isExpanded ? '▲' : '▼'}
                    </div>
                  </div>

                  {/* Expanded View */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      {/* Full text if different from title */}
                      {task.original_text && task.original_text !== task.task_text && (
                        <p className="text-sm text-gray-300 mb-3 whitespace-pre-wrap">{task.original_text}</p>
                      )}

                      {/* Attachments */}
                      {task.attachments.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {task.attachments.map(renderAttachment)}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        {task.status === 'pending' && (
                          <button
                            onClick={(e) => markDone(task.id, e)}
                            className="flex-1 px-3 py-2 bg-green-600 rounded-lg text-sm font-medium"
                          >
                            ✅ Bajarildi
                          </button>
                        )}
                        <button
                          onClick={(e) => deleteTask(task.id, e)}
                          className="px-3 py-2 bg-red-600 rounded-lg text-sm font-medium"
                        >
                          🗑️ O'chirish
                        </button>
                      </div>

                      {/* Meta info */}
                      <div className="mt-3 text-xs text-gray-500">
                        ID: #{task.id} | Yaratilgan: {new Date(task.created_at).toLocaleDateString('uz')}
                      </div>
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
