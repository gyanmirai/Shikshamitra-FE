import { it, expect, describe } from 'vitest';

import { getDynamicAdmissionValidationErrors } from './admission-form-validation';
import { getAdmissionPhotoError, ADMISSION_PHOTO_MAX_BYTES } from './admission-profile-photo';

const png = 'data:image/png;base64,iVBORw0KGgo=';

describe('admission profile photo validation', () => {
  it('allows optional blank photos and JPEG/PNG image signatures', () => {
    expect(getAdmissionPhotoError('')).toBeUndefined();
    expect(getAdmissionPhotoError(png)).toBeUndefined();
    expect(getAdmissionPhotoError('data:image/jpeg;base64,/9j/')).toBeUndefined();
  });

  it.each([
    'https://example.com/photo.png',
    'data:image/svg+xml;base64,PHN2Zz4=',
    'data:image/png;base64,dGV4dA==',
    'data:image/jpeg;base64,iVBORw0KGgo=',
    'data:image/png;base64,broken',
  ])('rejects unsupported, malformed, or mislabeled photo data: %s', (value) => {
    expect(getAdmissionPhotoError(value)).toBe('Choose a valid JPG or PNG photo.');
  });

  it('rejects oversized content before decoding it', () => {
    const data = 'A'.repeat(Math.ceil((ADMISSION_PHOTO_MAX_BYTES + 1) / 3) * 4);
    expect(getAdmissionPhotoError(`data:image/png;base64,${data}`)).toBe(
      'Photo must be 2 MB or smaller.'
    );
  });

  it('uses photo validation during form submission and preserves optional behavior', () => {
    const form = {
      sections: [
        {
          fields: [
            {
              code: 'PHOTO',
              label: 'Student photo',
              fieldType: 0,
              required: false,
              validationJson: '{"format":"photo"}',
            },
          ],
        },
      ],
    };
    expect(getDynamicAdmissionValidationErrors(form, { PHOTO: png })).toEqual({});
    expect(getDynamicAdmissionValidationErrors(form, { PHOTO: '' })).toEqual({});
    expect(getDynamicAdmissionValidationErrors(form, { PHOTO: 'plain text' })).toEqual({
      PHOTO: 'Student photo: Choose a valid JPG or PNG photo.',
    });
  });
});
