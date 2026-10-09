// Auto-save service with debouncing

export class AutoSaveManager {
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private debounceMs: number;
  private onSave: () => void;
  private enabled: boolean = true;

  constructor(onSave: () => void, debounceMs: number = 2000) {
    this.onSave = onSave;
    this.debounceMs = debounceMs;
  }

  trigger(): void {
    if (!this.enabled) return;

    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer
    this.debounceTimer = setTimeout(() => {
      this.onSave();
    }, this.debounceMs);
  }

  saveNow(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.onSave();
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  destroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  setDebounceMs(ms: number): void {
    this.debounceMs = ms;
  }
}

// LocalStorage auto-save for project data
export function saveProjectToStorage(projectId: string, data: any): void {
  try {
    const key = `greenfield_project_${projectId}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save project to storage:', error);
  }
}

export function loadProjectFromStorage(projectId: string): any | null {
  try {
    const key = `greenfield_project_${projectId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load project from storage:', error);
    return null;
  }
}

export function clearProjectFromStorage(projectId: string): void {
  try {
    const key = `greenfield_project_${projectId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear project from storage:', error);
  }
}
