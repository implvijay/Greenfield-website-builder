import React, { useState } from 'react';
import { Page } from '../types';
import { 
  getAllTags, 
  addTagToPage, 
  removeTagFromPage, 
  getTagStats,
  isValidTagName,
  normalizeTag
} from '../services/pageTags';
import { Tag, Plus, X } from 'lucide-react';

interface PageTagManagerProps {
  pages: Page[];
  onUpdatePages: (pages: Page[]) => void;
}

export const PageTagManager: React.FC<PageTagManagerProps> = ({
  pages,
  onUpdatePages,
}) => {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [showAllTags, setShowAllTags] = useState(false);

  const allTags = getAllTags(pages);
  const tagStats = getTagStats(pages);
  const selectedPage = pages.find(p => p.id === selectedPageId);

  const handleAddTag = () => {
    if (!selectedPageId || !newTag.trim()) return;
    
    const normalizedTag = normalizeTag(newTag);
    if (!isValidTagName(normalizedTag)) {
      alert('Invalid tag name. Use only letters, numbers, spaces, hyphens, and underscores.');
      return;
    }

    const updatedPages = addTagToPage(pages, selectedPageId, normalizedTag);
    onUpdatePages(updatedPages);
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    if (!selectedPageId) return;

    const updatedPages = removeTagFromPage(pages, selectedPageId, tag);
    onUpdatePages(updatedPages);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Page Tags</h3>
        </div>
        <button
          onClick={() => setShowAllTags(!showAllTags)}
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          {showAllTags ? 'Hide All Tags' : 'Show All Tags'}
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Page Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Page
          </label>
          <select
            value={selectedPageId || ''}
            onChange={(e) => setSelectedPageId(e.target.value || null)}
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Choose a page...</option>
            {pages.map(page => (
              <option key={page.id} value={page.id}>
                {page.title}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Page Tags */}
        {selectedPage && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tags for "{selectedPage.title}"
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(selectedPage.tags || []).length === 0 ? (
                <span className="text-sm text-slate-500">No tags yet</span>
              ) : (
                (selectedPage.tags || []).map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-sm rounded"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-indigo-100 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add New Tag */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        )}

        {/* All Tags Overview */}
        {showAllTags && (
          <div className="pt-4 border-t border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              All Tags ({allTags.length})
            </label>
            {allTags.length === 0 ? (
              <p className="text-sm text-slate-500">No tags created yet</p>
            ) : (
              <div className="space-y-2">
                {allTags.map(tag => (
                  <div
                    key={tag}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded"
                  >
                    <span className="text-sm font-medium text-slate-900">
                      {tag}
                    </span>
                    <span className="text-xs text-slate-500">
                      {tagStats.get(tag) || 0} pages
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
