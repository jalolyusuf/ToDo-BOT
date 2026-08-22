import { useEffect, useState } from 'react'

// Telegram WebApp types
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
        MainButton: {
          setText: (text: string) => void
          show: () => void
          hide: () => void
        }
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
  width: number | null
  height: number | null
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

type ViewMode = 'list' | 'stats'

// Modern SVG Icons
const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const LockIcon = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

const TasksIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
)

const PendingIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const DoneIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const AttachmentIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
)

const EmptyIcon = () => (
  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
)

const TextIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
)

const VoiceIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
)

const WebIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
)

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'done'>('pending')
  const [isTelegram, setIsTelegram] = useState(false)
  const [telegramUser, setTelegramUser] = useState<any>(null)

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
    if (isTelegram) {
      filterTasks()
    }
  }, [searchQuery, filterStatus, allTasks])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/v1/tasks')
      const data = await response.json()
      setAllTasks(data)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    }
  }

  const filterTasks = () => {
    let filtered = allTasks
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus)
    }
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.task_text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    setTasks(filtered)
  }

  const addTask = async () => {
    if (!newTask.trim()) return
    setLoading(true)
    try {
      const response = await fetch('/api/v1/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_text: newTask }),
      })
      if (response.ok) {
        setNewTask('')
        await fetchTasks()
      }
    } catch (error) {
      console.error('Failed to add task:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async (id: number) => {
    try {
      const response = await fetch(`/api/v1/tasks/${id}`, { method: 'DELETE' })
      if (response.ok) await fetchTasks()
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const markDone = async (id: number) => {
    try {
      const response = await fetch(`/api/v1/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'done' }),
      })
      if (response.ok) await fetchTasks()
    } catch (error) {
      console.error('Failed to mark task done:', error)
    }
  }

  const playMedia = async (attachmentId: number) => {
    try {
      const response = await fetch(`/api/v1/media/${attachmentId}/play`, {
        method: 'POST',
      })
      if (response.ok) {
        alert('📱 Media Telegram botga yuborildi! Telegram da ko\'ring.')
      } else {
        alert('❌ Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Failed to play media:', error)
      alert('❌ Xatolik yuz berdi')
    }
  }

  const renderAttachment = (attachment: Attachment) => {
    const baseUrl = window.location.origin

    // Photo - show directly
    if (attachment.file_type === 'photo') {
      return (
        <img
          key={attachment.id}
          src={`${baseUrl}${attachment.file_url}`}
          alt={attachment.file_name}
          className="w-full rounded-xl mt-3 cursor-pointer hover:opacity-90 transition"
          onClick={() => window.open(`${baseUrl}${attachment.file_url}`, '_blank')}
        />
      )
    }

    // Voice/Audio - Play button (sends via Telegram bot)
    if (attachment.file_type === 'voice' || attachment.file_type === 'audio') {
      return (
        <button
          key={attachment.id}
          onClick={() => playMedia(attachment.id)}
          className="inline-flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-xl hover:from-purple-600/30 hover:to-purple-700/30 transition mt-3"
        >
          <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-left">
            <div className="text-sm font-medium text-purple-200">
              {attachment.file_type === 'voice' ? 'Ovozli xabar' : 'Audio'}
            </div>
            {attachment.duration && (
              <div className="text-xs text-purple-400">
                {Math.floor(attachment.duration / 60)}:{(attachment.duration % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
        </button>
      )
    }

    // Video - Play button (sends via Telegram bot)
    if (attachment.file_type === 'video') {
      return (
        <button
          key={attachment.id}
          onClick={() => playMedia(attachment.id)}
          className="relative inline-flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-xl hover:from-blue-600/30 hover:to-blue-700/30 transition mt-3 w-full"
        >
          <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-left flex-1">
            <div className="text-sm font-medium text-blue-200">Video</div>
            <div className="text-xs text-blue-400">{attachment.file_name}</div>
            {attachment.duration && (
              <div className="text-xs text-blue-400 mt-1">
                ⏱️ {Math.floor(attachment.duration / 60)}:{(attachment.duration % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
        </button>
      )
    }

    // Document - Download link
    if (attachment.file_type === 'document') {
      return (
        <a
          key={attachment.id}
          href={`${baseUrl}${attachment.file_url}`}
          download={attachment.file_name}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 mt-3 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span className="text-sm">{attachment.file_name}</span>
          {attachment.file_size && (
            <span className="text-xs text-gray-400">
              ({(attachment.file_size / 1024).toFixed(0)} KB)
            </span>
          )}
        </a>
      )
    }

    return null
  }

  const getSourceBadge = (source: string) => {
    const badges = {
      text: { icon: <TextIcon />, label: 'Matn', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
      voice: { icon: <VoiceIcon />, label: 'Ovoz', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
      web: { icon: <WebIcon />, label: 'Web', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    }
    const badge = badges[source as keyof typeof badges] || badges.text
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${badge.color}`}>
        {badge.icon}
        <span>{badge.label}</span>
      </span>
    )
  }

  const stats = {
    total: allTasks.length,
    pending: allTasks.filter(t => t.status === 'pending').length,
    done: allTasks.filter(t => t.status === 'done').length,
    withMedia: allTasks.filter(t => t.attachments.length > 0).length,
  }

  if (!isTelegram) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-[url('/logo.png')] bg-center bg-no-repeat opacity-5 bg-contain"></div>
        <div className="text-center max-w-md relative z-10">
          <div className="mb-6 flex justify-center">
            <div className="p-6 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full border-2 border-red-500/30">
              <LockIcon />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Kirish Taqiqlangan
          </h1>
          <p className="text-gray-400 mb-6 leading-relaxed">
            Bu sahifaga faqat Telegram bot orqali kirish mumkin.<br />
            Xavfsizlik maqsadida browser orqali kirish cheklangan.
          </p>
          <a
            href="https://t.me/td_ls_bot"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition shadow-lg shadow-blue-500/25"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.155.232.171.326.016.094.036.308.02.475z"/>
            </svg>
            Botni ochish
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-4">
      <div className="max-w-2xl mx-auto px-3 py-3">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-500/20 p-5 mb-4">
          <div className="absolute inset-0 bg-[url('/logo.png')] bg-center bg-no-repeat opacity-5 bg-contain"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-xl shadow-lg" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Vazifa Boshqaruvi
                </h1>
                {telegramUser && (
                  <p className="text-sm text-blue-200">
                    {telegramUser.first_name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <ListIcon />
                <span>Ro'yxat</span>
              </button>
              <button
                onClick={() => setViewMode('stats')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                  viewMode === 'stats'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <ChartIcon />
                <span>Statistika</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats View */}
        {viewMode === 'stats' && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
              <div className="mb-2 text-blue-300">
                <TasksIcon />
              </div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-blue-200">Jami vazifalar</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-700/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/20">
              <div className="mb-2 text-yellow-300">
                <PendingIcon />
              </div>
              <div className="text-2xl font-bold text-yellow-300">{stats.pending}</div>
              <div className="text-xs text-yellow-200">Bajarilmagan</div>
            </div>
            <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/20">
              <div className="mb-2 text-green-300">
                <DoneIcon />
              </div>
              <div className="text-2xl font-bold text-green-300">{stats.done}</div>
              <div className="text-xs text-green-200">Bajarilgan</div>
            </div>
            <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
              <div className="mb-2 text-purple-300">
                <AttachmentIcon />
              </div>
              <div className="text-2xl font-bold text-purple-300">{stats.withMedia}</div>
              <div className="text-xs text-purple-200">Media fayl</div>
            </div>
          </div>
        )}

        {/* Add Task */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 mb-4 border border-gray-700/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="Yangi vazifa..."
              className="flex-1 px-4 py-3 bg-gray-900/50 text-white border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-500"
              disabled={loading}
            />
            <button
              onClick={addTask}
              disabled={loading || !newTask.trim()}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-500/25 transition flex items-center gap-2"
            >
              <PlusIcon />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 mb-4 border border-gray-700/50">
          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qidirish..."
              className="w-full pl-10 pr-4 py-3 bg-gray-900/50 text-white border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Barchasi
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === 'pending'
                  ? 'bg-yellow-600 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Kutilmoqda
            </button>
            <button
              onClick={() => setFilterStatus('done')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === 'done'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Bajarilgan
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50">
              <div className="mb-4 text-gray-600 flex justify-center">
                <EmptyIcon />
              </div>
              <p className="text-gray-400">
                {searchQuery || filterStatus !== 'pending'
                  ? 'Hech narsa topilmadi'
                  : 'Vazifa qo\'shing!'}
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl backdrop-blur-sm border transition-all ${
                  task.status === 'done'
                    ? 'bg-green-600/10 border-green-500/30'
                    : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getSourceBadge(task.source)}
                      <span className="text-xs text-gray-500">#{task.id}</span>
                    </div>
                    <p className={`mb-2 break-words ${
                      task.status === 'done' ? 'line-through text-gray-500' : 'text-white'
                    }`}>
                      {task.task_text}
                    </p>
                    {task.due_date && (
                      <div className="flex items-center gap-3 text-sm text-gray-400 mb-2">
                        <div className="flex items-center gap-1">
                          <CalendarIcon />
                          <span>{task.due_date}</span>
                        </div>
                        {task.due_time && (
                          <div className="flex items-center gap-1">
                            <ClockIcon />
                            <span>{task.due_time}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {task.attachments.length > 0 && (
                      <div className="space-y-2">
                        {task.attachments.map(renderAttachment)}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {task.status === 'pending' && (
                      <button
                        onClick={() => markDone(task.id)}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-500/25"
                        title="Bajarildi"
                      >
                        <CheckIcon />
                      </button>
                    )}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-lg shadow-red-500/25"
                      title="O'chirish"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Rasm, video, ovoz va hujjat yuborishingiz mumkin
          </p>
        </div>
      </div>
    </div>
  )
}
