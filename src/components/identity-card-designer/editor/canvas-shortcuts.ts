import type { KeyboardEvent } from 'react';

import { moveSelection } from './move-selection';

import type { IdentityCardLayout } from '../types';
import type { StudioController } from '../studio/use-card-studio';

export function canvasShortcuts(
  event: KeyboardEvent,
  studio: StudioController,
  layout: IdentityCardLayout,
  setTool: (tool: 'select' | 'hand') => void,
  disabled?: boolean
) {
  const target = event.target as HTMLElement;
  if (
    disabled ||
    !event.currentTarget.contains(target) ||
    target.closest(
      'input,textarea,select,[contenteditable="true"],[role="textbox"],[role="combobox"],[role="slider"],[role="menuitem"]'
    )
  )
    return;
  const command = event.ctrlKey || event.metaKey;
  const key = event.key.toLowerCase();
  let action: (() => void) | undefined;
  if (command) {
    const commands: Record<string, () => void> = {
      z: event.shiftKey ? studio.redo : studio.undo,
      y: studio.redo,
      c: studio.copySelection,
      v: studio.pasteSelection,
      d: studio.duplicateSelection,
      g: event.shiftKey ? studio.ungroupSelection : studio.groupSelection,
    };
    action = commands[key];
  } else if (['delete', 'backspace'].includes(key)) action = studio.deleteSelection;
  else if (key === 'escape') action = () => studio.setSelectedIds([]);
  else if (key === 'v' || key === 'h') action = () => setTool(key === 'v' ? 'select' : 'hand');
  else if (key.startsWith('arrow') && !target.closest('button,[role="tab"]'))
    action = () => moveSelection(studio, layout, key, event.shiftKey ? 10 : 1);

  if (action) {
    event.preventDefault();
    action();
  }
}
