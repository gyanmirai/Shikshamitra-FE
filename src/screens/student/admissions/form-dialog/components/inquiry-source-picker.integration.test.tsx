import { Formik } from 'formik';
import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { InquirySourcePicker } from './inquiry-source-picker';
import { getBlankAdmissionFormInitialValues } from '../form-dialog-model';
import { useFormInheritance, FormInheritanceProvider } from '../hooks/use-form-inheritance';

const requests = vi.hoisted(() => ({
  forms: vi.fn(),
  refetch: vi.fn(),
  permissions: [{ name: 'Students.Admissions.Forms.View', isGranted: true }],
}));
vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ auth: { permissions: requests.permissions } }),
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { error: vi.fn() } }));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useLazyGetAdmissionFormsQuery: () => [requests.forms],
  usePreviewAdmissionFormInheritanceMutation: () => [requests.refetch],
  useGetAdmissionFormInheritanceSourcesQuery: () => ({ refetch: requests.refetch }),
  useGetAdmissionFormQuery: () => ({ refetch: requests.refetch }),
}));

function Builder() {
  const inheritance = useFormInheritance()!;
  return (
    <>
      <button type="button" onClick={() => inheritance.setEnabled(!inheritance.enabled)}>
        Toggle Inquiry
      </button>
      <button
        type="button"
        onClick={() => inheritance.formik.setFieldValue('name', 'Updated draft')}
      >
        Edit draft
      </button>
      {inheritance.enabled && <InquirySourcePicker />}
    </>
  );
}

function setup() {
  render(
    <Formik initialValues={getBlankAdmissionFormInitialValues(1)} onSubmit={() => undefined}>
      {(formik) => (
        <FormInheritanceProvider formik={formik} active>
          <Builder />
        </FormInheritanceProvider>
      )}
    </Formik>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Toggle Inquiry' }));
}

beforeEach(() => {
  vi.clearAllMocks();
  requests.permissions = [{ name: 'Students.Admissions.Forms.View', isGranted: true }];
  requests.forms.mockImplementation(() => ({
    unwrap: async () => ({
      totalCount: 1,
      items: [{ id: 'published', name: 'Admission inquiry', version: 1 }],
    }),
  }));
});

it('loads published Inquiry forms on enabling reuse in a new Registration without typing', async () => {
  setup();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Preview using Inquiry form' }));
  expect(await screen.findByRole('option', { name: 'Admission inquiry · v1' })).toBeVisible();
  expect(requests.forms).toHaveBeenCalledWith({
    purpose: 0,
    status: 1,
    search: undefined,
    skipCount: 0,
    maxResultCount: 25,
  });
});

it('loads again after reuse is disabled and re-enabled without resetting the form', async () => {
  setup();
  await waitFor(() => expect(requests.forms).toHaveBeenCalledOnce());
  fireEvent.click(screen.getByRole('button', { name: 'Toggle Inquiry' }));
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Toggle Inquiry' }));
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Preview using Inquiry form' }));
  expect(await screen.findByRole('option', { name: 'Admission inquiry · v1' })).toBeVisible();
  expect(requests.forms).toHaveBeenCalledTimes(2);
});

it('offers retry when the initial published Inquiry request fails', async () => {
  requests.forms.mockImplementationOnce(() => ({
    unwrap: async () => {
      throw new Error('Offline');
    },
  }));
  setup();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Preview using Inquiry form' }));
  expect(await screen.findByText('Failed to load results')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Retry results' }));
  expect(await screen.findByRole('option', { name: 'Admission inquiry · v1' })).toBeVisible();
});

it('does not request published Inquiry forms without View permission', async () => {
  requests.permissions = [];
  setup();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Preview using Inquiry form' }));
  expect(await screen.findByText('No saved Inquiry forms')).toBeVisible();
  expect(requests.forms).not.toHaveBeenCalled();
});

it('preserves the search across ordinary draft edits and reloads the list when cleared', async () => {
  setup();
  await waitFor(() => expect(requests.forms).toHaveBeenCalledOnce());
  const input = screen.getByRole('combobox', { name: 'Preview using Inquiry form' });
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: 'Admission' } });
  await waitFor(() =>
    expect(requests.forms).toHaveBeenCalledWith(expect.objectContaining({ search: 'Admission' }))
  );
  const count = requests.forms.mock.calls.length;
  fireEvent.click(screen.getByRole('button', { name: 'Edit draft' }));
  expect(input).toHaveValue('Admission');
  expect(requests.forms).toHaveBeenCalledTimes(count);
  fireEvent.change(input, { target: { value: '' } });
  await waitFor(() =>
    expect(requests.forms).toHaveBeenLastCalledWith(expect.objectContaining({ search: undefined }))
  );
});
