import type { AdmissionFormField } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { useFormik } from 'formik';
import userEvent from '@testing-library/user-event';
import { shikshaMitraToast } from 'src/components/toast';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import AdmissionInquiryFormPage from './admission-inquiry-form-page';
import { useAdmissionInquiryDialog } from './use-admission-inquiry-dialog';
import {
  validateAdmissionInquiry,
  type AdmissionInquiryFormValues,
} from './admission-inquiry-model';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('./use-admission-inquiry-dialog', () => ({ useAdmissionInquiryDialog: vi.fn() }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    warning: vi.fn(),
  },
}));

const preferredClassMessage =
  'Preferred class must match the selected offering (Class 1). Choose a matching offering or change the preferred class.';

function controller(overrides: Record<string, unknown> = {}) {
  return {
    formik: {
      values: {
        admissionCycleId: 'cycle-1',
        boardId: 'board-1',
        mediumId: 'medium-1',
        standardId: 'standard-1',
        offeringId: 'offering-1',
        source: 0,
        sourceDetail: '',
        sendAcknowledgement: false,
        fields: { FIRST_NAME: '', GUARDIAN_MOBILE: '', PREFERRED_CLASS: 'Class 2' },
      },
      errors: {
        fields: {
          FIRST_NAME: 'Applicant first name is required',
          GUARDIAN_MOBILE: 'Guardian mobile is required',
          PREFERRED_CLASS: preferredClassMessage,
        },
      },
      touched: { fields: {} },
      submitCount: 1,
      dirty: true,
      handleSubmit: vi.fn(),
      handleBlur: vi.fn(),
      setFieldValue: vi.fn(),
      setTouched: vi.fn(),
      setValues: vi.fn(),
    },
    periods: [{ id: 'cycle-1', name: '2026-27' }],
    academicLoading: false,
    academicError: false,
    canCreateInquiry: true,
    boards: [{ id: 'board-1', name: 'CBSE' }],
    mediums: [{ id: 'medium-1', name: 'English' }],
    standards: [{ id: 'standard-1', name: 'Class 1' }],
    offerings: [{ id: 'offering-1', name: 'Class 1 offering' }],
    selectedOffering: { id: 'offering-1', standardName: 'Class 1' },
    fields: [
      {
        id: 'first',
        code: 'FIRST_NAME',
        label: 'Applicant first name',
        fieldType: 0,
        required: true,
        readOnly: false,
      },
      {
        id: 'mobile',
        code: 'GUARDIAN_MOBILE',
        label: 'Guardian mobile',
        fieldType: 4,
        required: true,
        readOnly: false,
      },
      {
        id: 'preferred',
        code: 'PREFERRED_CLASS',
        label: 'Preferred class',
        bindingKey: 'Preference.Class',
        fieldType: 0,
        required: false,
        readOnly: false,
      },
    ],
    sections: [
      {
        id: 'student',
        name: 'Student details',
        fields: [
          {
            id: 'first',
            code: 'FIRST_NAME',
            label: 'Applicant first name',
            fieldType: 0,
            required: true,
            readOnly: false,
          },
          {
            id: 'mobile',
            code: 'GUARDIAN_MOBILE',
            label: 'Guardian mobile',
            fieldType: 4,
            required: true,
            readOnly: false,
          },
          {
            id: 'preferred',
            code: 'PREFERRED_CLASS',
            label: 'Preferred class',
            bindingKey: 'Preference.Class',
            fieldType: 0,
            required: false,
            readOnly: false,
          },
        ],
      },
    ],
    classCapacity: { capacity: 24, remainingSeats: 24, isFull: false },
    offeringsLoading: false,
    offeringsError: false,
    runtimeLoading: false,
    runtimeError: false,
    formLoading: false,
    workflowLoading: false,
    canAutoAcknowledge: false,
    allowedSources: [0],
    policy: { requireSourceDetailFor: [] },
    matches: [],
    currentGuardianPhone: '',
    requestError: null,
    busy: false,
    ...overrides,
  };
}

function useValidationController() {
  const fixture = controller();
  const fields = fixture.fields as AdmissionFormField[];
  const formik = useFormik<AdmissionInquiryFormValues>({
    initialValues: fixture.formik.values as AdmissionInquiryFormValues,
    validate: (values) =>
      validateAdmissionInquiry(
        values,
        fields,
        null,
        fixture.selectedOffering as AdmissionOfferingListItem
      ),
    onSubmit: vi.fn(),
  });
  return { ...fixture, formik } as unknown as ReturnType<typeof useAdmissionInquiryDialog>;
}

it('does not display publication requirements or disable capture for a legacy published form', () => {
  vi.mocked(useAdmissionInquiryDialog).mockReturnValue(
    controller({
      configurationIssues: ['Add a required Student name field before publishing.'],
    }) as unknown as ReturnType<typeof useAdmissionInquiryDialog>
  );
  render(<AdmissionInquiryFormPage />);
  expect(screen.getByRole('button', { name: 'Create inquiry' })).toBeEnabled();
  expect(shikshaMitraToast.error).not.toHaveBeenCalledWith(
    expect.objectContaining({ message: expect.stringContaining('before publishing') })
  );
});

function useMultilingualController() {
  const fixture = controller();
  const fields = fixture.sections[0].fields.map((field, index) =>
    index === 0
      ? {
          ...field,
          translations: {
            gu: {
              label: 'વિદ્યાર્થીનું નામ',
              placeholder: 'નામ લખો',
              helpText: 'પૂર્ણ નામ લખો',
              validationMessage: 'નામ જરૂરી છે',
            },
            hi: { label: 'विद्यार्थी का नाम', placeholder: 'नाम लिखें' },
          },
        }
      : field
  );
  const formik = useFormik({
    initialValues: fixture.formik.values,
    initialErrors: { fields: { FIRST_NAME: 'Applicant first name is required' } },
    initialTouched: { fields: { FIRST_NAME: true } },
    onSubmit: vi.fn(),
  });
  return {
    ...fixture,
    formik,
    fields,
    form: {
      id: 'form-1',
      version: 1,
      defaultLanguage: 'gu',
      supportedLanguages: ['en', 'gu', 'hi'],
    },
    sections: [
      { ...fixture.sections[0], translations: { gu: { label: 'વિદ્યાર્થીની વિગતો' } }, fields },
    ],
  } as unknown as ReturnType<typeof useAdmissionInquiryDialog>;
}

describe('New inquiry form', () => {
  it.each([
    { name: 'ADM-STD-4', code: 'ADM-STD-4', expected: 'ADM-STD-4' },
    { name: 'Class 4 admission', code: 'ADM-STD-4', expected: 'Class 4 admission' },
    { name: '', code: 'ADM-STD-4', expected: 'ADM-STD-4' },
    {
      name: 'ADM-STD-4',
      code: 'ADM-STD-4',
      campusName: 'North Campus',
      expected: 'ADM-STD-4 · North Campus',
    },
  ])('shows the offering once and keeps the admission period separate: $expected', (offering) => {
    vi.mocked(useAdmissionInquiryDialog).mockReturnValue(
      controller({
        periods: [{ id: 'cycle-1', name: 'Side Admission Cycle' }],
        offerings: [{ id: 'offering-1', ...offering, admissionCycleName: 'Side Admission Cycle' }],
      }) as unknown as ReturnType<typeof useAdmissionInquiryDialog>
    );
    render(<AdmissionInquiryFormPage />);
    expect(screen.getByRole('combobox', { name: 'Offering' }).textContent).toBe(offering.expected);
    expect(screen.getByRole('combobox', { name: 'Admission period' })).toHaveTextContent(
      'Side Admission Cycle'
    );
  });

  it('keeps multilingual selection inside Admission Interest without a separate form row', () => {
    vi.mocked(useAdmissionInquiryDialog).mockImplementation(useMultilingualController);
    render(<AdmissionInquiryFormPage />);
    const section = screen.getByRole('heading', { name: 'Admission Interest' }).closest('section');
    expect(section).toContainElement(screen.getByRole('combobox', { name: 'Form language' }));
  });

  it('omits the language control for a single-language form', () => {
    vi.mocked(useAdmissionInquiryDialog).mockReturnValue(
      controller({
        form: { id: 'form-1', version: 1, defaultLanguage: 'en', supportedLanguages: ['en'] },
      }) as unknown as ReturnType<typeof useAdmissionInquiryDialog>
    );
    render(<AdmissionInquiryFormPage />);
    expect(screen.queryByRole('combobox', { name: 'Form language' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Student details$/i })).toBeVisible();
  });

  it('retains the full-capacity restriction after dismissing its compact notice', () => {
    vi.mocked(useAdmissionInquiryDialog).mockReturnValue(
      controller({
        classCapacity: { capacity: 24, remainingSeats: 0, isFull: true },
        canCreateInquiry: false,
        unavailableReason: 'No admission seats remain.',
      }) as unknown as ReturnType<typeof useAdmissionInquiryDialog>
    );
    render(<AdmissionInquiryFormPage />);
    expect(screen.getByText(/0 of 24 admission room seats available/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Create inquiry' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText(/0 of 24 admission room seats available/)).not.toBeInTheDocument();
    expect(screen.getByText('No admission seats remain.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Create inquiry' })).toBeDisabled();
  });

  it('reports failed prerequisite requests through standard toasts without inline errors or Retry rows', () => {
    const fixture = controller({ offeringsError: true, academicError: true });
    fixture.formik.values.standardId = '';
    vi.mocked(useAdmissionInquiryDialog).mockReturnValue(
      fixture as unknown as ReturnType<typeof useAdmissionInquiryDialog>
    );
    const { rerender } = render(<AdmissionInquiryFormPage />);
    expect(shikshaMitraToast.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Open admission offerings could not be loaded.' })
    );
    expect(shikshaMitraToast.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Academic choices could not be loaded.' })
    );
    expect(
      screen.queryByText('Open admission offerings could not be loaded.')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Academic choices could not be loaded.')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Retry/ })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'New inquiry' })).toBeVisible();
    rerender(<AdmissionInquiryFormPage />);
    expect(shikshaMitraToast.error).toHaveBeenCalledTimes(2);
  });

  it('keeps class selection usable while checking and does not announce stale unavailability', () => {
    const fixture = controller({
      offeringsLoading: true,
      canCreateInquiry: false,
      offerings: [],
      sections: [],
      noOfferingReason: 'Admission is closed.',
    });
    fixture.formik.values.offeringId = '';
    vi.mocked(useAdmissionInquiryDialog).mockReturnValue(
      fixture as unknown as ReturnType<typeof useAdmissionInquiryDialog>
    );
    render(<AdmissionInquiryFormPage />);
    expect(screen.getByRole('combobox', { name: 'Class' })).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByRole('combobox', { name: 'Offering' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByText('Checking latest admission offerings…')).toBeVisible();
    expect(screen.queryByText('Admission is closed.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create inquiry' })).toBeDisabled();
  });

  it('reports a failed class check through the standard toast while keeping selection usable', () => {
    const fixture = controller({
      offeringsError: true,
      canCreateInquiry: false,
      offerings: [],
      sections: [],
    });
    fixture.formik.values.offeringId = '';
    vi.mocked(useAdmissionInquiryDialog).mockReturnValue(
      fixture as unknown as ReturnType<typeof useAdmissionInquiryDialog>
    );
    render(<AdmissionInquiryFormPage />);
    expect(shikshaMitraToast.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Admission availability could not be checked. Please try again.',
      })
    );
    expect(
      screen.queryByText('Admission availability could not be checked. Please try again.')
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/No inquiry offering/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Class' })).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Create inquiry' })).toBeDisabled();
  });

  it('shows the latest unavailable reason once, without the old generic helper', () => {
    const reason = 'Admission offering setup is incomplete.';
    const fixture = controller({
      offerings: [],
      sections: [],
      canCreateInquiry: false,
      noOfferingReason: reason,
    });
    fixture.formik.values.offeringId = '';
    vi.mocked(useAdmissionInquiryDialog).mockReturnValue(
      fixture as unknown as ReturnType<typeof useAdmissionInquiryDialog>
    );
    render(<AdmissionInquiryFormPage />);
    expect(screen.getAllByText(reason)).toHaveLength(1);
    expect(screen.queryByText('Selected class has no admission open.')).not.toBeInTheDocument();
  });

  it('shows academic-start age with configured DOB help and permits creating an underage inquiry', async () => {
    const fixture = controller();
    const offering = {
      ...fixture.selectedOffering,
      boardId: 'board-1',
      mediumId: 'medium-1',
      standardId: 'standard-1',
    } as AdmissionOfferingListItem;
    const dob = {
      id: 'dob',
      code: 'DOB',
      label: 'Date of birth',
      bindingKey: 'Applicant.DateOfBirth',
      fieldType: 5,
      required: false,
      readOnly: false,
      helpText: 'Birth certificate date.',
    };
    const fields = [...fixture.fields, dob];
    fixture.formik.values.fields = {
      FIRST_NAME: 'QA child',
      GUARDIAN_MOBILE: '9876543210',
      PREFERRED_CLASS: 'Class 1',
      DOB: '2022-01-01',
    } as typeof fixture.formik.values.fields;
    fixture.formik.errors = { fields: {} } as typeof fixture.formik.errors;
    vi.mocked(useAdmissionInquiryDialog).mockReturnValue(
      controller({
        ...fixture,
        selectedOffering: offering,
        fields,
        sections: [{ ...fixture.sections[0], fields }],
        ageContext: {
          offering: { id: 'offering-1' },
          academicYearStartDate: '2026-04-01',
          minimumAgeYears: 5,
        },
      }) as unknown as ReturnType<typeof useAdmissionInquiryDialog>
    );
    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AdmissionInquiryFormPage />
      </LocalizationProvider>
    );
    expect(screen.getByText('Age: 4y 3m · Minimum: 5y')).toBeVisible();
    await userEvent.hover(screen.getByLabelText('Date of birth information'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Birth certificate date. Age at academic year start (01-04-2026)'
    );
    await waitFor(() =>
      expect(shikshaMitraToast.warning).toHaveBeenCalledWith({
        message: expect.stringContaining('below the minimum age of 5 years'),
      })
    );
    const submit = screen.getByRole('button', { name: 'Create inquiry' });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    expect(fixture.formik.handleSubmit).toHaveBeenCalled();
    expect(
      validateAdmissionInquiry(
        fixture.formik.values as AdmissionInquiryFormValues,
        fields as AdmissionFormField[],
        null,
        offering
      )
    ).toEqual({});
  });
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('starts with the form default and switches translated copy without clearing entered answers', async () => {
    const user = userEvent.setup();
    vi.mocked(useAdmissionInquiryDialog).mockImplementation(useMultilingualController);
    render(<AdmissionInquiryFormPage />);
    expect(screen.getByRole('combobox', { name: 'Form language' })).toHaveTextContent('Gujarati');
    expect(screen.getByRole('heading', { name: 'વિદ્યાર્થીની વિગતો' })).toBeVisible();
    expect(screen.getByText('નામ જરૂરી છે')).toBeVisible();
    await user.type(screen.getByRole('textbox', { name: 'વિદ્યાર્થીનું નામ' }), 'QA student');
    expect(screen.getByText('પૂર્ણ નામ લખો')).toBeVisible();
    await user.click(screen.getByRole('combobox', { name: 'Form language' }));
    await user.click(screen.getByRole('option', { name: 'Hindi' }));
    expect(screen.getByRole('textbox', { name: 'विद्यार्थी का नाम' })).toHaveValue('QA student');
    expect(screen.getByRole('textbox', { name: 'विद्यार्थी का नाम' })).toHaveAttribute(
      'placeholder',
      'नाम लिखें'
    );
    expect(screen.getByRole('heading', { name: 'Student details' })).toBeVisible();
    await user.click(screen.getByRole('combobox', { name: 'Form language' }));
    await user.click(screen.getByRole('option', { name: 'English' }));
    expect(screen.getByRole('textbox', { name: 'Applicant first name' })).toHaveValue('QA student');
  });

  it('shows required errors only beside their fields and focuses the first invalid field', async () => {
    vi.mocked(useAdmissionInquiryDialog).mockImplementation(useValidationController);
    const { container } = render(<AdmissionInquiryFormPage />);

    expect(container.querySelector('form')).toHaveAttribute('novalidate');
    fireEvent.click(screen.getByRole('button', { name: 'Create inquiry' }));
    await waitFor(() => {
      expect(screen.getAllByText('Applicant first name is required')).toHaveLength(1);
      expect(screen.getAllByText('Guardian mobile is required')).toHaveLength(1);
      expect(container.querySelector('[aria-invalid="true"]')).toHaveFocus();
    });
  });

  it('shows a loading skeleton and allows capacity information to be dismissed', () => {
    vi.mocked(useAdmissionInquiryDialog).mockReturnValue(
      controller({ runtimeLoading: true, sections: [] }) as unknown as ReturnType<
        typeof useAdmissionInquiryDialog
      >
    );
    const { rerender } = render(<AdmissionInquiryFormPage />);
    expect(screen.getByText('Loading fields for the selected offering.')).toBeInTheDocument();

    vi.mocked(useAdmissionInquiryDialog).mockReturnValue(
      controller() as unknown as ReturnType<typeof useAdmissionInquiryDialog>
    );
    rerender(<AdmissionInquiryFormPage />);
    expect(screen.getByText('24 of 24 admission room seats available.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('24 of 24 admission room seats available.')).not.toBeInTheDocument();
  });

  it('warns when preferred class differs from the offering', () => {
    vi.mocked(useAdmissionInquiryDialog).mockReturnValue(
      controller() as unknown as ReturnType<typeof useAdmissionInquiryDialog>
    );
    render(<AdmissionInquiryFormPage />);
    fireEvent.blur(screen.getByRole('textbox', { name: 'Preferred class' }));
    expect(shikshaMitraToast.warning).toHaveBeenCalledWith({ message: preferredClassMessage });
  });

  it('does not insert source or parent-role controls outside the configured form', () => {
    const fixture = controller({ policy: { requireSourceDetailFor: [0] } });
    vi.mocked(useAdmissionInquiryDialog).mockReturnValue(
      fixture as unknown as ReturnType<typeof useAdmissionInquiryDialog>
    );
    render(<AdmissionInquiryFormPage />);

    expect(screen.queryByRole('textbox', { name: 'Source details' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Parent relationship' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Inquiry Details' })).not.toBeInTheDocument();
  });

  it('keeps the published family fields without the extra family-contact controls', () => {
    vi.mocked(useAdmissionInquiryDialog).mockReturnValue(
      controller() as unknown as ReturnType<typeof useAdmissionInquiryDialog>
    );
    render(<AdmissionInquiryFormPage />);
    expect(screen.queryByRole('heading', { name: 'Family Contacts' })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Add other parent' })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Add other guardian' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Main school contact' })).not.toBeInTheDocument();
  });
});
