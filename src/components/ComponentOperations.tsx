import { Copy, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface ComponentOperationsProps {
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function ComponentOperations({
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: ComponentOperationsProps) {
  return (
    <div className="absolute -top-8 right-0 flex items-center gap-1 bg-white rounded-lg shadow-lg border border-slate-200 p-1 z-20">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onMoveUp();
        }}
        disabled={!canMoveUp}
        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Move up"
      >
        <ArrowUp size={14} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onMoveDown();
        }}
        disabled={!canMoveDown}
        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Move down"
      >
        <ArrowDown size={14} />
      </button>
      <div className="w-px h-4 bg-slate-200" />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
        title="Duplicate component"
      >
        <Copy size={14} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        title="Delete component"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
