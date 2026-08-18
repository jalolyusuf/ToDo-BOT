import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, Badge, Loading, EmptyState } from '../shared/components';
import { getTasks, getGroups, type TaskStatus, type TaskPriority } from '../shared/api/client';
import { useAuthStore } from '../shared/store/auth';
import {
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  highPriority: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}

const STATUS_COLORS: Record<string, string> = {
  created: '#64748b',
  assigned: '#3b82f6',
  in_progress: '#f59e0b',
  on_hold: '#6b7280',
  review: '#a855f7',
  completed: '#10b981',
  cancelled: '#ef4444',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: '#64748b',
  normal: '#3b82f6',
  high: '#f59e0b',
  urgent: '#ef4444',
};

export function DashboardPage() {
  const authHeader = useAuthStore((state) => state.authHeader);
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [groupCount, setGroupCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!authHeader) return;

    const fetchData = async () => {
      try {
        const [tasksRes, groupsRes] = await Promise.all([
          getTasks(authHeader),
          getGroups(authHeader),
        ]);

        const tasks = tasksRes.tasks;
        const byStatus: Record<string, number> = {};
        const byPriority: Record<string, number> = {};

        tasks.forEach((task) => {
          byStatus[task.status] = (byStatus[task.status] || 0) + 1;
          byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
        });

        setStats({
          total: tasks.length,
          completed: byStatus['completed'] || 0,
          inProgress: byStatus['in_progress'] || 0,
          highPriority: (byPriority['high'] || 0) + (byPriority['urgent'] || 0),
          byStatus,
          byPriority,
        });

        setGroupCount(groupsRes.groups.length);
        setRecentTasks(tasks.slice(0, 5));
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [authHeader]);

  if (isLoading) {
    return <Loading message="Loading dashboard..." />;
  }

  if (!stats) {
    return <EmptyState title="Failed to load dashboard" description="Please try again later" />;
  }

  const statusData = Object.entries(stats.byStatus).map(([name, value]) => ({
    name: name.replace('_', ' ').toUpperCase(),
    value,
  }));

  const priorityData = Object.entries(stats.byPriority).map(([name, value]) => ({
    name: name.toUpperCase(),
    value,
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.first_name}! 👋</h1>
        <p className="mt-2 text-slate-400">
          Here's what's happening with your tasks today
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-400">Total Tasks</div>
              <div className="mt-2 text-3xl font-bold">{stats.total}</div>
              <Link to="/tasks" className="mt-2 text-xs text-blue-400 hover:text-blue-300">
                View all →
              </Link>
            </div>
            <div className="rounded-full bg-blue-500/10 p-3">
              <ChartBarIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-400">In Progress</div>
              <div className="mt-2 text-3xl font-bold">{stats.inProgress}</div>
              <div className="mt-2 text-xs text-amber-400">{stats.highPriority} high priority</div>
            </div>
            <div className="rounded-full bg-amber-500/10 p-3">
              <ClockIcon className="h-8 w-8 text-amber-400" />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-400">Completed</div>
              <div className="mt-2 text-3xl font-bold">{stats.completed}</div>
              <div className="mt-2 text-xs text-emerald-400">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate
              </div>
            </div>
            <div className="rounded-full bg-emerald-500/10 p-3">
              <CheckCircleIcon className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-400">Groups</div>
              <div className="mt-2 text-3xl font-bold">{groupCount}</div>
              <Link to="/groups" className="mt-2 text-xs text-purple-400 hover:text-purple-300">
                Manage groups →
              </Link>
            </div>
            <div className="rounded-full bg-purple-500/10 p-3">
              <UserGroupIcon className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tasks by Status */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Tasks by Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[Object.keys(stats.byStatus)[index]]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No tasks yet" description="Create your first task to see statistics" />
          )}
        </Card>

        {/* Tasks by Priority */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Tasks by Priority</h3>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem'
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6">
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[Object.keys(stats.byPriority)[index]]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No tasks yet" description="Create your first task to see statistics" />
          )}
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Tasks</h3>
          <Link to="/tasks/new">
            <button className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors">
              <PlusIcon className="h-4 w-4" />
              New Task
            </button>
          </Link>
        </div>

        {recentTasks.length > 0 ? (
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className="block rounded-lg border border-slate-800 p-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{task.title}</h4>
                      <Badge variant={
                        task.status === 'completed' ? 'success' :
                        task.status === 'in_progress' ? 'warning' :
                        'default'
                      }>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="mt-1 text-sm text-slate-400 line-clamp-1">{task.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                      <span className={
                        task.priority === 'urgent' ? 'text-rose-400' :
                        task.priority === 'high' ? 'text-amber-400' :
                        'text-slate-400'
                      }>
                        {task.priority.toUpperCase()}
                      </span>
                      <span>By: {task.creator_first_name}</span>
                      {task.assignee_first_name && (
                        <span>→ {task.assignee_first_name}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📝"
            title="No tasks yet"
            description="Create your first task to get started"
            action={
              <Link to="/tasks/new">
                <button className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors">
                  <PlusIcon className="h-4 w-4" />
                  Create Task
                </button>
              </Link>
            }
          />
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/tasks/new">
          <Card hover className="cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-500/10 p-2">
                <PlusIcon className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <div className="font-medium">Create Task</div>
                <div className="text-xs text-slate-400">Add a new task</div>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/groups">
          <Card hover className="cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-500/10 p-2">
                <UserGroupIcon className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <div className="font-medium">Manage Groups</div>
                <div className="text-xs text-slate-400">View all groups</div>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/analytics">
          <Card hover className="cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500/10 p-2">
                <ChartBarIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="font-medium">View Analytics</div>
                <div className="text-xs text-slate-400">Detailed reports</div>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
