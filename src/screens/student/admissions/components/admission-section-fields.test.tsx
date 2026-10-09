import { it, expect, describe } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { AdmissionSectionFields } from './admission-section-fields';

const nameField = { code: 'NAME', fieldType: 0 };
const notesField = { code: 'NOTES', fieldType: 1 };
const photoField = { code: 'PHOTO', fieldType: 0, validationJson: '{"format":"photo"}' };

describe('admission section field layout', () => {
  it.each([1, 2, 3, 4])(
    'places photos before the %i-column field grid without changing definition order',
    (columns) => {
      const fields = [nameField, notesField, photoField].map((field) =>
        Object.freeze({ ...field })
      );
      Object.freeze(fields);
      render(
        <AdmissionSectionFields
          fields={fields}
          columns={columns}
          renderField={(field) => <input aria-label={field.code} readOnly value={field.code} />}
        />
      );

      expect(
        screen.getAllByRole('textbox').map((input) => input.getAttribute('aria-label'))
      ).toEqual(['PHOTO', 'NAME', 'NOTES']);
      expect(
        within(screen.getByLabelText('Profile photos')).getByRole('textbox', { name: 'PHOTO' })
      ).toBeVisible();
      expect(within(screen.getByLabelText('Form fields')).getAllByRole('textbox')).toHaveLength(2);
      expect(fields.map((field) => field.code)).toEqual(['NAME', 'NOTES', 'PHOTO']);
    }
  );

  it('keeps the normal field grid when no photo is configured', () => {
    render(
      <AdmissionSectionFields
        fields={[nameField, notesField]}
        columns={3}
        renderField={(field) => <input aria-label={field.code} readOnly value={field.code} />}
      />
    );
    expect(screen.queryByLabelText('Profile photos')).not.toBeInTheDocument();
    expect(screen.getAllByRole('textbox').map((input) => input.getAttribute('aria-label'))).toEqual(
      ['NAME', 'NOTES']
    );
  });

  it('preserves each photo and ordinary field when a section contains multiple photos', () => {
    render(
      <AdmissionSectionFields
        fields={[nameField, photoField, { ...photoField, code: 'GUARDIAN_PHOTO' }, notesField]}
        columns={2}
        renderField={(field) => <input aria-label={field.code} readOnly value={field.code} />}
      />
    );
    expect(
      within(screen.getByLabelText('Profile photos'))
        .getAllByRole('textbox')
        .map((input) => input.getAttribute('aria-label'))
    ).toEqual(['PHOTO', 'GUARDIAN_PHOTO']);
    expect(
      within(screen.getByLabelText('Form fields'))
        .getAllByRole('textbox')
        .map((input) => input.getAttribute('aria-label'))
    ).toEqual(['NAME', 'NOTES']);
  });
});
