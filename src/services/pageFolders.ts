import { PageFolder, Page } from '../types';
import { v4 as uuid } from 'uuid';

// Create a new page folder
export function createPageFolder(
  name: string,
  description?: string,
  color?: string,
  icon?: string,
  parentId?: string,
  order: number = 0
): PageFolder {
  return {
    id: uuid(),
    name,
    description,
    color: color || '#6366f1',
    icon: icon || '📁',
    parentId,
    order,
    createdAt: new Date().toISOString(),
  };
}

// Get all folders in a project
export function getProjectFolders(folders: PageFolder[]): PageFolder[] {
  return folders.sort((a, b) => a.order - b.order);
}

// Get root folders (no parent)
export function getRootFolders(folders: PageFolder[]): PageFolder[] {
  return folders
    .filter(f => !f.parentId)
    .sort((a, b) => a.order - b.order);
}

// Get child folders
export function getChildFolders(folders: PageFolder[], parentId: string): PageFolder[] {
  return folders
    .filter(f => f.parentId === parentId)
    .sort((a, b) => a.order - b.order);
}

// Get folder by ID
export function getFolderById(folders: PageFolder[], id: string): PageFolder | undefined {
  return folders.find(f => f.id === id);
}

// Get folder hierarchy (breadcrumb)
export function getFolderHierarchy(folders: PageFolder[], folderId: string): PageFolder[] {
  const hierarchy: PageFolder[] = [];
  let current = getFolderById(folders, folderId);
  
  while (current) {
    hierarchy.unshift(current);
    current = current.parentId ? getFolderById(folders, current.parentId) : undefined;
  }
  
  return hierarchy;
}

// Get all pages in a folder
export function getPagesInFolder(pages: Page[], folderId: string): Page[] {
  return pages
    .filter(p => p.folderId === folderId)
    .sort((a, b) => a.order - b.order);
}

// Get all pages not in any folder
export function getUnfolderedPages(pages: Page[]): Page[] {
  return pages
    .filter(p => !p.folderId)
    .sort((a, b) => a.order - b.order);
}

// Move page to folder
export function movePageToFolder(pages: Page[], pageId: string, folderId: string | undefined): Page[] {
  return pages.map(p => 
    p.id === pageId 
      ? { ...p, folderId, lastModified: new Date().toISOString() }
      : p
  );
}

// Move folder
export function moveFolder(folders: PageFolder[], folderId: string, newParentId: string | undefined): PageFolder[] {
  return folders.map(f => 
    f.id === folderId 
      ? { ...f, parentId: newParentId }
      : f
  );
}

// Reorder folders
export function reorderFolders(folders: PageFolder[], folderId: string, newOrder: number): PageFolder[] {
  const folder = folders.find(f => f.id === folderId);
  if (!folder) return folders;

  const sameLevelFolders = folders.filter(f => f.parentId === folder.parentId);
  const otherFolders = folders.filter(f => f.parentId !== folder.parentId);

  // Remove folder from its current position
  const filtered = sameLevelFolders.filter(f => f.id !== folderId);
  
  // Insert at new position
  filtered.splice(newOrder, 0, { ...folder, order: newOrder });
  
  // Update order for all folders at this level
  const reordered = filtered.map((f, index) => ({ ...f, order: index }));
  
  return [...otherFolders, ...reordered];
}

// Reorder pages
export function reorderPages(pages: Page[], pageId: string, newOrder: number): Page[] {
  const page = pages.find(p => p.id === pageId);
  if (!page) return pages;

  const sameFolderPages = pages.filter(p => p.folderId === page.folderId);
  const otherPages = pages.filter(p => p.folderId !== page.folderId);

  // Remove page from its current position
  const filtered = sameFolderPages.filter(p => p.id !== pageId);
  
  // Insert at new position
  filtered.splice(newOrder, 0, { ...page, order: newOrder, lastModified: new Date().toISOString() });
  
  // Update order for all pages in this folder
  const reordered = filtered.map((p, index) => ({ ...p, order: index }));
  
  return [...otherPages, ...reordered];
}

// Delete folder and optionally move pages
export function deleteFolder(
  folders: PageFolder[],
  pages: Page[],
  folderId: string,
  movePagesToRoot: boolean = true
): { folders: PageFolder[]; pages: Page[] } {
  const newFolders = folders.filter(f => f.id !== folderId);
  
  // Move child folders to root
  const updatedFolders = newFolders.map(f => 
    f.parentId === folderId ? { ...f, parentId: undefined } : f
  );
  
  // Move pages to root or delete them
  const updatedPages = movePagesToRoot
    ? pages.map(p => p.folderId === folderId ? { ...p, folderId: undefined } : p)
    : pages.filter(p => p.folderId !== folderId);
  
  return { folders: updatedFolders, pages: updatedPages };
}

// Get folder statistics
export function getFolderStats(folders: PageFolder[], pages: Page[], folderId: string): {
  pageCount: number;
  subfolderCount: number;
  totalPageCount: number;
} {
  const pageCount = pages.filter(p => p.folderId === folderId).length;
  const subfolderCount = folders.filter(f => f.parentId === folderId).length;
  
  // Count all pages in this folder and subfolders recursively
  const getAllPagesInFolder = (fId: string): number => {
    const directPages = pages.filter(p => p.folderId === fId).length;
    const childFolders = folders.filter(f => f.parentId === fId);
    const childPages = childFolders.reduce((sum, cf) => sum + getAllPagesInFolder(cf.id), 0);
    return directPages + childPages;
  };
  
  const totalPageCount = getAllPagesInFolder(folderId);
  
  return { pageCount, subfolderCount, totalPageCount };
}

// Generate folder tree structure
export interface FolderTreeNode {
  folder: PageFolder;
  children: FolderTreeNode[];
  pages: Page[];
}

export function buildFolderTree(folders: PageFolder[], pages: Page[]): FolderTreeNode[] {
  const buildNode = (folder: PageFolder): FolderTreeNode => {
    const children = folders
      .filter(f => f.parentId === folder.id)
      .sort((a, b) => a.order - b.order)
      .map(buildNode);
    
    const folderPages = pages
      .filter(p => p.folderId === folder.id)
      .sort((a, b) => a.order - b.order);
    
    return { folder, children, pages: folderPages };
  };
  
  return folders
    .filter(f => !f.parentId)
    .sort((a, b) => a.order - b.order)
    .map(buildNode);
}
