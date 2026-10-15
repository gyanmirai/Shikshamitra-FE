import type { ComponentProps } from 'react';

import { useState } from 'react';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, within, fireEvent } from '@testing-library/react';

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
    error,
  }: {
    field: { label: string };
    value: string;
    disabled: boolean;
    onChange: (value: string) => void;
    onBusyChange?: (busy: boolean) => void;
    error?: string;
  }) => {
    if (onBusyChange) photoReaders.set(field.label, onBusyChange);
    return (
      <>
        <input
          aria-label={field.label}
          aria-invalid={Boolean(error)}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
        {error && <span>{error}</span>}
      </>
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
        onSave={async () => true}
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
  it('keeps field validation beside fields without a duplicate top banner and keeps API errors visible by the footer', () => {
    renderForm({
      compact: true,
      errors: [
        'Complete the highlighted fields before continuing.',
        'The saved form changed. Reload and try again.',
      ],
      fieldErrors: { basic: 'Basic details answer is required.' },
      sectionActions: <button type="button">Section verification</button>,
    });
    expect(screen.getByRole('textbox', { name: 'Basic details answer' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByText('Basic details answer is required.')).toBeVisible();
    expect(
      screen.queryByText('Complete the highlighted fields before continuing.')
    ).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The saved form changed. Reload and try again.'
    );
    expect(screen.getByRole('button', { name: 'Section verification' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Admission form' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Section verification' })).toHaveLength(1);
    ['Previous', 'Save', 'Save & Next'].forEach((name) =>
      expect(screen.getByRole('button', { name })).toHaveClass('MuiButton-sizeSmall')
    );
  });
  it('keeps a configured registration photo on the left without losing its field binding', () => {
    const basic = section('basic', 'Basic details', 'personal', 0);
    renderForm({
      form: {
        formVersion: 1,
        academicYearId: 'year',
        status: 0,
        definition: {
          name: 'Registration',
          layoutType: 0,
          fieldsPerRow: 2,
          sections: [
            {
              ...basic,
              fields: [
                ...basic.fields,
                {
                  id: 'photo',
                  code: 'PHOTO',
                  label: 'Student photo',
                  fieldType: 0,
                  required: false,
                  validationJson: '{"format":"photo"}',
                },
              ],
            },
          ],
        },
      } as Props['form'],
    });
    const photo = within(screen.getByLabelText('Profile photos')).getByRole('textbox', {
      name: 'Student photo',
    });
    const answer = within(screen.getByLabelText('Form fields')).getByRole('textbox', {
      name: 'Basic details answer',
    });
    fireEvent.change(answer, { target: { value: 'Retained name' } });
    fireEvent.change(photo, { target: { value: 'photo-answer' } });
    expect(photo).toHaveValue('photo-answer');
    expect(answer).toHaveValue('Retained name');
    expect(screen.getAllByRole('textbox')).toEqual([photo, answer]);
  });

  it('saves in place and replaces the forward action with submission only on the last step', async () => {
    const user = userEvent.setup();
    const save = vi.fn(async () => true);
    const submit = vi.fn();
    renderForm({ compact: true, onSave: save, onSubmit: submit });
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit application' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(save).toHaveBeenCalledOnce();
    expect(screen.getByText('Basic details')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Save & Next' }));
    expect(save).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('button', { name: 'Save & Next' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Submit application' }));
    expect(submit).toHaveBeenCalledOnce();
  });

  it('keeps single-page forms submit-capable and respects their submission permission', () => {
    renderForm({
      compact: true,
      canSubmitForm: false,
      form: {
        status: 0,
        definition: { layoutType: 0, sections: [section('basic', 'Basic details', 'personal', 0)] },
      } as Props['form'],
      beforeActions: <div>Staff verification</div>,
    });
    expect(screen.queryByRole('navigation', { name: 'Form steps' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save & Next' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit application' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    expect(screen.getByText('Staff verification')).toBeVisible();
  });

  it('prevents duplicate forwards and section changes until the save finishes', async () => {
    const user = userEvent.setup();
    let finishSave!: (saved: boolean) => void;
    const save = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          finishSave = resolve;
        })
    );
    renderForm({ compact: true, onSave: save });
    await user.click(screen.getByRole('button', { name: 'Save & Next' }));
    expect(screen.getByRole('button', { name: 'Save & Next' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Medical information' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Basic details answer' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
    expect(save).toHaveBeenCalledOnce();
    await act(async () => finishSave(true));
    expect(screen.getByRole('textbox', { name: 'Health details answer' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Submit application' })).toBeEnabled();
  });

  it('keeps historical review read-only while allowing navigation through the configured form sections', async () => {
    const user = userEvent.setup();
    const save = vi.fn();
    const submit = vi.fn();
    renderForm({ compact: true, readOnly: true, onSave: save, onSubmit: submit });
    expect(screen.getByRole('textbox', { name: 'Basic details answer' })).toBeDisabled();
    ['Save', 'Save & Next', 'Submit application', 'Reopen form'].forEach((name) => {
      expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('textbox', { name: 'Health details answer' })).toBeDisabled();
    expect(save).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
  });

  it('uses the horizontal compact workspace without duplicate form headings and retains answers across sections', async () => {
    const user = userEvent.setup();
    renderForm({ compact: true });
    expect(screen.queryByText('Admission application · v1')).not.toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Form steps' }).querySelector('.MuiStepper-horizontal')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Form steps' }).querySelector('[data-simplebar]')
    ).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Basic details answer' }), 'Saved student');
    await user.click(screen.getByRole('button', { name: 'Save & Next' }));
    expect(screen.getByText('Health details')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(screen.getByRole('textbox', { name: 'Basic details answer' })).toHaveValue(
      'Saved student'
    );
    expect(screen.getAllByRole('button', { name: 'Save' })).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Submit application' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save & Next' })).toHaveClass('MuiButton-sizeSmall');
  }, 15000);

  it('validates and saves the configured section group before continuing in the compact footer', async () => {
    const user = userEvent.setup();
    const calls: string[] = [];
    renderForm({
      compact: true,
      onValidateStep: (id) => {
        calls.push(id);
        return true;
      },
      onSave: async () => {
        calls.push('save');
        return true;
      },
    });
    await user.click(screen.getByRole('button', { name: 'Save & Next' }));
    expect(calls).toEqual(['basic', 'contact', 'save']);
    expect(screen.getByText('Health details')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Save & Next' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit application' })).toBeEnabled();
  });

  it('preserves the active section and its answers when Save & Next cannot persist', async () => {
    const user = userEvent.setup();
    const save = vi.fn(async () => false);
    renderForm({ compact: true, onSave: save });
    await user.type(
      screen.getByRole('textbox', { name: 'Basic details answer' }),
      'Keep this answer'
    );
    await user.click(screen.getByRole('button', { name: 'Save & Next' }));
    expect(save).toHaveBeenCalledOnce();
    expect(screen.getByRole('textbox', { name: 'Basic details answer' })).toHaveValue(
      'Keep this answer'
    );
    expect(screen.getByRole('button', { name: 'Personal information' })).toHaveAttribute(
      'aria-current',
      'step'
    );
    expect(screen.queryByText('Step 1 of 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Health details')).not.toBeInTheDocument();
  });

  it('keeps compact fields, step navigation and footer actions locked while saving', () => {
    renderForm({ compact: true, saving: true });
    expect(screen.getByRole('textbox', { name: 'Basic details answer' })).toBeDisabled();
    ['Save', 'Save & Next', 'Previous'].forEach((name) => {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    });
    expect(screen.getByRole('button', { name: 'Medical information' })).toBeDisabled();
  });

  it('validates every section before advancing and keeps answers when returning', async () => {
    const user = userEvent.setup();
    const { onValidateStep } = renderForm();
    expect(screen.getByText('Basic details')).toBeVisible();
    expect(screen.getByText('Contact details')).toBeVisible();
    await user.type(
      screen.getByRole('textbox', { name: 'Basic details answer' }),
      'Student answer'
    );
    await user.click(screen.getByRole('button', { name: 'Save & Next' }));
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
    await user.click(screen.getByRole('button', { name: 'Save & Next' }));
    expect(validate).toHaveBeenCalledWith('basic');
    expect(screen.getByText('Basic details')).toBeVisible();
    expect(screen.queryByText('Health details')).not.toBeInTheDocument();
  });

  it('locks input, saving, submission, and navigation while a request is pending', () => {
    renderForm({ submitting: true });
    expect(screen.getByRole('textbox', { name: 'Basic details answer' })).toBeDisabled();
    ['Save', 'Save & Next', 'Previous'].forEach((name) => {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    });
  });

  it('waits for a photo read before allowing draft save or submission', () => {
    renderForm();
    act(() => photoReaders.get('Basic details answer')?.(true));
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save & Next' })).toBeDisabled();
    act(() => photoReaders.get('Basic details answer')?.(false));
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Save & Next' })).toBeEnabled();
  });
});
