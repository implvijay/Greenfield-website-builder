import { useState } from 'react';
import { GripVertical, Copy, Trash2, ChevronUp, ChevronDown, Settings } from 'lucide-react';

interface SectionControlsProps {
  sectionId: string;
  sectionType: string;
  index: number;
  totalSections: number;
  isSelected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSettings: () => void;
}

export function SectionControls({
  sectionId,
  sectionType,
  index,
  totalSections,
  isSelected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onSettings,
}: SectionControlsProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      className={`absolute -top-3 left-2 z-20 transition-all ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}
    >
      <div className="flex items-center gap-1 bg-white rounded-lg shadow-lg border border-slate-200 px-2 py-1">
        {/* Drag Handle */}
        <button
          className="p-1 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          <GripVertical size={14} className={isDragging ? 'text-indigo-600' : ''} />
        </button>

        {/* Section Label */}
        <span className="text-xs font-medium text-slate-600 px-2 capitalize border-r border-slate-200">
          {sectionType}
        </span>

        {/* Move Up */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          disabled={index === 0}
          className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move up"
        >
          <ChevronUp size={14} />
        </button>

        {/* Move Down */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          disabled={index === totalSections - 1}
          className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move down"
        >
          <ChevronDown size={14} />
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-slate-200" />

        {/* Settings */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSettings();
          }}
          className="p-1 text-slate-400 hover:text-indigo-600"
          title="Section settings"
        >
          <Settings size={14} />
        </button>

        {/* Duplicate */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1 text-slate-400 hover:text-indigo-600"
          title="Duplicate section"
        >
          <Copy size={14} />
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-slate-400 hover:text-red-500"
          title="Delete section"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// Drop zone indicator
export function DropZone({ isOver }: { isOver: boolean }) {
  if (!isOver) return null;

  return (
    <div className="h-2 bg-indigo-500 rounded-full mx-4 my-1 animate-pulse shadow-lg shadow-indigo-500/50" />
  );
}

// Section wrapper with drag feedback
export function DraggableSection({
  children,
  isDragging,
  isOver,
  isSelected,
  onClick,
}: {
  children: React.ReactNode;
  isDragging: boolean;
  isOver: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`group relative transition-all ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
    >
      {isOver && <DropZone isOver={true} />}
      {children}
    </div>
  );
}
