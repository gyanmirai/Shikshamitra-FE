const joinFormikPath = (prefix: string, key: string | number, isArrayIndex: boolean) =>
  isArrayIndex ? `${prefix}[${key}]` : prefix ? `${prefix}.${key}` : String(key);

export const shouldValidateForwardStepClick = (
  activeStep: number,
  targetStep: number,
  validateForwardStepClick: boolean
) => validateForwardStepClick && targetStep > activeStep;

export const shouldValidateCurrentStep = (isLastStep: boolean, validateFinalStep: boolean) =>
  !isLastStep || validateFinalStep;

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

export const focusFirstFormikError = (errors: unknown, root?: ParentNode): void => {
  if (!getFirstFormikErrorPath(errors) || typeof document === 'undefined') return;

  const paths = new Set<string>();
  const collect = (value: unknown, prefix = '') => {
    if (value && typeof value === 'object') {
      Object.entries(value).forEach(([key, child]) =>
        collect(child, joinFormikPath(prefix, key, Array.isArray(value)))
      );
    } else if (value && prefix) paths.add(prefix);
  };
  collect(errors);

  const focusField = () => {
    const scope = root ?? document.activeElement?.closest('form, [role="dialog"]') ?? document;
    const fields = scope.querySelectorAll<HTMLElement>('[name]');
    // Follow rendered field order, including nested/array paths. MUI Select's named input
    // is hidden; focus its visible combobox instead. Hidden steps cannot receive focus.
    Array.from(fields).some((field) => {
      if (!paths.has(field.getAttribute('name') ?? '')) return false;
      const target = field.matches('input[type="hidden"], input[aria-hidden="true"]')
        ? field.parentElement?.querySelector<HTMLElement>('[role="combobox"]')
        : field;
      if (
        !target ||
        !target.isConnected ||
        target.matches(':disabled, [aria-disabled="true"]') ||
        target.closest('[hidden], [inert], [aria-hidden="true"]')
      )
        return false;
      for (let ancestor: HTMLElement | null = target; ancestor; ancestor = ancestor.parentElement) {
        const style = window.getComputedStyle(ancestor);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return false;
        }
      }
      target.focus();
      if (document.activeElement !== target) return false;
      target.scrollIntoView?.({ block: 'center' });
      return true;
    });
  };

  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(focusField);
  } else {
    focusField();
  }
};
