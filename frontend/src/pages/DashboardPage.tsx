import { Card } from '../shared/components';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-400">
          Welcome to your task management dashboard
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="text-sm font-medium text-slate-400">Total Tasks</div>
          <div className="mt-2 text-3xl font-bold">24</div>
          <div className="mt-2 text-xs text-emerald-400">+12% from last week</div>
        </Card>

        <Card>
          <div className="text-sm font-medium text-slate-400">In Progress</div>
          <div className="mt-2 text-3xl font-bold">8</div>
          <div className="mt-2 text-xs text-blue-400">4 high priority</div>
        </Card>

        <Card>
          <div className="text-sm font-medium text-slate-400">Completed</div>
          <div className="mt-2 text-3xl font-bold">12</div>
          <div className="mt-2 text-xs text-emerald-400">50% completion rate</div>
        </Card>

        <Card>
          <div className="text-sm font-medium text-slate-400">Groups</div>
          <div className="mt-2 text-3xl font-bold">3</div>
          <div className="mt-2 text-xs text-slate-400">15 total members</div>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <p className="text-sm text-slate-400">No recent activity to show</p>
      </Card>
    </div>
  );
}
