// Keyboard shortcuts for the builder

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

export class KeyboardShortcutManager {
  private shortcuts: KeyboardShortcut[] = [];
  private enabled = true;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
    }
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (!this.enabled) return;

    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    for (const shortcut of this.shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;

      if (event.key.toLowerCase() === shortcut.key.toLowerCase() && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  }

  register(shortcut: KeyboardShortcut): void {
    this.shortcuts.push(shortcut);
  }

  unregister(key: string): void {
    this.shortcuts = this.shortcuts.filter(s => s.key !== key);
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
    }
    this.shortcuts = [];
  }

  getShortcuts(): KeyboardShortcut[] {
    return this.shortcuts;
  }
}

// Default builder shortcuts
export function createBuilderShortcuts(
  onUndo: () => void,
  onRedo: () => void,
  onSave: () => void,
  onDuplicate: () => void,
  onDelete: () => void,
  onAddSection: () => void,
  onCopy?: () => void,
  onPaste?: () => void,
  onCut?: () => void
): KeyboardShortcut[] {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'z',
      ctrl: true,
      description: 'Undo',
      action: onUndo,
    },
    {
      key: 'z',
      ctrl: true,
      shift: true,
      description: 'Redo',
      action: onRedo,
    },
    {
      key: 'y',
      ctrl: true,
      description: 'Redo (alternative)',
      action: onRedo,
    },
    {
      key: 's',
      ctrl: true,
      description: 'Save project',
      action: onSave,
    },
    {
      key: 'd',
      ctrl: true,
      description: 'Duplicate selected',
      action: onDuplicate,
    },
    {
      key: 'Delete',
      description: 'Delete selected',
      action: onDelete,
    },
    {
      key: 'Backspace',
      description: 'Delete selected',
      action: onDelete,
    },
    {
      key: 'n',
      ctrl: true,
      description: 'Add new section',
      action: onAddSection,
    },
  ];

  // Add clipboard shortcuts if handlers provided
  if (onCopy) {
    shortcuts.push({
      key: 'c',
      ctrl: true,
      description: 'Copy component',
      action: onCopy,
    });
  }

  if (onPaste) {
    shortcuts.push({
      key: 'v',
      ctrl: true,
      description: 'Paste component',
      action: onPaste,
    });
  }

  if (onCut) {
    shortcuts.push({
      key: 'x',
      ctrl: true,
      description: 'Cut component',
      action: onCut,
    });
  }

  return shortcuts;
}
