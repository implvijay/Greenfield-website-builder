import React, { useState } from 'react';
import { Page } from '../types';
import { 
  WorkflowPage, 
  WorkflowState, 
  getAvailableTransitions, 
  applyWorkflowTransition,
  getWorkflowStateColor,
  getWorkflowStateLabel,
  requiresApproval,
  initializeWorkflow
} from '../services/workflow';
import { createWorkflowNotification } from '../services/notifications';
import { GitBranch, Check, X, MessageSquare } from 'lucide-react';

interface WorkflowPanelProps {
  page: Page;
  currentUser: string;
  onUpdate: (page: WorkflowPage) => void;
}

export const WorkflowPanel: React.FC<WorkflowPanelProps> = ({ 
  page, 
  currentUser,
  onUpdate 
}) => {
  const [showTransitionDialog, setShowTransitionDialog] = useState(false);
  const [selectedTransition, setSelectedTransition] = useState<{
    to: WorkflowState;
    label: string;
    requiresApproval?: boolean;
    requiresComment?: boolean;
  } | null>(null);
  const [comment, setComment] = useState('');

  // Initialize workflow if not exists
  const workflowPage: WorkflowPage = (page as WorkflowPage).workflowState 
    ? page as WorkflowPage
    : initializeWorkflow(page, currentUser);

  const availableTransitions = getAvailableTransitions(workflowPage.workflowState);
  const currentState = workflowPage.workflowState;

  const handleTransitionClick = (transition: {
    to: WorkflowState;
    label: string;
    requiresApproval?: boolean;
    requiresComment?: boolean;
  }) => {
    setSelectedTransition(transition);
    setComment('');
    setShowTransitionDialog(true);
  };

  const handleConfirmTransition = () => {
    if (!selectedTransition) return;

    if (selectedTransition.requiresComment && !comment.trim()) {
      alert('Please provide a comment for this transition');
      return;
    }

    const updatedPage = applyWorkflowTransition(
      workflowPage,
      selectedTransition.to,
      currentUser,
      comment.trim() || undefined
    );

    if (updatedPage) {
      onUpdate(updatedPage);
      
      // Create notification
      createWorkflowNotification(
        updatedPage,
        currentState,
        selectedTransition.to,
        currentUser
      );
    }

    setShowTransitionDialog(false);
    setSelectedTransition(null);
    setComment('');
  };

  const handleCancelTransition = () => {
    setShowTransitionDialog(false);
    setSelectedTransition(null);
    setComment('');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-5 h-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">Workflow</h3>
      </div>

      {/* Current State */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Current State
        </label>
        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getWorkflowStateColor(currentState)}`}>
          {getWorkflowStateLabel(currentState)}
        </div>
      </div>

      {/* Available Transitions */}
      {availableTransitions.length > 0 && (
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Available Actions
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTransitions.map((transition, index) => (
              <button
                key={index}
                onClick={() => handleTransitionClick(transition)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  transition.to === 'published'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : transition.to === 'archived' || transition.to === 'deprecated'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {transition.label}
                {transition.requiresApproval && (
                  <span className="ml-1 text-xs opacity-75">(Requires Approval)</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Workflow History */}
      {workflowPage.workflowHistory && workflowPage.workflowHistory.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Workflow History
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...workflowPage.workflowHistory].reverse().map((entry, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    entry.toState === 'published' ? 'bg-green-100' :
                    entry.toState === 'archived' || entry.toState === 'deprecated' ? 'bg-red-100' :
                    'bg-blue-100'
                  }`}>
                    {entry.toState === 'published' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : entry.toState === 'archived' || entry.toState === 'deprecated' ? (
                      <X className="w-4 h-4 text-red-600" />
                    ) : (
                      <GitBranch className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${getWorkflowStateColor(entry.fromState)}`}>
                      {getWorkflowStateLabel(entry.fromState)}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getWorkflowStateColor(entry.toState)}`}>
                      {getWorkflowStateLabel(entry.toState)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {entry.changedBy} • {new Date(entry.changedAt).toLocaleString()}
                  </div>
                  {entry.comment && (
                    <div className="mt-1 text-sm text-gray-700 flex items-start gap-1">
                      <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{entry.comment}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transition Dialog */}
      {showTransitionDialog && selectedTransition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedTransition.label}
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Move page from{' '}
                <span className={`px-2 py-0.5 rounded text-xs ${getWorkflowStateColor(currentState)}`}>
                  {getWorkflowStateLabel(currentState)}
                </span>
                {' '}to{' '}
                <span className={`px-2 py-0.5 rounded text-xs ${getWorkflowStateColor(selectedTransition.to)}`}>
                  {getWorkflowStateLabel(selectedTransition.to)}
                </span>
              </p>

              {selectedTransition.requiresApproval && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ This transition requires approval
                  </p>
                </div>
              )}

              {(selectedTransition.requiresComment || true) && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Comment {selectedTransition.requiresComment && '(Required)'}
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCancelTransition}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTransition}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
