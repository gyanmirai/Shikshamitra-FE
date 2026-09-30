import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useGetAdmissionInquiryManagementQuery } from 'src/redux/student/admissions/admission-inquiry-management-api';
import {
  useGetAdmissionInquiryQuery,
  useUpdateAdmissionInquiryMutation,
} from 'src/redux/student/admissions/admission-inquiries-api';

import AdmissionInquiryEditPage, { getInquiryEditReturnUrl } from './admission-inquiry-edit-page';

const push = vi.fn();
const update = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'inquiry-1' }),
  useRouter: () => ({ push }),
  useSearchParams: () =>
    new URLSearchParams('returnTo=%2Fstudent%2Fadmissions%2Fpipeline%3Fview%3Dactive'),
}));
vi.mock('src/redux/student/admissions/admission-inquiries-api', () => ({
  useGetAdmissionInquiryQuery: vi.fn(),
  useUpdateAdmissionInquiryMutation: vi.fn(),
}));
vi.mock('src/redux/student/admissions/admission-inquiry-management-api', () => ({
  useGetAdmissionInquiryManagementQuery: vi.fn(),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('./use-admission-unsaved-changes', () => ({
  useAdmissionUnsavedChanges: vi.fn(),
}));

const inquiry = {
  id: 'inquiry-1',
  concurrencyStamp: 'stamp-1',
  inquiryNumber: 'INQ-1',
  applicantName: 'Riya Shah',
  normalizedPhone: '9876543210',
  email: 'riya@example.com',
  source: 0,
  preferredLanguageCode: 'en',
  formAnswers: [{ fieldCode: 'class', label: 'Preferred class', value: 'Class 1' }],
} as AdmissionInquiry;

describe('Edit inquiry page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetAdmissionInquiryQuery).mockReturnValue({
      data: inquiry,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useGetAdmissionInquiryQuery>);
    vi.mocked(useGetAdmissionInquiryManagementQuery).mockReturnValue({
      data: { isLocked: false },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useGetAdmissionInquiryManagementQuery>);
    update.mockReturnValue({
      unwrap: () => Promise.resolve({ ...inquiry, concurrencyStamp: 'stamp-2' }),
    });
    vi.mocked(useUpdateAdmissionInquiryMutation).mockReturnValue([
      update,
      { isLoading: false },
    ] as unknown as ReturnType<typeof useUpdateAdmissionInquiryMutation>);
  });

  it('shows editable details and saves with the current concurrency stamp', async () => {
    render(<AdmissionInquiryEditPage />);

    expect(screen.getByRole('heading', { name: 'Edit inquiry' })).toBeInTheDocument();
    expect(screen.getByText('Class 1')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'Applicant name' }), {
      target: { value: 'Riya S' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'inquiry-1',
          body: expect.objectContaining({ applicantName: 'Riya S', concurrencyStamp: 'stamp-1' }),
        })
      )
    );
  });

  it('respects the application lock and returns to the pipeline filter', () => {
    vi.mocked(useGetAdmissionInquiryManagementQuery).mockReturnValue({
      data: { isLocked: true },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useGetAdmissionInquiryManagementQuery>);
    render(<AdmissionInquiryEditPage />);

    expect(
      screen.getByText(/read-only because its application has already started/)
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Applicant name' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(push).toHaveBeenCalledWith('/student/admissions/pipeline?view=active');
  });

  it('keeps the form hidden on an API error and offers a retry', () => {
    const refetch = vi.fn();
    vi.mocked(useGetAdmissionInquiryQuery).mockReturnValue({
      isLoading: false,
      isError: true,
      refetch,
    } as ReturnType<typeof useGetAdmissionInquiryQuery>);
    render(<AdmissionInquiryEditPage />);

    expect(screen.queryByRole('textbox', { name: 'Applicant name' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('rejects an unrelated return path', () => {
    expect(getInquiryEditReturnUrl('https://example.com')).toBe('/student/admissions/inquiries');
    expect(getInquiryEditReturnUrl('/student/admissions/inquiries-other')).toBe(
      '/student/admissions/inquiries'
    );
  });
});
