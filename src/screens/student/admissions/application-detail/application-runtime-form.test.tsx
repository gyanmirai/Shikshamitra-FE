import type { ComponentProps } from 'react';

import { useState } from 'react';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { act, render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { ApplicationRuntimeForm } from './application-runtime-form';

const photoReaders = vi.hoisted(() => new Map<string, (busy: boolean) => void>());

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useLazyGetAdmissionFormOptionsQuery: () => [vi.fn()],
}));
vi.mock('../admission-runtime-field', () => ({
  default: ({
    field,
    value,
    disabled,
    onChange,
    onBusyChange,
  }: {
    field: { label: string };
    value: string;
    disabled: boolean;
    onChange: (value: string) => void;
    onBusyChange?: (busy: boolean) => void;
  }) => {
    if (onBusyChange) photoReaders.set(field.label, onBusyChange);
    return (
      <input
        aria-label={field.label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  },
}));

type Props = ComponentProps<typeof ApplicationRuntimeForm>;
const section = (id: string, name: string, stepId: string, order: number) => ({
  id,
  code: id,
  name,
  stepId,
  stepName: stepId === 'personal' ? 'Personal information' : 'Medical information',
  stepDisplayOrder: stepId === 'personal' ? 0 : 1,
  displayOrder: order,
  fields: [{ id: `${id}-field`, code: id, label: `${name} answer`, fieldType: 0, required: false }],
});

function renderForm(overrides: Partial<Props> = {}) {
  const onValidateStep = vi.fn(() => true);
  function TestForm() {
    const [values, setValues] = useState<Record<string, string>>({});
    return (
      <ApplicationRuntimeForm
        application={{ status: 0 } as Props['application']}
        form={
          {
            formVersion: 1,
            academicYearId: 'year',
            status: 0,
            definition: {
              name: 'Admission application',
              layoutType: 1,
              fieldsPerRow: 2,
              sections: [
                section('basic', 'Basic details', 'personal', 0),
                section('contact', 'Contact details', 'personal', 1),
                section('medical', 'Health details', 'medical', 2),
              ],
            },
          } as Props['form']
        }
        values={values}
        errors={[]}
        fieldErrors={{}}
        saving={false}
        submitting={false}
        onChange={(code, value) => setValues((current) => ({ ...current, [code]: value }))}
        onBlur={vi.fn()}
        onSave={async () => undefined}
        onValidateStep={onValidateStep}
        onSubmit={vi.fn()}
        showSaveDraft
        canSubmitForm
        managedFormStage={false}
        canReopen={false}
        reopening={false}
        onReopen={vi.fn()}
        {...overrides}
      />
    );
  }
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <TestForm />
    </ThemeProvider>
  );
  return { onValidateStep };
}

describe('application form step navigation', () => {
  it('validates every section before advancing and keeps answers when returning', async () => {
    const user = userEvent.setup();
    const { onValidateStep } = renderForm();
    expect(screen.getByText('Basic details')).toBeVisible();
    expect(screen.getByText('Contact details')).toBeVisible();
    await user.type(
      screen.getByRole('textbox', { name: 'Basic details answer' }),
      'Student answer'
    );
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onValidateStep.mock.calls).toEqual([['basic'], ['contact']]);
    expect(screen.getByText('Health details')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(screen.getByRole('textbox', { name: 'Basic details answer' })).toHaveValue(
      'Student answer'
    );
  }, 15000);

  it('stays on the current step when section validation fails', async () => {
    const user = userEvent.setup();
    const validate = vi.fn(() => false);
    renderForm({ onValidateStep: validate });
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(validate).toHaveBeenCalledWith('basic');
    expect(screen.getByText('Basic details')).toBeVisible();
    expect(screen.queryByText('Health details')).not.toBeInTheDocument();
  });

  it('locks input, saving, submission, and navigation while a request is pending', () => {
    renderForm({ submitting: true });
    expect(screen.getByRole('textbox', { name: 'Basic details answer' })).toBeDisabled();
    ['Next', 'Save draft', 'Save & continue', 'Submit application'].forEach((name) => {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    });
  });

  it('waits for a photo read before allowing draft save or submission', () => {
    renderForm();
    act(() => photoReaders.get('Basic details answer')?.(true));
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Submit application' })).toBeDisabled();
    act(() => photoReaders.get('Basic details answer')?.(false));
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Submit application' })).toBeEnabled();
  });
});
