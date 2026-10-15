import * as Yup from 'yup';

import type { IdentityKind, IdentityChoices, IdentitySelection } from './types';

export const selectionSchema = (signature = false) =>
  Yup.object({
    mode: Yup.number().oneOf([0, 1, 2]).required(),
    assetId: Yup.string()
      .nullable()
      .when('mode', { is: 1, then: (schema) => schema.required('Upload an image.') }),
    principalName: Yup.string()
      .nullable()
      .max(128)
      .when('mode', {
        is: (mode: number) => signature && mode === 1,
        then: (schema) => schema.trim().required('Enter the principal’s name.'),
      }),
    designation: Yup.string()
      .nullable()
      .max(128)
      .when('mode', {
        is: (mode: number) => signature && mode === 1,
        then: (schema) => schema.trim().required('Enter the designation.'),
      }),
  });
export const identitySchema = Yup.object({
  logo: selectionSchema(),
  banner: selectionSchema(),
  signature: selectionSchema(true).nullable().default(null),
});
export const templateIdentitySchema = Yup.object({
  logo: selectionSchema().optional().default(undefined),
  banner: selectionSchema().optional().default(undefined),
  signature: selectionSchema(true).nullable().optional().default(undefined),
}).nullable().default(undefined);
export function changedSelection(mode: 0 | 1 | 2, kind: IdentityKind): IdentitySelection {
  return mode === 1
    ? {
        mode,
        assetId: null,
        ...(kind === 'signature' ? { principalName: '', designation: 'Principal' } : {}),
      }
    : { mode };
}
export function inheritedChoices(signature: boolean): IdentityChoices {
  return { logo: { mode: 0 }, banner: { mode: 0 }, signature: signature ? { mode: 0 } : null };
}
export function identityError(error: unknown, operation: 'save' | 'upload' = 'save') {
  const value = error as { status?: number; data?: { error?: { code?: string } } };
  if (value.status === 409 || value.data?.error?.code?.includes('Concurrency'))
    return 'These settings changed since you opened them. Close the editor, refresh, and review the latest settings.';
  if (value.data?.error?.code?.includes('DraftExpired'))
    return 'This draft image expired. Upload the image again before submitting.';
  if (operation === 'upload')
    return 'The image could not be uploaded. Use a valid PNG or JPG within the stated size limit and try again.';
  return 'School Identity could not be saved. Your draft is preserved; check the images and try again.';
}
