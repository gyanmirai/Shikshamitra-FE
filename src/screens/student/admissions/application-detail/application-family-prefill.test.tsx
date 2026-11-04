import type { ComponentProps } from 'react';

import { it, vi, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { ApplicationRuntimeForm } from './application-runtime-form';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useLazyGetAdmissionFormOptionsQuery: () => [vi.fn()],
}));

type Props = ComponentProps<typeof ApplicationRuntimeForm>;
const form = {
  formVersion: 1,
  academicYearId: 'year',
  status: 0,
  familyPrefill: {
    sourceApplicantId: 'sibling',
    sourceApplicantName: 'Riya',
    relationship: 'father',
  },
  autoFilledFieldCodes: ['FATHER', 'MOTHER'],
  definition: {
    name: 'Configured Registration',
    layoutType: 0,
    fieldsPerRow: 2,
    sections: [
      {
        id: 'child',
        code: 'child',
        name: 'Our Student',
        fields: [
          {
            id: 'child-name',
            code: 'CHILD',
            label: 'Applicant preferred name',
            bindingKey: 'Applicant.Name',
            fieldType: 0,
            required: false,
            readOnly: false,
          },
        ],
      },
      {
        id: 'parent',
        code: 'parent',
        name: 'Configured Family',
        fields: [
          {
            id: 'father-name',
            code: 'FATHER',
            label: 'Paternal full name',
            bindingKey: 'Father.Name',
            fieldType: 0,
            required: false,
            readOnly: false,
          },
          {
            id: 'mother-name',
            code: 'MOTHER',
            label: 'Maternal full name',
            bindingKey: 'Mother.Name',
            fieldType: 0,
            required: false,
            readOnly: true,
          },
        ],
      },
    ],
  },
} as Props['form'];

function openForm(overrides: Partial<Props> = {}) {
  const onChange = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ApplicationRuntimeForm
        application={{ id: 'application', status: 0 } as Props['application']}
        form={form}
        values={{ CHILD: 'Priya', FATHER: 'Amit Sharma', MOTHER: 'Sunita Sharma' }}
        errors={[]}
        fieldErrors={{}}
        saving={false}
        submitting={false}
        onChange={onChange}
        onBlur={vi.fn()}
        onSave={async () => true}
        onValidateStep={() => true}
        onSubmit={vi.fn()}
        showSaveDraft
        canSubmitForm
        managedFormStage={false}
        canReopen={false}
        reopening={false}
        onReopen={vi.fn()}
        {...overrides}
      />
    </ThemeProvider>
  );
  return { onChange };
}

it('renders returned parent values in the real configured fields and shows confirmed source context once', () => {
  const { onChange } = openForm();
  expect(screen.getByText('Configured Family')).toBeVisible();
  expect(screen.getByRole('textbox', { name: 'Paternal full name' })).toHaveValue('Amit Sharma');
  expect(screen.getByRole('textbox', { name: 'Maternal full name' })).toHaveValue('Sunita Sharma');
  expect(screen.getByRole('textbox', { name: 'Maternal full name' })).toBeDisabled();
  expect(screen.getByRole('textbox', { name: 'Applicant preferred name' })).toHaveValue('Priya');
  expect(screen.getAllByText('Sibling Confirmed')).toHaveLength(1);
  expect(
    screen.queryByRole('button', { name: /copy|use saved|review family/i })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole('textbox', { name: 'Paternal full name' }), {
    target: { value: '' },
  });
  expect(onChange).toHaveBeenCalledWith('FATHER', '');
});

it('keeps manual required entry available when family data is absent', () => {
  openForm({
    form: { ...form, familyPrefill: undefined, autoFilledFieldCodes: undefined },
    values: { CHILD: 'Priya' },
  });
  expect(screen.queryByText('Sibling Confirmed')).not.toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Paternal full name' })).toHaveValue('');
  expect(screen.getByRole('textbox', { name: 'Paternal full name' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
});

it('keeps the existing read-only and busy guards on prefilled fields', () => {
  openForm({ saving: true });
  expect(screen.getByRole('textbox', { name: 'Paternal full name' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Submit Application' })).toBeDisabled();
});
