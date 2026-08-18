import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../features/auth/AuthProvider';
import { AppLayout } from '../layouts/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { TasksPage } from '../pages/TasksPage';
import { TaskDetailPage } from '../pages/TaskDetailPage';
import { TaskFormPage } from '../pages/TaskFormPage';
import { GroupsPage } from '../pages/GroupsPage';
import { GroupDetailPage } from '../pages/GroupDetailPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SettingsPage } from '../pages/SettingsPage';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout>
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<DashboardPage />} />

            {/* Tasks */}
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/tasks/new" element={<TaskFormPage />} />
            <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
            <Route path="/tasks/:taskId/edit" element={<TaskFormPage />} />

            {/* Groups */}
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/groups/:groupId" element={<GroupDetailPage />} />

            {/* Profile & Settings */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Placeholder routes */}
            <Route path="/analytics" element={<div className="text-center py-12 text-slate-400">Analytics page coming soon...</div>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}
