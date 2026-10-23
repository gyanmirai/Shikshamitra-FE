import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import RecordChangeForm from './record-change-form';

const mocks = vi.hoisted(() => ({ submit: vi.fn(), submitted: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ globalState: { currentYear: { boards: [] } } }),
}));
vi.mock('src/hooks/use-unsaved-navigation', () => ({
  useUnsavedNavigation: () => ({ confirmation: null }),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    success: vi.fn(),
  },
}));
vi.mock('src/components/form-section-card', () => ({
  FormSectionCard: ({ title, children }: any) => <section aria-label={title}>{children}</section>,
}));
vi.mock('@mui/x-date-pickers/DatePicker', () => ({ DatePicker: () => <span>Date of birth</span> }));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, onChange }: any) => (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    >
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('src/components/upload', () => ({ UploadAvatar: () => <span>Photo upload</span> }));
vi.mock('src/components/studentProfile/form-fields/components/AddressSection', () => ({
  default: () => null,
}));
vi.mock('src/components/studentProfile/form-fields/components/ContactDetailsSection', () => ({
  default: () => null,
}));
vi.mock('src/components/studentProfile/form-fields/register-fields', () => ({ familyFields: [] }));
vi.mock('src/components/studentProfile/form-fields/render-medical-details', () => ({
  medicalFields: [],
}));
vi.mock('src/components/studentProfile/form-fields/render-bank-details', () => ({
  bankDetailsFields: [],
}));
vi.mock('src/components/studentProfile/form-fields/render-communication', () => ({
  communicationFields: [],
}));
vi.mock('src/components/studentProfile/form-fields/render-previous-details', () => ({
  previousSchoolFields: [],
}));
vi.mock('src/components/studentProfile/form-fields/render-additional-details', () => ({
  additionalDetailsFields: [],
}));
vi.mock('src/components/studentProfile/form-fields/initialvalues', () => {
  const initializer = (value: any) => ({
    ...value,
    dob: value.dateOfBirth,
    religion: '',
    nationality: '',
    standardId: undefined,
  });
  return {
    generalFieldsInitialValues: initializer,
    bankDetailsInitialValues: initializer,
    familyFieldsInitialValues: initializer,
    medicalFieldsInitialValues: initializer,
    additionalDetailsInitialValues: initializer,
    CommunicationFieldsInitialValues: initializer,
    previousSchoolFieldsInitialValues: initializer,
  };
});
vi.mock('src/redux/student/records/student-record-changes-api', () => ({
  useCreateStudentRecordChangeMutation: () => [mocks.submit, { isLoading: false }],
  useUploadStudentRecordPhotoDraftMutation: () => [vi.fn(), { isLoading: false }],
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.submit.mockImplementation(() => ({
    unwrap: () => Promise.resolve({ id: 'request-1', status: 'Pending' }),
  }));
});

describe('Governed record changes', () => {
  it('accepts the permanent profile of a student with a single name', async () => {
    render(
      <RecordChangeForm
        studentId="student-1"
        snapshot={{
          section: 'general',
          snapshot: 'snapshot-1',
          data: { firstName: 'Aanya', lastName: '', dateOfBirth: '2015-01-01', gender: 1 },
        }}
        onSubmitted={mocks.submitted}
      />
    );
    fireEvent.change(screen.getByLabelText('Reason for change'), {
      target: { value: 'Verified contact correction for the permanent profile' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit change' }));
    await waitFor(() => expect(mocks.submit).toHaveBeenCalledOnce());
    expect(mocks.submit.mock.calls[0][0].payload.lastName).toBe('');
  });
  it('preserves hidden identity and placement fields when editing the shown name', async () => {
    const source = {
      firstName: 'Riya',
      lastName: 'Shah',
      middleName: '',
      dateOfBirth: '2015-01-01',
      gender: 1,
      religion: 'Hindu',
      nationality: 'Indian',
      standardId: 'class-1',
      divisionId: 'division-1',
      academicMediumId: 'medium-1',
      aadharNo: 'verified-id',
      profilePictureUrl: 'approved-photo',
    };
    render(
      <RecordChangeForm
        studentId="student-1"
        snapshot={{ section: 'general', snapshot: 'snapshot-1', data: source }}
        onSubmitted={mocks.submitted}
      />
    );
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Riya corrected' } });
    fireEvent.change(screen.getByLabelText('Reason for change'), {
      target: { value: 'Verified spelling correction' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit change' }));
    await waitFor(() => expect(mocks.submit).toHaveBeenCalledOnce());
    expect(mocks.submit.mock.calls[0][0]).toMatchObject({
      studentId: 'student-1',
      expectedSnapshot: 'snapshot-1',
      payload: { ...source, firstName: 'Riya corrected' },
    });
    expect(mocks.submitted).toHaveBeenCalledWith('request-1');
  });
  it('keeps the entered details when the current record changes before submission', async () => {
    mocks.submit.mockImplementation(() => ({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('Stale'), {
            data: { error: { code: 'Students:Records:StaleSnapshot' } },
          })
        ),
    }));
    render(
      <RecordChangeForm
        studentId="student-1"
        snapshot={{ section: 'status', snapshot: 'snapshot-1', data: { status: 6 } }}
        onSubmitted={mocks.submitted}
      />
    );
    fireEvent.change(screen.getByLabelText('Reason for change'), {
      target: { value: 'Review operational status' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit change' }));
    expect(
      await screen.findByText('changed while you were editing', { exact: false })
    ).toBeVisible();
    expect(screen.getByLabelText('Reason for change')).toHaveValue('Review operational status');
    expect(mocks.submitted).not.toHaveBeenCalled();
  });
  it('requires a staged photo before submitting a photo request', () => {
    render(
      <RecordChangeForm
        studentId="student-1"
        snapshot={{
          section: 'photo',
          snapshot: 'snapshot-1',
          data: { photoDraftId: null, photoUrl: 'existing-photo', currentBlobName: 'protected' },
        }}
        onSubmitted={mocks.submitted}
      />
    );
    fireEvent.change(screen.getByLabelText('Reason for change'), {
      target: { value: 'Renew annual photograph' },
    });
    expect(screen.getByRole('button', { name: 'Submit change' })).toBeDisabled();
    expect(mocks.submit).not.toHaveBeenCalled();
  });
  it('keeps the original snapshot and entered draft when a refresh returns a newer record', async () => {
    const { rerender } = render(
      <RecordChangeForm
        studentId="student-1"
        snapshot={{ section: 'status', snapshot: 'snapshot-1', data: { status: 6 } }}
        onSubmitted={mocks.submitted}
      />
    );
    fireEvent.change(screen.getByLabelText('Reason for change'), {
      target: { value: 'Review the original operational status' },
    });
    rerender(
      <RecordChangeForm
        studentId="student-1"
        snapshot={{ section: 'status', snapshot: 'snapshot-2', data: { status: 7 } }}
        onSubmitted={mocks.submitted}
      />
    );
    expect(screen.getByText('Your draft is preserved', { exact: false })).toBeVisible();
    expect(screen.getByLabelText('Reason for change')).toHaveValue(
      'Review the original operational status'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit change' }));
    await waitFor(() => expect(mocks.submit).toHaveBeenCalledOnce());
    expect(mocks.submit.mock.calls[0][0]).toMatchObject({
      expectedSnapshot: 'snapshot-1',
      payload: { status: 6 },
    });
  });
});
