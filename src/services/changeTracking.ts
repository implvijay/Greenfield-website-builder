import { Page, Section, ComponentInstance } from '../types';

// Change tracking types
export interface ChangeRecord {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'move' | 'duplicate';
  entityType: 'page' | 'section' | 'component';
  entityId: string;
  entityName: string;
  parentId?: string;
  changes: ChangeDetail[];
  metadata?: Record<string, any>;
}

export interface ChangeDetail {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'removed' | 'modified';
}

export interface ChangeFilter {
  userId?: string;
  entityType?: string;
  action?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

// Storage key
const CHANGE_LOG_KEY = 'greenfield_change_log';

// Get all change records
export function getChangeLog(): ChangeRecord[] {
  try {
    const data = localStorage.getItem(CHANGE_LOG_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load change log:', error);
    return [];
  }
}

// Save change log
export function saveChangeLog(records: ChangeRecord[]): void {
  try {
    // Keep only last 1000 records
    const trimmed = records.slice(0, 1000);
    localStorage.setItem(CHANGE_LOG_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save change log:', error);
  }
}

// Add change record
export function addChangeRecord(record: Omit<ChangeRecord, 'id' | 'timestamp'>): ChangeRecord {
  const records = getChangeLog();
  const newRecord: ChangeRecord = {
    ...record,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString()
  };
  
  records.unshift(newRecord);
  saveChangeLog(records);
  
  return newRecord;
}

// Track page creation
export function trackPageCreation(page: Page, userId: string, userName: string): ChangeRecord {
  return addChangeRecord({
    userId,
    userName,
    action: 'create',
    entityType: 'page',
    entityId: page.id,
    entityName: page.title,
    changes: [
      {
        field: 'page',
        oldValue: null,
        newValue: { title: page.title, type: page.type, status: page.status },
        changeType: 'added'
      }
    ]
  });
}

// Track page update
export function trackPageUpdate(
  oldPage: Page,
  newPage: Page,
  userId: string,
  userName: string
): ChangeRecord | null {
  const changes: ChangeDetail[] = [];
  
  if (oldPage.title !== newPage.title) {
    changes.push({
      field: 'title',
      oldValue: oldPage.title,
      newValue: newPage.title,
      changeType: 'modified'
    });
  }
  
  if (oldPage.slug !== newPage.slug) {
    changes.push({
      field: 'slug',
      oldValue: oldPage.slug,
      newValue: newPage.slug,
      changeType: 'modified'
    });
  }
  
  if (oldPage.status !== newPage.status) {
    changes.push({
      field: 'status',
      oldValue: oldPage.status,
      newValue: newPage.status,
      changeType: 'modified'
    });
  }
  
  if (oldPage.sections.length !== newPage.sections.length) {
    changes.push({
      field: 'sections',
      oldValue: oldPage.sections.length,
      newValue: newPage.sections.length,
      changeType: 'modified'
    });
  }
  
  if (changes.length === 0) return null;
  
  return addChangeRecord({
    userId,
    userName,
    action: 'update',
    entityType: 'page',
    entityId: newPage.id,
    entityName: newPage.title,
    changes
  });
}

// Track page deletion
export function trackPageDeletion(page: Page, userId: string, userName: string): ChangeRecord {
  return addChangeRecord({
    userId,
    userName,
    action: 'delete',
    entityType: 'page',
    entityId: page.id,
    entityName: page.title,
    changes: [
      {
        field: 'page',
        oldValue: { title: page.title, type: page.type },
        newValue: null,
        changeType: 'removed'
      }
    ]
  });
}

// Track section addition
export function trackSectionAddition(
  pageId: string,
  pageTitle: string,
  section: Section,
  userId: string,
  userName: string
): ChangeRecord {
  return addChangeRecord({
    userId,
    userName,
    action: 'create',
    entityType: 'section',
    entityId: section.id,
    entityName: `${section.type} section`,
    parentId: pageId,
    changes: [
      {
        field: 'section',
        oldValue: null,
        newValue: { type: section.type, variant: section.variant },
        changeType: 'added'
      }
    ],
    metadata: { pageTitle }
  });
}

// Track section deletion
export function trackSectionDeletion(
  pageId: string,
  pageTitle: string,
  section: Section,
  userId: string,
  userName: string
): ChangeRecord {
  return addChangeRecord({
    userId,
    userName,
    action: 'delete',
    entityType: 'section',
    entityId: section.id,
    entityName: `${section.type} section`,
    parentId: pageId,
    changes: [
      {
        field: 'section',
        oldValue: { type: section.type, variant: section.variant },
        newValue: null,
        changeType: 'removed'
      }
    ],
    metadata: { pageTitle }
  });
}

// Track component addition
export function trackComponentAddition(
  pageId: string,
  pageTitle: string,
  sectionId: string,
  component: ComponentInstance,
  userId: string,
  userName: string
): ChangeRecord {
  return addChangeRecord({
    userId,
    userName,
    action: 'create',
    entityType: 'component',
    entityId: component.id,
    entityName: `${component.type} component`,
    parentId: sectionId,
    changes: [
      {
        field: 'component',
        oldValue: null,
        newValue: { type: component.type },
        changeType: 'added'
      }
    ],
    metadata: { pageTitle, sectionId }
  });
}

// Filter change log
export function filterChangeLog(records: ChangeRecord[], filter: ChangeFilter): ChangeRecord[] {
  return records.filter(record => {
    if (filter.userId && record.userId !== filter.userId) return false;
    if (filter.entityType && record.entityType !== filter.entityType) return false;
    if (filter.action && record.action !== filter.action) return false;
    
    if (filter.dateRange) {
      const recordDate = new Date(record.timestamp);
      const startDate = new Date(filter.dateRange.start);
      const endDate = new Date(filter.dateRange.end);
      
      if (recordDate < startDate || recordDate > endDate) return false;
    }
    
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const matchesName = record.entityName.toLowerCase().includes(searchLower);
      const matchesUser = record.userName.toLowerCase().includes(searchLower);
      
      if (!matchesName && !matchesUser) return false;
    }
    
    return true;
  });
}

// Get change statistics
export function getChangeStatistics(records: ChangeRecord[]): {
  totalChanges: number;
  changesByAction: Record<string, number>;
  changesByEntityType: Record<string, number>;
  changesByUser: Record<string, { count: number; name: string }>;
  recentActivity: ChangeRecord[];
} {
  const changesByAction: Record<string, number> = {};
  const changesByEntityType: Record<string, number> = {};
  const changesByUser: Record<string, { count: number; name: string }> = {};
  
  records.forEach(record => {
    changesByAction[record.action] = (changesByAction[record.action] || 0) + 1;
    changesByEntityType[record.entityType] = (changesByEntityType[record.entityType] || 0) + 1;
    
    if (!changesByUser[record.userId]) {
      changesByUser[record.userId] = { count: 0, name: record.userName };
    }
    changesByUser[record.userId].count++;
  });
  
  return {
    totalChanges: records.length,
    changesByAction,
    changesByEntityType,
    changesByUser,
    recentActivity: records.slice(0, 10)
  };
}

// Export change log to CSV
export function exportChangeLogToCSV(records: ChangeRecord[]): string {
  const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity Name', 'Changes'];
  const rows = records.map(record => [
    new Date(record.timestamp).toLocaleString(),
    record.userName,
    record.action,
    record.entityType,
    record.entityName,
    record.changes.map(c => `${c.field}: ${c.oldValue} → ${c.newValue}`).join('; ')
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csvContent;
}

// Clear change log
export function clearChangeLog(): void {
  saveChangeLog([]);
}

// Get changes for specific entity
export function getChangesForEntity(entityId: string): ChangeRecord[] {
  return getChangeLog().filter(record => record.entityId === entityId);
}

// Get changes by user
export function getChangesByUser(userId: string): ChangeRecord[] {
  return getChangeLog().filter(record => record.userId === userId);
}

// Get recent changes
export function getRecentChanges(limit: number = 50): ChangeRecord[] {
  return getChangeLog().slice(0, limit);
}

// Format change for display
export function formatChangeForDisplay(record: ChangeRecord): string {
  const actionVerb = {
    create: 'created',
    update: 'updated',
    delete: 'deleted',
    move: 'moved',
    duplicate: 'duplicated'
  }[record.action];
  
  return `${record.userName} ${actionVerb} ${record.entityType} "${record.entityName}"`;
}
