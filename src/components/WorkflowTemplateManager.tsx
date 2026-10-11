import React, { useState, useEffect } from 'react';
import {
  getWorkflowTemplates,
  createWorkflowTemplate,
  updateWorkflowTemplate,
  deleteWorkflowTemplate,
  duplicateWorkflowTemplate,
  validateWorkflowConfig,
  exportWorkflowTemplate,
  importWorkflowTemplate,
  WorkflowTemplate
} from '../services/workflowTemplates';
import { WorkflowConfig, WorkflowState } from '../services/workflow';
import { GitBranch, Plus, Edit2, Trash2, Copy, Download, Upload } from 'lucide-react';

interface WorkflowTemplateManagerProps {
  currentUserId: string;
  onApplyTemplate?: (template: WorkflowTemplate) => void;
}

export const WorkflowTemplateManager: React.FC<WorkflowTemplateManagerProps> = ({
  currentUserId,
  onApplyTemplate
}) => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkflowTemplate | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importJson, setImportJson] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const data = getWorkflowTemplates();
    setTemplates(data);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setShowCreateDialog(true);
  };

  const handleEdit = (template: WorkflowTemplate) => {
    setEditingTemplate(template);
    setShowCreateDialog(true);
  };

  const handleDelete = (templateId: string) => {
    if (confirm('Are you sure you want to delete this workflow template?')) {
      const success = deleteWorkflowTemplate(templateId);
      if (success) {
        loadTemplates();
      } else {
        alert('Cannot delete default templates');
      }
    }
  };

  const handleDuplicate = (templateId: string) => {
    const duplicate = duplicateWorkflowTemplate(templateId, currentUserId);
    if (duplicate) {
      loadTemplates();
    }
  };

  const handleExport = (template: WorkflowTemplate) => {
    const json = exportWorkflowTemplate(template);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-template-${template.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const result = importWorkflowTemplate(importJson, currentUserId);
    if (result.success) {
      loadTemplates();
      setImportDialogOpen(false);
      setImportJson('');
      alert('Workflow template imported successfully');
    } else {
      alert(`Import failed: ${result.error}`);
    }
  };

  const handleApply = (template: WorkflowTemplate) => {
    if (onApplyTemplate) {
      onApplyTemplate(template);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Workflow Templates</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setImportDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Manage reusable workflow templates for your pages
        </p>
      </div>

      {/* Template List */}
      <div className="p-6">
        {templates.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <GitBranch className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No workflow templates yet</p>
            <button
              onClick={handleCreate}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Template
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      {template.isDefault && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{template.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>{template.config.states.length} states</span>
                      <span>{template.config.transitions.length} transitions</span>
                      <span>Created by {template.createdBy}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleApply(template)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Apply template"
                    >
                      <GitBranch className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                      title="Edit template"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(template.id)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                      title="Duplicate template"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExport(template)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                      title="Export template"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {!template.isDefault && (
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* States Preview */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {template.config.states.map((state) => (
                    <span
                      key={state}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {state}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      {showCreateDialog && (
        <WorkflowTemplateDialog
          template={editingTemplate}
          currentUserId={currentUserId}
          onClose={() => {
            setShowCreateDialog(false);
            setEditingTemplate(null);
          }}
          onSave={() => {
            loadTemplates();
            setShowCreateDialog(false);
            setEditingTemplate(null);
          }}
        />
      )}

      {/* Import Dialog */}
      {importDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Import Workflow Template</h3>
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="Paste workflow template JSON here..."
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setImportDialogOpen(false);
                  setImportJson('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importJson.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Workflow Template Dialog Component
interface WorkflowTemplateDialogProps {
  template: WorkflowTemplate | null;
  currentUserId: string;
  onClose: () => void;
  onSave: () => void;
}

const WorkflowTemplateDialog: React.FC<WorkflowTemplateDialogProps> = ({
  template,
  currentUserId,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [states, setStates] = useState<WorkflowState[]>(
    template?.config.states || ['draft', 'published']
  );
  const [newState, setNewState] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleAddState = () => {
    if (newState && !states.includes(newState as WorkflowState)) {
      setStates([...states, newState as WorkflowState]);
      setNewState('');
    }
  };

  const handleRemoveState = (state: WorkflowState) => {
    setStates(states.filter(s => s !== state));
  };

  const handleSave = () => {
    const config: WorkflowConfig = {
      states,
      transitions: template?.config.transitions || [],
      requireApprovalFor: template?.config.requireApprovalFor || []
    };

    const validation = validateWorkflowConfig(config);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    if (template) {
      updateWorkflowTemplate(template.id, {
        name,
        description,
        config
      });
    } else {
      createWorkflowTemplate(name, description, config, currentUserId);
    }

    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {template ? 'Edit Workflow Template' : 'Create Workflow Template'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Simple Publish Workflow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe this workflow template..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Workflow States *
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {states.map((state) => (
                <span
                  key={state}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded flex items-center gap-1"
                >
                  {state}
                  <button
                    onClick={() => handleRemoveState(state)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddState()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Add new state..."
              />
              <button
                onClick={handleAddState}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm font-medium text-red-800 mb-1">Validation Errors:</div>
              <ul className="text-sm text-red-700 list-disc list-inside">
                {validationErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || states.length < 2}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {template ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};
