import type { AdmissionFormField } from 'src/redux/student/admissions/admission-forms-api';

import { useFormik } from 'formik';
import { it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { initialAdmissionInquiryValues } from './admission-inquiry-model';
import {
  useInquiryPrimaryContact,
  changeInquiryPrimaryContact,
} from './use-inquiry-primary-contact';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));
const field = (code: string, bindingKey: string): AdmissionFormField => ({
  id: code,
  code,
  bindingKey,
  bindingType: 0,
  label: code,
  fieldType: 0,
  required: true,
  readOnly: false,
  displayOrder: 0,
});
const fields = [
  field('ROLE', 'Inquiry.ParentRelationship'),
  field('NAME', 'Guardian.FirstName'),
  field('PHONE', 'Guardian.Mobile'),
];
const submit = vi.fn();
it('clears a legacy saved Father identity when a newly configured selector changes its role', () => {
  const next = changeInquiryPrimaryContact(
    {
      ...initialAdmissionInquiryValues,
      capturedParentRelationship: 'father' as const,
      fields: { ROLE: '', NAME: 'Raj Shah', PHONE: '9876543210' },
    },
    fields,
    'ROLE',
    'mother'
  );
  expect(next.fields).toEqual({ ROLE: 'mother', NAME: '', PHONE: '' });
});
function Harness({ contextKey = 'one' }: { contextKey?: string }) {
  const formik = useFormik({
    initialValues: {
      ...initialAdmissionInquiryValues,
      fields: { ROLE: 'father', NAME: 'Raj Shah', PHONE: '9876543210' },
    },
    onSubmit: submit,
  });
  const contact = useInquiryPrimaryContact({ formik, fields, contextKey });
  return (
    <form onSubmit={formik.handleSubmit}>
      <button type="button" onClick={() => contact.changeField(fields[0], 'guardian')}>
        Guardian
      </button>
      <button type="button" onClick={() => contact.changeField(fields[0], 'mother')}>
        Mother
      </button>
      <output data-testid="values">{JSON.stringify(formik.values)}</output>
      {contact.confirmation}
    </form>
  );
}
it('stages Guardian, cancels with the previous identity intact, and confirms without submitting', async () => {
  submit.mockClear();
  const user = userEvent.setup();
  render(<Harness />);
  await user.click(screen.getByRole('button', { name: 'Guardian' }));
  expect(screen.getByRole('dialog')).toBeVisible();
  expect(JSON.parse(screen.getByTestId('values').textContent!).fields).toEqual({
    ROLE: 'father',
    NAME: 'Raj Shah',
    PHONE: '9876543210',
  });
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(JSON.parse(screen.getByTestId('values').textContent!).fields).toEqual({
    ROLE: 'father',
    NAME: 'Raj Shah',
    PHONE: '9876543210',
  });
  await user.click(screen.getByRole('button', { name: 'Guardian' }));
  await user.click(screen.getByRole('button', { name: 'Confirm guardian' }));
  expect(JSON.parse(screen.getByTestId('values').textContent!)).toMatchObject({
    guardianResponsibilityConfirmed: true,
    fields: { ROLE: 'guardian', NAME: '', PHONE: '' },
  });
  expect(submit).not.toHaveBeenCalled();
});
it('clears the previous adult on an actual role change and dismisses pending confirmation on context change', async () => {
  const user = userEvent.setup();
  const view = render(<Harness />);
  await user.click(screen.getByRole('button', { name: 'Mother' }));
  expect(JSON.parse(screen.getByTestId('values').textContent!).fields).toEqual({
    ROLE: 'mother',
    NAME: '',
    PHONE: '',
  });
  await user.click(screen.getByRole('button', { name: 'Guardian' }));
  view.rerender(<Harness contextKey="two" />);
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});
