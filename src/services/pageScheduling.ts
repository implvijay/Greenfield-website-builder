import { Page } from '../types';

// Schedule page publication
export function schedulePagePublish(pages: Page[], pageId: string, publishAt: string): Page[] {
  return pages.map(p => 
    p.id === pageId 
      ? { ...p, scheduledPublishAt: publishAt, lastModified: new Date().toISOString() }
      : p
  );
}

// Schedule page expiration
export function schedulePageExpire(pages: Page[], pageId: string, expireAt: string): Page[] {
  return pages.map(p => 
    p.id === pageId 
      ? { ...p, scheduledExpireAt: expireAt, lastModified: new Date().toISOString() }
      : p
  );
}

// Clear scheduled publish
export function clearScheduledPublish(pages: Page[], pageId: string): Page[] {
  return pages.map(p => 
    p.id === pageId 
      ? { ...p, scheduledPublishAt: undefined, lastModified: new Date().toISOString() }
      : p
  );
}

// Clear scheduled expiration
export function clearScheduledExpire(pages: Page[], pageId: string): Page[] {
  return pages.map(p => 
    p.id === pageId 
      ? { ...p, scheduledExpireAt: undefined, lastModified: new Date().toISOString() }
      : p
  );
}

// Clear all schedules
export function clearAllSchedules(pages: Page[], pageId: string): Page[] {
  return pages.map(p => 
    p.id === pageId 
      ? { ...p, scheduledPublishAt: undefined, scheduledExpireAt: undefined, lastModified: new Date().toISOString() }
      : p
  );
}

// Get pages scheduled to publish
export function getScheduledPublishPages(pages: Page[]): Page[] {
  const now = new Date().toISOString();
  return pages.filter(p => 
    p.scheduledPublishAt && p.scheduledPublishAt > now && p.status === 'draft'
  );
}

// Get pages scheduled to expire
export function getScheduledExpirePages(pages: Page[]): Page[] {
  const now = new Date().toISOString();
  return pages.filter(p => 
    p.scheduledExpireAt && p.scheduledExpireAt > now && p.status === 'published'
  );
}

// Get pages that should be published now
export function getPagesToPublish(pages: Page[]): Page[] {
  const now = new Date().toISOString();
  return pages.filter(p => 
    p.scheduledPublishAt && 
    p.scheduledPublishAt <= now && 
    p.status === 'draft'
  );
}

// Get pages that should be expired now
export function getPagesToExpire(pages: Page[]): Page[] {
  const now = new Date().toISOString();
  return pages.filter(p => 
    p.scheduledExpireAt && 
    p.scheduledExpireAt <= now && 
    p.status === 'published'
  );
}

// Process scheduled pages (publish/expire)
export function processScheduledPages(pages: Page[]): { pages: Page[]; published: string[]; expired: string[] } {
  const now = new Date().toISOString();
  const published: string[] = [];
  const expired: string[] = [];
  
  const updatedPages = pages.map(p => {
    // Publish if scheduled time has passed
    if (p.scheduledPublishAt && p.scheduledPublishAt <= now && p.status === 'draft') {
      published.push(p.id);
      return { 
        ...p, 
        status: 'published' as const, 
        scheduledPublishAt: undefined,
        lastModified: now 
      };
    }
    
    // Expire if scheduled time has passed
    if (p.scheduledExpireAt && p.scheduledExpireAt <= now && p.status === 'published') {
      expired.push(p.id);
      return { 
        ...p, 
        status: 'archived' as const, 
        scheduledExpireAt: undefined,
        lastModified: now 
      };
    }
    
    return p;
  });
  
  return { pages: updatedPages, published, expired };
}

// Get schedule status for a page
export function getPageScheduleStatus(page: Page): {
  hasPublishSchedule: boolean;
  hasExpireSchedule: boolean;
  publishStatus: 'scheduled' | 'past' | 'none';
  expireStatus: 'scheduled' | 'past' | 'none';
  timeUntilPublish?: number;
  timeUntilExpire?: number;
} {
  const now = new Date().getTime();
  
  const hasPublishSchedule = !!page.scheduledPublishAt;
  const hasExpireSchedule = !!page.scheduledExpireAt;
  
  let publishStatus: 'scheduled' | 'past' | 'none' = 'none';
  let expireStatus: 'scheduled' | 'past' | 'none' = 'none';
  let timeUntilPublish: number | undefined;
  let timeUntilExpire: number | undefined;
  
  if (hasPublishSchedule && page.scheduledPublishAt) {
    const publishTime = new Date(page.scheduledPublishAt).getTime();
    timeUntilPublish = publishTime - now;
    publishStatus = timeUntilPublish > 0 ? 'scheduled' : 'past';
  }
  
  if (hasExpireSchedule && page.scheduledExpireAt) {
    const expireTime = new Date(page.scheduledExpireAt).getTime();
    timeUntilExpire = expireTime - now;
    expireStatus = timeUntilExpire > 0 ? 'scheduled' : 'past';
  }
  
  return {
    hasPublishSchedule,
    hasExpireSchedule,
    publishStatus,
    expireStatus,
    timeUntilPublish,
    timeUntilExpire,
  };
}

// Format time until event
export function formatTimeUntil(milliseconds: number): string {
  if (milliseconds <= 0) return 'Now';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  return `${seconds} second${seconds > 1 ? 's' : ''}`;
}

// Validate schedule date
export function isValidScheduleDate(date: string): boolean {
  if (!date) return false;
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}

// Check if date is in the past
export function isDateInPast(date: string): boolean {
  const parsed = new Date(date);
  return parsed.getTime() < new Date().getTime();
}

// Get upcoming scheduled pages
export function getUpcomingScheduledPages(pages: Page[], limit: number = 10): Page[] {
  const now = new Date().getTime();
  
  return pages
    .filter(p => {
      const publishTime = p.scheduledPublishAt ? new Date(p.scheduledPublishAt).getTime() : Infinity;
      const expireTime = p.scheduledExpireAt ? new Date(p.scheduledExpireAt).getTime() : Infinity;
      return publishTime > now || expireTime > now;
    })
    .sort((a, b) => {
      const aTime = Math.min(
        a.scheduledPublishAt ? new Date(a.scheduledPublishAt).getTime() : Infinity,
        a.scheduledExpireAt ? new Date(a.scheduledExpireAt).getTime() : Infinity
      );
      const bTime = Math.min(
        b.scheduledPublishAt ? new Date(b.scheduledPublishAt).getTime() : Infinity,
        b.scheduledExpireAt ? new Date(b.scheduledExpireAt).getTime() : Infinity
      );
      return aTime - bTime;
    })
    .slice(0, limit);
}

// Bulk schedule publish
export function bulkSchedulePublish(pages: Page[], pageIds: string[], publishAt: string): Page[] {
  return pages.map(p => 
    pageIds.includes(p.id)
      ? { ...p, scheduledPublishAt: publishAt, lastModified: new Date().toISOString() }
      : p
  );
}

// Bulk schedule expire
export function bulkScheduleExpire(pages: Page[], pageIds: string[], expireAt: string): Page[] {
  return pages.map(p => 
    pageIds.includes(p.id)
      ? { ...p, scheduledExpireAt: expireAt, lastModified: new Date().toISOString() }
      : p
  );
}
