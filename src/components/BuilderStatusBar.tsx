import { CheckCircle, Save, Clock, FileText, Layers } from 'lucide-react';
import { Page } from '../types';

interface BuilderStatusBarProps {
  page: Page;
  lastSaved?: string;
  isSaving?: boolean;
  sectionCount: number;
}

export function BuilderStatusBar({ page, lastSaved, isSaving, sectionCount }: BuilderStatusBarProps) {
  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-between text-sm">
      {/* Left Side - Page Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-600">
          <FileText size={14} />
          <span className="font-medium">{page.title}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Layers size={14} />
          <span>{sectionCount} sections</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {page.status}
          </span>
        </div>
      </div>

      {/* Right Side - Save Status */}
      <div className="flex items-center gap-4">
        {lastSaved && (
          <div className="flex items-center gap-2 text-slate-500">
            <Clock size={14} />
            <span className="text-xs">Saved {formatTime(lastSaved)}</span>
          </div>
        )}
        <div className={`flex items-center gap-2 ${isSaving ? 'text-amber-600' : 'text-green-600'}`}>
          {isSaving ? (
            <>
              <Save size={14} className="animate-pulse" />
              <span className="text-xs font-medium">Saving...</span>
            </>
          ) : (
            <>
              <CheckCircle size={14} />
              <span className="text-xs font-medium">All changes saved</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
