import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  createTask,
  updateTask,
  getTask,
  getGroups,
  type CreateTaskRequest,
  type UpdateTaskRequest,
  type TaskPriority,
  type GroupWithMemberCountResponse,
} from '../shared/api/client';
import { useAuthStore } from '../shared/store/auth';
import { Loading, ErrorMessage, Card } from '../shared/components';
import { ArrowLeftIcon, CalendarIcon, FlagIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'text-slate-400' },
  { value: 'normal', label: 'Normal', color: 'text-blue-400' },
  { value: 'high', label: 'High', color: 'text-amber-400' },
  { value: 'urgent', label: 'Urgent', color: 'text-rose-400' },
];

export function TaskFormPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const authHeader = useAuthStore((state) => state.authHeader);
  const isEditing = !!taskId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [deadline, setDeadline] = useState('');
  const [groupId, setGroupId] = useState('');
  const [groups, setGroups] = useState<GroupWithMemberCountResponse[]>([]);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ title: false, description: false });

  // Validation
  const titleError = touched.title && !title.trim() ? 'Title is required' : '';
  const isValid = title.trim().length > 0 && title.length <= 256 && description.length <= 5000;

  useEffect(() => {
    if (!authHeader) return;

    // Load groups
    getGroups(authHeader)
      .then((response) => setGroups(response.groups))
      .catch(() => {}); // Ignore errors

    // Load existing task if editing
    if (isEditing && taskId) {
      setIsLoading(true);
      getTask(authHeader, taskId)
        .then((task) => {
          setTitle(task.title);
          setDescription(task.description || '');
          setPriority(task.priority);
          setDeadline(task.deadline ? task.deadline.split('T')[0] : '');
          setGroupId(task.group_id || '');
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to load task');
          setIsLoading(false);
        });
    }
  }, [authHeader, isEditing, taskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authHeader || !isValid) {
      setTouched({ title: true, description: true });
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const data: CreateTaskRequest | UpdateTaskRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        deadline: deadline || undefined,
        group_id: groupId || undefined,
      };

      if (isEditing && taskId) {
        await updateTask(authHeader, taskId, data);
        toast.success('Task updated successfully!');
        navigate(`/tasks/${taskId}`);
      } else {
        const newTask = await createTask(authHeader, data as CreateTaskRequest);
        toast.success('Task created successfully!');
        navigate(`/tasks/${newTask.id}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save task';
      setError(message);
      toast.error(message);
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loading message="Loading task..." />;

  const groupOptions = [
    { value: '', label: 'Personal Task (No Group)' },
    ...groups.map((g) => ({ value: g.id, label: g.name })),
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to={isEditing ? `/tasks/${taskId}` : '/tasks'}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </Link>
      </div>

      {/* Form Card */}
      <Card padding="lg">
        <h1 className="mb-6 text-2xl font-bold">{isEditing ? 'Edit Task' : 'Create New Task'}</h1>

        {error && <ErrorMessage message={error} className="mb-6" />}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTouched({ ...touched, title: true })}
              placeholder="Enter task title"
              maxLength={256}
              className={clsx(
                'w-full rounded-lg border bg-slate-900 px-4 py-3 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors',
                titleError
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
              )}
            />
            <div className="mt-1 flex justify-between text-xs">
              {titleError ? (
                <span className="text-rose-400">{titleError}</span>
              ) : (
                <span className="text-slate-500">Required field</span>
              )}
              <span className={title.length > 240 ? 'text-amber-400' : 'text-slate-500'}>
                {title.length}/256
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => setTouched({ ...touched, description: true })}
              placeholder="Enter task description"
              rows={4}
              maxLength={5000}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-slate-50 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
            />
            <div className="mt-1 text-xs text-right">
              <span className={description.length > 4800 ? 'text-amber-400' : 'text-slate-500'}>
                {description.length}/5000
              </span>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              <div className="flex items-center gap-2">
                <FlagIcon className="h-4 w-4" />
                Priority
              </div>
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPriority(option.value as TaskPriority)}
                  className={clsx(
                    'rounded-lg border px-4 py-3 text-sm font-medium transition-colors',
                    priority === option.value
                      ? 'border-emerald-500 bg-emerald-600 text-white'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
                  )}
                >
                  <span className={priority !== option.value ? option.color : ''}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Deadline
              </div>
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-slate-50 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
            />
          </div>

          {/* Group */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Group</label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-slate-50 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
            >
              {groupOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={isSaving || !isValid}
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={() => navigate(isEditing ? `/tasks/${taskId}` : '/tasks')}
              className="rounded-lg border border-slate-700 px-6 py-3 font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>

      {/* Help Text */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400">
        <p>
          💡 <span className="font-medium text-slate-300">Tip:</span> Use clear, actionable titles
          for better task management. You can always edit the task later.
        </p>
      </div>
    </div>
  );
}
