import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getTasks, getGroups, type TaskWithDetailsResponse, type TaskStatus, type TaskPriority } from '../shared/api/client';
import { useAuthStore } from '../shared/store/auth';
import { Loading, ErrorMessage, Button, Select, Badge, Card, EmptyState } from '../shared/components';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

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
  const [allTasks, setAllTasks] = useState<TaskWithDetailsResponse[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [groupFilter, setGroupFilter] = useState<string>('');
  const [hasDeadlineFilter, setHasDeadlineFilter] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    if (!authHeader) return;

    setIsLoading(true);
    setError(null);

    Promise.all([
      getTasks(authHeader),
      getGroups(authHeader),
    ])
      .then(([tasksRes, groupsRes]) => {
        setAllTasks(tasksRes.tasks);
        setGroups(groupsRes.groups);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
        setIsLoading(false);
      });
  }, [authHeader]);

  // Filter tasks client-side
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDescription = task.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription) return false;
      }

      // Status filter
      if (statusFilter && task.status !== statusFilter) return false;

      // Priority filter
      if (priorityFilter && task.priority !== priorityFilter) return false;

      // Group filter
      if (groupFilter) {
        if (groupFilter === 'personal') {
          if (task.group_id !== null) return false;
        } else {
          if (task.group_id !== groupFilter) return false;
        }
      }

      // Deadline filter
      if (hasDeadlineFilter) {
        if (hasDeadlineFilter === 'yes' && !task.deadline) return false;
        if (hasDeadlineFilter === 'no' && task.deadline) return false;
      }

      return true;
    });
  }, [allTasks, searchQuery, statusFilter, priorityFilter, groupFilter, hasDeadlineFilter]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (statusFilter) count++;
    if (priorityFilter) count++;
    if (groupFilter) count++;
    if (hasDeadlineFilter) count++;
    return count;
  }, [searchQuery, statusFilter, priorityFilter, groupFilter, hasDeadlineFilter]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPriorityFilter('');
    setGroupFilter('');
    setHasDeadlineFilter('');
  };

  if (isLoading) return <Loading message="Loading tasks..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="mt-1 text-sm text-slate-400">
            {filteredTasks.length} of {allTasks.length} tasks
          </p>
        </div>
        <Link to="/tasks/new">
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            New Task
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <Card>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-10 pr-4 text-slate-50 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </Card>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={clsx(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            showAdvancedFilters
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          )}
        >
          <FunnelIcon className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="default" size="sm">
              {activeFilterCount}
            </Badge>
          )}
          {showAdvancedFilters ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-slate-200"
          >
            <XMarkIcon className="h-4 w-4" />
            Clear all
          </button>
        )}

        {/* Active Filter Chips */}
        {searchQuery && (
          <Badge variant="info">
            Search: {searchQuery}
            <button onClick={() => setSearchQuery('')} className="ml-2">
              <XMarkIcon className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {statusFilter && (
          <Badge variant="info">
            Status: {statusOptions.find(o => o.value === statusFilter)?.label}
            <button onClick={() => setStatusFilter('')} className="ml-2">
              <XMarkIcon className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {priorityFilter && (
          <Badge variant="warning">
            Priority: {priorityOptions.find(o => o.value === priorityFilter)?.label}
            <button onClick={() => setPriorityFilter('')} className="ml-2">
              <XMarkIcon className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <Card>
          <h3 className="mb-4 text-sm font-semibold">Advanced Filters</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <Select
              label="Group"
              options={[
                { value: '', label: 'All Groups' },
                { value: 'personal', label: 'Personal Tasks' },
                ...groups.map(g => ({ value: g.id, label: g.name })),
              ]}
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            />
            <Select
              label="Has Deadline"
              options={[
                { value: '', label: 'All' },
                { value: 'yes', label: 'With Deadline' },
                { value: 'no', label: 'No Deadline' },
              ]}
              value={hasDeadlineFilter}
              onChange={(e) => setHasDeadlineFilter(e.target.value)}
            />
          </div>
        </Card>
      )}

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon="📝"
          title={allTasks.length === 0 ? "No tasks yet" : "No tasks match your filters"}
          description={
            allTasks.length === 0
              ? "Create your first task to get started"
              : "Try adjusting your filters or search query"
          }
          action={
            allTasks.length === 0 ? (
              <Link to="/tasks/new">
                <Button className="flex items-center gap-2">
                  <PlusIcon className="h-4 w-4" />
                  Create Task
                </Button>
              </Link>
            ) : (
              <Button onClick={clearAllFilters}>Clear Filters</Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Link
              key={task.id}
              to={`/tasks/${task.id}`}
              className="block rounded-lg border border-slate-800 bg-slate-900 p-4 transition-colors hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium truncate">{task.title}</h3>
                    <Badge
                      variant={
                        task.status === 'completed' ? 'success' :
                        task.status === 'in_progress' ? 'warning' :
                        task.status === 'cancelled' ? 'danger' :
                        'default'
                      }
                    >
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="mt-1 text-sm text-slate-400 line-clamp-2">{task.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className={clsx('font-medium', priorityColors[task.priority])}>
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
