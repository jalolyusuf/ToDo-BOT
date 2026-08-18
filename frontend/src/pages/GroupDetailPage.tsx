import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getGroup,
  getGroupMembers,
  deleteGroup,
  removeGroupMember,
  getTasks,
  type GroupResponse,
  type GroupMemberResponse,
} from '../shared/api/client';
import { useAuthStore } from '../shared/store/auth';
import { Loading, ErrorMessage, Card, Badge, ConfirmDialog, EmptyState } from '../shared/components';
import {
  ArrowLeftIcon,
  TrashIcon,
  UserGroupIcon,
  UsersIcon,
  ChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const authHeader = useAuthStore((state) => state.authHeader);
  const currentUser = useAuthStore((state) => state.user);

  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [members, setMembers] = useState<GroupMemberResponse[]>([]);
  const [groupTasks, setGroupTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete group states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Remove member states
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  useEffect(() => {
    loadGroupData();
  }, [authHeader, groupId]);

  const loadGroupData = () => {
    if (!authHeader || !groupId) return;

    setIsLoading(true);
    setError(null);

    Promise.all([
      getGroup(authHeader, groupId),
      getGroupMembers(authHeader, groupId),
      getTasks(authHeader, { group_id: groupId }),
    ])
      .then(([groupData, membersData, tasksData]) => {
        setGroup(groupData);
        setMembers(membersData.members);
        setGroupTasks(tasksData.tasks);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load group');
        setIsLoading(false);
      });
  };

  const handleDelete = async () => {
    if (!authHeader || !groupId) return;

    setIsDeleting(true);
    try {
      await deleteGroup(authHeader, groupId);
      toast.success('Group deleted successfully');
      navigate('/groups');
    } catch (err) {
      toast.error('Failed to delete group');
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!authHeader || !groupId || !memberToRemove) return;

    setIsRemovingMember(true);
    try {
      await removeGroupMember(authHeader, groupId, memberToRemove);
      toast.success('Member removed successfully');
      setMemberToRemove(null);
      loadGroupData();
    } catch (err) {
      toast.error('Failed to remove member');
    } finally {
      setIsRemovingMember(false);
    }
  };

  if (isLoading) return <Loading message="Loading group..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!group) return <ErrorMessage message="Group not found" />;

  const isOwner = currentUser?.id === group.owner_id;
  const completedTasks = groupTasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/groups"
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to groups
        </Link>
        {isOwner && (
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
            Delete Group
          </button>
        )}
      </div>

      {/* Group Info Card */}
      <Card padding="lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-500/10 p-3">
                <UserGroupIcon className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{group.name}</h1>
                {isOwner && <Badge variant="success" className="mt-1">Owner</Badge>}
              </div>
            </div>
            {group.description && (
              <p className="mt-4 text-slate-400">{group.description}</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3 border-t border-slate-800 pt-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-500/10 p-2">
              <UsersIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{members.length}</div>
              <div className="text-xs text-slate-400">Members</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-500/10 p-2">
              <ChartBarIcon className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{groupTasks.length}</div>
              <div className="text-xs text-slate-400">Tasks</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-500/10 p-2">
              <ChartBarIcon className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{completedTasks}</div>
              <div className="text-xs text-slate-400">Completed</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Members Card */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Members ({members.length})</h2>
          {isOwner && (
            <button
              disabled
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 cursor-not-allowed"
              title="Coming soon"
            >
              <PlusIcon className="h-4 w-4" />
              Add Member
            </button>
          )}
        </div>

        {members.length === 0 ? (
          <EmptyState title="No members" description="This group has no members yet" />
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 text-white font-semibold text-sm">
                    {member.user_first_name.charAt(0)}{member.user_last_name?.charAt(0) || ''}
                  </div>
                  <div>
                    <p className="font-medium">
                      {member.user_first_name}
                      {member.user_last_name && ` ${member.user_last_name}`}
                    </p>
                    {member.user_username && (
                      <p className="text-sm text-slate-400">@{member.user_username}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {member.role === 'owner' ? (
                    <Badge variant="success">Owner</Badge>
                  ) : (
                    <Badge variant="default">Member</Badge>
                  )}
                  {member.status === 'inactive' && (
                    <Badge variant="danger">Inactive</Badge>
                  )}
                  {isOwner && member.role !== 'owner' && (
                    <button
                      onClick={() => setMemberToRemove(member.user_id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-rose-900/20 hover:text-rose-400 transition-colors"
                      title="Remove member"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Group Tasks Card */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Group Tasks</h2>
        {groupTasks.length === 0 ? (
          <EmptyState
            title="No tasks in this group"
            description="Create tasks and assign them to this group"
            action={
              <Link to="/tasks/new">
                <button className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors">
                  <PlusIcon className="h-4 w-4" />
                  Create Task
                </button>
              </Link>
            }
          />
        ) : (
          <Link to={`/tasks?group_id=${groupId}`}>
            <button className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium hover:bg-slate-700 transition-colors">
              View All {groupTasks.length} Tasks →
            </button>
          </Link>
        )}
      </Card>

      {/* Delete Group Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Group"
        message={`Are you sure you want to delete "${group.name}"? This action cannot be undone and will remove all group data.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Remove Member Dialog */}
      {memberToRemove && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setMemberToRemove(null)}
          onConfirm={handleRemoveMember}
          title="Remove Member"
          message="Are you sure you want to remove this member from the group?"
          confirmText="Remove"
          variant="danger"
          isLoading={isRemovingMember}
        />
      )}
    </div>
  );
}
