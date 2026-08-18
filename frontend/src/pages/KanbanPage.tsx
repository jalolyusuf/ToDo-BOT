import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { getTasks, getGroups, updateTaskStatus, type TaskWithDetailsResponse, type TaskStatus } from '../shared/api/client';
import { useAuthStore } from '../shared/store/auth';
import { Loading, ErrorMessage, Button, Badge } from '../shared/components';
import { PlusIcon, ViewColumnsIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { KanbanColumn } from '../components/KanbanColumn';
import { KanbanCard } from '../components/KanbanCard';

const COLUMNS: Array<{ id: TaskStatus; title: string; color: string }> = [
  { id: 'created', title: 'Created', color: 'bg-slate-700' },
  { id: 'assigned', title: 'Assigned', color: 'bg-blue-700' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-amber-700' },
  { id: 'review', title: 'Review', color: 'bg-purple-700' },
  { id: 'completed', title: 'Completed', color: 'bg-emerald-700' },
];

export function KanbanPage() {
  const authHeader = useAuthStore((state) => state.authHeader);
  const [tasks, setTasks] = useState<TaskWithDetailsResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<TaskWithDetailsResponse | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadTasks = () => {
    if (!authHeader) return;

    setIsLoading(true);
    setError(null);

    getTasks(authHeader)
      .then((response) => {
        // Filter out cancelled tasks from kanban view
        setTasks(response.tasks.filter(t => t.status !== 'cancelled'));
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadTasks();
  }, [authHeader]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !authHeader) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTaskStatus(authHeader, taskId, newStatus);
      toast.success(`Task moved to ${COLUMNS.find(c => c.id === newStatus)?.title}`);
    } catch (err) {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: task.status } : t))
      );
      toast.error('Failed to update task status');
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  if (isLoading) return <Loading message="Loading kanban board..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ViewColumnsIcon className="h-7 w-7" />
            Kanban Board
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {tasks.length} active tasks • Drag to change status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/tasks">
            <Button variant="secondary" className="flex items-center gap-2">
              <Squares2X2Icon className="h-4 w-4" />
              List View
            </Button>
          </Link>
          <Link to="/tasks/new">
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              New Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            return (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                count={columnTasks.length}
              >
                <SortableContext items={columnTasks.map((t) => t.id)}>
                  <div className="space-y-3">
                    {columnTasks.map((task) => (
                      <KanbanCard key={task.id} task={task} />
                    ))}
                  </div>
                </SortableContext>
              </KanbanColumn>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3 opacity-90">
              <KanbanCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/50 p-12">
          <div className="text-center">
            <ViewColumnsIcon className="mx-auto h-12 w-12 text-slate-600" />
            <h3 className="mt-4 text-lg font-semibold text-slate-300">No tasks yet</h3>
            <p className="mt-2 text-sm text-slate-400">
              Create your first task to see it on the board
            </p>
            <Link to="/tasks/new">
              <Button className="mt-6 flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Create Task
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
