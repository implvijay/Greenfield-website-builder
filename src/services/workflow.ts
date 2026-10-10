import { Page } from '../types';

// Workflow state types
export type WorkflowState = 
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'published'
  | 'scheduled'
  | 'archived'
  | 'deprecated';

export interface WorkflowTransition {
  from: WorkflowState;
  to: WorkflowState;
  label: string;
  requiresApproval?: boolean;
  requiresComment?: boolean;
}

export interface WorkflowHistory {
  id: string;
  pageId: string;
  fromState: WorkflowState;
  toState: WorkflowState;
  changedBy: string;
  changedAt: string;
  comment?: string;
}

export interface WorkflowConfig {
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  requireApprovalFor: WorkflowState[];
}

// Default workflow configuration
export const DEFAULT_WORKFLOW_CONFIG: WorkflowConfig = {
  states: ['draft', 'in_review', 'approved', 'published', 'scheduled', 'archived', 'deprecated'],
  transitions: [
    { from: 'draft', to: 'in_review', label: 'Submit for Review' },
    { from: 'in_review', to: 'approved', label: 'Approve', requiresApproval: true },
    { from: 'in_review', to: 'draft', label: 'Request Changes', requiresComment: true },
    { from: 'approved', to: 'published', label: 'Publish' },
    { from: 'approved', to: 'scheduled', label: 'Schedule' },
    { from: 'published', to: 'archived', label: 'Archive' },
    { from: 'published', to: 'deprecated', label: 'Deprecate' },
    { from: 'archived', to: 'draft', label: 'Restore to Draft' },
    { from: 'deprecated', to: 'draft', label: 'Restore to Draft' },
    { from: 'scheduled', to: 'published', label: 'Publish Now' },
    { from: 'scheduled', to: 'draft', label: 'Cancel Schedule' }
  ],
  requireApprovalFor: ['approved', 'published']
};

// Extended page interface with workflow
export interface WorkflowPage extends Page {
  workflowState: WorkflowState;
  workflowHistory: WorkflowHistory[];
  assignedTo?: string;
  dueDate?: string;
}

// Get available transitions for current state
export function getAvailableTransitions(
  currentState: WorkflowState,
  config: WorkflowConfig = DEFAULT_WORKFLOW_CONFIG
): WorkflowTransition[] {
  return config.transitions.filter(t => t.from === currentState);
}

// Check if transition is valid
export function isValidTransition(
  fromState: WorkflowState,
  toState: WorkflowState,
  config: WorkflowConfig = DEFAULT_WORKFLOW_CONFIG
): boolean {
  return config.transitions.some(t => t.from === fromState && t.to === toState);
}

// Get transition details
export function getTransition(
  fromState: WorkflowState,
  toState: WorkflowState,
  config: WorkflowConfig = DEFAULT_WORKFLOW_CONFIG
): WorkflowTransition | undefined {
  return config.transitions.find(t => t.from === fromState && t.to === toState);
}

// Apply workflow transition
export function applyWorkflowTransition(
  page: WorkflowPage,
  toState: WorkflowState,
  changedBy: string,
  comment?: string,
  config: WorkflowConfig = DEFAULT_WORKFLOW_CONFIG
): WorkflowPage | null {
  const transition = getTransition(page.workflowState, toState, config);
  
  if (!transition) {
    return null; // Invalid transition
  }
  
  const historyEntry: WorkflowHistory = {
    id: crypto.randomUUID(),
    pageId: page.id,
    fromState: page.workflowState,
    toState,
    changedBy,
    changedAt: new Date().toISOString(),
    comment
  };
  
  return {
    ...page,
    workflowState: toState,
    status: mapWorkflowStateToStatus(toState),
    workflowHistory: [...page.workflowHistory, historyEntry],
    lastModified: new Date().toISOString()
  };
}

// Map workflow state to page status
export function mapWorkflowStateToStatus(state: WorkflowState): 'draft' | 'published' | 'archived' {
  switch (state) {
    case 'draft':
    case 'in_review':
    case 'approved':
    case 'scheduled':
      return 'draft';
    case 'published':
      return 'published';
    case 'archived':
    case 'deprecated':
      return 'archived';
    default:
      return 'draft';
  }
}

// Map page status to workflow state
export function mapStatusToWorkflowState(status: 'draft' | 'published' | 'archived'): WorkflowState {
  switch (status) {
    case 'draft':
      return 'draft';
    case 'published':
      return 'published';
    case 'archived':
      return 'archived';
    default:
      return 'draft';
  }
}

// Get workflow statistics
export function getWorkflowStatistics(pages: WorkflowPage[]): Record<WorkflowState, number> {
  const stats: Record<WorkflowState, number> = {
    draft: 0,
    in_review: 0,
    approved: 0,
    published: 0,
    scheduled: 0,
    archived: 0,
    deprecated: 0
  };
  
  pages.forEach(page => {
    stats[page.workflowState]++;
  });
  
  return stats;
}

// Get pages by workflow state
export function getPagesByWorkflowState(
  pages: WorkflowPage[],
  state: WorkflowState
): WorkflowPage[] {
  return pages.filter(p => p.workflowState === state);
}

// Get pages assigned to user
export function getPagesAssignedTo(
  pages: WorkflowPage[],
  userId: string
): WorkflowPage[] {
  return pages.filter(p => p.assignedTo === userId);
}

// Get overdue pages
export function getOverduePages(pages: WorkflowPage[]): WorkflowPage[] {
  const now = new Date();
  return pages.filter(p => {
    if (!p.dueDate) return false;
    const dueDate = new Date(p.dueDate);
    return dueDate < now && p.workflowState !== 'published' && p.workflowState !== 'archived';
  });
}

// Get pages needing approval
export function getPagesNeedingApproval(pages: WorkflowPage[]): WorkflowPage[] {
  return pages.filter(p => p.workflowState === 'in_review');
}

// Get workflow history for page
export function getPageWorkflowHistory(page: WorkflowPage): WorkflowHistory[] {
  return page.workflowHistory || [];
}

// Get latest workflow action
export function getLatestWorkflowAction(page: WorkflowPage): WorkflowHistory | null {
  if (!page.workflowHistory || page.workflowHistory.length === 0) {
    return null;
  }
  return page.workflowHistory[page.workflowHistory.length - 1];
}

// Check if page requires approval for next state
export function requiresApproval(
  toState: WorkflowState,
  config: WorkflowConfig = DEFAULT_WORKFLOW_CONFIG
): boolean {
  return config.requireApprovalFor.includes(toState);
}

// Initialize workflow for page
export function initializeWorkflow(page: Page, userId?: string): WorkflowPage {
  return {
    ...page,
    workflowState: mapStatusToWorkflowState(page.status),
    workflowHistory: [{
      id: crypto.randomUUID(),
      pageId: page.id,
      fromState: 'draft',
      toState: mapStatusToWorkflowState(page.status),
      changedBy: userId || 'system',
      changedAt: page.lastModified || new Date().toISOString(),
      comment: 'Workflow initialized'
    }],
    assignedTo: userId,
    lastModified: new Date().toISOString()
  };
}

// Assign page to user
export function assignPage(page: WorkflowPage, userId: string): WorkflowPage {
  return {
    ...page,
    assignedTo: userId,
    lastModified: new Date().toISOString()
  };
}

// Set due date
export function setDueDate(page: WorkflowPage, dueDate: string): WorkflowPage {
  return {
    ...page,
    dueDate,
    lastModified: new Date().toISOString()
  };
}

// Get workflow state color
export function getWorkflowStateColor(state: WorkflowState): string {
  switch (state) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'in_review':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-blue-100 text-blue-800';
    case 'published':
      return 'bg-green-100 text-green-800';
    case 'scheduled':
      return 'bg-purple-100 text-purple-800';
    case 'archived':
      return 'bg-slate-100 text-slate-800';
    case 'deprecated':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Get workflow state label
export function getWorkflowStateLabel(state: WorkflowState): string {
  switch (state) {
    case 'draft':
      return 'Draft';
    case 'in_review':
      return 'In Review';
    case 'approved':
      return 'Approved';
    case 'published':
      return 'Published';
    case 'scheduled':
      return 'Scheduled';
    case 'archived':
      return 'Archived';
    case 'deprecated':
      return 'Deprecated';
    default:
      return state;
  }
}
