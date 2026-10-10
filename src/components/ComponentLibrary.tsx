import { useState } from 'react';
import { X, Search, Grid3x3, List } from 'lucide-react';

interface ComponentLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (componentType: string) => void;
}

interface ComponentCategory {
  name: string;
  components: {
    type: string;
    label: string;
    icon: string;
    description: string;
  }[];
}

const componentCategories: ComponentCategory[] = [
  {
    name: 'Content',
    components: [
      { type: 'heading', label: 'Heading', icon: '📝', description: 'Title or heading text' },
      { type: 'paragraph', label: 'Paragraph', icon: '📄', description: 'Body text content' },
      { type: 'text', label: 'Text Block', icon: '📋', description: 'Multi-line text' },
      { type: 'image', label: 'Image', icon: '🖼️', description: 'Image with caption' },
      { type: 'video', label: 'Video', icon: '🎥', description: 'Video embed' },
    ],
  },
  {
    name: 'Interactive',
    components: [
      { type: 'button', label: 'Button', icon: '🔘', description: 'Call-to-action button' },
      { type: 'button-group', label: 'Button Group', icon: '🎯', description: 'Multiple buttons' },
      { type: 'form-field', label: 'Form Field', icon: '📝', description: 'Input field' },
    ],
  },
  {
    name: 'Layout',
    components: [
      { type: 'card', label: 'Card', icon: '🃏', description: 'Content card' },
      { type: 'divider', label: 'Divider', icon: '📏', description: 'Horizontal line' },
      { type: 'spacer', label: 'Spacer', icon: '⬜', description: 'Vertical spacing' },
    ],
  },
  {
    name: 'Data Display',
    components: [
      { type: 'stat', label: 'Statistics', icon: '📊', description: 'Number displays' },
      { type: 'list', label: 'List', icon: '📋', description: 'Bulleted or numbered list' },
      { type: 'badge', label: 'Badge', icon: '🏷️', description: 'Small label/tag' },
    ],
  },
  {
    name: 'Media',
    components: [
      { type: 'gallery', label: 'Gallery', icon: '🖼️', description: 'Image gallery' },
      { type: 'logo-cloud', label: 'Logo Cloud', icon: '🏢', description: 'Company logos' },
    ],
  },
];

export function ComponentLibrary({ isOpen, onClose, onSelect }: ComponentLibraryProps) {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (!isOpen) return null;

  const filteredCategories = componentCategories.map(category => ({
    ...category,
    components: category.components.filter(
      comp =>
        comp.label.toLowerCase().includes(search.toLowerCase()) ||
        comp.description.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(category => category.components.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Component Library</h2>
            <p className="text-sm text-slate-500 mt-1">Choose a component to add to your page</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search and View Toggle */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search components..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              <Grid3x3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Component Grid */}
        <div className="flex-1 overflow-auto p-6">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No components found matching "{search}"</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredCategories.map(category => (
                <div key={category.name}>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                    {category.name}
                  </h3>
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'
                        : 'space-y-2'
                    }
                  >
                    {category.components.map(component => (
                      <button
                        key={component.type}
                        onClick={() => {
                          onSelect(component.type);
                          onClose();
                        }}
                        className={
                          viewMode === 'grid'
                            ? 'p-4 border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all text-left group'
                            : 'flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all w-full text-left'
                        }
                      >
                        <span className={viewMode === 'grid' ? 'text-3xl mb-2 block' : 'text-2xl'}>
                          {component.icon}
                        </span>
                        <div className={viewMode === 'grid' ? '' : 'flex-1'}>
                          <div className="font-medium text-slate-900 group-hover:text-indigo-600">
                            {component.label}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {component.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
