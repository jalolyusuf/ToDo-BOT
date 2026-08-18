import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { type TaskWithDetailsResponse } from '../shared/api/client';
import { Badge } from '../shared/components';
import { ClockIcon, FlagIcon, UserIcon, CalendarIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface KanbanCardProps {
  task: TaskWithDetailsResponse;
}

const priorityColors: Record<string, string> = {
  low: 'text-slate-400',
  normal: 'text-blue-400',
  high: 'text-amber-400',
  urgent: 'text-rose-400',
};

const priorityBgColors: Record<string, string> = {
  low: 'bg-slate-500/10',
  normal: 'bg-blue-500/10',
  high: 'bg-amber-500/10',
  urgent: 'bg-rose-500/10',
};

export function KanbanCard({ task }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.deadline && new Date(task.deadline) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(
        'cursor-grab rounded-lg border bg-slate-900 p-4 transition-all active:cursor-grabbing',
        isDragging
          ? 'opacity-50 shadow-2xl ring-2 ring-emerald-500'
          : 'border-slate-800 hover:border-slate-700 hover:shadow-lg'
      )}
    >
      <Link to={`/tasks/${task.id}`} onClick={(e) => e.stopPropagation()}>
        {/* Priority Badge */}
        <div className="mb-3 flex items-center justify-between">
          <div className={clsx('flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium', priorityBgColors[task.priority], priorityColors[task.priority])}>
            <FlagIcon className="h-3 w-3" />
            {task.priority.toUpperCase()}
          </div>
          {task.group_name && (
            <Badge variant="default" className="text-xs">
              {task.group_name}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h4 className="mb-2 font-semibold line-clamp-2 hover:text-emerald-400 transition-colors">
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="mb-3 text-sm text-slate-400 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="space-y-2 border-t border-slate-800 pt-3">
          {/* Assignee */}
          {task.assignee_first_name && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <UserIcon className="h-3.5 w-3.5" />
              <span>{task.assignee_first_name}</span>
            </div>
          )}

          {/* Deadline */}
          {task.deadline && (
            <div className={clsx(
              'flex items-center gap-2 text-xs',
              isOverdue ? 'text-rose-400 font-medium' : 'text-slate-500'
            )}>
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>
                {new Date(task.deadline).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
                {isOverdue && ' (Overdue)'}
              </span>
            </div>
          )}

          {/* Created Time */}
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ClockIcon className="h-3.5 w-3.5" />
            <span>
              {new Date(task.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
