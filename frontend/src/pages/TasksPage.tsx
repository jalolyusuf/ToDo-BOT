import { useEffect, useState } from 'react'

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

type ViewMode = 'list' | 'calendar' | 'stats'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'done'>('pending')

  useEffect(() => {
    fetchTasks()
  }, [])

  useEffect(() => {
    filterTasks()
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
          Browser audio qo'llab-quvvatlamaydi
        </audio>
      )
    }

    if (attachment.file_type === 'video') {
      return (
        <video key={attachment.id} controls className="w-full max-w-md rounded-lg mt-2">
          <source src={`${baseUrl}${attachment.file_url}`} type={attachment.mime_type || 'video/mp4'} />
          Browser video qo'llab-quvvatlamaydi
        </video>
      )
    }

    if (attachment.file_type === 'document') {
      return (
        <a
          key={attachment.id}
          href={`${baseUrl}${attachment.file_url}`}
          download={attachment.file_name}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 mt-2"
        >
          <span>📎</span>
          <span className="text-sm">{attachment.file_name}</span>
          {attachment.file_size && (
            <span className="text-xs text-gray-500">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                🎯 Vazifa Eslatuvchi
              </h1>
              <p className="text-gray-600">Web Dashboard - Barcha vazifalaringiz bir joyda</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📋 Ro'yxat
              </button>
              <button
                onClick={() => setViewMode('stats')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  viewMode === 'stats'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📊 Statistika
              </button>
            </div>
          </div>
        </div>

        {/* Stats View */}
        {viewMode === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-3xl mb-2">📝</div>
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-sm text-gray-600">Jami vazifalar</div>
            </div>
            <div className="bg-yellow-50 rounded-xl shadow-md p-6">
              <div className="text-3xl mb-2">⏳</div>
              <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
              <div className="text-sm text-yellow-600">Bajarilmagan</div>
            </div>
            <div className="bg-green-50 rounded-xl shadow-md p-6">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-green-700">{stats.done}</div>
              <div className="text-sm text-green-600">Bajarilgan</div>
            </div>
            <div className="bg-purple-50 rounded-xl shadow-md p-6">
              <div className="text-3xl mb-2">📎</div>
              <div className="text-2xl font-bold text-purple-700">{stats.withMedia}</div>
              <div className="text-sm text-purple-600">Media bilan</div>
            </div>
          </div>
        )}

        {/* Add Task */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Yangi vazifa qo'shish</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="Vazifa nomini kiriting..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              disabled={loading}
            />
            <button
              onClick={addTask}
              disabled={loading || !newTask.trim()}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md transition"
            >
              {loading ? 'Yuklanmoqda...' : '➕ Qo\'shish'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Qidirish..."
              className="flex-1 min-w-[200px] px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Hammasi
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ⏳ Bajarilmagan
              </button>
              <button
                onClick={() => setFilterStatus('done')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === 'done'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ✅ Bajarilgan
              </button>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Vazifalar ({tasks.length})
          </h2>
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-lg">
                {searchQuery || filterStatus !== 'pending'
                  ? 'Hech narsa topilmadi'
                  : 'Vazifalar yo\'q. Yuqorida yangi vazifa qo\'shing!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-5 rounded-xl transition hover:shadow-md ${
                    task.status === 'done'
                      ? 'bg-green-50 border-2 border-green-200'
                      : 'bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{task.status === 'done' ? '✅' : '⏳'}</span>
                        <span className="text-lg">{getSourceIcon(task.source)}</span>
                        <span className="text-sm text-gray-500">#{task.id}</span>
                      </div>
                      <p className={`text-lg font-medium mb-2 ${
                        task.status === 'done' ? 'line-through text-gray-600' : 'text-gray-800'
                      }`}>
                        {task.task_text}
                      </p>
                      {task.due_date && (
                        <p className="text-sm text-gray-600 mb-2">
                          📅 {task.due_date}
                          {task.due_time && ` ⏰ ${task.due_time}`}
                        </p>
                      )}
                      {task.original_text && task.original_text !== task.task_text && (
                        <details className="text-xs text-gray-500 mt-2">
                          <summary className="cursor-pointer hover:text-gray-700">
                            Original matn
                          </summary>
                          <p className="mt-1 italic">{task.original_text}</p>
                        </details>
                      )}

                      {/* Attachments */}
                      {task.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {task.attachments.map(renderAttachment)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {task.status === 'pending' && (
                        <button
                          onClick={() => markDone(task.id)}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 whitespace-nowrap transition"
                        >
                          ✓ Bajarildi
                        </button>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 whitespace-nowrap transition"
                      >
                        🗑️ O'chirish
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-700 mb-2">
              🤖 Telegram botdan ham foydalanishingiz mumkin:
            </p>
            <a
              href="https://t.me/td_ls_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md"
            >
              @td_ls_bot ga o'tish
            </a>
            <p className="text-xs text-gray-500 mt-4">
              Rasm, video, ovozli xabar va hujjatlarni botga yuboring!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
