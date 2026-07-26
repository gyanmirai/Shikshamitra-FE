const joinFormikPath = (prefix: string, key: string | number, isArrayIndex: boolean) =>
  isArrayIndex ? `${prefix}[${key}]` : prefix ? `${prefix}.${key}` : String(key);

export const shouldValidateForwardStepClick = (
  activeStep: number,
  targetStep: number,
  validateForwardStepClick: boolean
) => validateForwardStepClick && targetStep > activeStep;

export const getFirstFormikErrorPath = (errors: unknown, prefix = ''): string | null => {
  if (Array.isArray(errors)) {
    return errors.reduce<string | null>(
      (firstPath, value, index) =>
        firstPath ?? getFirstFormikErrorPath(value, joinFormikPath(prefix, index, true)),
      null
    );
  }

  if (errors && typeof errors === 'object') {
    return Object.entries(errors).reduce<string | null>(
      (firstPath, [key, value]) =>
        firstPath ?? getFirstFormikErrorPath(value, joinFormikPath(prefix, key, false)),
      null
    );
  }

  return errors ? prefix || null : null;
};

export const focusFirstFormikError = (errors: unknown): void => {
  const path = getFirstFormikErrorPath(errors);
  if (!path || typeof document === 'undefined') return;

  const focusField = () => {
    const field = Array.from(document.querySelectorAll<HTMLElement>('[name]')).find(
      (element) => element.getAttribute('name') === path
    );
    field?.focus();
    field?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  };

  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(focusField);
  } else {
    focusField();
  }
};
