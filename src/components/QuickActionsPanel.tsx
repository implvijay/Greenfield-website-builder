import { useState } from 'react';
import { Sparkles, Copy, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Palette } from 'lucide-react';
import { Section } from '../types';

interface QuickActionsPanelProps {
  section: Section;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisibility: () => void;
  onOpenSettings: () => void;
  onOpenAnimation: () => void;
}

export function QuickActionsPanel({
  section,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  onOpenSettings,
  onOpenAnimation,
}: QuickActionsPanelProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (showConfirmDelete) {
      onDelete();
      setShowConfirmDelete(false);
    } else {
      setShowConfirmDelete(true);
      setTimeout(() => setShowConfirmDelete(false), 3000);
    }
  };

  const actions = [
    {
      icon: Palette,
      label: 'Settings',
      onClick: onOpenSettings,
      color: 'text-blue-600 hover:bg-blue-50',
      description: 'Configure section layout and style',
    },
    {
      icon: Sparkles,
      label: 'Animation',
      onClick: onOpenAnimation,
      color: 'text-purple-600 hover:bg-purple-50',
      description: 'Add entrance animations',
    },
    {
      icon: Copy,
      label: 'Duplicate',
      onClick: onDuplicate,
      color: 'text-green-600 hover:bg-green-50',
      description: 'Create a copy of this section',
    },
    {
      icon: section.settings.visible === false ? Eye : EyeOff,
      label: section.settings.visible === false ? 'Show' : 'Hide',
      onClick: onToggleVisibility,
      color: 'text-orange-600 hover:bg-orange-50',
      description: section.settings.visible === false ? 'Make section visible' : 'Hide section from preview',
    },
    {
      icon: ArrowUp,
      label: 'Move Up',
      onClick: onMoveUp,
      color: 'text-indigo-600 hover:bg-indigo-50',
      description: 'Move section up in page order',
    },
    {
      icon: ArrowDown,
      label: 'Move Down',
      onClick: onMoveDown,
      color: 'text-indigo-600 hover:bg-indigo-50',
      description: 'Move section down in page order',
    },
  ];

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900">Quick Actions</h3>
        <p className="text-xs text-slate-500 mt-1 capitalize">{section.type} Section</p>
      </div>

      {/* Actions Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.onClick}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 transition-all hover:shadow-md ${action.color}`}
                title={action.description}
              >
                <Icon size={24} />
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* Danger Zone */}
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-900 mb-2">Danger Zone</p>
          <button
            onClick={handleDelete}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              showConfirmDelete
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-white hover:bg-red-50 text-red-600 border border-red-300'
            }`}
          >
            <Trash2 size={16} />
            {showConfirmDelete ? 'Confirm Delete' : 'Delete Section'}
          </button>
          {showConfirmDelete && (
            <p className="text-xs text-red-700 mt-2 text-center">
              Click again to confirm deletion
            </p>
          )}
        </div>

        {/* Section Info */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <p className="text-xs font-medium text-slate-700 mb-2">Section Info</p>
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="font-medium capitalize">{section.type}</span>
            </div>
            <div className="flex justify-between">
              <span>Variant:</span>
              <span className="font-medium">{section.variant}</span>
            </div>
            <div className="flex justify-between">
              <span>Rows:</span>
              <span className="font-medium">{section.rows.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Animation:</span>
              <span className="font-medium capitalize">
                {section.animation?.type || 'None'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Visible:</span>
              <span className="font-medium">
                {section.settings.visible === false ? 'Hidden' : 'Visible'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
