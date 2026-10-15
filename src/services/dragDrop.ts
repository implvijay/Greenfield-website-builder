import { Page, PageFolder } from '../types';

// Drag and drop types
export interface DragItem {
  type: 'page' | 'folder';
  id: string;
  data: Page | PageFolder;
}

export interface DropResult {
  targetId: string | null; // null means root level
  targetType: 'folder' | 'root';
  position: number;
}

// Reorder pages within a folder
export function reorderPagesInFolder(
  pages: Page[],
  pageId: string,
  newOrder: number,
  folderId: string | undefined
): Page[] {
  const folderPages = pages.filter(p => p.folderId === folderId);
  const otherPages = pages.filter(p => p.folderId !== folderId);
  
  const page = folderPages.find(p => p.id === pageId);
  if (!page) return pages;
  
  // Remove from current position
  const withoutPage = folderPages.filter(p => p.id !== pageId);
  
  // Insert at new position
  withoutPage.splice(newOrder, 0, page);
  
  // Update order for all pages in folder
  const reordered = withoutPage.map((p, index) => ({
    ...p,
    order: index,
    lastModified: new Date().toISOString()
  }));
  
  return [...otherPages, ...reordered];
}

// Move page to different folder
export function movePageToFolder(
  pages: Page[],
  pageId: string,
  targetFolderId: string | undefined
): Page[] {
  return pages.map(p => {
    if (p.id === pageId) {
      return {
        ...p,
        folderId: targetFolderId,
        lastModified: new Date().toISOString()
      };
    }
    return p;
  });
}

// Reorder folders at same level
export function reorderFolders(
  folders: PageFolder[],
  folderId: string,
  newOrder: number
): PageFolder[] {
  const folder = folders.find(f => f.id === folderId);
  if (!folder) return folders;
  
  const sameLevelFolders = folders.filter(f => f.parentId === folder.parentId);
  const otherFolders = folders.filter(f => f.parentId !== folder.parentId);
  
  // Remove from current position
  const withoutFolder = sameLevelFolders.filter(f => f.id !== folderId);
  
  // Insert at new position
  withoutFolder.splice(newOrder, 0, folder);
  
  // Update order for all folders at this level
  const reordered = withoutFolder.map((f, index) => ({
    ...f,
    order: index
  }));
  
  return [...otherFolders, ...reordered];
}

// Move folder to different parent
export function moveFolderToParent(
  folders: PageFolder[],
  folderId: string,
  targetParentId: string | undefined
): PageFolder[] {
  // Prevent moving folder into itself or its children
  const folder = folders.find(f => f.id === folderId);
  if (!folder) return folders;
  
  if (targetParentId === folderId) return folders;
  
  // Check if target is a descendant
  const isDescendant = (parentId: string | undefined, targetId: string): boolean => {
    if (!parentId) return false;
    if (parentId === targetId) return true;
    const parent = folders.find(f => f.id === parentId);
    if (!parent || !parent.parentId) return false;
    return isDescendant(parent.parentId, targetId);
  };
  
  if (targetParentId && isDescendant(targetParentId, folderId)) {
    return folders; // Can't move into descendant
  }
  
  return folders.map(f => {
    if (f.id === folderId) {
      return {
        ...f,
        parentId: targetParentId
      };
    }
    return f;
  });
}

// Calculate drop position
export function calculateDropPosition(
  mouseY: number,
  itemTop: number,
  itemHeight: number
): 'before' | 'after' {
  const itemCenter = itemTop + itemHeight / 2;
  return mouseY < itemCenter ? 'before' : 'after';
}

// Validate drop target
export function isValidDropTarget(
  dragItem: DragItem,
  dropTargetId: string | null,
  dropTargetType: 'folder' | 'root',
  folders: PageFolder[]
): boolean {
  // Can't drop on itself
  if (dragItem.id === dropTargetId) return false;
  
  // Pages can only be dropped into folders or root
  if (dragItem.type === 'page') {
    return dropTargetType === 'folder' || dropTargetType === 'root';
  }
  
  // Folders can only be dropped into other folders or root
  if (dragItem.type === 'folder') {
    if (dropTargetType === 'root') return true;
    if (dropTargetType === 'folder' && dropTargetId) {
      // Check if not dropping into descendant
      const folder = folders.find(f => f.id === dragItem.id);
      if (!folder) return false;
      
      const isDescendant = (parentId: string | undefined, targetId: string): boolean => {
        if (!parentId) return false;
        if (parentId === targetId) return true;
        const parent = folders.find(f => f.id === parentId);
        if (!parent || !parent.parentId) return false;
        return isDescendant(parent.parentId, targetId);
      };
      
      return !isDescendant(dropTargetId, dragItem.id);
    }
  }
  
  return false;
}

// Get drop indicator position
export function getDropIndicatorPosition(
  dragItem: DragItem,
  dropTargetId: string | null,
  position: 'before' | 'after'
): { type: 'page' | 'folder'; targetId: string | null; position: 'before' | 'after' } {
  return {
    type: dragItem.type,
    targetId: dropTargetId,
    position
  };
}
