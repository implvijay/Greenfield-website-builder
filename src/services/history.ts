// Undo/Redo system for builder operations

import { Page, Section } from '../types';

export interface HistoryState {
  pages: Page[];
  timestamp: number;
  action: string;
}

export class HistoryManager {
  private history: HistoryState[] = [];
  private currentIndex = -1;
  private maxSize = 50;

  constructor(initialState: Page[]) {
    this.push(initialState, 'Initial state');
  }

  push(pages: Page[], action: string): void {
    // Remove any future states if we're not at the end
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add new state
    this.history.push({
      pages: JSON.parse(JSON.stringify(pages)),
      timestamp: Date.now(),
      action,
    });

    // Enforce max size
    if (this.history.length > this.maxSize) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  undo(): Page[] | null {
    if (!this.canUndo()) return null;
    this.currentIndex--;
    return JSON.parse(JSON.stringify(this.history[this.currentIndex].pages));
  }

  redo(): Page[] | null {
    if (!this.canRedo()) return null;
    this.currentIndex++;
    return JSON.parse(JSON.stringify(this.history[this.currentIndex].pages));
  }

  getCurrentAction(): string {
    if (this.currentIndex < 0) return '';
    return this.history[this.currentIndex].action;
  }

  getHistory(): { action: string; timestamp: number }[] {
    return this.history.map((h) => ({
      action: h.action,
      timestamp: h.timestamp,
    }));
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }
}
