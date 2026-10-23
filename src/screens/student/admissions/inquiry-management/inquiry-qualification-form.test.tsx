import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';
import type { AdmissionInquiryManagement } from 'src/redux/student/admissions/admission-inquiry-management-api';

import { it, vi, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { InquiryQualificationForm } from './inquiry-qualification-form';

const mocks = vi.hoisted(() => ({ update: vi.fn(), error: vi.fn() }));
vi.mock('src/redux/student/admissions/admission-inquiries-api', () => ({
  useUpdateAdmissionInquiryMutation: () => [mocks.update, { isLoading: false }],
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, onChange }: any) => (
    <label htmlFor="test-status-select">
      {label}
      <select
        id="test-status-select"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  ),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    success: vi.fn(),
    error: mocks.error,
  },
}));
const inquiry = {
  id: 'inquiry-1',
  concurrencyStamp: 'inquiry-stamp',
  status: 0,
  applicantName: 'Riya',
  normalizedPhone: '9876543210',
  source: 1,
  preferredLanguageCode: 'en',
} as AdmissionInquiry;
const management = {
  inquiryId: 'inquiry-1',
  concurrencyStamp: 'management-stamp',
  qualificationAnswers: [],
  followUps: [],
} as unknown as AdmissionInquiryManagement;
beforeEach(() => {
  mocks.update.mockReset();
  mocks.error.mockReset();
  mocks.update.mockReturnValue({ unwrap: () => Promise.resolve(inquiry) });
});

it('offers three statuses and saves Interested without starting an application', async () => {
  const user = userEvent.setup();
  render(<InquiryQualificationForm value={management} inquiry={inquiry} />);
  expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
    'Pending',
    'Interested',
    'Not interested',
  ]);
  fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), { target: { value: '2' } });
  await user.click(screen.getByRole('button', { name: 'Save status' }));
  await waitFor(() =>
    expect(mocks.update).toHaveBeenCalledWith({
      id: 'inquiry-1',
      body: expect.objectContaining({ status: 2, concurrencyStamp: 'inquiry-stamp' }),
    })
  );
});

it('explains a status concurrency conflict without discarding the selected status', async () => {
  const user = userEvent.setup();
  mocks.update.mockReturnValue({
    unwrap: () =>
      Promise.reject(
        Object.assign(new Error('One or more business rules were violated.'), {
          status: 409,
          data: {
            error: {
              code: 'Admissions:Inquiry:ConcurrencyConflict',
              message: 'One or more business rules were violated.',
            },
          },
        })
      ),
  });
  render(<InquiryQualificationForm value={management} inquiry={inquiry} />);
  fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), { target: { value: '2' } });
  await user.click(screen.getByRole('button', { name: 'Save status' }));
  await waitFor(() =>
    expect(mocks.error).toHaveBeenCalledWith({
      message:
        'This inquiry changed after it was loaded. Refresh the inquiry and try saving the status again.',
    })
  );
  expect(screen.getByRole('combobox', { name: 'Status' })).toHaveValue('2');
});

it('replaces an unhelpful generic business-rule message with status-specific recovery guidance', async () => {
  const user = userEvent.setup();
  mocks.update.mockReturnValue({
    unwrap: () =>
      Promise.reject(
        Object.assign(new Error('One or more business rules were violated.'), {
          data: { error: { message: 'One or more business rules were violated.' } },
        })
      ),
  });
  render(<InquiryQualificationForm value={management} inquiry={inquiry} />);
  fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), { target: { value: '2' } });
  await user.click(screen.getByRole('button', { name: 'Save status' }));
  await waitFor(() =>
    expect(mocks.error).toHaveBeenCalledWith({
      message: 'Unable to update inquiry status. Refresh the inquiry and try again.',
    })
  );
});

it('requires a reason for Not interested before persisting', async () => {
  const user = userEvent.setup();
  render(<InquiryQualificationForm value={management} inquiry={inquiry} />);
  fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), { target: { value: '6' } });
  await user.click(screen.getByRole('button', { name: 'Save status' }));
  expect(await screen.findByText('Enter a reason for this status change')).toBeInTheDocument();
  expect(mocks.update).not.toHaveBeenCalled();
  await user.type(
    screen.getByRole('textbox', { name: 'Status change reason *' }),
    'Family changed plans'
  );
  await user.click(screen.getByRole('button', { name: 'Save status' }));
  await waitFor(() =>
    expect(mocks.update).toHaveBeenCalledWith({
      id: 'inquiry-1',
      body: expect.objectContaining({ status: 6, statusReason: 'Family changed plans' }),
    })
  );
});
