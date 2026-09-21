'use client';

import { useRef, useState, useEffect } from 'react';

const findScrollParent = (element: HTMLElement) => {
  let parent = element.parentElement;

  while (parent) {
    const { overflowY } = window.getComputedStyle(parent);
    if (/(auto|scroll)/.test(overflowY) && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return null;
};

export function useDeferredRender(rootMargin = '400px') {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target || shouldRender) {
      return undefined;
    }

    if (typeof IntersectionObserver === 'undefined') {
      const parsedMargin = Number.parseInt(rootMargin, 10);
      const margin = Number.isNaN(parsedMargin) ? 400 : parsedMargin;
      const scrollParent = findScrollParent(target);
      const checkVisibility = () => {
        const bounds = target.getBoundingClientRect();
        if (bounds.top <= window.innerHeight + margin && bounds.bottom >= -margin) {
          setShouldRender(true);
        }
      };

      checkVisibility();
      scrollParent?.addEventListener('scroll', checkVisibility, { passive: true });
      window.addEventListener('resize', checkVisibility, { passive: true });

      return () => {
        scrollParent?.removeEventListener('scroll', checkVisibility);
        window.removeEventListener('resize', checkVisibility);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  return { targetRef, shouldRender };
}
