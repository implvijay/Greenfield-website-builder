import { ComponentInstance } from '../types';
import { X } from 'lucide-react';

interface ComponentPropertiesPanelProps {
  component: ComponentInstance;
  onUpdate: (props: any) => void;
  onClose: () => void;
}

export function ComponentPropertiesPanel({ component, onUpdate, onClose }: ComponentPropertiesPanelProps) {
  const { type, props } = component;

  const renderProperties = () => {
    switch (type) {
      case 'heading':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Text</label>
              <input
                type="text"
                value={props.text || ''}
                onChange={(e) => onUpdate({ text: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
              <select
                value={props.level || 2}
                onChange={(e) => onUpdate({ level: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
                <option value={4}>H4</option>
                <option value={5}>H5</option>
                <option value={6}>H6</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Size</label>
              <select
                value={props.size || '2xl'}
                onChange={(e) => onUpdate({ size: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="xl">Extra Large</option>
                <option value="2xl">2X Large</option>
                <option value="3xl">3X Large</option>
                <option value="4xl">4X Large</option>
                <option value="5xl">5X Large</option>
              </select>
            </div>
          </div>
        );

      case 'paragraph':
      case 'text':
        return (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Text</label>
            <textarea
              value={props.text || ''}
              onChange={(e) => onUpdate({ text: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
              <input
                type="url"
                value={props.src || ''}
                onChange={(e) => onUpdate({ src: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alt Text</label>
              <input
                type="text"
                value={props.alt || ''}
                onChange={(e) => onUpdate({ alt: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Label</label>
              <input
                type="text"
                value={props.text || ''}
                onChange={(e) => onUpdate({ text: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
              <input
                type="url"
                value={props.url || ''}
                onChange={(e) => onUpdate({ url: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Variant</label>
              <select
                value={props.variant || 'primary'}
                onChange={(e) => onUpdate({ variant: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
              </select>
            </div>
          </div>
        );

      case 'button-group':
        return (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Buttons</label>
            <div className="space-y-3">
              {(props.buttons || []).map((btn: any, i: number) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg space-y-2">
                  <input
                    type="text"
                    value={btn.label || ''}
                    onChange={(e) => {
                      const newButtons = [...(props.buttons || [])];
                      newButtons[i] = { ...newButtons[i], label: e.target.value };
                      onUpdate({ buttons: newButtons });
                    }}
                    placeholder="Button label"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <select
                    value={btn.variant || 'primary'}
                    onChange={(e) => {
                      const newButtons = [...(props.buttons || [])];
                      newButtons[i] = { ...newButtons[i], variant: e.target.value };
                      onUpdate({ buttons: newButtons });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="primary">Primary</option>
                    <option value="outline">Outline</option>
                  </select>
                  <button
                    onClick={() => {
                      const newButtons = (props.buttons || []).filter((_: any, idx: number) => idx !== i);
                      onUpdate({ buttons: newButtons });
                    }}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Remove Button
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newButtons = [...(props.buttons || []), { label: 'New Button', variant: 'primary' }];
                  onUpdate({ buttons: newButtons });
                }}
                className="w-full px-3 py-2 border border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:border-indigo-500 hover:text-indigo-600"
              >
                + Add Button
              </button>
            </div>
          </div>
        );

      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={props.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={props.description || ''}
                onChange={(e) => onUpdate({ description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
              <input
                type="url"
                value={props.image || ''}
                onChange={(e) => onUpdate({ image: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Icon (emoji)</label>
              <input
                type="text"
                value={props.icon || ''}
                onChange={(e) => onUpdate({ icon: e.target.value })}
                placeholder="⭐"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        );

      case 'stat':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Value</label>
              <input
                type="text"
                value={props.value || ''}
                onChange={(e) => onUpdate({ value: e.target.value })}
                placeholder="100+"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Label</label>
              <input
                type="text"
                value={props.label || ''}
                onChange={(e) => onUpdate({ label: e.target.value })}
                placeholder="Happy Customers"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Icon (emoji)</label>
              <input
                type="text"
                value={props.icon || ''}
                onChange={(e) => onUpdate({ icon: e.target.value })}
                placeholder="📊"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        );

      case 'testimonial':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quote Text</label>
              <textarea
                value={props.text || ''}
                onChange={(e) => onUpdate({ text: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                type="text"
                value={props.name || ''}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role/Title</label>
              <input
                type="text"
                value={props.role || ''}
                onChange={(e) => onUpdate({ role: e.target.value })}
                placeholder="CEO, Company Name"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Avatar URL</label>
              <input
                type="url"
                value={props.avatar || ''}
                onChange={(e) => onUpdate({ avatar: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        );

      case 'team-member':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                type="text"
                value={props.name || ''}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role/Position</label>
              <input
                type="text"
                value={props.role || ''}
                onChange={(e) => onUpdate({ role: e.target.value })}
                placeholder="Chief Executive Officer"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
              <textarea
                value={props.bio || ''}
                onChange={(e) => onUpdate({ bio: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Photo URL</label>
              <input
                type="url"
                value={props.image || ''}
                onChange={(e) => onUpdate({ image: e.target.value })}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        );

      case 'pricing-card':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Plan Name</label>
              <input
                type="text"
                value={props.name || ''}
                onChange={(e) => onUpdate({ name: e.target.value })}
                placeholder="Professional"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
              <input
                type="text"
                value={props.price || ''}
                onChange={(e) => onUpdate({ price: e.target.value })}
                placeholder="$99"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Period</label>
              <input
                type="text"
                value={props.period || ''}
                onChange={(e) => onUpdate({ period: e.target.value })}
                placeholder="/month"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Features</label>
              <div className="space-y-2">
                {(props.features || []).map((feature: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...(props.features || [])];
                        newFeatures[i] = e.target.value;
                        onUpdate({ features: newFeatures });
                      }}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => {
                        const newFeatures = (props.features || []).filter((_: any, idx: number) => idx !== i);
                        onUpdate({ features: newFeatures });
                      }}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newFeatures = [...(props.features || []), 'New feature'];
                    onUpdate({ features: newFeatures });
                  }}
                  className="w-full px-3 py-2 border border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:border-indigo-500 hover:text-indigo-600"
                >
                  + Add Feature
                </button>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={props.popular || false}
                  onChange={(e) => onUpdate({ popular: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium text-slate-700">Mark as Popular</span>
              </label>
            </div>
          </div>
        );

      case 'faq-item':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Question</label>
              <input
                type="text"
                value={props.question || ''}
                onChange={(e) => onUpdate({ question: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Answer</label>
              <textarea
                value={props.answer || ''}
                onChange={(e) => onUpdate({ answer: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        );

      case 'form-field':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Label</label>
              <input
                type="text"
                value={props.label || ''}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Field Type</label>
              <select
                value={props.fieldType || 'text'}
                onChange={(e) => onUpdate({ fieldType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="tel">Phone</option>
                <option value="textarea">Textarea</option>
                <option value="number">Number</option>
                <option value="url">URL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Placeholder</label>
              <input
                type="text"
                value={props.placeholder || ''}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={props.required || false}
                  onChange={(e) => onUpdate({ required: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium text-slate-700">Required Field</span>
              </label>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">Properties editor for {type} component coming soon</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 capitalize">{type} Properties</h3>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {renderProperties()}
      </div>
    </div>
  );
}
