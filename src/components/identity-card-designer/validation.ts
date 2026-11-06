import type { IdentityCardLayout, IdentityCardFieldOption } from './types';

export function validateIdentityCardLayout(
  layout: IdentityCardLayout,
  fields?: IdentityCardFieldOption[]
): string[] {
  const errors: string[] = [];
  if (!layout || typeof layout !== 'object') return ['Card layout is missing.'];
  if (!Array.isArray(layout.front?.elements)) return ['The front must contain an elements array.'];
  if (!['Horizontal', 'Vertical'].includes(layout.orientation))
    errors.push('Card orientation is invalid.');
  if (![layout.themeColor, layout.backgroundColor].every((color) => /^#[\da-f]{6}$/i.test(color)))
    errors.push('Card colours must use six-digit hexadecimal values.');
  if (
    ![layout.widthMm, layout.heightMm].every(
      (value) => Number.isFinite(value) && value >= 30 && value <= 200
    )
  )
    errors.push('Finished width and height must be between 30 and 200 mm.');
  if (![layout.width, layout.height].every((value) => Number.isFinite(value) && value > 0))
    errors.push('Canvas dimensions must be positive finite numbers.');
  const common = [
    'schoolName',
    'schoolAddress',
    'headerText',
    'footerText',
    'CardNumber',
    'static',
  ];
  (['front', 'back'] as const).forEach((side) => {
    const elements = layout[side]?.elements ?? [];
    if (!Array.isArray(elements)) {
      errors.push(`${side}: elements must be an array.`);
      return;
    }
    const ids = new Set<string>();
    if (elements.length > 100) errors.push(`${side}: use at most 100 elements.`);
    elements.forEach((element) => {
      if (!element || typeof element !== 'object') {
        errors.push(`${side}: invalid element.`);
        return;
      }
      const name = element.label || element.id;
      if (typeof element.id !== 'string' || !element.id.trim())
        errors.push(`${side}: every element needs an identifier.`);
      if (!['text', 'photo', 'logo', 'qr', 'barcode', 'shape', 'line'].includes(element.type))
        errors.push(`${side}: ${name} has an unsupported element type.`);
      if (element.style) {
        if (
          element.style.fontFamily &&
          !['Arial', 'sans-serif', 'Inter', 'Roboto', 'Noto Sans', 'Lato'].includes(
            element.style.fontFamily
          )
        )
          errors.push(`${side}: ${name} has an unsupported font family.`);
        if (
          [element.style.color, element.style.backgroundColor, element.style.borderColor].some(
            (color) => color !== undefined && !/^#[\da-f]{6}$/i.test(color)
          )
        )
          errors.push(`${side}: ${name} colours must use six-digit hexadecimal values.`);
      }
      if (ids.has(element.id)) errors.push(`${side}: duplicate element ${element.id}.`);
      ids.add(element.id);
      if (
        ![element.x, element.y, element.w, element.h, element.z].every(Number.isFinite) ||
        element.x < 0 ||
        element.y < 0 ||
        element.w <= 0 ||
        element.h <= 0 ||
        element.x + element.w > layout.width + 0.01 ||
        element.y + element.h > layout.height + 0.01
      )
        errors.push(`${side}: ${name} is outside the card. Adjust its position or size.`);
      if (
        fields &&
        element.fieldKey &&
        !common.includes(element.fieldKey) &&
        !fields.some((field) => field.key === element.fieldKey)
      )
        errors.push(`${side}: ${name} uses an unavailable field binding.`);
      if (
        element.style?.fontSize !== undefined &&
        (!Number.isFinite(element.style.fontSize) ||
          element.style.fontSize < 4 ||
          element.style.fontSize > 100)
      )
        errors.push(`${side}: ${name} font size must be between 4 and 100 canvas units.`);
    });
  });
  return errors;
}
