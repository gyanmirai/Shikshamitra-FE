import type { KeyboardEvent } from 'react';

export function handleAutocompleteKeyDown(event: KeyboardEvent<HTMLElement>): void {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.getAttribute('role') !== 'combobox') return;
  if (input.getAttribute('aria-expanded') !== 'true') return;
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key !== ' ' && event.key !== 'Enter' && event.key !== 'Tab') return;
  if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229 || event.repeat) {
    if (event.key !== 'Tab') {
      event.stopPropagation();
      if (event.repeat) event.preventDefault();
    }
    return;
  }
  if (event.key !== ' ' && (event.key !== 'Tab' || event.shiftKey)) return;

  const highlightedId = input.getAttribute('aria-activedescendant');
  const option = highlightedId ? input.ownerDocument.getElementById(highlightedId) : null;
  const listboxId = input.getAttribute('aria-controls');
  if (!option || option.closest('[role="listbox"]')?.id !== listboxId) return;
  if (option.getAttribute('aria-disabled') === 'true') return;
  if (event.key === 'Tab' && option.getAttribute('aria-selected') === 'true') return;
  // Automatic highlights must not turn spaces in a search query into selections.
  if (event.key === ' ' && !option.classList.contains('Mui-focusVisible')) return;

  if (event.key === ' ') event.preventDefault();
  option.click();
}
