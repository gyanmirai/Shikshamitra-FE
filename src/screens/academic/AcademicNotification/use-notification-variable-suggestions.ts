import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

import { useId, useState } from 'react';

import type { TemplateVariable } from './notification-template-model';

type VariableQuery = {
  start: number;
  end: number;
  query: string;
};

export function variableQueryAt(textBeforeCaret: string, end: number): VariableQuery | null {
  const match = /(?:^|[^\p{L}\p{N}_@])@([a-z0-9_]*)$/iu.exec(textBeforeCaret);
  if (!match) return null;

  return { start: end - match[1].length - 1, end, query: match[1].toLowerCase() };
}

export function useNotificationVariableSuggestions(variables: TemplateVariable[], disabled: boolean) {
  const listId = useId();
  const [query, setQuery] = useState<VariableQuery | null>(null);
  const [index, setIndex] = useState(0);
  const open = !disabled && variables.length > 0 && query !== null;
  const matches = open
    ? variables.filter(({ key }) => key.includes(query.query))
    : [];
  const activeIndex = Math.min(index, matches.length - 1);
  const activeId = activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined;

  function update(next: VariableQuery | null) {
    setQuery(next);
    setIndex(0);
  }

  function handleKey(event: KeyboardEvent | ReactKeyboardEvent, insert: (key: string) => void) {
    const { isComposing } = 'nativeEvent' in event ? event.nativeEvent : event;
    if (!open || isComposing) return false;

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      update(null);
      return true;
    }

    if (!matches.length) return false;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      event.preventDefault();
      setIndex((activeIndex + direction + matches.length) % matches.length);
      return true;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      insert(matches[activeIndex].key);
      return true;
    }
    return false;
  }

  return {
    query,
    open,
    listId,
    matches,
    activeId,
    update,
    handleKey,
    inputAttributes: {
      'aria-autocomplete': 'list' as const,
      'aria-controls': open ? listId : undefined,
      'aria-activedescendant': activeId,
    },
  };
}
