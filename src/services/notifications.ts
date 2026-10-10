import { Page } from '../types';

// Notification types
export type NotificationType = 
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'schedule'
  | 'workflow'
  | 'assignment';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  pageId?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  enabled: boolean;
  types: NotificationType[];
  soundEnabled: boolean;
  desktopNotifications: boolean;
}

// Default notification preferences
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  types: ['info', 'success', 'warning', 'error', 'schedule', 'workflow', 'assignment'],
  soundEnabled: false,
  desktopNotifications: false
};

// Storage keys
const NOTIFICATIONS_STORAGE_KEY = 'greenfield_notifications';
const PREFERENCES_STORAGE_KEY = 'greenfield_notification_preferences';

// Get all notifications
export function getNotifications(): Notification[] {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load notifications:', error);
    return [];
  }
}

// Save notifications
export function saveNotifications(notifications: Notification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Failed to save notifications:', error);
  }
}

// Add notification
export function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
  const notifications = getNotifications();
  const newNotification: Notification = {
    ...notification,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    read: false
  };
  
  notifications.unshift(newNotification);
  
  // Keep only last 100 notifications
  const trimmed = notifications.slice(0, 100);
  saveNotifications(trimmed);
  
  return newNotification;
}

// Mark notification as read
export function markAsRead(notificationId: string): void {
  const notifications = getNotifications();
  const updated = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
  saveNotifications(updated);
}

// Mark all notifications as read
export function markAllAsRead(): void {
  const notifications = getNotifications();
  const updated = notifications.map(n => ({ ...n, read: true }));
  saveNotifications(updated);
}

// Delete notification
export function deleteNotification(notificationId: string): void {
  const notifications = getNotifications();
  const filtered = notifications.filter(n => n.id !== notificationId);
  saveNotifications(filtered);
}

// Clear all notifications
export function clearAllNotifications(): void {
  saveNotifications([]);
}

// Get unread notifications
export function getUnreadNotifications(): Notification[] {
  return getNotifications().filter(n => !n.read);
}

// Get unread count
export function getUnreadCount(): number {
  return getUnreadNotifications().length;
}

// Get notifications by type
export function getNotificationsByType(type: NotificationType): Notification[] {
  return getNotifications().filter(n => n.type === type);
}

// Get notifications for page
export function getNotificationsForPage(pageId: string): Notification[] {
  return getNotifications().filter(n => n.pageId === pageId);
}

// Get notification preferences
export function getNotificationPreferences(): NotificationPreferences {
  try {
    const data = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_NOTIFICATION_PREFERENCES;
  } catch (error) {
    console.error('Failed to load notification preferences:', error);
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

// Save notification preferences
export function saveNotificationPreferences(preferences: NotificationPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save notification preferences:', error);
  }
}

// Create schedule notification
export function createScheduleNotification(
  page: Page,
  event: 'publish' | 'expire',
  scheduledDate: Date
): Notification {
  const now = new Date();
  const timeUntil = scheduledDate.getTime() - now.getTime();
  const hoursUntil = Math.floor(timeUntil / 3600000);
  
  let message = '';
  if (hoursUntil < 1) {
    message = `Page "${page.title}" will ${event} in less than an hour`;
  } else if (hoursUntil < 24) {
    message = `Page "${page.title}" will ${event} in ${hoursUntil} hours`;
  } else {
    const daysUntil = Math.floor(hoursUntil / 24);
    message = `Page "${page.title}" will ${event} in ${daysUntil} days`;
  }
  
  return addNotification({
    type: 'schedule',
    title: event === 'publish' ? 'Scheduled Publication' : 'Scheduled Expiration',
    message,
    pageId: page.id,
    metadata: {
      event,
      scheduledDate: scheduledDate.toISOString(),
      pageTitle: page.title
    }
  });
}

// Create workflow notification
export function createWorkflowNotification(
  page: Page,
  fromState: string,
  toState: string,
  changedBy: string
): Notification {
  return addNotification({
    type: 'workflow',
    title: 'Workflow State Changed',
    message: `Page "${page.title}" moved from ${fromState} to ${toState} by ${changedBy}`,
    pageId: page.id,
    metadata: {
      fromState,
      toState,
      changedBy,
      pageTitle: page.title
    }
  });
}

// Create assignment notification
export function createAssignmentNotification(
  page: Page,
  assignedTo: string,
  assignedBy: string
): Notification {
  return addNotification({
    type: 'assignment',
    title: 'Page Assigned',
    message: `Page "${page.title}" has been assigned to ${assignedTo} by ${assignedBy}`,
    pageId: page.id,
    metadata: {
      assignedTo,
      assignedBy,
      pageTitle: page.title
    }
  });
}

// Create info notification
export function createInfoNotification(title: string, message: string, pageId?: string): Notification {
  return addNotification({
    type: 'info',
    title,
    message,
    pageId
  });
}

// Create success notification
export function createSuccessNotification(title: string, message: string, pageId?: string): Notification {
  return addNotification({
    type: 'success',
    title,
    message,
    pageId
  });
}

// Create warning notification
export function createWarningNotification(title: string, message: string, pageId?: string): Notification {
  return addNotification({
    type: 'warning',
    title,
    message,
    pageId
  });
}

// Create error notification
export function createErrorNotification(title: string, message: string, pageId?: string): Notification {
  return addNotification({
    type: 'error',
    title,
    message,
    pageId
  });
}

// Check for upcoming scheduled events
export function checkUpcomingScheduledEvents(pages: Page[]): void {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 3600000); // 1 hour
  
  pages.forEach(page => {
    // Check for upcoming publications
    if (page.scheduledPublishAt) {
      const publishDate = new Date(page.scheduledPublishAt);
      if (publishDate > now && publishDate <= oneHourFromNow) {
        // Check if we already sent a notification for this
        const existing = getNotifications().find(n => 
          n.pageId === page.id && 
          n.metadata?.event === 'publish' &&
          n.metadata?.scheduledDate === page.scheduledPublishAt
        );
        
        if (!existing) {
          createScheduleNotification(page, 'publish', publishDate);
        }
      }
    }
    
    // Check for upcoming expirations
    if (page.scheduledExpireAt) {
      const expireDate = new Date(page.scheduledExpireAt);
      if (expireDate > now && expireDate <= oneHourFromNow) {
        // Check if we already sent a notification for this
        const existing = getNotifications().find(n => 
          n.pageId === page.id && 
          n.metadata?.event === 'expire' &&
          n.metadata?.scheduledDate === page.scheduledExpireAt
        );
        
        if (!existing) {
          createScheduleNotification(page, 'expire', expireDate);
        }
      }
    }
  });
}

// Get notification icon
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'info':
      return 'ℹ️';
    case 'success':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'error':
      return '❌';
    case 'schedule':
      return '⏰';
    case 'workflow':
      return '🔄';
    case 'assignment':
      return '👤';
    default:
      return '📢';
  }
}

// Get notification color
export function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case 'info':
      return 'bg-blue-50 border-blue-200 text-blue-800';
    case 'success':
      return 'bg-green-50 border-green-200 text-green-800';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    case 'error':
      return 'bg-red-50 border-red-200 text-red-800';
    case 'schedule':
      return 'bg-purple-50 border-purple-200 text-purple-800';
    case 'workflow':
      return 'bg-indigo-50 border-indigo-200 text-indigo-800';
    case 'assignment':
      return 'bg-pink-50 border-pink-200 text-pink-800';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800';
  }
}

// Format notification time
export function formatNotificationTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}
