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
    // Check if opened in Telegram
    const tg = window.Telegram?.WebApp
    if (tg && tg.initData) {
      setIsTelegram(true)
      setTelegramUser(tg.initDataUnsafe.user)
      tg.ready()
      tg.expand()
      fetchTasks()
    } else {
      // Block browser access
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
      if (response.ok) {
        await fetchTasks()
      }
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
      if (response.ok) {
        await fetchTasks()
      }
    } catch (error) {
      console.error('Failed to mark task done:', error)
    }
  }

  const renderAttachment = (attachment: Attachment) => {
    const baseUrl = window.location.origin

    if (attachment.file_type === 'photo') {
      return (
        <img
          key={attachment.id}
          src={`${baseUrl}${attachment.file_url}`}
          alt={attachment.file_name}
          className="w-full max-w-sm rounded-lg mt-2 cursor-pointer hover:opacity-90"
          onClick={() => window.open(`${baseUrl}${attachment.file_url}`, '_blank')}
        />
      )
    }

    if (attachment.file_type === 'voice' || attachment.file_type === 'audio') {
      return (
        <audio key={attachment.id} controls className="w-full max-w-sm mt-2">
          <source src={`${baseUrl}${attachment.file_url}`} type={attachment.mime_type || 'audio/ogg'} />
          Audio
        </audio>
      )
    }

    if (attachment.file_type === 'video') {
      return (
        <video key={attachment.id} controls className="w-full max-w-md rounded-lg mt-2">
          <source src={`${baseUrl}${attachment.file_url}`} type={attachment.mime_type || 'video/mp4'} />
          Video
        </video>
      )
    }

    if (attachment.file_type === 'document') {
      return (
        <a
          key={attachment.id}
          href={`${baseUrl}${attachment.file_url}`}
          download={attachment.file_name}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 mt-2"
        >
          <span>📎</span>
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

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'text': return '💬'
      case 'voice': return '🎤'
      case 'web': return '🌐'
      default: return '📝'
    }
  }

  const stats = {
    total: allTasks.length,
    pending: allTasks.filter(t => t.status === 'pending').length,
    done: allTasks.filter(t => t.status === 'done').length,
    withMedia: allTasks.filter(t => t.attachments.length > 0).length,
  }

  // Block non-Telegram access
  if (!isTelegram) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">🔒</div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Kirish taqiqlangan
          </h1>
          <p className="text-gray-400 mb-6">
            Bu sahifaga faqat Telegram bot orqali kirish mumkin
          </p>
          <a
            href="https://t.me/td_ls_bot"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            🤖 Botni ochish
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-4">
      <div className="max-w-2xl mx-auto px-3 py-3">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-4 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                🎯 Vazifalar
              </h1>
              {telegramUser && (
                <p className="text-sm text-gray-400">
                  Salom, {telegramUser.first_name}!
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                📋
              </button>
              <button
                onClick={() => setViewMode('stats')}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  viewMode === 'stats'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                📊
              </button>
            </div>
          </div>
        </div>

        {/* Stats View */}
        {viewMode === 'stats' && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="text-2xl mb-1">📝</div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-gray-400">Jami</div>
            </div>
            <div className="bg-yellow-900 bg-opacity-30 rounded-xl p-4">
              <div className="text-2xl mb-1">⏳</div>
              <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
              <div className="text-xs text-yellow-400">Bajarilmagan</div>
            </div>
            <div className="bg-green-900 bg-opacity-30 rounded-xl p-4">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-2xl font-bold text-green-400">{stats.done}</div>
              <div className="text-xs text-green-400">Bajarilgan</div>
            </div>
            <div className="bg-purple-900 bg-opacity-30 rounded-xl p-4">
              <div className="text-2xl mb-1">📎</div>
              <div className="text-2xl font-bold text-purple-400">{stats.withMedia}</div>
              <div className="text-xs text-purple-400">Media</div>
            </div>
          </div>
        )}

        {/* Add Task */}
        <div className="bg-gray-800 rounded-xl p-4 mb-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="Yangi vazifa..."
              className="flex-1 px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={addTask}
              disabled={loading || !newTask.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? '...' : '➕'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-3 mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Qidirish..."
            className="w-full px-3 py-2 mb-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Hammasi
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              ⏳
            </button>
            <button
              onClick={() => setFilterStatus('done')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'done'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              ✅
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-8 bg-gray-800 rounded-xl">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-400">
                {searchQuery || filterStatus !== 'pending'
                  ? 'Hech narsa yo\'q'
                  : 'Vazifa qo\'shing!'}
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl ${
                  task.status === 'done'
                    ? 'bg-green-900 bg-opacity-20 border border-green-800'
                    : 'bg-gray-800 border border-gray-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{task.status === 'done' ? '✅' : '⏳'}</span>
                      <span>{getSourceIcon(task.source)}</span>
                      <span className="text-xs text-gray-500">#{task.id}</span>
                    </div>
                    <p className={`mb-2 ${
                      task.status === 'done' ? 'line-through text-gray-500' : ''
                    }`}>
                      {task.task_text}
                    </p>
                    {task.due_date && (
                      <p className="text-sm text-gray-400 mb-2">
                        📅 {task.due_date}
                        {task.due_time && ` ⏰ ${task.due_time}`}
                      </p>
                    )}

                    {/* Attachments */}
                    {task.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {task.attachments.map(renderAttachment)}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {task.status === 'pending' && (
                      <button
                        onClick={() => markDone(task.id)}
                        className="px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="px-3 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Rasm, video, ovoz va hujjatlarni botga yuboring!
          </p>
        </div>
      </div>
    </div>
  )
}
