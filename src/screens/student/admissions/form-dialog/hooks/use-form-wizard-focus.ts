import { useRef, useEffect } from 'react';

export function useFormWizardFocus(activeStep: number) {
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const content = contentRef.current;
    const scrollArea = content
      ?.closest('form')
      ?.querySelector<HTMLElement>(
        ':scope > [data-simplebar] > .simplebar-wrapper > .simplebar-mask > .simplebar-offset > .simplebar-content-wrapper'
      );
    if (scrollArea) scrollArea.scrollTop = 0;
    content?.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
  }, [activeStep]);
  return contentRef;
}
