import { useEffect, useState } from 'react';
import { getTasks, getGroups } from '../shared/api/client';
import { useAuthStore } from '../shared/store/auth';
import { Card, Loading, Badge } from '../shared/components';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  ChartBarIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

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

export function AnalyticsPage() {
  const authHeader = useAuthStore((state) => state.authHeader);
  const [tasks, setTasks] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    if (!authHeader) return;

    setIsLoading(true);
    Promise.all([getTasks(authHeader), getGroups(authHeader)])
      .then(([tasksRes, groupsRes]) => {
        setTasks(tasksRes.tasks);
        setGroups(groupsRes.groups);
      })
      .finally(() => setIsLoading(false));
  }, [authHeader]);

  if (isLoading) {
    return <Loading message="Loading analytics..." />;
  }

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Tasks by status
  const statusData = Object.entries(
    tasks.reduce((acc: Record<string, number>, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({
    name: name.replace('_', ' ').toUpperCase(),
    value,
    color: STATUS_COLORS[name],
  }));

  // Tasks by priority
  const priorityData = Object.entries(
    tasks.reduce((acc: Record<string, number>, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({
    name: name.toUpperCase(),
    value,
    color: PRIORITY_COLORS[name],
  }));

  // Tasks created over time (last 30 days)
  const days = parseInt(dateRange);
  const dateLabels: string[] = [];
  const tasksByDate: Record<string, number> = {};

  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'MMM dd');
    dateLabels.push(date);
    tasksByDate[date] = 0;
  }

  tasks.forEach((task) => {
    const date = format(new Date(task.created_at), 'MMM dd');
    if (tasksByDate[date] !== undefined) {
      tasksByDate[date]++;
    }
  });

  const timelineData = dateLabels.map((date) => ({
    date,
    tasks: tasksByDate[date],
  }));

  // Top performing groups
  const groupStats = groups.map((group) => {
    const groupTasks = tasks.filter((t) => t.group_id === group.id);
    const completed = groupTasks.filter((t) => t.status === 'completed').length;
    return {
      name: group.name,
      total: groupTasks.length,
      completed,
      rate: groupTasks.length > 0 ? Math.round((completed / groupTasks.length) * 100) : 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Reports</h1>
          <p className="mt-1 text-sm text-slate-400">
            Insights into your task management performance
          </p>
        </div>

        {/* Date Range Filter */}
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-50"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-400">Total Tasks</div>
              <div className="mt-2 text-3xl font-bold">{totalTasks}</div>
            </div>
            <div className="rounded-full bg-blue-500/10 p-3">
              <ChartBarIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-400">Completed</div>
              <div className="mt-2 text-3xl font-bold">{completedTasks}</div>
            </div>
            <div className="rounded-full bg-emerald-500/10 p-3">
              <CheckCircleIcon className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-400">In Progress</div>
              <div className="mt-2 text-3xl font-bold">{inProgressTasks}</div>
            </div>
            <div className="rounded-full bg-amber-500/10 p-3">
              <ClockIcon className="h-8 w-8 text-amber-400" />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-400">Completion Rate</div>
              <div className="mt-2 text-3xl font-bold">{completionRate}%</div>
            </div>
            <div className="rounded-full bg-purple-500/10 p-3">
              <TrophyIcon className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Task Creation Timeline */}
        <Card>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <CalendarIcon className="h-5 w-5" />
            Task Creation Timeline
          </h3>
          {timelineData.some((d) => d.tasks > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-slate-400">
              No data for selected period
            </div>
          )}
        </Card>

        {/* Tasks by Status */}
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Tasks by Status</h3>
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-slate-400">
              No tasks to display
            </div>
          )}
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tasks by Priority */}
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Tasks by Priority</h3>
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
                    borderRadius: '0.5rem',
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6">
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-slate-400">
              No tasks to display
            </div>
          )}
        </Card>

        {/* Group Performance */}
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Group Performance</h3>
          {groupStats.length > 0 ? (
            <div className="space-y-3">
              {groupStats
                .sort((a, b) => b.rate - a.rate)
                .slice(0, 5)
                .map((group) => (
                  <div
                    key={group.name}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{group.name}</div>
                      <div className="text-xs text-slate-400">
                        {group.completed}/{group.total} tasks completed
                      </div>
                    </div>
                    <Badge
                      variant={
                        group.rate >= 75
                          ? 'success'
                          : group.rate >= 50
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {group.rate}%
                    </Badge>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-slate-400">
              No groups with tasks
            </div>
          )}
        </Card>
      </div>

      {/* Export Section */}
      <Card className="border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Export Reports</h3>
            <p className="mt-1 text-sm text-slate-400">
              Download analytics data for external analysis
            </p>
          </div>
          <button
            disabled
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-500 cursor-not-allowed"
            title="Coming soon"
          >
            Export to CSV
          </button>
        </div>
      </Card>
    </div>
  );
}
