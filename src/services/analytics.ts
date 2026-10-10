import { Page, PageFolder } from '../types';

// Analytics data structures
export interface PageAnalytics {
  totalPages: number;
  publishedPages: number;
  draftPages: number;
  archivedPages: number;
  scheduledPages: number;
  averageSectionsPerPage: number;
  pagesByType: Record<string, number>;
  pagesByStatus: Record<string, number>;
  recentPages: Page[];
  mostTaggedPages: Page[];
}

export interface FolderAnalytics {
  totalFolders: number;
  rootFolders: number;
  nestedFolders: number;
  pagesPerFolder: Record<string, number>;
  emptyFolders: string[];
  largestFolders: { folderId: string; count: number }[];
}

export interface TagAnalytics {
  totalTags: number;
  tagUsage: Record<string, number>;
  mostUsedTags: { tag: string; count: number }[];
  unusedTags: string[];
  averageTagsPerPage: number;
}

export interface ScheduleAnalytics {
  scheduledPublish: number;
  scheduledExpire: number;
  upcomingEvents: { page: Page; event: 'publish' | 'expire'; date: Date }[];
  recentlyPublished: Page[];
  recentlyExpired: Page[];
}

export interface ProjectAnalytics {
  pages: PageAnalytics;
  folders: FolderAnalytics;
  tags: TagAnalytics;
  schedule: ScheduleAnalytics;
  lastUpdated: string;
}

// Calculate page analytics
export function calculatePageAnalytics(pages: Page[]): PageAnalytics {
  const now = new Date();
  
  const publishedPages = pages.filter(p => p.status === 'published').length;
  const draftPages = pages.filter(p => p.status === 'draft').length;
  const archivedPages = pages.filter(p => p.status === 'archived').length;
  const scheduledPages = pages.filter(p => 
    (p.scheduledPublishAt && new Date(p.scheduledPublishAt) > now) ||
    (p.scheduledExpireAt && new Date(p.scheduledExpireAt) > now)
  ).length;
  
  const totalSections = pages.reduce((sum, p) => sum + p.sections.length, 0);
  const averageSectionsPerPage = pages.length > 0 ? totalSections / pages.length : 0;
  
  const pagesByType: Record<string, number> = {};
  const pagesByStatus: Record<string, number> = {
    published: publishedPages,
    draft: draftPages,
    archived: archivedPages
  };
  
  pages.forEach(p => {
    pagesByType[p.type] = (pagesByType[p.type] || 0) + 1;
  });
  
  const recentPages = [...pages]
    .sort((a, b) => new Date(b.lastModified || 0).getTime() - 
                    new Date(a.lastModified || 0).getTime())
    .slice(0, 10);
  
  const mostTaggedPages = [...pages]
    .filter(p => p.tags && p.tags.length > 0)
    .sort((a, b) => (b.tags?.length || 0) - (a.tags?.length || 0))
    .slice(0, 10);
  
  return {
    totalPages: pages.length,
    publishedPages,
    draftPages,
    archivedPages,
    scheduledPages,
    averageSectionsPerPage,
    pagesByType,
    pagesByStatus,
    recentPages,
    mostTaggedPages
  };
}

// Calculate folder analytics
export function calculateFolderAnalytics(pages: Page[], folders: PageFolder[]): FolderAnalytics {
  const rootFolders = folders.filter(f => !f.parentId).length;
  const nestedFolders = folders.filter(f => f.parentId).length;
  
  const pagesPerFolder: Record<string, number> = {};
  folders.forEach(f => {
    pagesPerFolder[f.id] = pages.filter(p => p.folderId === f.id).length;
  });
  
  const emptyFolders = folders
    .filter(f => pagesPerFolder[f.id] === 0)
    .map(f => f.id);
  
  const largestFolders = Object.entries(pagesPerFolder)
    .map(([folderId, count]) => ({ folderId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return {
    totalFolders: folders.length,
    rootFolders,
    nestedFolders,
    pagesPerFolder,
    emptyFolders,
    largestFolders
  };
}

// Calculate tag analytics
export function calculateTagAnalytics(pages: Page[]): TagAnalytics {
  const tagUsage: Record<string, number> = {};
  let totalTags = 0;
  
  pages.forEach(p => {
    if (p.tags) {
      p.tags.forEach(tag => {
        tagUsage[tag] = (tagUsage[tag] || 0) + 1;
        totalTags++;
      });
    }
  });
  
  const uniqueTags = Object.keys(tagUsage);
  
  const mostUsedTags = Object.entries(tagUsage)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
  
  const unusedTags = uniqueTags.filter(tag => tagUsage[tag] === 0);
  
  const averageTagsPerPage = pages.length > 0 ? totalTags / pages.length : 0;
  
  return {
    totalTags: uniqueTags.length,
    tagUsage,
    mostUsedTags,
    unusedTags,
    averageTagsPerPage
  };
}

// Calculate schedule analytics
export function calculateScheduleAnalytics(pages: Page[]): ScheduleAnalytics {
  const now = new Date();
  
  const scheduledPublish = pages.filter(p => 
    p.scheduledPublishAt && new Date(p.scheduledPublishAt) > now
  ).length;
  
  const scheduledExpire = pages.filter(p => 
    p.scheduledExpireAt && new Date(p.scheduledExpireAt) > now
  ).length;
  
  const upcomingEvents: { page: Page; event: 'publish' | 'expire'; date: Date }[] = [];
  
  pages.forEach(p => {
    if (p.scheduledPublishAt) {
      const publishDate = new Date(p.scheduledPublishAt);
      if (publishDate > now) {
        upcomingEvents.push({ page: p, event: 'publish', date: publishDate });
      }
    }
    if (p.scheduledExpireAt) {
      const expireDate = new Date(p.scheduledExpireAt);
      if (expireDate > now) {
        upcomingEvents.push({ page: p, event: 'expire', date: expireDate });
      }
    }
  });
  
  upcomingEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  const recentlyPublished = pages
    .filter(p => p.status === 'published' && p.lastModified)
    .sort((a, b) => new Date(b.lastModified!).getTime() - new Date(a.lastModified!).getTime())
    .slice(0, 10);
  
  const recentlyExpired = pages
    .filter(p => p.status === 'archived' && p.lastModified)
    .sort((a, b) => new Date(b.lastModified!).getTime() - new Date(a.lastModified!).getTime())
    .slice(0, 10);
  
  return {
    scheduledPublish,
    scheduledExpire,
    upcomingEvents: upcomingEvents.slice(0, 20),
    recentlyPublished,
    recentlyExpired
  };
}

// Calculate complete project analytics
export function calculateProjectAnalytics(
  pages: Page[],
  folders: PageFolder[]
): ProjectAnalytics {
  return {
    pages: calculatePageAnalytics(pages),
    folders: calculateFolderAnalytics(pages, folders),
    tags: calculateTagAnalytics(pages),
    schedule: calculateScheduleAnalytics(pages),
    lastUpdated: new Date().toISOString()
  };
}

// Format number with commas
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

// Format percentage
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

// Format date for display
export function formatDateForAnalytics(date: Date): string {
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

// Get analytics summary
export function getAnalyticsSummary(analytics: ProjectAnalytics): {
  keyMetrics: { label: string; value: string; trend?: 'up' | 'down' | 'neutral' }[];
  insights: string[];
} {
  const keyMetrics = [
    {
      label: 'Total Pages',
      value: formatNumber(analytics.pages.totalPages),
      trend: 'neutral' as const
    },
    {
      label: 'Published',
      value: formatNumber(analytics.pages.publishedPages),
      trend: 'up' as const
    },
    {
      label: 'Drafts',
      value: formatNumber(analytics.pages.draftPages),
      trend: 'neutral' as const
    },
    {
      label: 'Folders',
      value: formatNumber(analytics.folders.totalFolders),
      trend: 'neutral' as const
    },
    {
      label: 'Tags',
      value: formatNumber(analytics.tags.totalTags),
      trend: 'up' as const
    },
    {
      label: 'Scheduled',
      value: formatNumber(analytics.schedule.scheduledPublish + analytics.schedule.scheduledExpire),
      trend: 'neutral' as const
    }
  ];
  
  const insights: string[] = [];
  
  // Generate insights
  if (analytics.pages.averageSectionsPerPage < 3) {
    insights.push('Pages have few sections on average. Consider adding more content.');
  }
  
  if (analytics.folders.emptyFolders.length > 0) {
    insights.push(`${analytics.folders.emptyFolders.length} folder(s) are empty.`);
  }
  
  if (analytics.tags.unusedTags.length > 0) {
    insights.push(`${analytics.tags.unusedTags.length} tag(s) are not being used.`);
  }
  
  if (analytics.schedule.upcomingEvents.length > 0) {
    const nextEvent = analytics.schedule.upcomingEvents[0];
    const timeUntil = nextEvent.date.getTime() - new Date().getTime();
    const hoursUntil = Math.floor(timeUntil / 3600000);
    
    if (hoursUntil < 24) {
      insights.push(`Page "${nextEvent.page.title}" will ${nextEvent.event} in ${hoursUntil} hours.`);
    }
  }
  
  const publishedPercentage = (analytics.pages.publishedPages / analytics.pages.totalPages) * 100;
  if (publishedPercentage > 80) {
    insights.push('Great! Most pages are published.');
  } else if (publishedPercentage < 50) {
    insights.push('Many pages are still in draft. Consider publishing more content.');
  }
  
  if (analytics.tags.averageTagsPerPage > 5) {
    insights.push('Pages are well-tagged for organization.');
  } else if (analytics.tags.averageTagsPerPage < 1) {
    insights.push('Consider adding tags to pages for better organization.');
  }
  
  return { keyMetrics, insights };
}
