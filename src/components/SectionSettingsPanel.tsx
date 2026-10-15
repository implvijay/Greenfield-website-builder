import { useState } from 'react';
import { Section, SectionSettings } from '../types';
import { X, Palette, Layout, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface SectionSettingsPanelProps {
  section: Section;
  onUpdate: (settings: Partial<SectionSettings>) => void;
  onClose: () => void;
}

export function SectionSettingsPanel({ section, onUpdate, onClose }: SectionSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'layout' | 'style' | 'advanced'>('layout');

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Section Settings</h3>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { id: 'layout', label: 'Layout', icon: Layout },
          { id: 'style', label: 'Style', icon: Palette },
          { id: 'advanced', label: 'Advanced', icon: Layout },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {activeTab === 'layout' && (
          <>
            {/* Padding */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Padding</label>
              <select
                value={section.settings.padding || '4rem 0'}
                onChange={e => onUpdate({ padding: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1rem 0">Extra Small (1rem)</option>
                <option value="2rem 0">Small (2rem)</option>
                <option value="3rem 0">Medium Small (3rem)</option>
                <option value="4rem 0">Medium (4rem)</option>
                <option value="5rem 0">Medium Large (5rem)</option>
                <option value="6rem 0">Large (6rem)</option>
                <option value="8rem 0">Extra Large (8rem)</option>
                <option value="10rem 0">Huge (10rem)</option>
                <option value="custom">Custom...</option>
              </select>
              {section.settings.padding === 'custom' && (
                <input
                  type="text"
                  value={section.settings.padding || ''}
                  onChange={e => onUpdate({ padding: e.target.value })}
                  placeholder="e.g., 2rem 1rem"
                  className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>

            {/* Margin */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Margin</label>
              <input
                type="text"
                value={section.settings.margin || '0'}
                onChange={e => onUpdate({ margin: e.target.value })}
                placeholder="e.g., 2rem 0 or 1rem auto"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-slate-500 mt-1">CSS margin value (e.g., 2rem 0, 1rem auto)</p>
            </div>

            {/* Min Height */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Height</label>
              <select
                value={section.settings.minHeight || 'auto'}
                onChange={e => onUpdate({ minHeight: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="auto">Auto</option>
                <option value="200px">Small (200px)</option>
                <option value="400px">Medium (400px)</option>
                <option value="600px">Large (600px)</option>
                <option value="100vh">Full Viewport (100vh)</option>
                <option value="custom">Custom...</option>
              </select>
              {section.settings.minHeight === 'custom' && (
                <input
                  type="text"
                  value={section.settings.minHeight || ''}
                  onChange={e => onUpdate({ minHeight: e.target.value })}
                  placeholder="e.g., 500px or 50vh"
                  className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>

            {/* Container Width */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Container Width</label>
              <select
                value={section.settings.maxWidth || '1200px'}
                onChange={e => onUpdate({ maxWidth: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="600px">Narrow (600px)</option>
                <option value="800px">Medium Narrow (800px)</option>
                <option value="1000px">Medium (1000px)</option>
                <option value="1200px">Wide (1200px)</option>
                <option value="1400px">Extra Wide (1400px)</option>
                <option value="1600px">Full HD (1600px)</option>
                <option value="100%">100% Width</option>
              </select>
            </div>

            {/* Section Width */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Section Width</label>
              <select
                value={section.settings.width || '100%'}
                onChange={e => onUpdate({ width: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="100%">Full Width (100%)</option>
                <option value="90%">90%</option>
                <option value="80%">80%</option>
                <option value="70%">70%</option>
                <option value="60%">60%</option>
                <option value="50%">Half Width (50%)</option>
              </select>
            </div>

            {/* Full Width Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-900">Full Width</p>
                <p className="text-xs text-slate-500">Remove container constraints</p>
              </div>
              <input
                type="checkbox"
                checked={section.settings.fullWidth || false}
                onChange={e => onUpdate({ fullWidth: e.target.checked })}
                className="rounded"
              />
            </div>

            {/* Number of Columns */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Number of Columns</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      // Update all rows to have the specified number of columns
                      const updatedRows = section.rows.map(row => {
                        const currentColumns = row.columns;
                        if (currentColumns.length === num) return row;
                        
                        if (currentColumns.length < num) {
                          // Add columns
                          const newColumns = [...currentColumns];
                          while (newColumns.length < num) {
                            newColumns.push({
                              id: crypto.randomUUID(),
                              width: 100 / num,
                              components: []
                            });
                          }
                          // Adjust widths
                          return {
                            ...row,
                            columns: newColumns.map(col => ({ ...col, width: 100 / num }))
                          };
                        } else {
                          // Remove columns (keep first ones)
                          const newColumns = currentColumns.slice(0, num);
                          return {
                            ...row,
                            columns: newColumns.map(col => ({ ...col, width: 100 / num }))
                          };
                        }
                      });
                      onUpdate({ rows: updatedRows } as any);
                    }}
                    className={`flex-1 px-3 py-2 border rounded-lg transition-colors ${
                      section.rows[0]?.columns.length === num
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-1">Adjust the number of columns in each row</p>
            </div>

            {/* Text Alignment */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Text Alignment</label>
              <div className="flex gap-2">
                {[
                  { value: 'left', icon: AlignLeft, label: 'Left' },
                  { value: 'center', icon: AlignCenter, label: 'Center' },
                  { value: 'right', icon: AlignRight, label: 'Right' },
                ].map(align => (
                  <button
                    key={align.value}
                    onClick={() => onUpdate({ textAlign: align.value as any })}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                      section.settings.textAlign === align.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <align.icon size={16} />
                    <span className="text-xs">{align.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'style' && (
          <>
            {/* Background Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Background</label>
              <select
                value={section.settings.background || 'solid'}
                onChange={e => onUpdate({ background: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="solid">Solid Color</option>
                <option value="gradient">Gradient</option>
                <option value="image">Background Image</option>
              </select>
            </div>

            {/* Background Image */}
            {section.settings.background === 'image' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={section.settings.backgroundImage || ''}
                  onChange={e => onUpdate({ backgroundImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Overlay */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-900">Dark Overlay</p>
                <p className="text-xs text-slate-500">Add dark overlay for better text readability</p>
              </div>
              <input
                type="checkbox"
                checked={section.settings.overlay || false}
                onChange={e => onUpdate({ overlay: e.target.checked })}
                className="rounded"
              />
            </div>

            {/* Overlay Opacity */}
            {section.settings.overlay && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Overlay Opacity: {section.settings.overlayOpacity || 0.5}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={section.settings.overlayOpacity || 0.5}
                  onChange={e => onUpdate({ overlayOpacity: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            )}

            {/* Custom Class */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Custom CSS Class</label>
              <input
                type="text"
                value={section.settings.customClass || ''}
                onChange={e => onUpdate({ customClass: e.target.value })}
                placeholder="my-custom-class"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </>
        )}

        {activeTab === 'advanced' && (
          <>
            {/* Section ID */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Section ID</label>
              <input
                type="text"
                value={section.id}
                disabled
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500"
              />
              <p className="text-xs text-slate-500 mt-1">Auto-generated unique identifier</p>
            </div>

            {/* Section Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Section Type</label>
              <input
                type="text"
                value={section.type}
                disabled
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 capitalize"
              />
            </div>

            {/* Variant */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Variant</label>
              <input
                type="text"
                value={section.variant}
                onChange={e => onUpdate({ variant: e.target.value } as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-slate-500 mt-1">Section variant (e.g., default, minimal, cards)</p>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 font-medium mb-1">Advanced Settings</p>
              <p className="text-xs text-blue-700">
                These settings are for advanced users. Changes may affect the layout and functionality of the section.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
