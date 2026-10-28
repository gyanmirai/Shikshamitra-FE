import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import userEvent from '@testing-library/user-event';
import { shikshaMitraToast } from 'src/components/toast';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useGetAdmissionInquiryManagementQuery } from 'src/redux/student/admissions/admission-inquiry-management-api';
import {
  useGetAdmissionInquiryQuery,
  useUpdateAdmissionInquiryMutation,
  useGetAdmissionInquiryCaptureContextQuery,
  useGetAdmissionInquiryCaptureCatalogueQuery,
} from 'src/redux/student/admissions/admission-inquiries-api';

import AdmissionInquiryEditPage, { getInquiryEditReturnUrl } from './admission-inquiry-edit-page';
import { AdmissionInquiryManagementPage } from './inquiry-management/admission-inquiry-management-page';

const push = vi.fn();
const update = vi.fn();
const { loadOfferingChoices } = vi.hoisted(() => ({
  loadOfferingChoices: () => ({ unwrap: () => Promise.resolve({ totalCount: 0, items: [] }) }),
}));

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));
vi.mock('src/components/empty-content', () => ({
  EmptyContent: ({ title, description }: { title: string; description: string }) => (
    <div>
      {title} {description}
    </div>
  ),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'inquiry-1' }),
  useRouter: () => ({ push }),
  useSearchParams: () =>
    new URLSearchParams('returnTo=%2Fstudent%2Fadmissions%2Fpipeline%3Fview%3Dactive'),
}));
vi.mock('src/redux/student/admissions/admission-inquiries-api', () => ({
  useGetAdmissionInquiryQuery: vi.fn(),
  useGetAdmissionInquiryTimelineQuery: () => ({ data: [], isLoading: false, isError: false }),
  useUpdateAdmissionInquiryMutation: vi.fn(),
  useGetAdmissionInquiryCaptureContextQuery: vi.fn(),
  useGetAdmissionInquiryCaptureCatalogueQuery: vi.fn(),
}));
vi.mock('src/redux/student/admissions/admission-inquiry-management-api', () => ({
  useGetAdmissionInquiryManagementQuery: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({
      globalState: { currentYear: { id: 'year-1' } },
      auth: { permissions: [{ name: 'Students.Admissions.Inquiries.Add', isGranted: true }] },
    }),
}));
vi.mock('src/redux/class/classApi', () => ({
  useGetClassByMediumQuery: () => ({
    currentData: [{ id: 'class-1', name: 'Class 1', educationMediumStageId: 'stage-1' }],
  }),
}));
vi.mock('src/redux/academicOrganizationOptions/academicOrganizationOptionsApi', () => ({
  useGetAcademicOrganizationOptionsQuery: () => ({
    currentData: {
      items: [
        {
          id: 'stage-1',
          boardId: 'board-1',
          boardName: 'CBSE',
          mediumId: 'medium-1',
          mediumName: 'English',
          label: 'Primary',
        },
      ],
    },
  }),
}));
vi.mock('src/redux/student/admissions/admission-offerings-api', () => ({
  useGetAdmissionOfferingQuery: () => ({
    currentData: {
      id: 'offering-1',
      admissionCycleId: 'cycle-1',
      boardId: 'board-1',
      mediumId: 'medium-1',
      standardId: 'class-1',
      name: 'Class 1',
      inquiryFormDefinitionId: 'form-v2',
    },
  }),
  useGetAdmissionOfferingAvailabilityQuery: () => ({ currentData: { canCreateInquiry: true } }),
  useLazyGetAdmissionOfferingsQuery: () => [loadOfferingChoices],
}));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormQuery: vi.fn(() => ({
    currentData: {
      id: 'form-v1',
      name: 'Original inquiry',
      version: 1,
      sections: [
        {
          id: 'details',
          code: 'details',
          name: 'Family details',
          displayOrder: 0,
          fields: [
            {
              id: 'name',
              code: 'name',
              label: 'Applicant name',
              fieldType: 0,
              bindingType: 0,
              bindingKey: 'Applicant.FirstName',
              required: true,
              readOnly: false,
              displayOrder: 0,
            },
            {
              id: 'guardian',
              code: 'guardian',
              label: 'Guardian name',
              fieldType: 0,
              bindingType: 0,
              bindingKey: 'Guardian.FirstName',
              required: true,
              readOnly: false,
              displayOrder: 1,
            },
            {
              id: 'mobile',
              code: 'mobile',
              label: 'Mobile number',
              fieldType: 4,
              bindingType: 0,
              bindingKey: 'Guardian.Mobile',
              required: true,
              readOnly: false,
              displayOrder: 2,
            },
            {
              id: 'notes',
              code: 'notes',
              label: 'Family notes',
              fieldType: 1,
              bindingType: 1,
              required: false,
              readOnly: false,
              displayOrder: 3,
            },
          ],
        },
      ],
    },
  })),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    info: vi.fn(),
    dismiss: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));
vi.mock('./use-admission-unsaved-changes', () => ({
  useAdmissionUnsavedChanges: vi.fn(),
}));

const originalForm = {
  id: 'form-v1',
  name: 'Original inquiry',
  version: 1,
  sections: [
    {
      id: 'details',
      code: 'details',
      name: 'Family details',
      displayOrder: 0,
      fields: [
        {
          id: 'name',
          code: 'name',
          label: 'Applicant name',
          fieldType: 0,
          bindingType: 0,
          bindingKey: 'Applicant.FirstName',
          required: true,
          readOnly: false,
          displayOrder: 0,
        },
        {
          id: 'guardian',
          code: 'guardian',
          label: 'Guardian name',
          fieldType: 0,
          bindingType: 0,
          bindingKey: 'Guardian.FirstName',
          required: true,
          readOnly: false,
          displayOrder: 1,
        },
        {
          id: 'mobile',
          code: 'mobile',
          label: 'Mobile number',
          fieldType: 4,
          bindingType: 0,
          bindingKey: 'Guardian.Mobile',
          required: true,
          readOnly: false,
          displayOrder: 2,
        },
        {
          id: 'notes',
          code: 'notes',
          label: 'Family notes',
          fieldType: 1,
          bindingType: 1,
          required: false,
          readOnly: false,
          displayOrder: 3,
        },
      ],
    },
  ],
};
const inquiry = {
  id: 'inquiry-1',
  concurrencyStamp: 'stamp-1',
  inquiryNumber: 'INQ-1',
  admissionCycleId: 'cycle-1',
  admissionOfferingId: 'offering-1',
  boardId: 'board-1',
  mediumId: 'medium-1',
  standardId: 'class-1',
  formResponseDefinitionId: 'form-v1',
  formDefinition: originalForm,
  formValues: [
    { fieldCode: 'name', valueJson: '"Riya Shah"' },
    { fieldCode: 'guardian', valueJson: '"Meera"' },
    { fieldCode: 'mobile', valueJson: '"9876543210"' },
    { fieldCode: 'notes', valueJson: '"Existing note"' },
  ],
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
    vi.mocked(useGetAdmissionInquiryCaptureCatalogueQuery).mockReturnValue({
      currentData: {
        periods: [{ id: 'cycle-1', name: '2026-27' }],
        academicOptions: [
          {
            boardId: 'board-1',
            boardName: 'CBSE',
            mediumId: 'medium-1',
            mediumName: 'English',
            standardId: 'class-1',
            standardName: 'Class 1',
          },
        ],
        offerings: [],
      },
    } as unknown as ReturnType<typeof useGetAdmissionInquiryCaptureCatalogueQuery>);
    vi.mocked(useGetAdmissionInquiryCaptureContextQuery).mockReturnValue({
      currentData: {
        academicYearStartDate: '2026-04-01',
        minimumAgeYears: 5,
        offering: {
          id: 'offering-1',
          admissionCycleId: 'cycle-1',
          boardId: 'board-1',
          mediumId: 'medium-1',
          standardId: 'class-1',
          name: 'Class 1',
        },
        form: { ...originalForm, id: 'form-v2', version: 2 },
        availability: { canCreateInquiry: true },
      },
    } as unknown as ReturnType<typeof useGetAdmissionInquiryCaptureContextQuery>);
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

  it('shows age from the offering year and saves a pinned-form edit despite the age warning', async () => {
    const dob = {
      id: 'dob',
      code: 'DOB',
      label: 'Date of birth',
      helpText: 'Enter the date from the birth certificate.',
      bindingKey: 'Applicant.DateOfBirth',
      bindingType: 0,
      displayOrder: 4,
      fieldType: 5,
      required: false,
      readOnly: false,
    };
    const edited = {
      ...inquiry,
      formDefinition: {
        ...originalForm,
        sections: originalForm.sections.map((section) => ({
          ...section,
          fields: [...section.fields, dob],
        })),
      },
      formValues: [...inquiry.formValues!, { fieldCode: 'DOB', valueJson: '"2022-01-01"' }],
    } as AdmissionInquiry;
    vi.mocked(useGetAdmissionInquiryQuery).mockReturnValue({
      data: edited,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useGetAdmissionInquiryQuery>);
    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AdmissionInquiryEditPage />
      </LocalizationProvider>
    );
    expect(screen.getByText('Age: 4y 3m · Minimum: 5y')).toBeVisible();
    await userEvent.hover(screen.getByLabelText('Date of birth information'));
    const ageDetails = await screen.findByRole('tooltip');
    expect(ageDetails).toHaveTextContent('Enter the date from the birth certificate.');
    expect(ageDetails).toHaveTextContent(/academic year start.*01-04-2026/);
    await waitFor(() =>
      expect(shikshaMitraToast.warning).toHaveBeenCalledWith({
        message: expect.stringContaining('below the minimum age of 5 years'),
      })
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Family notes' }), {
      target: { value: 'QA age warning is advisory' },
    });
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            formValues: expect.arrayContaining([{ fieldCode: 'DOB', valueJson: '"2022-01-01"' }]),
          }),
        })
      )
    );
  });

  it('uses the pinned form default and saves original field codes after switching language', async () => {
    const user = userEvent.setup();
    const multilingualInquiry = {
      ...inquiry,
      formDefinition: {
        ...inquiry.formDefinition!,
        defaultLanguage: 'gu',
        supportedLanguages: ['en', 'gu', 'hi'],
        sections: inquiry.formDefinition!.sections.map((section) => ({
          ...section,
          fields: section.fields.map((field) =>
            field.code === 'name'
              ? {
                  ...field,
                  translations: {
                    gu: { label: 'વિદ્યાર્થીનું નામ', placeholder: 'નામ લખો' },
                    hi: { label: 'विद्यार्थी का नाम', placeholder: 'नाम लिखें' },
                  },
                }
              : field
          ),
        })),
      },
    };
    vi.mocked(useGetAdmissionInquiryQuery).mockReturnValue({
      data: multilingualInquiry,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useGetAdmissionInquiryQuery>);
    render(<AdmissionInquiryEditPage />);
    expect(screen.getByText('Original inquiry · Version 1')).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Form language' })).toHaveTextContent('Gujarati');
    expect(screen.getByRole('textbox', { name: 'વિદ્યાર્થીનું નામ' })).toHaveValue('Riya Shah');
    await user.click(screen.getByRole('combobox', { name: 'Form language' }));
    await user.click(screen.getByRole('option', { name: 'Hindi' }));
    await user.clear(screen.getByRole('textbox', { name: 'विद्यार्थी का नाम' }));
    await user.type(screen.getByRole('textbox', { name: 'विद्यार्थी का नाम' }), 'QA updated');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            applicantName: 'QA updated',
            preferredLanguageCode: 'en',
            concurrencyStamp: 'stamp-1',
            formValues: expect.arrayContaining([{ fieldCode: 'name', valueJson: '"QA updated"' }]),
          }),
        })
      )
    );
  });

  it('shows editable details and saves with the current concurrency stamp', async () => {
    render(<AdmissionInquiryEditPage />);

    expect(screen.getByRole('heading', { name: 'Edit inquiry' })).toBeInTheDocument();
    expect(screen.getByText('Original inquiry · Version 1')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Form history' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Status' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Schedule follow-up' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Family notes' })).toHaveValue('Existing note');
    fireEvent.change(screen.getByRole('textbox', { name: 'Applicant name' }), {
      target: { value: 'Riya S' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'inquiry-1',
          body: expect.objectContaining({
            applicantName: 'Riya S',
            concurrencyStamp: 'stamp-1',
            formValues: expect.arrayContaining([
              { fieldCode: 'notes', valueJson: '"Existing note"' },
            ]),
          }),
        })
      )
    );
  });

  it('uses the same edit-only form from the inquiry list and protects dirty footer cancellation', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    render(<AdmissionInquiryManagementPage inquiry={inquiry} onClose={close} />);

    expect(screen.queryByRole('heading', { name: 'Form history' })).not.toBeInTheDocument();
    expect(screen.getByText('Original inquiry · Version 1')).toBeVisible();
    const name = screen.getByRole('textbox', { name: 'Applicant name' });
    await user.clear(name);
    await user.type(name, 'Unsaved inquiry edit');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(close).not.toHaveBeenCalled();
    expect(name).toHaveValue('Unsaved inquiry edit');
    expect(await screen.findByRole('dialog', { name: 'Discard changes?' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Discard' }));
    expect(close).toHaveBeenCalledOnce();
    expect(update).not.toHaveBeenCalled();
  });

  it('preserves the draft when a status save refreshes the concurrency stamp', async () => {
    const { rerender } = render(<AdmissionInquiryEditPage />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Applicant name' }), {
      target: { value: 'Riya Updated' },
    });
    vi.mocked(useGetAdmissionInquiryQuery).mockReturnValue({
      data: { ...inquiry, status: 2, concurrencyStamp: 'status-stamp' },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useGetAdmissionInquiryQuery>);
    rerender(<AdmissionInquiryEditPage />);
    expect(screen.getByRole('textbox', { name: 'Applicant name' })).toHaveValue('Riya Updated');
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            applicantName: 'Riya Updated',
            concurrencyStamp: 'status-stamp',
          }),
        })
      )
    );
  });

  it('does not replace an unavailable original form with the latest configured version', () => {
    vi.mocked(useGetAdmissionInquiryQuery).mockReturnValue({
      data: { ...inquiry, formDefinition: null },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useGetAdmissionInquiryQuery>);
    render(<AdmissionInquiryEditPage />);
    expect(screen.getByText(/original attached inquiry form is unavailable/i)).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Applicant name' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
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
