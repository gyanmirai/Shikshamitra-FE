import type { KeyboardEvent } from 'react';

export const handleHierarchyScrollKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
  const element = event.currentTarget;
  const pageStep = element.clientHeight * 0.8;
  let top: number | undefined;

  switch (event.key) {
    case 'ArrowDown':
      top = element.scrollTop + 48;
      break;
    case 'ArrowUp':
      top = element.scrollTop - 48;
      break;
    case 'PageDown':
    case ' ':
      top = element.scrollTop + pageStep;
      break;
    case 'PageUp':
      top = element.scrollTop - pageStep;
      break;
    case 'Home':
      top = 0;
      break;
    case 'End':
      top = element.scrollHeight;
      break;
    default:
      return;
  }

  event.preventDefault();
  element.scrollTo({ top });
};
