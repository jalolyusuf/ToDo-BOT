import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getGroup, getGroupMembers, deleteGroup, type GroupResponse, type GroupMemberResponse } from '../shared/api/client';
import { useAuthStore } from '../shared/store/auth';
import { Loading, ErrorMessage, Button } from '../shared/components';

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const authHeader = useAuthStore((state) => state.authHeader);
  const currentUser = useAuthStore((state) => state.user);

  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [members, setMembers] = useState<GroupMemberResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authHeader || !groupId) return;

    setIsLoading(true);
    setError(null);

    Promise.all([
      getGroup(authHeader, groupId),
      getGroupMembers(authHeader, groupId),
    ])
      .then(([groupData, membersData]) => {
        setGroup(groupData);
        setMembers(membersData.members);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load group');
        setIsLoading(false);
      });
  }, [authHeader, groupId]);

  const handleDelete = async () => {
    if (!authHeader || !groupId || !confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteGroup(authHeader, groupId);
      navigate('/groups');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete group');
      setIsDeleting(false);
    }
  };

  if (isLoading) return <Loading message="Loading group..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!group) return <ErrorMessage message="Group not found" />;

  const isOwner = currentUser?.id === group.owner_id;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/groups" className="text-sm text-slate-400 hover:text-slate-200">
          ← Back to groups
        </Link>
        {isOwner && (
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Group'}
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Group Info */}
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{group.name}</h1>
              {group.description && (
                <p className="mt-2 text-slate-400">{group.description}</p>
              )}
            </div>
            {isOwner && (
              <span className="rounded bg-emerald-700 px-3 py-1 text-sm text-emerald-100">
                Owner
              </span>
            )}
          </div>

          <div className="border-t border-slate-700 pt-4 text-xs text-slate-500">
            <p>Created: {new Date(group.created_at).toLocaleString()}</p>
          </div>
        </div>

        {/* Members */}
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Members ({members.length})</h2>
            {isOwner && (
              <Button size="sm" variant="secondary" disabled>
                + Add Member
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-3"
              >
                <div className="flex-1">
                  <p className="font-medium">
                    {member.user_first_name}
                    {member.user_last_name && ` ${member.user_last_name}`}
                  </p>
                  {member.user_username && (
                    <p className="text-sm text-slate-500">@{member.user_username}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {member.role === 'owner' ? (
                    <span className="rounded bg-emerald-700 px-2 py-1 text-xs text-emerald-100">
                      Owner
                    </span>
                  ) : (
                    <span className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-300">
                      Member
                    </span>
                  )}
                  {member.status === 'inactive' && (
                    <span className="text-xs text-rose-400">(Inactive)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Group Tasks */}
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
          <h2 className="mb-4 text-lg font-semibold">Group Tasks</h2>
          <Link to={`/?group_id=${groupId}`}>
            <Button className="w-full" variant="secondary">
              View Group Tasks
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
