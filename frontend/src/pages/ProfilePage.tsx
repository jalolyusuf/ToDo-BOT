import { useEffect, useState } from 'react';
import { Card, Badge, Loading } from '../shared/components';
import { getTasks, getGroups } from '../shared/api/client';
import { useAuthStore } from '../shared/store/auth';
import { UserIcon, CheckCircleIcon, UserGroupIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export function ProfilePage() {
  const authHeader = useAuthStore((state) => state.authHeader);
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState({ tasks: 0, groups: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authHeader) return;

    const fetchStats = async () => {
      try {
        const [tasksRes, groupsRes] = await Promise.all([
          getTasks(authHeader),
          getGroups(authHeader),
        ]);

        const completed = tasksRes.tasks.filter((t) => t.status === 'completed').length;

        setStats({
          tasks: tasksRes.tasks.length,
          groups: groupsRes.groups.length,
          completed,
        });
      } catch (error) {
        console.error('Failed to load profile stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [authHeader]);

  if (!user) {
    return <Loading message="Loading profile..." />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="mt-2 text-sm text-slate-400">
          View and manage your profile information
        </p>
      </div>

      {/* Profile Card */}
      <Card padding="lg">
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 text-3xl font-bold text-white">
              {user.first_name.charAt(0)}{user.last_name?.charAt(0) || ''}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold">
              {user.first_name} {user.last_name || ''}
            </h2>
            {user.username && (
              <p className="mt-1 text-slate-400">@{user.username}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <Badge variant="info">
                <UserIcon className="h-3 w-3 inline mr-1" />
                Telegram User
              </Badge>
              {user.can_create_groups && (
                <Badge variant="success">
                  <UserGroupIcon className="h-3 w-3 inline mr-1" />
                  Can Create Groups
                </Badge>
              )}
              {user.is_active && (
                <Badge variant="success">Active</Badge>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-400">Telegram ID</div>
                <div className="mt-1 font-mono">{user.telegram_user_id}</div>
              </div>
              {user.language_code && (
                <div>
                  <div className="text-slate-400">Language</div>
                  <div className="mt-1 uppercase">{user.language_code}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Activity Statistics</h3>
        {isLoading ? (
          <Loading message="Loading stats..." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-500/10 p-2">
                  <CalendarIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.tasks}</div>
                  <div className="text-xs text-slate-400">Total Tasks</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-500/10 p-2">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <div className="text-xs text-slate-400">Completed</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-purple-500/10 p-2">
                  <UserGroupIcon className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.groups}</div>
                  <div className="text-xs text-slate-400">Groups</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Account Info */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Account Information</h3>
        <dl className="space-y-4">
          <div className="flex justify-between py-2 border-b border-slate-800">
            <dt className="text-slate-400">User ID</dt>
            <dd className="font-mono text-sm">{user.id}</dd>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800">
            <dt className="text-slate-400">Status</dt>
            <dd>
              <Badge variant={user.is_active ? 'success' : 'danger'}>
                {user.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-slate-400">Member since</dt>
            <dd className="text-sm">Telegram User</dd>
          </div>
        </dl>
      </Card>

      {/* Placeholder for future features */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 text-center">
        <p className="text-sm text-slate-400">
          Profile editing and additional settings coming soon...
        </p>
      </div>
    </div>
  );
}
