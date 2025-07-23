/**
 * Keyboard Navigation Module
 * Provides comprehensive keyboard shortcuts for accessibility
 */

export interface KeyboardShortcut {
  key: string;
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  description: string;
  action: () => void;
  category: ShortcutCategory;
}

export type ShortcutCategory = 
  | 'navigation'
  | 'actions'
  | 'editing'
  | 'accessibility'
  | 'help';

class KeyboardNavigationManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private enabled: boolean = true;
  
  constructor() {
    this.setupEventListeners();
  }
  
  /**
   * Register a keyboard shortcut
   */
  registerShortcut(shortcut: KeyboardShortcut): void {
    const key = this.generateShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }
  
  /**
   * Register multiple shortcuts at once
   */
  registerShortcuts(shortcuts: KeyboardShortcut[]): void {
    shortcuts.forEach(shortcut => this.registerShortcut(shortcut));
  }
  
  /**
   * Unregister a keyboard shortcut
   */
  unregisterShortcut(shortcut: Partial<KeyboardShortcut>): void {
    const key = this.generateShortcutKey(shortcut as KeyboardShortcut);
    this.shortcuts.delete(key);
  }
  
  /**
   * Enable/disable keyboard navigation
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  /**
   * Get all registered shortcuts by category
   */
  getShortcutsByCategory(): Map<ShortcutCategory, KeyboardShortcut[]> {
    const categorized = new Map<ShortcutCategory, KeyboardShortcut[]>();
    
    this.shortcuts.forEach(shortcut => {
      const category = shortcut.category;
      if (!categorized.has(category)) {
        categorized.set(category, []);
      }
      categorized.get(category)!.push(shortcut);
    });
    
    return categorized;
  }
  
  /**
   * Generate a unique key for shortcut lookup
   */
  private generateShortcutKey(shortcut: KeyboardShortcut): string {
    const modifiers = shortcut.modifiers || [];
    const sortedModifiers = [...modifiers].sort();
    return `${sortedModifiers.join('+')}+${shortcut.key.toLowerCase()}`;
  }
  
  /**
   * Setup global keyboard event listeners
   */
  private setupEventListeners(): void {
    document.addEventListener('keydown', (event) => {
      if (!this.enabled) return;
      
      // Skip if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (this.isInputElement(target) && !event.ctrlKey && !event.metaKey) {
        return;
      }
      
      const shortcut = this.findMatchingShortcut(event);
      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    });
    
    // Track focus for navigation (if needed in future)
    document.addEventListener('focusin', (_event) => {
      // Currently not tracking active element
    });
  }
  
  /**
   * Check if element is an input field
   */
  private isInputElement(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    return tagName === 'input' || 
           tagName === 'textarea' || 
           tagName === 'select' ||
           element.contentEditable === 'true';
  }
  
  /**
   * Find matching shortcut for keyboard event
   */
  private findMatchingShortcut(event: KeyboardEvent): KeyboardShortcut | null {
    const modifiers: string[] = [];
    if (event.ctrlKey) modifiers.push('ctrl');
    if (event.altKey) modifiers.push('alt');
    if (event.shiftKey) modifiers.push('shift');
    if (event.metaKey) modifiers.push('meta');
    
    const key = `${modifiers.sort().join('+')}+${event.key.toLowerCase()}`;
    return this.shortcuts.get(key) || null;
  }
}

// Create singleton instance
export const keyboardNav = new KeyboardNavigationManager();

/**
 * Default keyboard shortcuts for Clockwork Elite
 */
export const defaultShortcuts: KeyboardShortcut[] = [
  // Navigation
  {
    key: 'Tab',
    description: 'Navigate to next focusable element',
    action: () => navigateToNext(),
    category: 'navigation'
  },
  {
    key: 'Tab',
    modifiers: ['shift'],
    description: 'Navigate to previous focusable element',
    action: () => navigateToPrevious(),
    category: 'navigation'
  },
  {
    key: '/',
    description: 'Focus search/input field',
    action: () => focusMainInput(),
    category: 'navigation'
  },
  {
    key: 'Escape',
    description: 'Close modal/dialog or cancel current action',
    action: () => closeActiveModal(),
    category: 'navigation'
  },
  
  // Actions
  {
    key: 'Enter',
    modifiers: ['ctrl'],
    description: 'Generate output',
    action: () => triggerGenerate(),
    category: 'actions'
  },
  {
    key: 's',
    modifiers: ['ctrl'],
    description: 'Save current work',
    action: () => triggerSave(),
    category: 'actions'
  },
  {
    key: 'n',
    modifiers: ['ctrl'],
    description: 'Create new POC',
    action: () => createNewPOC(),
    category: 'actions'
  },
  {
    key: 'c',
    modifiers: ['ctrl', 'shift'],
    description: 'Copy output to clipboard',
    action: () => copyOutputToClipboard(),
    category: 'actions'
  },
  
  // Editing
  {
    key: 'a',
    modifiers: ['ctrl'],
    description: 'Select all text in focused field',
    action: () => selectAllInFocused(),
    category: 'editing'
  },
  {
    key: 'z',
    modifiers: ['ctrl'],
    description: 'Undo last action',
    action: () => undo(),
    category: 'editing'
  },
  {
    key: 'y',
    modifiers: ['ctrl'],
    description: 'Redo last undone action',
    action: () => redo(),
    category: 'editing'
  },
  
  // Accessibility
  {
    key: '?',
    modifiers: ['shift'],
    description: 'Show keyboard shortcuts help',
    action: () => showKeyboardHelp(),
    category: 'help'
  },
  {
    key: '+',
    modifiers: ['ctrl'],
    description: 'Increase font size',
    action: () => increaseFontSize(),
    category: 'accessibility'
  },
  {
    key: '-',
    modifiers: ['ctrl'],
    description: 'Decrease font size',
    action: () => decreaseFontSize(),
    category: 'accessibility'
  },
  {
    key: '0',
    modifiers: ['ctrl'],
    description: 'Reset font size',
    action: () => resetFontSize(),
    category: 'accessibility'
  }
];

// Navigation helper functions
function navigateToNext(): void {
  const focusables = getFocusableElements();
  const currentIndex = focusables.indexOf(document.activeElement as HTMLElement);
  const nextIndex = (currentIndex + 1) % focusables.length;
  focusables[nextIndex]?.focus();
}

function navigateToPrevious(): void {
  const focusables = getFocusableElements();
  const currentIndex = focusables.indexOf(document.activeElement as HTMLElement);
  const prevIndex = currentIndex <= 0 ? focusables.length - 1 : currentIndex - 1;
  focusables[prevIndex]?.focus();
}

function getFocusableElements(): HTMLElement[] {
  const selector = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(document.querySelectorAll(selector));
}

function focusMainInput(): void {
  const input = document.querySelector('.universal-input') as HTMLTextAreaElement;
  input?.focus();
}

function closeActiveModal(): void {
  const modal = document.querySelector('.modal-overlay');
  if (modal) {
    const closeButton = modal.querySelector('.cancel-btn, .close-btn') as HTMLButtonElement;
    closeButton?.click();
  }
}

// Action helper functions
function triggerGenerate(): void {
  const generateButton = document.querySelector('.btn-primary') as HTMLButtonElement;
  generateButton?.click();
}

function triggerSave(): void {
  const saveButton = document.querySelector('.save-btn, .btn-save') as HTMLButtonElement;
  saveButton?.click();
}

function createNewPOC(): void {
  const createButton = document.querySelector('.btn-manual-create') as HTMLButtonElement;
  createButton?.click();
}

function copyOutputToClipboard(): void {
  const copyButton = document.querySelector('.btn-copy') as HTMLButtonElement;
  copyButton?.click();
}

// Editing helper functions
function selectAllInFocused(): void {
  const element = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
  if (element && 'select' in element) {
    element.select();
  }
}

function undo(): void {
  document.execCommand('undo');
}

function redo(): void {
  document.execCommand('redo');
}

// Accessibility helper functions
function showKeyboardHelp(): void {
  // This would typically open a help modal
  console.log('Keyboard shortcuts:', keyboardNav.getShortcutsByCategory());
  alert('Press Shift+? to see keyboard shortcuts');
}

function increaseFontSize(): void {
  const root = document.documentElement;
  const currentSize = parseInt(getComputedStyle(root).fontSize);
  root.style.fontSize = `${currentSize + 2}px`;
}

function decreaseFontSize(): void {
  const root = document.documentElement;
  const currentSize = parseInt(getComputedStyle(root).fontSize);
  root.style.fontSize = `${Math.max(12, currentSize - 2)}px`;
}

function resetFontSize(): void {
  document.documentElement.style.fontSize = '';
}

// Initialize default shortcuts
keyboardNav.registerShortcuts(defaultShortcuts);