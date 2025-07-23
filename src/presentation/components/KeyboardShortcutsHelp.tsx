import React from 'react';
import { defaultShortcuts, ShortcutCategory } from '@/modules/keyboard-navigation';
import './KeyboardShortcutsHelp.css';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const shortcutsByCategory = defaultShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<ShortcutCategory, typeof defaultShortcuts>);

  const categoryLabels: Record<ShortcutCategory, string> = {
    navigation: 'Navigation',
    actions: 'Actions',
    editing: 'Editing',
    accessibility: 'Accessibility',
    help: 'Help'
  };

  const formatShortcut = (shortcut: typeof defaultShortcuts[0]): string => {
    const modifiers = shortcut.modifiers || [];
    const keys = [...modifiers.map(m => m.charAt(0).toUpperCase() + m.slice(1)), shortcut.key];
    return keys.join(' + ');
  };

  return (
    <div className="keyboard-shortcuts-overlay" onClick={onClose}>
      <div className="keyboard-shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2>Keyboard Shortcuts</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        
        <div className="shortcuts-content">
          {Object.entries(shortcutsByCategory).map(([category, shortcuts]) => (
            <div key={category} className="shortcut-category">
              <h3>{categoryLabels[category as ShortcutCategory]}</h3>
              <div className="shortcut-list">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="shortcut-item">
                    <kbd className="shortcut-key">{formatShortcut(shortcut)}</kbd>
                    <span className="shortcut-description">{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="shortcuts-footer">
          <p>Press <kbd>Esc</kbd> to close this dialog</p>
        </div>
      </div>
    </div>
  );
};