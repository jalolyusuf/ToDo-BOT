import { useEffect, useState } from 'react'

interface Task {
  id: number
  task_text: string
  due_date: string | null
  due_time: string | null
  status: string
  created_at: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/v1/tasks?status=pending')
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    }
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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎯 Vazifa Eslatuvchi
          </h1>
          <p className="text-gray-600">Web Dashboard</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Yangi vazifa qo'shish</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="Vazifa nomini kiriting..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={addTask}
              disabled={loading || !newTask.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Yuklanyapti...' : 'Qo\'shish'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Vazifalar ({tasks.length})
          </h2>
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Vazifalar yo'q. Yuqorida yangi vazifa qo'shing!
            </p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{task.task_text}</p>
                    {task.due_date && (
                      <p className="text-sm text-gray-500 mt-1">
                        📅 {task.due_date}
                        {task.due_time && ` ${task.due_time}`}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => markDone(task.id)}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                  >
                    ✓ Bajarildi
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                  >
                    🗑️ O'chirish
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-gray-600">
          <p>
            Telegram botdan ham foydalanishingiz mumkin:{' '}
            <a
              href="https://t.me/td_ls_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              @td_ls_bot
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
