import { useDroppable } from '@dnd-kit/core';
import clsx from 'clsx';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  count: number;
  children: React.ReactNode;
}

export function KanbanColumn({ id, title, color, count, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'flex min-w-[300px] flex-col rounded-lg border transition-colors',
        isOver ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800 bg-slate-900/50'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between border-b border-slate-800 p-4">
        <div className="flex items-center gap-2">
          <div className={clsx('h-2 w-2 rounded-full', color)} />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-medium">
          {count}
        </span>
      </div>

      {/* Column Content */}
      <div className="flex-1 space-y-3 p-4 min-h-[200px]">
        {children}
      </div>
    </div>
  );
}
