const focusableSelector =
  'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex], [contenteditable="true"]';

function isTabbable(element: HTMLElement): boolean {
  if (
    element.tabIndex < 0 ||
    element.matches(':disabled') ||
    element.closest('[hidden], [inert], [aria-hidden="true"]')
  )
    return false;

  for (let ancestor: HTMLElement | null = element; ancestor; ancestor = ancestor.parentElement) {
    const style = element.ownerDocument.defaultView?.getComputedStyle(ancestor);
    if (style?.display === 'none' || style?.visibility === 'hidden') return false;
  }
  return true;
}

export function focusAdjacentControl(origin: HTMLElement, backwards = false): void {
  // Wait for the popup's focus restoration and aria-hidden cleanup before advancing.
  setTimeout(() => {
    if (!origin.isConnected) return;
    const scope = origin.closest('[role="dialog"], [role="alertdialog"]') ?? origin.ownerDocument;
    const candidates = Array.from(scope.querySelectorAll<HTMLElement>(focusableSelector)).filter(
      (element) => isTabbable(element) && (element === origin || !origin.contains(element))
    );
    const controls = candidates
      .filter((element) => {
        if (!(element instanceof HTMLInputElement) || element.type !== 'radio' || !element.name)
          return true;
        const group = candidates.filter(
          (candidate): candidate is HTMLInputElement =>
            candidate instanceof HTMLInputElement &&
            candidate.type === 'radio' &&
            candidate.name === element.name &&
            candidate.form === element.form
        );
        return (
          element ===
          (group.find((radio) => radio.checked) ?? group[backwards ? group.length - 1 : 0])
        );
      })
      .sort((left, right) => (left.tabIndex || Infinity) - (right.tabIndex || Infinity));
    const index = controls.indexOf(origin);
    if (index < 0) return;
    const next = controls[index + (backwards ? -1 : 1)];
    if (next) next.focus();
    else if (scope instanceof HTMLElement) controls[backwards ? controls.length - 1 : 0]?.focus();
    else origin.blur();
  }, 0);
}
