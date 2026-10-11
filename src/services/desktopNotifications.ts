// Desktop notification service using Browser Notification API

export interface DesktopNotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  onClick?: () => void;
}

// Check if notifications are supported
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

// Get notification permission status
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  
  if (Notification.permission === 'denied') {
    return 'denied';
  }
  
  const permission = await Notification.requestPermission();
  return permission;
}

// Show desktop notification
export function showDesktopNotification(options: DesktopNotificationOptions): Notification | null {
  if (!isNotificationSupported()) {
    console.warn('Desktop notifications are not supported in this browser');
    return null;
  }
  
  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return null;
  }
  
  const notification = new Notification(options.title, {
    body: options.body,
    icon: options.icon || '/favicon.ico',
    tag: options.tag,
    requireInteraction: options.requireInteraction || false,
    silent: options.silent || false
  });
  
  if (options.onClick) {
    notification.onclick = () => {
      window.focus();
      options.onClick!();
      notification.close();
    };
  }
  
  // Auto-close after 5 seconds if not requiring interaction
  if (!options.requireInteraction) {
    setTimeout(() => {
      notification.close();
    }, 5000);
  }
  
  return notification;
}

// Show page update notification
export function showPageUpdateNotification(
  pageTitle: string,
  action: string,
  onClick?: () => void
): Notification | null {
  return showDesktopNotification({
    title: `Page ${action}`,
    body: `"${pageTitle}" has been ${action.toLowerCase()}`,
    tag: `page-${action}`,
    onClick
  });
}

// Show workflow notification
export function showWorkflowNotification(
  pageTitle: string,
  fromState: string,
  toState: string,
  onClick?: () => void
): Notification | null {
  return showDesktopNotification({
    title: 'Workflow State Changed',
    body: `"${pageTitle}" moved from ${fromState} to ${toState}`,
    tag: 'workflow-change',
    onClick
  });
}

// Show schedule notification
export function showScheduleNotification(
  pageTitle: string,
  event: 'publish' | 'expire',
  timeUntil: string,
  onClick?: () => void
): Notification | null {
  return showDesktopNotification({
    title: event === 'publish' ? 'Scheduled Publication' : 'Scheduled Expiration',
    body: `"${pageTitle}" will ${event} in ${timeUntil}`,
    tag: `schedule-${event}`,
    requireInteraction: true,
    onClick
  });
}

// Show assignment notification
export function showAssignmentNotification(
  pageTitle: string,
  assignedTo: string,
  onClick?: () => void
): Notification | null {
  return showDesktopNotification({
    title: 'Page Assigned',
    body: `"${pageTitle}" has been assigned to ${assignedTo}`,
    tag: 'assignment',
    onClick
  });
}

// Show collaboration notification
export function showCollaborationNotification(
  userName: string,
  action: string,
  pageTitle?: string,
  onClick?: () => void
): Notification | null {
  const body = pageTitle
    ? `${userName} ${action} "${pageTitle}"`
    : `${userName} ${action}`;
  
  return showDesktopNotification({
    title: 'Collaboration Update',
    body,
    tag: 'collaboration',
    onClick
  });
}

// Show error notification
export function showErrorNotification(
  title: string,
  message: string
): Notification | null {
  return showDesktopNotification({
    title: `Error: ${title}`,
    body: message,
    tag: 'error',
    requireInteraction: true
  });
}

// Show success notification
export function showSuccessNotification(
  title: string,
  message: string
): Notification | null {
  return showDesktopNotification({
    title,
    body: message,
    tag: 'success'
  });
}

// Close all notifications
export function closeAllNotifications(): void {
  if (!isNotificationSupported()) return;
  
  // Note: We can't directly access all active notifications
  // This is a limitation of the Notification API
  // Users need to close notifications manually or they auto-close
}

// Check if notifications are enabled
export function areNotificationsEnabled(): boolean {
  return isNotificationSupported() && Notification.permission === 'granted';
}

// Get notification permission status as string
export function getNotificationPermissionStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Show permission request dialog
export async function showPermissionRequestDialog(): Promise<boolean> {
  if (!isNotificationSupported()) {
    alert('Desktop notifications are not supported in your browser');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission === 'denied') {
    alert('Notifications are blocked. Please enable them in your browser settings.');
    return false;
  }
  
  const permission = await requestNotificationPermission();
  return permission === 'granted';
}

// Test notification
export function testNotification(): void {
  showDesktopNotification({
    title: 'Test Notification',
    body: 'If you can see this, notifications are working!',
    tag: 'test'
  });
}

// Notification sound (optional)
export function playNotificationSound(): void {
  // Create a simple beep sound using Web Audio API
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.warn('Failed to play notification sound:', error);
  }
}
