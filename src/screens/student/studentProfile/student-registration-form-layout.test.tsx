import { it, vi, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { StudentRegistrationFormFields } from './student-registration-form-fields';
import { customField, customSource, customSection } from './student-custom-details-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('./student-custom-runtime-field', () => ({
  StudentCustomRuntimeField: ({ field, value }: any) => (
    <input aria-label={field.label} value={value} readOnly />
  ),
}));
const createSource = (stepper = true) => {
  const source = customSource(
    [
      customSection([customField('name', 0, { label: 'Student name' })], {
        id: 'student',
        name: 'Identity',
        stepId: 'identity',
        stepName: 'Student Profile',
        stepDisplayOrder: 1,
      }),
      customSection([customField('father', 0, { label: 'Father name' })], {
        id: 'family',
        name: 'Parents',
        stepId: 'family-step',
        stepName: 'Family Details',
        stepDisplayOrder: 2,
      }),
    ],
    { name: 'Aanya', father: 'Ramesh' }
  );
  source.definition!.layoutType = stepper ? 1 : 0;
  return source;
};

it('shows single-page sections together without step navigation', () => {
  const source = createSource(false);
  render(
    <StudentRegistrationFormFields
      studentId="student"
      source={source}
      values={source.currentValues}
    />
  );
  expect(screen.getByLabelText('Student name')).toHaveValue('Aanya');
  expect(screen.getByLabelText('Father name')).toHaveValue('Ramesh');
  expect(screen.queryByRole('navigation', { name: 'Form Steps' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
});

it('uses configured steps and renders only the selected step, preserving saved values', async () => {
  const source = createSource();
  render(
    <StudentRegistrationFormFields
      studentId="student"
      source={source}
      values={source.currentValues}
    />
  );
  expect(screen.getByRole('button', { name: 'Student Profile' })).toHaveAttribute(
    'aria-current',
    'step'
  );
  expect(screen.queryByLabelText('Father name')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(await screen.findByLabelText('Father name')).toHaveValue('Ramesh');
  expect(screen.queryByLabelText('Student name')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByLabelText('Student name')).toHaveValue('Aanya');
});

it('omits hidden steps and returns to an available step when a rule hides the active one', async () => {
  const source = createSource();
  source.definition!.sections[1].stepVisibilityRuleJson = JSON.stringify({
    field: 'showFamily',
    operator: 'equals',
    value: 'Yes',
  });
  const values = { ...source.currentValues, showFamily: 'Yes' };
  const { rerender } = render(
    <StudentRegistrationFormFields studentId="student" source={source} values={values} />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(await screen.findByLabelText('Father name')).toBeVisible();
  rerender(
    <StudentRegistrationFormFields
      studentId="student"
      source={source}
      values={{ ...values, showFamily: 'No' }}
    />
  );
  expect(screen.queryByRole('button', { name: 'Family Details' })).not.toBeInTheDocument();
  expect(screen.getByLabelText('Student name')).toBeVisible();
});

it('blocks forward editing navigation when the current step validation fails', async () => {
  const source = createSource();
  const validate = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
  render(
    <StudentRegistrationFormFields
      studentId="student"
      source={source}
      values={source.currentValues}
      editing
      onValidateStep={validate}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  await waitFor(() => expect(validate).toHaveBeenCalledWith(['student']));
  expect(screen.getByLabelText('Student name')).toBeVisible();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(await screen.findByLabelText('Father name')).toBeVisible();
});

it('reveals errors on another step after Save, without moving the user on ordinary field edits', async () => {
  const source = createSource();
  const { rerender } = render(
    <StudentRegistrationFormFields
      studentId="student"
      source={source}
      values={source.currentValues}
    />
  );
  rerender(
    <StudentRegistrationFormFields
      studentId="student"
      source={source}
      values={source.currentValues}
      validationAttempt={1}
      errors={{ father: 'Required' }}
    />
  );
  expect(await screen.findByLabelText('Father name')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  rerender(
    <StudentRegistrationFormFields
      studentId="student"
      source={source}
      values={source.currentValues}
      validationAttempt={1}
      errors={{ father: 'Still required' }}
    />
  );
  expect(screen.getByLabelText('Student name')).toBeVisible();
});

it('keeps an empty repeatable section available for adding an entry on its configured step', async () => {
  const source = createSource();
  source.definition!.sections[1] = {
    ...source.definition!.sections[1],
    isRepeatable: true,
    maxEntries: 3,
    entryLabel: 'Parent',
  };
  source.currentValues.father = [];
  source.formEditableFieldCodes = ['father'];
  const onChange = vi.fn();
  render(
    <StudentRegistrationFormFields
      studentId="student"
      source={source}
      values={source.currentValues}
      editing
      onChange={onChange}
    />
  );
  expect(screen.queryByRole('button', { name: 'Add Parent entry' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Add Parent entry' }));
  expect(onChange).toHaveBeenCalledWith('father', expect.any(String));
});

it('retains a configured repeatable step with no saved entries in read-only mode', async () => {
  const source = createSource();
  source.definition!.sections[1].isRepeatable = true;
  source.currentValues.father = [];
  render(
    <StudentRegistrationFormFields
      studentId="student"
      source={source}
      values={source.currentValues}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(await screen.findByText('No saved entries.')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Family Details' })).toHaveAttribute(
    'aria-current',
    'step'
  );
});

it('validates intervening sections when jumping forward and opens the invalid step', async () => {
  const source = createSource();
  source.definition!.sections.push(
    customSection([customField('city')], {
      id: 'address',
      name: 'Address',
      stepId: 'address-step',
      stepName: 'Address',
      stepDisplayOrder: 3,
    })
  );
  const validate = vi.fn().mockResolvedValue('family');
  render(
    <StudentRegistrationFormFields
      studentId="student"
      source={source}
      values={source.currentValues}
      editing
      onValidateStep={validate}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Address' }));
  await waitFor(() => expect(validate).toHaveBeenCalledWith(['student', 'family']));
  expect(await screen.findByLabelText('Father name')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Family Details' })).toHaveAttribute(
    'aria-current',
    'step'
  );
});

it('attaches section actions and footer to rendered repeatable rows when edge rows are hidden', () => {
  const source = customSource(
    [
      customSection(
        [
          customField('gate', 0, {
            visibilityRuleJson: JSON.stringify({
              field: 'gate',
              operator: 'equals',
              value: 'never',
            }),
          }),
          customField('note', 0, {
            label: 'Note',
            visibilityRuleJson: JSON.stringify({ field: 'gate', operator: 'equals', value: 'Yes' }),
          }),
        ],
        { isRepeatable: true }
      ),
    ],
    { gate: ['No', 'Yes', 'No'], note: ['hidden', 'Visible row', 'hidden'] }
  );
  render(
    <StudentRegistrationFormFields
      studentId="student"
      source={source}
      values={source.currentValues}
      sectionAction={() => <button type="button">Section action</button>}
      sectionFooter={() => <input aria-label="Section reason" />}
    />
  );
  expect(screen.getByLabelText('Note')).toHaveValue('Visible row');
  expect(screen.getAllByRole('button', { name: 'Section action' })).toHaveLength(1);
  expect(screen.getAllByLabelText('Section reason')).toHaveLength(1);
});
