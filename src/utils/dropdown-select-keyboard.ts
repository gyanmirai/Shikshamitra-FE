import type { KeyboardEvent } from 'react';

import { focusAdjacentControl } from './dropdown-focus';

export function handleSelectKeyDown(event: KeyboardEvent<HTMLElement>): void {
  const { target } = event;
  if (!(target instanceof HTMLElement)) return;
  const listbox = target.closest<HTMLElement>('[role="listbox"]');
  if (!listbox || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229 || event.repeat) return;

  const input = target instanceof HTMLInputElement && target.type !== 'checkbox';
  const options = Array.from(
    listbox.querySelectorAll<HTMLElement>('[role="option"][data-value]')
  ).filter((option) => option.getAttribute('aria-disabled') !== 'true');

  if (input && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
    event.preventDefault();
    event.stopPropagation();
    options[event.key === 'ArrowDown' ? 0 : options.length - 1]?.focus();
    return;
  }

  if (!input && target.closest('button, a, input, textarea, [contenteditable="true"]')) return;
  const option = target.closest<HTMLElement>('[role="option"][data-value]');
  if (event.key === ' ' && option && options.includes(option)) {
    event.preventDefault();
    event.stopPropagation();
    option.click();
  }

  if (event.key === 'Tab') {
    if (
      !event.shiftKey &&
      option &&
      options.includes(option) &&
      !option.hasAttribute('data-select-all') &&
      option.getAttribute('aria-selected') !== 'true'
    )
      option.click();
    const trigger = Array.from(
      listbox.ownerDocument.querySelectorAll<HTMLElement>('[role="combobox"]')
    ).find((element) => element.getAttribute('aria-controls') === listbox.id);
    if (trigger) focusAdjacentControl(trigger, event.shiftKey);
  }
}
