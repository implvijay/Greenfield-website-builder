import { ComponentInstance } from '../types';

export interface ClipboardData {
  component: ComponentInstance;
  timestamp: number;
}

export interface ClipboardHistoryItem {
  component: ComponentInstance;
  timestamp: number;
  id: string;
}

const CLIPBOARD_KEY = 'greenfield_component_clipboard';
const CLIPBOARD_HISTORY_KEY = 'greenfield_component_clipboard_history';
const MAX_HISTORY_ITEMS = 5;

export function copyComponentToClipboard(component: ComponentInstance): void {
  const data: ClipboardData = {
    component: JSON.parse(JSON.stringify(component)),
    timestamp: Date.now(),
  };
  localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(data));
  
  // Add to history
  addToClipboardHistory(component);
}

export function pasteComponentFromClipboard(): ComponentInstance | null {
  try {
    const data = localStorage.getItem(CLIPBOARD_KEY);
    if (!data) return null;
    
    const parsed: ClipboardData = JSON.parse(data);
    // Create a new instance with a new ID
    return {
      ...parsed.component,
      id: crypto.randomUUID(),
    };
  } catch {
    return null;
  }
}

export function hasClipboardContent(): boolean {
  return localStorage.getItem(CLIPBOARD_KEY) !== null;
}

export function clearClipboard(): void {
  localStorage.removeItem(CLIPBOARD_KEY);
}

// Clipboard History Functions
export function getClipboardHistory(): ClipboardHistoryItem[] {
  try {
    const data = localStorage.getItem(CLIPBOARD_HISTORY_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function addToClipboardHistory(component: ComponentInstance): void {
  const history = getClipboardHistory();
  const newItem: ClipboardHistoryItem = {
    component: JSON.parse(JSON.stringify(component)),
    timestamp: Date.now(),
    id: crypto.randomUUID(),
  };
  
  // Add to beginning of history
  history.unshift(newItem);
  
  // Keep only last MAX_HISTORY_ITEMS
  const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);
  
  localStorage.setItem(CLIPBOARD_HISTORY_KEY, JSON.stringify(trimmedHistory));
}

export function pasteFromHistory(index: number): ComponentInstance | null {
  const history = getClipboardHistory();
  if (index < 0 || index >= history.length) return null;
  
  const item = history[index];
  return {
    ...item.component,
    id: crypto.randomUUID(),
  };
}

export function clearClipboardHistory(): void {
  localStorage.removeItem(CLIPBOARD_HISTORY_KEY);
}
