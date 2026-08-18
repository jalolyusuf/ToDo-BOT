import { Card } from '../shared/components';
import {
  BellIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface SettingItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
  comingSoon?: boolean;
}

function SettingItem({ icon: Icon, title, description, action, comingSoon }: SettingItemProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-800 last:border-0">
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-slate-800 p-2">
          <Icon className="h-5 w-5 text-slate-400" />
        </div>
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-slate-400">{description}</div>
        </div>
      </div>
      <div>
        {comingSoon ? (
          <span className="text-xs text-slate-500">Coming Soon</span>
        ) : (
          action
        )}
      </div>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-2 text-sm text-slate-400">
          Manage your account preferences and settings
        </p>
      </div>

      {/* Notifications */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Notifications</h3>
        <div>
          <SettingItem
            icon={BellIcon}
            title="Task Notifications"
            description="Receive notifications for task updates"
            comingSoon
          />
          <SettingItem
            icon={BellIcon}
            title="Group Notifications"
            description="Get notified about group activities"
            comingSoon
          />
          <SettingItem
            icon={BellIcon}
            title="Deadline Reminders"
            description="Remind me before task deadlines"
            comingSoon
          />
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Appearance</h3>
        <div>
          <SettingItem
            icon={PaintBrushIcon}
            title="Theme"
            description="Currently: Dark Mode"
            action={
              <div className="text-sm text-slate-400">
                Dark
              </div>
            }
          />
          <SettingItem
            icon={GlobeAltIcon}
            title="Language"
            description="Choose your preferred language"
            comingSoon
          />
        </div>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Privacy & Security</h3>
        <div>
          <SettingItem
            icon={ShieldCheckIcon}
            title="Data Privacy"
            description="Manage your data and privacy settings"
            comingSoon
          />
          <SettingItem
            icon={ShieldCheckIcon}
            title="Connected Accounts"
            description="Manage connected Telegram account"
            action={
              <div className="text-sm text-emerald-400">
                Connected
              </div>
            }
          />
        </div>
      </Card>

      {/* About */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">About</h3>
        <div>
          <SettingItem
            icon={InformationCircleIcon}
            title="Version"
            description="Task Manager v1.0.0"
            action={
              <div className="text-sm text-slate-400">
                Latest
              </div>
            }
          />
          <SettingItem
            icon={InformationCircleIcon}
            title="Help & Support"
            description="Get help and report issues"
            comingSoon
          />
        </div>
      </Card>

      {/* Info Banner */}
      <div className="rounded-lg border border-blue-800/50 bg-blue-900/20 p-4">
        <div className="flex gap-3">
          <InformationCircleIcon className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-300">Settings in Development</p>
            <p className="mt-1 text-blue-400/80">
              Many settings features are currently under development and will be available in future updates.
              Your preferences are already being saved for when these features go live.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
