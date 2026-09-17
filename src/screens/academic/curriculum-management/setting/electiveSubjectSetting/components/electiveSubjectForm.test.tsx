import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SettingElectiveSubjectForm from './electiveSubjectForm';

const mocks = vi.hoisted(() => ({
  useForm: vi.fn(),
}));

vi.mock('../hooks/useElectiveSubjectForm', () => ({
  useElectiveSubjectForm: mocks.useForm,
}));

vi.mock('src/components/customDialog', () => ({
  DialogScrollContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('src/components/back-popup-check/BackPopUpCheck', () => ({
  BackPopUpChecked: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('src/components/shaking-text-field', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('src/components/static-color/colorPickerCircle', () => ({
  default: () => <div>Color picker</div>,
}));

vi.mock('src/components/responsiveMultiSelect', () => ({
  ResponsiveMultiSelect: ({ disabled }: { disabled?: boolean }) => (
    <button type="button" disabled={disabled}>
      Subject selector
    </button>
  ),
}));

const editData = {
  id: 'group-1',
  name: 'Language Group',
  groupType: 'Language',
  description: 'Existing group',
  subjects: [
    { id: 'subject-1', name: 'English' },
    { id: 'subject-2', name: 'Computer Science' },
  ],
  subjectIds: ['subject-1', 'subject-2'],
  color: '#8E33FF',
  isUsed: true,
  canModifySubjects: false,
  createdBy: 'Admin',
};

const formik = {
  initialValues: {},
  values: {
    name: editData.name,
    groupType: editData.groupType,
    color: editData.color,
    description: editData.description,
    subjectIds: editData.subjectIds,
    sortOrder: '',
  },
  touched: {},
  errors: {},
  setFieldValue: vi.fn(),
  handleChange: vi.fn(),
  handleSubmit: vi.fn(),
};

describe('SettingElectiveSubjectForm subject membership lock', () => {
  beforeEach(() => {
    mocks.useForm.mockReturnValue({
      formik,
      subjectData: editData.subjects,
      isSubjectLoading: false,
      isSaveLoading: false,
      areSubjectsLocked: true,
    });
  });

  it('disables subject selection and explains the restriction for a used group', () => {
    render(<SettingElectiveSubjectForm open={{} as never} onClose={vi.fn()} editData={editData} />);

    expect(screen.getByRole('button', { name: 'Subject selector' })).toBeDisabled();
    expect(screen.getByText(/subject selection is locked/i)).toBeVisible();
    expect(screen.getByLabelText('Elective Group Name *')).toBeEnabled();
  });

  it('allows subject selection and omits the note for an unused group', () => {
    mocks.useForm.mockReturnValue({
      formik,
      subjectData: editData.subjects,
      isSubjectLoading: false,
      isSaveLoading: false,
      areSubjectsLocked: false,
    });

    render(
      <SettingElectiveSubjectForm
        open={{} as never}
        onClose={vi.fn()}
        editData={{ ...editData, isUsed: false, canModifySubjects: true }}
      />
    );

    expect(screen.getByRole('button', { name: 'Subject selector' })).toBeEnabled();
    expect(screen.queryByText(/subject selection is locked/i)).not.toBeInTheDocument();
  });
});
