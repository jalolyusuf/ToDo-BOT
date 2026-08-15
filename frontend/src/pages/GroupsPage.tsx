import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getGroups, createGroup, type GroupWithMemberCountResponse } from '../shared/api/client';
import { useAuthStore } from '../shared/store/auth';
import { Loading, ErrorMessage, Button, Input, Textarea } from '../shared/components';

export function GroupsPage() {
  const authHeader = useAuthStore((state) => state.authHeader);
  const user = useAuthStore((state) => state.user);

  const [groups, setGroups] = useState<GroupWithMemberCountResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadGroups = () => {
    if (!authHeader) return;

    setIsLoading(true);
    setError(null);

    getGroups(authHeader)
      .then((response) => {
        setGroups(response.groups);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load groups');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadGroups();
  }, [authHeader]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authHeader) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      await createGroup(authHeader, {
        name: newGroupName,
        description: newGroupDescription || undefined,
      });
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDescription('');
      loadGroups();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) return <Loading message="Loading groups..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Groups</h1>
        {user?.can_create_groups && (
          <Button onClick={() => setShowCreateModal(true)}>+ New Group</Button>
        )}
      </div>

      {!user?.can_create_groups && (
        <div className="mb-6 rounded-lg border border-amber-700 bg-amber-950/20 p-4 text-amber-200">
          <p className="text-sm">
            You don't have permission to create groups. Contact admin to request access.
          </p>
        </div>
      )}

      {/* Groups List */}
      {groups.length === 0 ? (
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-8 text-center">
          <p className="text-slate-400">No groups found</p>
          {user?.can_create_groups && (
            <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
              Create your first group
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="block rounded-lg border border-slate-700 bg-slate-900 p-4 transition-colors hover:border-slate-600"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{group.name}</h3>
                    {group.user_role === 'owner' && (
                      <span className="rounded bg-emerald-700 px-2 py-0.5 text-xs text-emerald-100">
                        Owner
                      </span>
                    )}
                  </div>
                  {group.description && (
                    <p className="mt-1 text-sm text-slate-400 line-clamp-2">{group.description}</p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-bold">Create New Group</h2>

            {createError && <ErrorMessage message={createError} className="mb-4" />}

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <Input
                label="Group Name *"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
                required
                maxLength={128}
              />

              <Textarea
                label="Description"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Enter group description"
                rows={3}
                maxLength={1000}
              />

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isCreating || !newGroupName.trim()}
                  className="flex-1"
                >
                  {isCreating ? 'Creating...' : 'Create Group'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewGroupName('');
                    setNewGroupDescription('');
                    setCreateError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
