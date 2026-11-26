import { IDENTITY_CARD_PREFIX_LIMIT, IDENTITY_CARD_BORDER_STYLES } from '../types';

import type { IdentityCardElement } from '../types';

export function validateEditorElement(element: IdentityCardElement): string[] {
  const errors: string[] = [];
  if (
    element.prefix != null &&
    (element.type !== 'text' ||
      typeof element.prefix !== 'string' ||
      element.prefix.length > IDENTITY_CARD_PREFIX_LIMIT)
  )
    errors.push(
      `Only text elements can use a prefix of up to ${IDENTITY_CARD_PREFIX_LIMIT} characters.`
    );
  if (
    element.rotation !== undefined &&
    (!Number.isFinite(element.rotation) || Math.abs(element.rotation) > 180)
  )
    errors.push('Rotation must be between -180 and 180 degrees.');
  if (
    element.opacity !== undefined &&
    (!Number.isFinite(element.opacity) || element.opacity < 0 || element.opacity > 1)
  )
    errors.push('Opacity must be between 0 and 100%.');
  if (element.groupId !== undefined && (!element.groupId.trim() || element.groupId.length > 100))
    errors.push('Group identifier is invalid.');
  if (element.type === 'image') {
    if (
      !element.imageData ||
      !/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+={0,2}$/.test(element.imageData)
    )
      errors.push('Upload a valid PNG or JPEG image.');
    else if (
      (element.imageData.length - element.imageData.indexOf(',') - 1) * 0.75 >
      512 * 1024 + 2
    )
      errors.push('Each image must be at most 512 KB.');
  } else if (element.imageData !== undefined)
    errors.push('Only uploaded image layers can contain raster assets.');
  if (element.style?.shape !== undefined && !['rectangle', 'ellipse'].includes(element.style.shape))
    errors.push('Shape must be rectangle or ellipse.');
  if (
    element.style?.borderStyle != null &&
    (!IDENTITY_CARD_BORDER_STYLES.includes(element.style.borderStyle) ||
      (element.type !== 'line' && element.type !== 'shape'))
  )
    errors.push('Border style must be Solid, Dashed, or Dotted on a line or shape.');
  if (
    element.style?.borderStyle != null &&
    element.style.borderWidth != null &&
    (!Number.isFinite(element.style.borderWidth) ||
      element.style.borderWidth < 0 ||
      element.style.borderWidth > 20)
  )
    errors.push('Border width must be between 0 and 20 canvas units.');
  if (
    element.style?.fontStyle !== undefined &&
    !['normal', 'italic'].includes(element.style.fontStyle)
  )
    errors.push('Font style is invalid.');
  if (
    element.style?.textDecoration !== undefined &&
    !['none', 'underline', 'line-through'].includes(element.style.textDecoration)
  )
    errors.push('Text decoration is invalid.');
  return errors;
}
