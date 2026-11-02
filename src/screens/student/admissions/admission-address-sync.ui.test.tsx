import type { ComponentProps } from 'react';

import { useState } from 'react';
import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { act, screen, cleanup, waitFor } from '@testing-library/react';

import { renderDocumentUi } from './document-verification/document-ui-test-fixture';
import { ApplicationRuntimeForm } from './application-detail/application-runtime-form';
import { FormBuilderLivePreview } from './form-dialog/components/form-builder-live-preview';
import { newField, getBlankAdmissionFormInitialValues } from './form-dialog/form-dialog-model';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));

function addressForm(purpose: 0 | 1) {
  const form = getBlankAdmissionFormInitialValues(purpose);
  form.layoutType = purpose;
  const section = form.sections[0];
  section.fields = (
    [
      ['CUR_STREET', 'Current street', 'Address.AddressLine1', 0],
      ['CUR_POST', 'Current postal code', 'Address.PostalCode', 0],
      ['SAME', 'Permanent address same as current', 'PermanentAddress.SameAsCurrent', 9],
      ['PERM_STREET', 'Permanent street', 'PermanentAddress.Line1', 0],
      ['PERM_POST', 'Permanent postal code', 'PermanentAddress.PostalCode', 0],
    ] as const
  ).map(([code, label, bindingKey, fieldType], index) => ({
    ...newField(section.id, index),
    code,
    label,
    bindingKey,
    bindingType: 0,
    fieldType,
    required: false,
  }));
  return form;
}

it.each([0, 1] as const)(
  'copies and synchronizes address fields in purpose %i, then permits independent editing after unchecking',
  async (purpose) => {
    const user = userEvent.setup();
    const form = addressForm(purpose);
    renderDocumentUi(<FormBuilderLivePreview form={form} />);
    await user.type(screen.getByRole('textbox', { name: 'Current street' }), 'QA Garden Road');
    await user.type(screen.getByRole('textbox', { name: 'Current postal code' }), '380015');
    await user.click(screen.getByRole('checkbox', { name: 'Permanent address same as current' }));
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Permanent street' })).toHaveValue(
        'QA Garden Road'
      )
    );
    expect(screen.getByRole('textbox', { name: 'Permanent postal code' })).toHaveValue('380015');
    expect(screen.getByRole('textbox', { name: 'Permanent street' })).toBeDisabled();
    await user.type(screen.getByRole('textbox', { name: 'Current street' }), ' Extension');
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Permanent street' })).toHaveValue(
        'QA Garden Road Extension'
      )
    );
    await user.click(screen.getByRole('checkbox', { name: 'Permanent address same as current' }));
    expect(screen.getByRole('textbox', { name: 'Permanent street' })).toBeEnabled();
    expect(screen.getByRole('textbox', { name: 'Permanent street' })).toHaveValue(
      'QA Garden Road Extension'
    );
    await user.clear(screen.getByRole('textbox', { name: 'Permanent street' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Permanent street' }),
      'Independent address'
    );
    expect(screen.getByRole('textbox', { name: 'Current street' })).toHaveValue(
      'QA Garden Road Extension'
    );
  }
);

type RuntimeProps = ComponentProps<typeof ApplicationRuntimeForm>;

function runtimeProps(definition = addressForm(1)): RuntimeProps {
  return {
    application: { status: 0 } as RuntimeProps['application'],
    form: {
      formInstanceId: 'address-response',
      formDefinitionId: 'address-definition',
      academicYearId: 'year',
      values: [],
      formVersion: 1,
      status: 0,
      definition,
    } as RuntimeProps['form'],
    values: {},
    errors: [],
    fieldErrors: {},
    saving: false,
    submitting: false,
    onChange: vi.fn(),
    onBlur: vi.fn(),
    onSave: async () => true,
    onValidateStep: () => true,
    onSubmit: vi.fn(),
    showSaveDraft: true,
    canSubmitForm: true,
    managedFormStage: false,
    canReopen: false,
    reopening: false,
    onReopen: vi.fn(),
  };
}

it('saves synchronized Registration answers and restores the checked lock after remounting saved data', async () => {
  const user = userEvent.setup();
  const props = runtimeProps();
  let saved: Record<string, string> = {};
  function SavedRegistration({ initial = {} }: { initial?: Record<string, string> }) {
    const [values, setValues] = useState(initial);
    return (
      <ApplicationRuntimeForm
        {...props}
        values={values}
        onChange={(code, value) => setValues((current) => ({ ...current, [code]: value }))}
        onSave={async () => {
          saved = JSON.parse(JSON.stringify(values));
          return true;
        }}
      />
    );
  }
  renderDocumentUi(<SavedRegistration />);
  await user.type(screen.getByRole('textbox', { name: 'Current street' }), 'Saved current road');
  await user.type(screen.getByRole('textbox', { name: 'Current postal code' }), '380015');
  await user.click(screen.getByRole('checkbox', { name: 'Permanent address same as current' }));
  await waitFor(() =>
    expect(screen.getByRole('textbox', { name: 'Permanent street' })).toHaveValue(
      'Saved current road'
    )
  );
  await user.click(screen.getByRole('button', { name: /^Save$/ }));
  expect(saved).toMatchObject({
    SAME: 'true',
    PERM_STREET: 'Saved current road',
    PERM_POST: '380015',
  });
  cleanup();
  renderDocumentUi(<SavedRegistration initial={saved} />);
  expect(screen.getByRole('checkbox', { name: 'Permanent address same as current' })).toBeChecked();
  expect(screen.getByRole('textbox', { name: 'Permanent street' })).toHaveValue(
    'Saved current road'
  );
  expect(screen.getByRole('textbox', { name: 'Permanent street' })).toBeDisabled();
  await user.type(screen.getByRole('textbox', { name: 'Current street' }), ' updated');
  await waitFor(() =>
    expect(screen.getByRole('textbox', { name: 'Permanent street' })).toHaveValue(
      'Saved current road updated'
    )
  );
});

it('does not write hidden correction fields or immutable Registration snapshots', async () => {
  const definition = addressForm(1);
  definition.sections[0].fields.forEach((field) => {
    if (field.code.startsWith('PERM_'))
      field.visibilityRuleJson = JSON.stringify({
        field: 'SHOW',
        operator: 'equals',
        value: 'yes',
      });
  });
  const props = runtimeProps(definition);
  const onChange = vi.fn();
  const values = { CUR_STREET: 'Current', SAME: 'true', PERM_STREET: 'Frozen', SHOW: 'no' };
  await act(async () => {
    renderDocumentUi(
      <ApplicationRuntimeForm
        {...props}
        application={{ status: 6 } as RuntimeProps['application']}
        form={{ ...props.form, canCorrectForm: true }}
        correctionMode
        values={values}
        onChange={onChange}
      />
    );
  });
  expect(screen.queryByRole('textbox', { name: 'Permanent street' })).not.toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
  cleanup();
  await act(async () => {
    renderDocumentUi(
      <ApplicationRuntimeForm
        {...props}
        readOnly
        values={{ ...values, SHOW: 'yes' }}
        onChange={onChange}
      />
    );
  });
  expect(screen.getByRole('textbox', { name: 'Permanent street' })).toHaveValue('Frozen');
  expect(onChange).not.toHaveBeenCalled();
});

it('keeps hidden correction entries unchanged when a visible repeated entry shares its address codes', async () => {
  const definition = addressForm(1);
  const section = definition.sections[0];
  section.isRepeatable = true;
  section.minEntries = 0;
  section.maxEntries = 3;
  section.fields.push({
    ...newField(section.id, 5),
    code: 'SHOW',
    label: 'Show entry',
    fieldType: 0,
    required: false,
  });
  section.fields.forEach((field) => {
    if (field.code.startsWith('PERM_'))
      field.visibilityRuleJson = JSON.stringify({
        field: 'SHOW',
        operator: 'equals',
        value: 'yes',
      });
  });
  const props = runtimeProps(definition);
  const onChange = vi.fn();
  function CorrectionEntries() {
    const [values, setValues] = useState<Record<string, string>>({
      SAME: '["true","true"]',
      SHOW: '["no","yes"]',
      CUR_STREET: '["Hidden current","Visible current"]',
      PERM_STREET: '["Frozen hidden","Old visible"]',
    });
    return (
      <ApplicationRuntimeForm
        {...props}
        application={{ status: 6 } as RuntimeProps['application']}
        form={{ ...props.form, canCorrectForm: true }}
        correctionMode
        onChange={(code, value) => {
          onChange(code, value);
          setValues((current) => ({ ...current, [code]: value }));
        }}
        values={values}
      />
    );
  }
  await act(async () => {
    renderDocumentUi(<CorrectionEntries />);
  });
  expect(screen.getAllByRole('textbox', { name: 'Permanent street' })).toHaveLength(1);
  expect(screen.getByRole('textbox', { name: 'Permanent street' })).toHaveValue('Visible current');
  expect(onChange).toHaveBeenCalledExactlyOnceWith(
    'PERM_STREET',
    '["Frozen hidden","Visible current"]'
  );
});
