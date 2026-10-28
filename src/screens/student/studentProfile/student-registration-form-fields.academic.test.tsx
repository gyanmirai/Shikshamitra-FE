import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { StudentRegistrationFormFields } from './student-registration-form-fields';
import { customField, customSection, customSource } from './student-custom-details-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));

vi.mock('./student-custom-runtime-field', () => ({
  StudentCustomRuntimeField: ({ field, value, onChange }: any) => (
    <input
      aria-label={field.code}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

const academicFields = () => [
  customField('MEDIUM', 6, { optionsJson: '{"source":"EducationMediums","parentField":"BOARD"}' }),
  customField('CLASS', 6, { optionsJson: '["Old class"]' }),
  customField('DIVISION', 6, { optionsJson: '["Old division"]' }),
];

describe('Student Records academic dependencies', () => {
  it('clears Class and Division after changing Medium in a saved legacy form', () => {
    const values = { MEDIUM: 'english', CLASS: 'prep', DIVISION: 'lotus' };
    const source = customSource([customSection(academicFields())], values, {
      formEditableFieldCodes: ['MEDIUM', 'CLASS', 'DIVISION'],
    });
    const change = vi.fn();
    render(
      <StudentRegistrationFormFields
        studentId="student-1"
        source={source}
        values={values}
        editing
        onChange={change}
      />
    );
    fireEvent.change(screen.getByLabelText('MEDIUM'), { target: { value: 'gujarati' } });
    expect(change).toHaveBeenCalledWith('CLASS', '');
    expect(change).toHaveBeenCalledWith('DIVISION', '');
  });

  it('preserves the first repeated row when the second row class changes', () => {
    const values = {
      MEDIUM: ['english', 'english'],
      CLASS: ['prep', 'oak'],
      DIVISION: ['lotus', 'rose'],
    };
    const source = customSource([customSection(academicFields(), { isRepeatable: true })], values, {
      formEditableFieldCodes: ['MEDIUM', 'CLASS', 'DIVISION'],
    });
    const change = vi.fn();
    render(
      <StudentRegistrationFormFields
        studentId="student-1"
        source={source}
        values={values}
        editing
        onChange={change}
      />
    );
    fireEvent.change(screen.getAllByLabelText('CLASS')[1], { target: { value: 'pine' } });
    expect(change).toHaveBeenCalledWith('DIVISION', '["lotus",""]');
  });

  it('does not submit changes to a protected dependent field', () => {
    const values = { MEDIUM: 'english', CLASS: 'prep', DIVISION: 'lotus' };
    const source = customSource([customSection(academicFields())], values, {
      formEditableFieldCodes: ['MEDIUM'],
    });
    const change = vi.fn();
    render(
      <StudentRegistrationFormFields
        studentId="student-1"
        source={source}
        values={values}
        editing
        onChange={change}
      />
    );
    fireEvent.change(screen.getByLabelText('MEDIUM'), { target: { value: 'gujarati' } });
    expect(change.mock.calls.map(([code]) => code)).toEqual(['MEDIUM']);
  });
});
