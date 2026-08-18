import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getGroups, createGroup, type GroupWithMemberCountResponse } from '../shared/api/client';
import { useAuthStore } from '../shared/store/auth';
import { Loading, ErrorMessage, Button, Input, Textarea, Modal, Card, Badge, EmptyState } from '../shared/components';
import { UserGroupIcon, PlusIcon, UsersIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

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
      toast.success('Group created successfully!');
      loadGroups();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create group');
      toast.error('Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) return <Loading message="Loading groups..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Groups</h1>
          <p className="mt-1 text-sm text-slate-400">
            {groups.length} {groups.length === 1 ? 'group' : 'groups'}
          </p>
        </div>
        {user?.can_create_groups && (
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            New Group
          </Button>
        )}
      </div>

      {/* Permission Warning */}
      {!user?.can_create_groups && (
        <Card className="border-amber-700 bg-amber-950/20">
          <div className="flex gap-3">
            <UserGroupIcon className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <div className="text-sm text-amber-200">
              <p className="font-medium">Limited Access</p>
              <p className="mt-1 text-amber-300/80">
                You don't have permission to create groups. Contact admin to request access.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <EmptyState
          icon={<UserGroupIcon className="h-12 w-12" />}
          title="No groups yet"
          description={
            user?.can_create_groups
              ? "Create your first group to start collaborating with others"
              : "You haven't joined any groups yet"
          }
          action={
            user?.can_create_groups ? (
              <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Create Group
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Link key={group.id} to={`/groups/${group.id}`}>
              <Card hover className="h-full cursor-pointer">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{group.name}</h3>
                      {group.description && (
                        <p className="mt-1 text-sm text-slate-400 line-clamp-2">{group.description}</p>
                      )}
                    </div>
                    {group.user_role === 'owner' && (
                      <Badge variant="success">Owner</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <UsersIcon className="h-4 w-4" />
                    <span>
                      {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewGroupName('');
          setNewGroupDescription('');
          setCreateError(null);
        }}
        title="Create New Group"
      >
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

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setNewGroupName('');
                setNewGroupDescription('');
                setCreateError(null);
              }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !newGroupName.trim()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
