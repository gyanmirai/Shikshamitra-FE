import dayjs from 'dayjs';
import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import EmployeeFrom from './employee-form';

const mocks = vi.hoisted(() => ({ create: vi.fn(), values: {} as Record<string, unknown> }));

vi.mock('react-redux', () => ({
  useSelector: (selector: any) =>
    selector({ globalState: { currentYear: { id: 'year' } }, confirmPopup: { isChanges: false } }),
  useDispatch: () => vi.fn(),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ type }: any) => (type === 'mutation' ? [mocks.create] : {}),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: () => null }));
vi.mock('./employee-form-fields', () => ({ allFields: [] }));
vi.mock('./payroll-profile-workspace', () => ({ PayrollProfileWorkspace: () => null }));
vi.mock('./payroll-edit-details', () => ({ PayrollEditDetails: () => null }));
// Keep the production form's selected schema and create handler, with a small Formik submit shell.
vi.mock('src/components/custom-stepper', async () => {
  const { useFormik } = await import('formik');
  return {
    CustomStepperWithFormik: ({ initialValues, validationSchema, handleNext, activeStep }: any) => {
      const formik = useFormik({
        initialValues: { ...initialValues, ...mocks.values },
        validationSchema,
        onSubmit: (values): void => {
          handleNext(false, values, formik, vi.fn());
        },
      });
      return (
        <form onSubmit={formik.handleSubmit}>
          <output data-testid="step">{activeStep}</output>
          <output data-testid="errors">{JSON.stringify(formik.errors)}</output>
          <button type="submit">Save & Next</button>
        </form>
      );
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.create.mockReturnValue({ unwrap: async () => ({ id: 'staff', userId: 'user' }) });
  mocks.values = {
    photo: '',
    firstName: 'Synthetic',
    lastName: 'Staff',
    dob: dayjs('1990-01-01'),
    familyCast: 'Synthetic',
    castType: '0',
    gender: '0',
    religion: '0',
    maritalStatus: '0',
    adharNo: '900123456789',
    panNo: 'ABCDE1234F',
    mobileNo: '9876543210',
    email: 'synthetic@example.invalid',
    dateOfJoining: dayjs('2026-04-01'),
    employeeGroup: '0',
    role: 'role',
    addressLine1: 'Synthetic building',
    addressLine2: 'Synthetic locality',
    country: { name: 'India', isoCode: 'IN' },
    state: { name: 'Gujarat', isoCode: 'GJ' },
    city: { name: 'Ahmedabad' },
    pincode: '380001',
    shift: 'shift',
  };
});

it.each([false, true])('creates directory staff with photo selected: %s', async (withPhoto) => {
  const photo = new File(['synthetic image'], 'profile.png', { type: 'image/png' });
  if (withPhoto) {
    mocks.values.photo = 'data:image/png;base64,c3ludGhldGlj';
    mocks.values.photoFile = photo;
  }
  render(<EmployeeFrom handleClose={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
  await waitFor(() => expect(screen.getByTestId('step')).toHaveTextContent('1'));
  expect(mocks.create).toHaveBeenCalledTimes(1);
  const body = mocks.create.mock.calls[0][0].body as FormData;
  expect(body.has('ProfilePicture')).toBe(withPhoto);
  if (withPhoto) {
    const uploadedPhoto = body.get('ProfilePicture') as File;
    expect(uploadedPhoto.name).toBe(photo.name);
    expect(await uploadedPhoto.text()).toBe(await photo.text());
  }
  expect(JSON.parse(body.get('Data') as string)).toMatchObject({
    firstName: 'Synthetic',
    email: 'synthetic@example.invalid',
    adharNo: '900123456789',
    panNo: 'ABCDE1234F',
  });
});

it.each([
  [
    'photo',
    `data:image/png;base64,${'a'.repeat(4 * 1024 * 1024 + 8)}`,
    'Photo size must be less than 3MB',
  ],
  ['adharNo', '', 'Aadhaar number is required'],
  ['panNo', '', 'PAN number is required'],
])('still rejects invalid %s during directory creation', async (field, value, message) => {
  mocks.values[field] = value;
  render(<EmployeeFrom handleClose={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
  await waitFor(() => expect(screen.getByTestId('errors')).toHaveTextContent(message));
  expect(mocks.create).not.toHaveBeenCalled();
  expect(screen.getByTestId('step')).toHaveTextContent('0');
});
