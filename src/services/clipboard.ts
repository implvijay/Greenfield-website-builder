import { ComponentInstance } from '../types';

export interface ClipboardData {
  component: ComponentInstance;
  timestamp: number;
}

const CLIPBOARD_KEY = 'greenfield_component_clipboard';

export function copyComponentToClipboard(component: ComponentInstance): void {
  const data: ClipboardData = {
    component: JSON.parse(JSON.stringify(component)),
    timestamp: Date.now(),
  };
  localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(data));
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
