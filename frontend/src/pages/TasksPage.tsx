import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTasks, type TaskWithDetailsResponse, type TaskStatus, type TaskPriority } from '../shared/api/client';
import { useAuthStore } from '../shared/store/auth';
import { Loading, ErrorMessage, Button, Select } from '../shared/components';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'created', label: 'Created' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const priorityOptions = [
  { value: '', label: 'All Priority' },
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const statusColors: Record<TaskStatus, string> = {
  created: 'bg-slate-700 text-slate-200',
  assigned: 'bg-blue-700 text-blue-100',
  in_progress: 'bg-amber-700 text-amber-100',
  on_hold: 'bg-gray-700 text-gray-200',
  review: 'bg-purple-700 text-purple-100',
  completed: 'bg-emerald-700 text-emerald-100',
  cancelled: 'bg-rose-700 text-rose-100',
};

const priorityColors: Record<TaskPriority, string> = {
  low: 'text-slate-400',
  normal: 'text-blue-400',
  high: 'text-amber-400',
  urgent: 'text-rose-400',
};

export function TasksPage() {
  const authHeader = useAuthStore((state) => state.authHeader);
  const [tasks, setTasks] = useState<TaskWithDetailsResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  useEffect(() => {
    if (!authHeader) return;

    setIsLoading(true);
    setError(null);

    const filters: { status?: TaskStatus; priority?: TaskPriority } = {};
    if (statusFilter) filters.status = statusFilter as TaskStatus;
    if (priorityFilter) filters.priority = priorityFilter as TaskPriority;

    getTasks(authHeader, filters)
      .then((response) => {
        setTasks(response.tasks);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
        setIsLoading(false);
      });
  }, [authHeader, statusFilter, priorityFilter]);

  if (isLoading) return <Loading message="Loading tasks..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Link to="/tasks/new">
          <Button>+ New Task</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Select
          label="Status"
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
        <Select
          label="Priority"
          options={priorityOptions}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        />
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-8 text-center">
          <p className="text-slate-400">No tasks found</p>
          <Link to="/tasks/new">
            <Button className="mt-4">Create your first task</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Link
              key={task.id}
              to={`/tasks/${task.id}`}
              className="block rounded-lg border border-slate-700 bg-slate-900 p-4 transition-colors hover:border-slate-600"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{task.title}</h3>
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusColors[task.status]}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  {task.description && (
                    <p className="mt-1 text-sm text-slate-400 line-clamp-2">{task.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className={priorityColors[task.priority]}>
                      {task.priority.toUpperCase()}
                    </span>
                    <span>By: {task.creator_first_name}</span>
                    {task.assignee_first_name && (
                      <span>→ {task.assignee_first_name}</span>
                    )}
                    {task.deadline && (
                      <span>📅 {new Date(task.deadline).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
