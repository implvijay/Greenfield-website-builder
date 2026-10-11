import { WorkflowConfig, WorkflowState, WorkflowTransition } from './workflow';

// Custom workflow template
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  config: WorkflowConfig;
  createdAt: string;
  createdBy: string;
  isDefault?: boolean;
}

// Storage key
const WORKFLOW_TEMPLATES_KEY = 'greenfield_workflow_templates';

// Default workflow templates
const DEFAULT_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'simple-publish',
    name: 'Simple Publish',
    description: 'Basic draft to published workflow',
    config: {
      states: ['draft', 'published', 'archived'],
      transitions: [
        { from: 'draft', to: 'published', label: 'Publish' },
        { from: 'published', to: 'archived', label: 'Archive' },
        { from: 'archived', to: 'draft', label: 'Restore' }
      ],
      requireApprovalFor: []
    },
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    isDefault: true
  },
  {
    id: 'review-required',
    name: 'Review Required',
    description: 'Workflow with mandatory review step',
    config: {
      states: ['draft', 'in_review', 'approved', 'published', 'archived'],
      transitions: [
        { from: 'draft', to: 'in_review', label: 'Submit for Review' },
        { from: 'in_review', to: 'approved', label: 'Approve', requiresApproval: true },
        { from: 'in_review', to: 'draft', label: 'Request Changes', requiresComment: true },
        { from: 'approved', to: 'published', label: 'Publish' },
        { from: 'published', to: 'archived', label: 'Archive' },
        { from: 'archived', to: 'draft', label: 'Restore' }
      ],
      requireApprovalFor: ['approved', 'published']
    },
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    isDefault: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise Workflow',
    description: 'Full enterprise workflow with scheduling and deprecation',
    config: {
      states: ['draft', 'in_review', 'approved', 'published', 'scheduled', 'archived', 'deprecated'],
      transitions: [
        { from: 'draft', to: 'in_review', label: 'Submit for Review' },
        { from: 'in_review', to: 'approved', label: 'Approve', requiresApproval: true },
        { from: 'in_review', to: 'draft', label: 'Request Changes', requiresComment: true },
        { from: 'approved', to: 'published', label: 'Publish' },
        { from: 'approved', to: 'scheduled', label: 'Schedule' },
        { from: 'published', to: 'archived', label: 'Archive' },
        { from: 'published', to: 'deprecated', label: 'Deprecate' },
        { from: 'scheduled', to: 'published', label: 'Publish Now' },
        { from: 'scheduled', to: 'draft', label: 'Cancel Schedule' },
        { from: 'archived', to: 'draft', label: 'Restore' },
        { from: 'deprecated', to: 'draft', label: 'Restore' }
      ],
      requireApprovalFor: ['approved', 'published']
    },
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    isDefault: true
  }
];

// Get all workflow templates
export function getWorkflowTemplates(): WorkflowTemplate[] {
  try {
    const data = localStorage.getItem(WORKFLOW_TEMPLATES_KEY);
    if (!data) {
      // Initialize with defaults
      saveWorkflowTemplates(DEFAULT_WORKFLOW_TEMPLATES);
      return DEFAULT_WORKFLOW_TEMPLATES;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load workflow templates:', error);
    return DEFAULT_WORKFLOW_TEMPLATES;
  }
}

// Save workflow templates
export function saveWorkflowTemplates(templates: WorkflowTemplate[]): void {
  try {
    localStorage.setItem(WORKFLOW_TEMPLATES_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('Failed to save workflow templates:', error);
  }
}

// Create workflow template
export function createWorkflowTemplate(
  name: string,
  description: string,
  config: WorkflowConfig,
  createdBy: string
): WorkflowTemplate {
  const templates = getWorkflowTemplates();
  const newTemplate: WorkflowTemplate = {
    id: crypto.randomUUID(),
    name,
    description,
    config,
    createdAt: new Date().toISOString(),
    createdBy
  };
  
  templates.push(newTemplate);
  saveWorkflowTemplates(templates);
  
  return newTemplate;
}

// Update workflow template
export function updateWorkflowTemplate(
  templateId: string,
  updates: Partial<Omit<WorkflowTemplate, 'id' | 'createdAt'>>
): WorkflowTemplate | null {
  const templates = getWorkflowTemplates();
  const index = templates.findIndex(t => t.id === templateId);
  
  if (index === -1) return null;
  
  templates[index] = { ...templates[index], ...updates };
  saveWorkflowTemplates(templates);
  
  return templates[index];
}

// Delete workflow template
export function deleteWorkflowTemplate(templateId: string): boolean {
  const templates = getWorkflowTemplates();
  const template = templates.find(t => t.id === templateId);
  
  // Can't delete default templates
  if (template?.isDefault) return false;
  
  const filtered = templates.filter(t => t.id !== templateId);
  saveWorkflowTemplates(filtered);
  
  return true;
}

// Get workflow template by ID
export function getWorkflowTemplateById(templateId: string): WorkflowTemplate | null {
  const templates = getWorkflowTemplates();
  return templates.find(t => t.id === templateId) || null;
}

// Duplicate workflow template
export function duplicateWorkflowTemplate(templateId: string, createdBy: string): WorkflowTemplate | null {
  const templates = getWorkflowTemplates();
  const original = templates.find(t => t.id === templateId);
  
  if (!original) return null;
  
  const duplicate: WorkflowTemplate = {
    ...original,
    id: crypto.randomUUID(),
    name: `${original.name} (Copy)`,
    createdAt: new Date().toISOString(),
    createdBy,
    isDefault: false
  };
  
  templates.push(duplicate);
  saveWorkflowTemplates(templates);
  
  return duplicate;
}

// Validate workflow config
export function validateWorkflowConfig(config: WorkflowConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check for at least 2 states
  if (config.states.length < 2) {
    errors.push('Workflow must have at least 2 states');
  }
  
  // Check for at least 1 transition
  if (config.transitions.length === 0) {
    errors.push('Workflow must have at least 1 transition');
  }
  
  // Check that all transition states exist
  config.transitions.forEach(transition => {
    if (!config.states.includes(transition.from)) {
      errors.push(`Transition from state "${transition.from}" does not exist`);
    }
    if (!config.states.includes(transition.to)) {
      errors.push(`Transition to state "${transition.to}" does not exist`);
    }
  });
  
  // Check for duplicate transitions
  const transitionKeys = config.transitions.map(t => `${t.from}-${t.to}`);
  const duplicates = transitionKeys.filter((key, index) => transitionKeys.indexOf(key) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate transitions found: ${duplicates.join(', ')}`);
  }
  
  // Check that requireApprovalFor states exist
  config.requireApprovalFor.forEach(state => {
    if (!config.states.includes(state)) {
      errors.push(`Approval required state "${state}" does not exist`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Export workflow template to JSON
export function exportWorkflowTemplate(template: WorkflowTemplate): string {
  return JSON.stringify(template, null, 2);
}

// Import workflow template from JSON
export function importWorkflowTemplate(json: string, createdBy: string): {
  success: boolean;
  template?: WorkflowTemplate;
  error?: string;
} {
  try {
    const parsed = JSON.parse(json);
    
    // Validate structure
    if (!parsed.name || !parsed.config || !parsed.config.states || !parsed.config.transitions) {
      return { success: false, error: 'Invalid template structure' };
    }
    
    // Validate config
    const validation = validateWorkflowConfig(parsed.config);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(', ') };
    }
    
    // Create template
    const template = createWorkflowTemplate(
      parsed.name,
      parsed.description || '',
      parsed.config,
      createdBy
    );
    
    return { success: true, template };
  } catch (error) {
    return { success: false, error: 'Failed to parse JSON' };
  }
}

// Get workflow template statistics
export function getWorkflowTemplateStatistics(): {
  totalTemplates: number;
  defaultTemplates: number;
  customTemplates: number;
  templatesByCreator: Record<string, number>;
} {
  const templates = getWorkflowTemplates();
  
  return {
    totalTemplates: templates.length,
    defaultTemplates: templates.filter(t => t.isDefault).length,
    customTemplates: templates.filter(t => !t.isDefault).length,
    templatesByCreator: templates.reduce((acc, t) => {
      acc[t.createdBy] = (acc[t.createdBy] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
}
