import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { createTask, updateTask, getTask, getGroups, type CreateTaskRequest, type UpdateTaskRequest, type TaskPriority, type GroupWithMemberCountResponse } from '../shared/api/client';
import { useAuthStore } from '../shared/store/auth';
import { Loading, ErrorMessage, Button, Input, Textarea, Select } from '../shared/components';

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
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
    if (!authHeader) return;

    setIsSaving(true);
    setError(null);

    try {
      const data: CreateTaskRequest | UpdateTaskRequest = {
        title,
        description: description || undefined,
        priority,
        deadline: deadline || undefined,
        group_id: groupId || undefined,
      };

      if (isEditing && taskId) {
        await updateTask(authHeader, taskId, data);
        navigate(`/tasks/${taskId}`);
      } else {
        const newTask = await createTask(authHeader, data as CreateTaskRequest);
        navigate(`/tasks/${newTask.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loading message="Loading task..." />;

  const groupOptions = [
    { value: '', label: 'Personal Task (No Group)' },
    ...groups.map((g) => ({ value: g.id, label: g.name })),
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link to={isEditing ? `/tasks/${taskId}` : '/'} className="text-sm text-slate-400 hover:text-slate-200">
          ← Back
        </Link>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
        <h1 className="mb-6 text-2xl font-bold">{isEditing ? 'Edit Task' : 'New Task'}</h1>

        {error && <ErrorMessage message={error} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            required
            maxLength={256}
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            rows={4}
            maxLength={5000}
          />

          <Select
            label="Priority"
            options={priorityOptions}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          />

          <Input
            label="Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          <Select
            label="Group"
            options={groupOptions}
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSaving || !title.trim()}
              className="flex-1"
            >
              {isSaving ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(isEditing ? `/tasks/${taskId}` : '/')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
