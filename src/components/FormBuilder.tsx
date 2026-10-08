import { useState } from 'react';
import { Project, Form, FormField, FormAction } from '../types';
import { v4 as uuid } from 'uuid';
import { Plus, Trash2, Copy, GripVertical, X, Settings, Eye, Type, Mail, Phone, MessageSquare, Hash, List, CheckSquare, Radio, FileText, Calendar, Lock, Check } from 'lucide-react';

interface FormBuilderProps {
  project: Project;
  updateProject: (p: Project) => void;
  notify: (type: 'success' | 'error' | 'info', msg: string) => void;
}

const fieldTypes: { type: FormField['type']; label: string; icon: any }[] = [
  { type: 'text', label: 'Text', icon: Type },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'phone', label: 'Phone', icon: Phone },
  { type: 'textarea', label: 'Textarea', icon: MessageSquare },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'select', label: 'Select', icon: List },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'radio', label: 'Radio', icon: Radio },
  { type: 'file', label: 'File Upload', icon: FileText },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'hidden', label: 'Hidden', icon: Lock },
];

export function FormBuilder({ project, updateProject, notify }: FormBuilderProps) {
  const [selectedFormId, setSelectedFormId] = useState<string | null>(project.forms[0]?.id || null);
  const [showCreate, setShowCreate] = useState(false);
  const [previewForm, setPreviewForm] = useState<Form | null>(null);

  const selectedForm = project.forms.find(f => f.id === selectedFormId);

  const createForm = (name: string) => {
    const newForm: Form = {
      id: uuid(),
      name,
      fields: [
        { id: uuid(), type: 'text', label: 'Name', required: true, placeholder: 'Your name' },
        { id: uuid(), type: 'email', label: 'Email', required: true, placeholder: 'your@email.com' },
        { id: uuid(), type: 'textarea', label: 'Message', required: false, placeholder: 'Your message...' },
      ],
      submitAction: { type: 'email', emailTo: project.seo.email || '' },
      successMessage: 'Thank you! Your message has been sent successfully.',
    };
    updateProject({ ...project, forms: [...project.forms, newForm] });
    setSelectedFormId(newForm.id);
    setShowCreate(false);
    notify('success', 'Form created');
  };

  const deleteForm = (id: string) => {
    if (confirm('Delete this form?')) {
      updateProject({ ...project, forms: project.forms.filter(f => f.id !== id) });
      if (selectedFormId === id) setSelectedFormId(null);
      notify('success', 'Form deleted');
    }
  };

  const duplicateForm = (form: Form) => {
    const clone: Form = {
      ...JSON.parse(JSON.stringify(form)),
      id: uuid(),
      name: form.name + ' (Copy)',
      fields: form.fields.map(f => ({ ...f, id: uuid() })),
    };
    updateProject({ ...project, forms: [...project.forms, clone] });
    notify('success', 'Form duplicated');
  };

  const updateForm = (updated: Form) => {
    updateProject({ ...project, forms: project.forms.map(f => f.id === updated.id ? updated : f) });
  };

  const addField = (type: FormField['type']) => {
    if (!selectedForm) return;
    const newField: FormField = {
      id: uuid(),
      type,
      label: `New ${type} field`,
      required: false,
      placeholder: '',
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
    };
    updateForm({ ...selectedForm, fields: [...selectedForm.fields, newField] });
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    if (!selectedForm) return;
    updateForm({
      ...selectedForm,
      fields: selectedForm.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f),
    });
  };

  const deleteField = (fieldId: string) => {
    if (!selectedForm) return;
    updateForm({ ...selectedForm, fields: selectedForm.fields.filter(f => f.id !== fieldId) });
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (!selectedForm) return;
    const fields = [...selectedForm.fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    [fields[index], fields[newIndex]] = [fields[newIndex], fields[index]];
    updateForm({ ...selectedForm, fields });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Forms</h1>
          <p className="text-slate-500 text-sm mt-1">{project.forms.length} form(s)</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
          <Plus size={16} /> New Form
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-sm text-slate-900">Forms</h3>
          </div>
          {project.forms.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              <p>No forms yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {project.forms.map(form => (
                <div
                  key={form.id}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${
                    selectedFormId === form.id ? 'bg-indigo-50' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedFormId(form.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{form.name}</p>
                    <p className="text-xs text-slate-500">{form.fields.length} fields • {form.submitAction.type}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setPreviewForm(form); }} className="p-1 text-slate-400 hover:text-indigo-600" title="Preview">
                      <Eye size={12} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); duplicateForm(form); }} className="p-1 text-slate-400 hover:text-indigo-600" title="Duplicate">
                      <Copy size={12} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteForm(form.id); }} className="p-1 text-slate-400 hover:text-red-500" title="Delete">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Editor */}
        <div className="lg:col-span-2">
          {selectedForm ? (
            <div className="space-y-4">
              {/* Form Settings */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-4 mb-4">
                  <input
                    type="text"
                    value={selectedForm.name}
                    onChange={e => updateForm({ ...selectedForm, name: e.target.value })}
                    className="flex-1 text-lg font-semibold text-slate-900 border-none focus:outline-none bg-transparent"
                  />
                  <button
                    onClick={() => setPreviewForm(selectedForm)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1"
                  >
                    <Eye size={12} /> Preview
                  </button>
                </div>

                {/* Submit Action */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Submit Action</label>
                    <select
                      value={selectedForm.submitAction.type}
                      onChange={e => updateForm({ ...selectedForm, submitAction: { ...selectedForm.submitAction, type: e.target.value as FormAction['type'] } })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="email">Email Notification</option>
                      <option value="webhook">Webhook</option>
                      <option value="formspree">Formspree</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  {selectedForm.submitAction.type === 'email' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Email To</label>
                      <input
                        type="email"
                        value={selectedForm.submitAction.emailTo || ''}
                        onChange={e => updateForm({ ...selectedForm, submitAction: { ...selectedForm.submitAction, emailTo: e.target.value } })}
                        placeholder="admin@example.com"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                  {(selectedForm.submitAction.type === 'webhook' || selectedForm.submitAction.type === 'formspree') && (
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Endpoint URL</label>
                      <input
                        type="url"
                        value={selectedForm.submitAction.endpoint || ''}
                        onChange={e => updateForm({ ...selectedForm, submitAction: { ...selectedForm.submitAction, endpoint: e.target.value } })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Success Message</label>
                  <input
                    type="text"
                    value={selectedForm.successMessage}
                    onChange={e => updateForm({ ...selectedForm, successMessage: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Fields */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Fields ({selectedForm.fields.length})</h3>
                </div>

                <div className="space-y-2 mb-4">
                  {selectedForm.fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex flex-col gap-0.5 pt-1">
                        <button onClick={() => moveField(index, 'up')} className="text-slate-300 hover:text-slate-600 text-[10px]">▲</button>
                        <GripVertical size={12} className="text-slate-300" />
                        <button onClick={() => moveField(index, 'down')} className="text-slate-300 hover:text-slate-600 text-[10px]">▼</button>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <select
                            value={field.type}
                            onChange={e => updateField(field.id, { type: e.target.value as FormField['type'] })}
                            className="px-2 py-1 border border-slate-200 rounded text-xs bg-white"
                          >
                            {fieldTypes.map(ft => (
                              <option key={ft.type} value={ft.type}>{ft.label}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={field.label}
                            onChange={e => updateField(field.id, { label: e.target.value })}
                            className="flex-1 px-2 py-1 border border-slate-200 rounded text-sm bg-white"
                            placeholder="Field label"
                          />
                          <label className="flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
                            <input type="checkbox" checked={field.required} onChange={e => updateField(field.id, { required: e.target.checked })} className="rounded" />
                            Required
                          </label>
                          <button onClick={() => deleteField(field.id)} className="p-1 text-slate-400 hover:text-red-500">
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={field.placeholder || ''}
                            onChange={e => updateField(field.id, { placeholder: e.target.value })}
                            className="flex-1 px-2 py-1 border border-slate-200 rounded text-xs bg-white"
                            placeholder="Placeholder text"
                          />
                          <input
                            type="text"
                            value={field.helpText || ''}
                            onChange={e => updateField(field.id, { helpText: e.target.value })}
                            className="flex-1 px-2 py-1 border border-slate-200 rounded text-xs bg-white"
                            placeholder="Help text"
                          />
                        </div>
                        {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                          <div>
                            <label className="text-xs text-slate-500">Options (comma separated)</label>
                            <input
                              type="text"
                              value={(field.options || []).join(', ')}
                              onChange={e => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                              className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white mt-1"
                              placeholder="Option 1, Option 2, Option 3"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Field Buttons */}
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-medium text-slate-500 mb-2">Add Field</p>
                  <div className="flex flex-wrap gap-1.5">
                    {fieldTypes.map(ft => (
                      <button
                        key={ft.type}
                        onClick={() => addField(ft.type)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-xs rounded-md transition-colors"
                      >
                        <ft.icon size={10} />
                        {ft.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Settings size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">Select a form to edit or create a new one</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreate && (
        <CreateFormModal onClose={() => setShowCreate(false)} onCreate={createForm} />
      )}

      {/* Preview Form Modal */}
      {previewForm && (
        <FormPreviewModal form={previewForm} onClose={() => setPreviewForm(null)} />
      )}
    </div>
  );
}

function CreateFormModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState('');
  const templates = [
    { name: 'Contact Form', desc: 'Name, Email, Message' },
    { name: 'Newsletter Signup', desc: 'Email only' },
    { name: 'Quote Request', desc: 'Detailed project info' },
    { name: 'Job Application', desc: 'Resume and details' },
    { name: 'Blank Form', desc: 'Start from scratch' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Create Form</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="p-5">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Form Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Contact Form" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <p className="text-sm font-medium text-slate-700 mb-2">Or choose a template:</p>
          <div className="space-y-2">
            {templates.map(t => (
              <button
                key={t.name}
                onClick={() => onCreate(t.name)}
                className="w-full p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-left transition-colors"
              >
                <p className="text-sm font-medium text-slate-900">{t.name}</p>
                <p className="text-xs text-slate-500">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => onCreate(name || 'New Form')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
          >
            Create Form
          </button>
        </div>
      </div>
    </div>
  );
}

function FormPreviewModal({ form, onClose }: { form: Form; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Form Preview: {form.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Check size={24} className="text-green-600" />
              </div>
              <p className="text-green-700 font-medium">{form.successMessage}</p>
              <button onClick={() => setSubmitted(false)} className="mt-4 text-sm text-indigo-600 hover:text-indigo-700">Submit another</button>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
              {form.fields.filter(f => f.type !== 'hidden').map(field => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      placeholder={field.placeholder}
                      required={field.required}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : field.type === 'select' ? (
                    <select required={field.required} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">Select...</option>
                      {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <div className="space-y-1">
                      {(field.options || []).map(opt => (
                        <label key={opt} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded" /> {opt}
                        </label>
                      ))}
                    </div>
                  ) : field.type === 'radio' ? (
                    <div className="space-y-1">
                      {(field.options || []).map(opt => (
                        <label key={opt} className="flex items-center gap-2 text-sm">
                          <input type="radio" name={field.id} className="rounded" /> {opt}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type={field.type === 'phone' ? 'tel' : field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                  {field.helpText && <p className="text-xs text-slate-400 mt-1">{field.helpText}</p>}
                </div>
              ))}
              <button type="submit" className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm">
                Submit
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
