import { Page } from '../types';

// Add tag to page
export function addTagToPage(pages: Page[], pageId: string, tag: string): Page[] {
  return pages.map(p => {
    if (p.id === pageId) {
      const tags = p.tags || [];
      if (!tags.includes(tag)) {
        return { ...p, tags: [...tags, tag], lastModified: new Date().toISOString() };
      }
    }
    return p;
  });
}

// Remove tag from page
export function removeTagFromPage(pages: Page[], pageId: string, tag: string): Page[] {
  return pages.map(p => {
    if (p.id === pageId) {
      const tags = (p.tags || []).filter(t => t !== tag);
      return { ...p, tags, lastModified: new Date().toISOString() };
    }
    return p;
  });
}

// Set tags for page (replace all tags)
export function setPageTags(pages: Page[], pageId: string, tags: string[]): Page[] {
  return pages.map(p => 
    p.id === pageId 
      ? { ...p, tags, lastModified: new Date().toISOString() }
      : p
  );
}

// Get all unique tags across all pages
export function getAllTags(pages: Page[]): string[] {
  const tagSet = new Set<string>();
  pages.forEach(p => {
    (p.tags || []).forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

// Get pages by tag
export function getPagesByTag(pages: Page[], tag: string): Page[] {
  return pages.filter(p => (p.tags || []).includes(tag));
}

// Get pages by multiple tags (AND logic)
export function getPagesByTags(pages: Page[], tags: string[]): Page[] {
  if (tags.length === 0) return pages;
  return pages.filter(p => {
    const pageTags = p.tags || [];
    return tags.every(tag => pageTags.includes(tag));
  });
}

// Get pages by any tag (OR logic)
export function getPagesByAnyTag(pages: Page[], tags: string[]): Page[] {
  if (tags.length === 0) return pages;
  return pages.filter(p => {
    const pageTags = p.tags || [];
    return tags.some(tag => pageTags.includes(tag));
  });
}

// Get tag statistics
export function getTagStats(pages: Page[]): Map<string, number> {
  const stats = new Map<string, number>();
  pages.forEach(p => {
    (p.tags || []).forEach(tag => {
      stats.set(tag, (stats.get(tag) || 0) + 1);
    });
  });
  return stats;
}

// Bulk add tag to multiple pages
export function bulkAddTag(pages: Page[], pageIds: string[], tag: string): Page[] {
  return pages.map(p => {
    if (pageIds.includes(p.id)) {
      const tags = p.tags || [];
      if (!tags.includes(tag)) {
        return { ...p, tags: [...tags, tag], lastModified: new Date().toISOString() };
      }
    }
    return p;
  });
}

// Bulk remove tag from multiple pages
export function bulkRemoveTag(pages: Page[], pageIds: string[], tag: string): Page[] {
  return pages.map(p => {
    if (pageIds.includes(p.id)) {
      const tags = (p.tags || []).filter(t => t !== tag);
      return { ...p, tags, lastModified: new Date().toISOString() };
    }
    return p;
  });
}

// Rename tag across all pages
export function renameTag(pages: Page[], oldTag: string, newTag: string): Page[] {
  return pages.map(p => {
    const tags = p.tags || [];
    if (tags.includes(oldTag)) {
      const newTags = tags.map(t => t === oldTag ? newTag : t);
      // Remove duplicates
      const uniqueTags = Array.from(new Set(newTags));
      return { ...p, tags: uniqueTags, lastModified: new Date().toISOString() };
    }
    return p;
  });
}

// Delete tag from all pages
export function deleteTagFromAllPages(pages: Page[], tag: string): Page[] {
  return pages.map(p => {
    const tags = (p.tags || []).filter(t => t !== tag);
    if (tags.length !== (p.tags || []).length) {
      return { ...p, tags, lastModified: new Date().toISOString() };
    }
    return p;
  });
}

// Search pages by tag (partial match)
export function searchPagesByTag(pages: Page[], query: string): Page[] {
  if (!query.trim()) return pages;
  const lowerQuery = query.toLowerCase();
  return pages.filter(p => 
    (p.tags || []).some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

// Get suggested tags (tags that appear frequently)
export function getSuggestedTags(pages: Page[], limit: number = 10): string[] {
  const stats = getTagStats(pages);
  return Array.from(stats.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

// Validate tag name
export function isValidTagName(tag: string): boolean {
  if (!tag || tag.trim().length === 0) return false;
  if (tag.length > 50) return false;
  // Allow letters, numbers, spaces, hyphens, and underscores
  return /^[a-zA-Z0-9\s\-_]+$/.test(tag);
}

// Normalize tag name
export function normalizeTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-_]/g, '');
}
