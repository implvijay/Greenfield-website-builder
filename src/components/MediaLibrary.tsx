import { useState, useRef } from 'react';
import { Project, MediaAsset } from '../types';
import { v4 as uuid } from 'uuid';
import { Upload, Search, Trash2, Edit3, X, Image, File, Grid, List, Check } from 'lucide-react';

interface MediaLibraryProps {
  project: Project;
  updateProject: (p: Project) => void;
  notify: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export function MediaLibrary({ project, updateProject, notify }: MediaLibraryProps) {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaAsset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = project.media.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.alt.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = (files: FileList | null) => {
    if (!files) return;
    const newAssets: MediaAsset[] = [];

    Array.from(files).forEach(file => {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        notify('error', `Invalid file type: ${file.name}`);
        return;
      }

      // Validate file size (max 5MB for demo)
      if (file.size > 5 * 1024 * 1024) {
        notify('error', `File too large: ${file.name} (max 5MB)`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const asset: MediaAsset = {
          id: uuid(),
          name: file.name,
          url: e.target?.result as string,
          alt: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          width: 800,
          height: 600,
          size: file.size,
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
        };
        newAssets.push(asset);

        if (newAssets.length === files.length) {
          updateProject({ ...project, media: [...project.media, ...newAssets] });
          notify('success', `${newAssets.length} file(s) uploaded`);
          setShowUpload(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const addUrlMedia = (url: string) => {
    if (!url.trim()) return;
    const asset: MediaAsset = {
      id: uuid(),
      name: url.split('/').pop() || 'image',
      url: url.trim(),
      alt: 'Image',
      uploadedAt: new Date().toISOString(),
    };
    updateProject({ ...project, media: [...project.media, asset] });
    notify('success', 'Image URL added');
  };

  const deleteMedia = (id: string) => {
    if (confirm('Delete this media asset?')) {
      updateProject({ ...project, media: project.media.filter(m => m.id !== id) });
      notify('success', 'Media deleted');
      if (selectedMedia === id) setSelectedMedia(null);
    }
  };

  const updateMedia = (updated: MediaAsset) => {
    updateProject({ ...project, media: project.media.map(m => m.id === updated.id ? updated : m) });
    setEditingMedia(null);
    notify('success', 'Media updated');
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Media Library</h1>
          <p className="text-slate-500 text-sm mt-1">{project.media.length} assets</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowUpload(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
            <Upload size={16} /> Upload
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search media..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}>
            <Grid size={16} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Media Grid/List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Image size={40} className="mx-auto mb-3 text-slate-300" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {search ? 'No matching media' : 'No media yet'}
          </h3>
          <p className="text-slate-500 mb-4">Upload images to use in your website.</p>
          <button onClick={() => setShowUpload(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">
            <Upload size={16} /> Upload Media
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map(media => (
            <div
              key={media.id}
              className={`bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all group ${
                selectedMedia === media.id ? 'border-indigo-500 shadow-lg' : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => setSelectedMedia(media.id)}
            >
              <div className="aspect-square bg-slate-100 overflow-hidden">
                {media.url ? (
                  <img src={media.url} alt={media.alt} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <File size={24} className="text-slate-300" />
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-slate-700 truncate">{media.name}</p>
                <p className="text-[10px] text-slate-400">{formatSize(media.size)}</p>
              </div>
              <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                <button onClick={(e) => { e.stopPropagation(); setEditingMedia(media); }} className="p-1 bg-white/80 rounded shadow-sm">
                  <Edit3 size={12} className="text-slate-600" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteMedia(media.id); }} className="p-1 bg-white/80 rounded shadow-sm">
                  <Trash2 size={12} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Preview</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Alt Text</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Size</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Date</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(media => (
                <tr key={media.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden">
                      {media.url ? (
                        <img src={media.url} alt={media.alt} className="w-full h-full object-cover" />
                      ) : (
                        <File size={16} className="m-2 text-slate-300" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-900">{media.name}</td>
                  <td className="px-4 py-2 text-sm text-slate-500">{media.alt}</td>
                  <td className="px-4 py-2 text-sm text-slate-500">{formatSize(media.size)}</td>
                  <td className="px-4 py-2 text-sm text-slate-500">{new Date(media.uploadedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => setEditingMedia(media)} className="p-1 text-slate-400 hover:text-indigo-600"><Edit3 size={14} /></button>
                    <button onClick={() => deleteMedia(media.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUpload={handleUpload}
          onAddUrl={addUrlMedia}
          fileInputRef={fileInputRef}
        />
      )}

      {/* Edit Modal */}
      {editingMedia && (
        <EditMediaModal
          media={editingMedia}
          onClose={() => setEditingMedia(null)}
          onSave={updateMedia}
        />
      )}

      {/* Selected Media Detail */}
      {selectedMedia && (
        <SelectedMediaPanel
          media={project.media.find(m => m.id === selectedMedia)!}
          onClose={() => setSelectedMedia(null)}
          onEdit={() => {
            const m = project.media.find(m => m.id === selectedMedia);
            if (m) setEditingMedia(m);
          }}
          onDelete={() => deleteMedia(selectedMedia)}
        />
      )}
    </div>
  );
}

function UploadModal({ onClose, onUpload, onAddUrl, fileInputRef }: {
  onClose: () => void;
  onUpload: (files: FileList | null) => void;
  onAddUrl: (url: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}) {
  const [url, setUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Upload Media</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="p-5">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300'
            }`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault();
              setDragOver(false);
              onUpload(e.dataTransfer.files);
            }}
          >
            <Upload size={32} className="mx-auto mb-3 text-slate-400" />
            <p className="text-slate-600 mb-2">Drag & drop files here</p>
            <p className="text-sm text-slate-400 mb-3">or</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
            >
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => onUpload(e.target.files)}
            />
            <p className="text-xs text-slate-400 mt-3">JPEG, PNG, GIF, WebP, SVG • Max 5MB</p>
          </div>

          {/* URL Input */}
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700 mb-2">Or add from URL</p>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => { onAddUrl(url); setUrl(''); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditMediaModal({ media, onClose, onSave }: {
  media: MediaAsset;
  onClose: () => void;
  onSave: (m: MediaAsset) => void;
}) {
  const [alt, setAlt] = useState(media.alt);
  const [name, setName] = useState(media.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Edit Media</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="p-5">
          {media.url && (
            <div className="mb-4 rounded-lg overflow-hidden bg-slate-100">
              <img src={media.url} alt={alt} className="max-h-48 w-full object-contain" />
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">File Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alt Text</label>
              <input type="text" value={alt} onChange={e => setAlt(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <p className="text-xs text-slate-400 mt-1">Important for accessibility and SEO</p>
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <p>Type: {media.mimeType || 'unknown'}</p>
              <p>URL: <span className="truncate block max-w-full">{media.url}</span></p>
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 text-sm font-medium">Cancel</button>
          <button onClick={() => onSave({ ...media, alt, name })} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function SelectedMediaPanel({ media, onClose, onEdit, onDelete }: {
  media: MediaAsset;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(media.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-white rounded-xl border border-slate-200 shadow-xl w-80 max-h-96 overflow-auto">
      <div className="p-3 border-b border-slate-100 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-900">Media Details</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
      </div>
      <div className="p-3">
        {media.url && (
          <div className="rounded-lg overflow-hidden bg-slate-100 mb-3">
            <img src={media.url} alt={media.alt} className="w-full h-32 object-cover" />
          </div>
        )}
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-slate-500 text-xs">Name:</span>
            <p className="text-slate-900 truncate">{media.name}</p>
          </div>
          <div>
            <span className="text-slate-500 text-xs">Alt:</span>
            <p className="text-slate-900">{media.alt}</p>
          </div>
          <div>
            <span className="text-slate-500 text-xs">URL:</span>
            <div className="flex items-center gap-1">
              <p className="text-slate-700 truncate flex-1 text-xs">{media.url}</p>
              <button onClick={copyUrl} className="p-1 text-slate-400 hover:text-indigo-600">
                {copied ? <Check size={12} className="text-green-500" /> : <span className="text-xs">Copy</span>}
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={onEdit} className="flex-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg hover:bg-indigo-100">Edit</button>
          <button onClick={onDelete} className="flex-1 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100">Delete</button>
        </div>
      </div>
    </div>
  );
}
