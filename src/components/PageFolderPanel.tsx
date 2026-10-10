import React, { useState } from 'react';
import { PageFolder, Page } from '../types';
import { 
  createPageFolder, 
  getRootFolders, 
  getChildFolders, 
  getPagesInFolder, 
  deleteFolder,
  getFolderStats
} from '../services/pageFolders';
import { Folder, Plus, Trash2, Edit2, ChevronRight, ChevronDown } from 'lucide-react';

interface PageFolderPanelProps {
  folders: PageFolder[];
  pages: Page[];
  onUpdateFolders: (folders: PageFolder[]) => void;
  onUpdatePages: (pages: Page[]) => void;
  onMovePageToFolder: (pageId: string, folderId: string | undefined) => void;
}

export const PageFolderPanel: React.FC<PageFolderPanelProps> = ({
  folders,
  pages,
  onUpdateFolders,
  onUpdatePages,
  onMovePageToFolder,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingFolder, setEditingFolder] = useState<PageFolder | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#6366f1');
  const [newFolderIcon, setNewFolderIcon] = useState('📁');
  const [parentFolderId, setParentFolderId] = useState<string | undefined>();

  const rootFolders = getRootFolders(folders);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder = createPageFolder(
      newFolderName,
      newFolderDescription,
      newFolderColor,
      newFolderIcon,
      parentFolderId,
      folders.length
    );

    onUpdateFolders([...folders, newFolder]);
    setShowCreateDialog(false);
    setNewFolderName('');
    setNewFolderDescription('');
    setNewFolderColor('#6366f1');
    setNewFolderIcon('📁');
    setParentFolderId(undefined);
  };

  const handleDeleteFolder = (folderId: string) => {
    if (!confirm('Delete this folder? Pages will be moved to root.')) return;

    const { folders: updatedFolders, pages: updatedPages } = deleteFolder(
      folders,
      pages,
      folderId,
      true
    );

    onUpdateFolders(updatedFolders);
    onUpdatePages(updatedPages);
  };

  const FolderItem: React.FC<{ folder: PageFolder; level: number }> = ({ folder, level }) => {
    const isExpanded = expandedFolders.has(folder.id);
    const childFolders = getChildFolders(folders, folder.id);
    const folderPages = getPagesInFolder(pages, folder.id);
    const stats = getFolderStats(folders, pages, folder.id);

    return (
      <div>
        <div 
          className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer group"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {childFolders.length > 0 && (
            <button
              onClick={() => toggleFolder(folder.id)}
              className="p-1 hover:bg-slate-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          {childFolders.length === 0 && <div className="w-6" />}
          
          <div 
            className="w-6 h-6 rounded flex items-center justify-center text-sm"
            style={{ backgroundColor: folder.color + '20', color: folder.color }}
          >
            {folder.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate">
              {folder.name}
            </div>
            {folder.description && (
              <div className="text-xs text-slate-500 truncate">
                {folder.description}
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500">
            {stats.totalPageCount} pages
          </div>

          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
            <button
              onClick={() => {
                setEditingFolder(folder);
                setNewFolderName(folder.name);
                setNewFolderDescription(folder.description || '');
                setNewFolderColor(folder.color || '#6366f1');
                setNewFolderIcon(folder.icon || '📁');
                setShowCreateDialog(true);
              }}
              className="p-1 hover:bg-slate-200 rounded"
              title="Edit folder"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleDeleteFolder(folder.id)}
              className="p-1 hover:bg-red-100 text-red-600 rounded"
              title="Delete folder"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {isExpanded && childFolders.length > 0 && (
          <div>
            {childFolders.map(child => (
              <FolderItem key={child.id} folder={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Page Folders</h3>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          New Folder
        </button>
      </div>

      <div className="p-2">
        {rootFolders.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No folders yet. Create a folder to organize your pages.
          </div>
        ) : (
          <div className="space-y-1">
            {rootFolders.map(folder => (
              <FolderItem key={folder.id} folder={folder} level={0} />
            ))}
          </div>
        )}
      </div>

      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingFolder ? 'Edit Folder' : 'Create Folder'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Folder Name *
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Blog Posts"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                  placeholder="Optional description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={newFolderColor}
                    onChange={(e) => setNewFolderColor(e.target.value)}
                    className="w-full h-10 border border-slate-300 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Icon
                  </label>
                  <select
                    value={newFolderIcon}
                    onChange={(e) => setNewFolderIcon(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="📁">📁 Folder</option>
                    <option value="📝">📝 Posts</option>
                    <option value="📄">📄 Documents</option>
                    <option value="🎨">🎨 Design</option>
                    <option value="💼">💼 Business</option>
                    <option value="🛍️">🛍️ Shop</option>
                    <option value="📊">📊 Analytics</option>
                    <option value="⚙️">⚙️ Settings</option>
                  </select>
                </div>
              </div>

              {!editingFolder && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Parent Folder
                  </label>
                  <select
                    value={parentFolderId || ''}
                    onChange={(e) => setParentFolderId(e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">None (Root Level)</option>
                    {folders.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingFolder(null);
                  setNewFolderName('');
                  setNewFolderDescription('');
                  setNewFolderColor('#6366f1');
                  setNewFolderIcon('📁');
                  setParentFolderId(undefined);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingFolder ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
