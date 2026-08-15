import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTask, updateTaskStatus, deleteTask, type TaskWithDetailsResponse, type TaskStatus } from '../shared/api/client';
import { useAuthStore } from '../shared/store/auth';
import { Loading, ErrorMessage, Button, Select } from '../shared/components';

const statusOptions = [
  { value: 'created', label: 'Created' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const authHeader = useAuthStore((state) => state.authHeader);
  const currentUser = useAuthStore((state) => state.user);

  const [task, setTask] = useState<TaskWithDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authHeader || !taskId) return;

    setIsLoading(true);
    setError(null);

    getTask(authHeader, taskId)
      .then((data) => {
        setTask(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load task');
        setIsLoading(false);
      });
  }, [authHeader, taskId]);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!authHeader || !taskId || !task) return;

    setIsUpdatingStatus(true);
    try {
      await updateTaskStatus(authHeader, taskId, newStatus);
      setTask({ ...task, status: newStatus });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!authHeader || !taskId || !confirm('Are you sure you want to delete this task?')) return;

    setIsDeleting(true);
    try {
      await deleteTask(authHeader, taskId);
      navigate('/');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete task');
      setIsDeleting(false);
    }
  };

  if (isLoading) return <Loading message="Loading task..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!task) return <ErrorMessage message="Task not found" />;

  const isCreator = currentUser?.id === task.creator_id;
  const canDelete = isCreator; // Only creator can delete

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="text-sm text-slate-400 hover:text-slate-200">
          ← Back to tasks
        </Link>
        {canDelete && (
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        )}
      </div>

      <div className="space-y-6 rounded-lg border border-slate-700 bg-slate-900 p-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold">{task.title}</h1>
        </div>

        {/* Description */}
        {task.description && (
          <div>
            <p className="text-sm font-medium text-slate-400">Description</p>
            <p className="mt-2 whitespace-pre-wrap text-slate-200">{task.description}</p>
          </div>
        )}

        {/* Status */}
        <div>
          <Select
            label="Status"
            options={statusOptions}
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
            disabled={isUpdatingStatus}
          />
        </div>

        {/* Details Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-slate-400">Priority</p>
            <p className="mt-1 text-lg font-medium capitalize">{task.priority}</p>
          </div>

          {task.deadline && (
            <div>
              <p className="text-sm font-medium text-slate-400">Deadline</p>
              <p className="mt-1 text-lg font-medium">
                {new Date(task.deadline).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-slate-400">Creator</p>
            <p className="mt-1">
              {task.creator_first_name}
              {task.creator_last_name && ` ${task.creator_last_name}`}
              {task.creator_username && (
                <span className="ml-1 text-sm text-slate-500">@{task.creator_username}</span>
              )}
            </p>
          </div>

          {task.assignee_first_name && (
            <div>
              <p className="text-sm font-medium text-slate-400">Assigned to</p>
              <p className="mt-1">
                {task.assignee_first_name}
                {task.assignee_last_name && ` ${task.assignee_last_name}`}
                {task.assignee_username && (
                  <span className="ml-1 text-sm text-slate-500">@{task.assignee_username}</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Timestamps */}
        <div className="border-t border-slate-700 pt-4 text-xs text-slate-500">
          <p>Created: {new Date(task.created_at).toLocaleString()}</p>
          <p>Updated: {new Date(task.updated_at).toLocaleString()}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link to={`/tasks/${taskId}/edit`} className="flex-1">
            <Button className="w-full" variant="secondary">
              Edit Task
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
