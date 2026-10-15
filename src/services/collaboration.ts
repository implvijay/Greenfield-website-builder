import { Page } from '../types';

// Mock user for collaboration simulation
export interface CollaboratorUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  isOnline: boolean;
  lastSeen: string;
  currentPageId?: string;
  currentSectionId?: string;
}

// Collaboration event types
export type CollaborationEventType = 
  | 'user_joined'
  | 'user_left'
  | 'page_viewing'
  | 'page_editing'
  | 'section_editing'
  | 'cursor_move'
  | 'comment_added';

export interface CollaborationEvent {
  id: string;
  type: CollaborationEventType;
  userId: string;
  userName: string;
  timestamp: string;
  pageId?: string;
  sectionId?: string;
  metadata?: Record<string, any>;
}

// Mock collaborators
const MOCK_COLLABORATORS: CollaboratorUser[] = [
  {
    id: 'user-1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    color: '#3b82f6',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    currentPageId: undefined
  },
  {
    id: 'user-2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    color: '#10b981',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    currentPageId: undefined
  },
  {
    id: 'user-3',
    name: 'Carol Williams',
    email: 'carol@example.com',
    color: '#f59e0b',
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    currentPageId: undefined
  },
  {
    id: 'user-4',
    name: 'David Brown',
    email: 'david@example.com',
    color: '#ef4444',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    currentPageId: undefined
  }
];

// Storage keys
const COLLABORATORS_KEY = 'greenfield_collaborators';
const EVENTS_KEY = 'greenfield_collaboration_events';

// Initialize mock collaborators
export function initializeCollaborators(): CollaboratorUser[] {
  try {
    const data = localStorage.getItem(COLLABORATORS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    // Initialize with mock data
    saveCollaborators(MOCK_COLLABORATORS);
    return MOCK_COLLABORATORS;
  } catch (error) {
    console.error('Failed to initialize collaborators:', error);
    return MOCK_COLLABORATORS;
  }
}

// Save collaborators
export function saveCollaborators(collaborators: CollaboratorUser[]): void {
  try {
    localStorage.setItem(COLLABORATORS_KEY, JSON.stringify(collaborators));
  } catch (error) {
    console.error('Failed to save collaborators:', error);
  }
}

// Get all collaborators
export function getCollaborators(): CollaboratorUser[] {
  return initializeCollaborators();
}

// Get online collaborators
export function getOnlineCollaborators(): CollaboratorUser[] {
  return getCollaborators().filter(c => c.isOnline);
}

// Get collaborator by ID
export function getCollaboratorById(userId: string): CollaboratorUser | null {
  return getCollaborators().find(c => c.id === userId) || null;
}

// Update collaborator status
export function updateCollaboratorStatus(
  userId: string,
  updates: Partial<CollaboratorUser>
): CollaboratorUser | null {
  const collaborators = getCollaborators();
  const index = collaborators.findIndex(c => c.id === userId);
  
  if (index === -1) return null;
  
  collaborators[index] = {
    ...collaborators[index],
    ...updates,
    lastSeen: new Date().toISOString()
  };
  
  saveCollaborators(collaborators);
  return collaborators[index];
}

// Set collaborator online status
export function setCollaboratorOnline(userId: string, isOnline: boolean): void {
  updateCollaboratorStatus(userId, { isOnline });
}

// Set collaborator current page
export function setCollaboratorCurrentPage(userId: string, pageId: string | undefined): void {
  updateCollaboratorStatus(userId, { currentPageId: pageId });
}

// Set collaborator current section
export function setCollaboratorCurrentSection(userId: string, sectionId: string | undefined): void {
  updateCollaboratorStatus(userId, { currentSectionId: sectionId });
}

// Get collaborators viewing a page
export function getCollaboratorsViewingPage(pageId: string): CollaboratorUser[] {
  return getOnlineCollaborators().filter(c => c.currentPageId === pageId);
}

// Get collaborators editing a section
export function getCollaboratorsEditingSection(sectionId: string): CollaboratorUser[] {
  return getOnlineCollaborators().filter(c => c.currentSectionId === sectionId);
}

// Collaboration events
export function getCollaborationEvents(): CollaborationEvent[] {
  try {
    const data = localStorage.getItem(EVENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load collaboration events:', error);
    return [];
  }
}

export function saveCollaborationEvents(events: CollaborationEvent[]): void {
  try {
    // Keep only last 500 events
    const trimmed = events.slice(0, 500);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save collaboration events:', error);
  }
}

export function addCollaborationEvent(
  event: Omit<CollaborationEvent, 'id' | 'timestamp'>
): CollaborationEvent {
  const events = getCollaborationEvents();
  const newEvent: CollaborationEvent = {
    ...event,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString()
  };
  
  events.unshift(newEvent);
  saveCollaborationEvents(events);
  
  return newEvent;
}

// Simulate user joining
export function simulateUserJoin(userId: string): CollaborationEvent {
  const user = getCollaboratorById(userId);
  if (!user) throw new Error('User not found');
  
  setCollaboratorOnline(userId, true);
  
  return addCollaborationEvent({
    type: 'user_joined',
    userId: user.id,
    userName: user.name
  });
}

// Simulate user leaving
export function simulateUserLeave(userId: string): CollaborationEvent {
  const user = getCollaboratorById(userId);
  if (!user) throw new Error('User not found');
  
  setCollaboratorOnline(userId, false);
  setCollaboratorCurrentPage(userId, undefined);
  setCollaboratorCurrentSection(userId, undefined);
  
  return addCollaborationEvent({
    type: 'user_left',
    userId: user.id,
    userName: user.name
  });
}

// Simulate page viewing
export function simulatePageViewing(userId: string, pageId: string): CollaborationEvent {
  const user = getCollaboratorById(userId);
  if (!user) throw new Error('User not found');
  
  setCollaboratorCurrentPage(userId, pageId);
  
  return addCollaborationEvent({
    type: 'page_viewing',
    userId: user.id,
    userName: user.name,
    pageId
  });
}

// Simulate page editing
export function simulatePageEditing(userId: string, pageId: string): CollaborationEvent {
  const user = getCollaboratorById(userId);
  if (!user) throw new Error('User not found');
  
  setCollaboratorCurrentPage(userId, pageId);
  
  return addCollaborationEvent({
    type: 'page_editing',
    userId: user.id,
    userName: user.name,
    pageId
  });
}

// Simulate section editing
export function simulateSectionEditing(
  userId: string,
  pageId: string,
  sectionId: string
): CollaborationEvent {
  const user = getCollaboratorById(userId);
  if (!user) throw new Error('User not found');
  
  setCollaboratorCurrentPage(userId, pageId);
  setCollaboratorCurrentSection(userId, sectionId);
  
  return addCollaborationEvent({
    type: 'section_editing',
    userId: user.id,
    userName: user.name,
    pageId,
    sectionId
  });
}

// Get recent collaboration events
export function getRecentCollaborationEvents(limit: number = 50): CollaborationEvent[] {
  return getCollaborationEvents().slice(0, limit);
}

// Get collaboration events for a page
export function getCollaborationEventsForPage(pageId: string): CollaborationEvent[] {
  return getCollaborationEvents().filter(e => e.pageId === pageId);
}

// Get collaboration events by user
export function getCollaborationEventsByUser(userId: string): CollaborationEvent[] {
  return getCollaborationEvents().filter(e => e.userId === userId);
}

// Clear collaboration events
export function clearCollaborationEvents(): void {
  saveCollaborationEvents([]);
}

// Reset collaborators to initial state
export function resetCollaborators(): void {
  saveCollaborators(MOCK_COLLABORATORS);
  clearCollaborationEvents();
}

// Simulate random collaboration activity
export function simulateRandomActivity(): void {
  const onlineUsers = getOnlineCollaborators();
  if (onlineUsers.length === 0) return;
  
  const randomUser = onlineUsers[Math.floor(Math.random() * onlineUsers.length)];
  const activities: CollaborationEventType[] = [
    'page_viewing',
    'page_editing',
    'section_editing'
  ];
  
  const randomActivity = activities[Math.floor(Math.random() * activities.length)];
  
  // Simulate activity (in real app, this would be triggered by actual user actions)
  switch (randomActivity) {
    case 'page_viewing':
      // Would need a pageId to simulate
      break;
    case 'page_editing':
      // Would need a pageId to simulate
      break;
    case 'section_editing':
      // Would need pageId and sectionId to simulate
      break;
  }
}

// Get collaboration statistics
export function getCollaborationStatistics(): {
  totalCollaborators: number;
  onlineCollaborators: number;
  totalEvents: number;
  eventsByType: Record<string, number>;
  mostActiveUsers: { userId: string; userName: string; count: number }[];
} {
  const collaborators = getCollaborators();
  const events = getCollaborationEvents();
  
  const eventsByType: Record<string, number> = {};
  const userActivity: Record<string, { name: string; count: number }> = {};
  
  events.forEach(event => {
    eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    
    if (!userActivity[event.userId]) {
      userActivity[event.userId] = { name: event.userName, count: 0 };
    }
    userActivity[event.userId].count++;
  });
  
  const mostActiveUsers = Object.entries(userActivity)
    .map(([userId, data]) => ({
      userId,
      userName: data.name,
      count: data.count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return {
    totalCollaborators: collaborators.length,
    onlineCollaborators: collaborators.filter(c => c.isOnline).length,
    totalEvents: events.length,
    eventsByType,
    mostActiveUsers
  };
}

// Format collaboration event for display
export function formatCollaborationEvent(event: CollaborationEvent): string {
  const time = new Date(event.timestamp).toLocaleTimeString();
  
  switch (event.type) {
    case 'user_joined':
      return `${event.userName} joined the session`;
    case 'user_left':
      return `${event.userName} left the session`;
    case 'page_viewing':
      return `${event.userName} is viewing a page`;
    case 'page_editing':
      return `${event.userName} is editing a page`;
    case 'section_editing':
      return `${event.userName} is editing a section`;
    case 'cursor_move':
      return `${event.userName} moved cursor`;
    case 'comment_added':
      return `${event.userName} added a comment`;
    default:
      return `${event.userName} performed an action`;
  }
}
