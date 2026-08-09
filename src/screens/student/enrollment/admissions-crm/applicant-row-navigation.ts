import type { MouseEvent } from 'react';

const interactiveSelector =
  'a, button, input, select, textarea, [role="button"], [role="checkbox"], [role="link"], [role="menuitem"], [contenteditable="true"]';

const isInteractiveTarget = (target: EventTarget | null, currentTarget: EventTarget | null) => {
  if (!(target instanceof Element) || target === currentTarget) return false;
  return Boolean(target.closest(interactiveSelector));
};

type Options = {
  applicantName: string;
  onOpen: () => void;
};

export function createApplicantRowNavigationProps({ onOpen }: Options) {
  return {
    onClick: (event: MouseEvent<HTMLTableRowElement>) => {
      if (!isInteractiveTarget(event.target, event.currentTarget)) onOpen();
    },
    sx: {
      cursor: 'pointer',
    },
  };
}

type ApplicantLinkOptions = {
  href: string;
  onOpen: () => void;
  onPrefetch?: () => void;
};

export function createApplicantLinkNavigationProps({
  href,
  onOpen,
  onPrefetch,
}: ApplicantLinkOptions) {
  return {
    href,
    onMouseEnter: onPrefetch,
    onFocus: onPrefetch,
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();
      onOpen();
    },
  };
}
