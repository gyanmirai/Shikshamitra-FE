import { it, vi, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { ApplicationRuntimeFormCore } from './application-runtime-form';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useLazyGetAdmissionFormOptionsQuery: () => {
    throw new Error('Authenticated options hook mounted');
  },
}));
vi.mock('../admission-master-data-runtime-field', () => ({
  AdmissionMasterDataRuntimeField: () => {
    throw new Error('Authenticated academic hook mounted');
  },
}));

it('renders the public frozen form without mounting staff hooks and restricts editable codes', () => {
  render(
    <ApplicationRuntimeFormCore
      application={{ status: 1 } as any}
      form={
        {
          status: 0,
          definition: {
            name: 'Registration',
            layoutType: 0,
            sections: [
              {
                id: 's',
                code: 's',
                name: 'Student Details',
                fields: [
                  { id: 'name', code: 'NAME', label: 'Student name', fieldType: 0 },
                  { id: 'locked', code: 'LOCKED', label: 'School value', fieldType: 0 },
                  {
                    id: 'class',
                    code: 'CLASS',
                    label: 'Class',
                    fieldType: 6,
                    optionsJson: JSON.stringify([{ value: 'c', label: 'Class 1', isActive: true }]),
                  },
                  {
                    id: 'sibling',
                    code: 'SIBLING',
                    label: 'Sibling search',
                    fieldType: 6,
                    bindingKey: 'Family.SiblingStudentIds',
                  },
                ],
              },
            ],
          },
        } as any
      }
      values={{}}
      errors={[]}
      fieldErrors={{}}
      saving={false}
      submitting={false}
      onChange={vi.fn()}
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
      publicMode
      editableFieldCodes={['NAME', 'CLASS', 'SIBLING']}
      canEditOverride
      submitLabel="Continue to review"
      saveLabel="Save draft"
    />
  );
  expect(screen.getByRole('textbox', { name: 'Student name' })).toBeEnabled();
  expect(screen.getByRole('textbox', { name: 'School value' })).toBeDisabled();
  expect(screen.getByRole('combobox', { name: 'Class' })).toBeEnabled();
  expect(screen.queryByLabelText('Sibling search')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Continue to review' })).toBeVisible();
});

it('clears an arbitrary-code academic child using public-safe parent metadata without staff queries', () => {
  const onChange = vi.fn();
  render(
    <ApplicationRuntimeFormCore
      application={{ status: 0 } as any}
      form={
        {
          status: 0,
          definition: {
            name: 'Registration',
            layoutType: 0,
            sections: [
              {
                id: 's',
                code: 's',
                name: 'Academic Details',
                fields: [
                  { id: 'p', code: 'CUSTOM_PARENT', label: 'Selected board', fieldType: 0 },
                  {
                    id: 'c',
                    code: 'CUSTOM_CHILD',
                    label: 'Selected medium',
                    fieldType: 6,
                    optionsJson: JSON.stringify([{ value: 'medium', label: 'English' }]),
                    optionsSourceJson: JSON.stringify({
                      source: 'EducationMediums',
                      parentField: 'CUSTOM_PARENT',
                    }),
                  },
                ],
              },
            ],
          },
        } as any
      }
      values={{ CUSTOM_PARENT: 'board', CUSTOM_CHILD: 'medium' }}
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
      publicMode
      editableFieldCodes={['CUSTOM_PARENT', 'CUSTOM_CHILD']}
      canEditOverride
    />
  );
  fireEvent.change(screen.getByRole('textbox', { name: 'Selected board' }), {
    target: { value: '' },
  });
  expect(onChange).toHaveBeenCalledWith('CUSTOM_CHILD', '');
});

it('requires the parent answer before enabling a resolved academic child without staff queries', () => {
  render(
    <ApplicationRuntimeFormCore
      application={{ status: 0 } as any}
      form={
        {
          status: 0,
          definition: {
            name: 'Registration',
            layoutType: 0,
            sections: [
              {
                id: 's',
                code: 's',
                name: 'Academic Details',
                fields: [
                  {
                    id: 'c',
                    code: 'CUSTOM_CHILD',
                    label: 'Selected medium',
                    fieldType: 6,
                    optionsJson: JSON.stringify([{ value: 'medium', label: 'English' }]),
                    optionsSourceJson: JSON.stringify({
                      source: 'EducationMediums',
                      parentField: 'CUSTOM_PARENT',
                    }),
                  },
                ],
              },
            ],
          },
        } as any
      }
      values={{}}
      errors={[]}
      fieldErrors={{}}
      saving={false}
      submitting={false}
      onChange={vi.fn()}
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
      publicMode
      editableFieldCodes={['CUSTOM_CHILD']}
      canEditOverride
    />
  );
  expect(screen.getByRole('combobox', { name: 'Selected medium' })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  expect(screen.getByText('Select the parent academic field first.')).toBeVisible();
});
