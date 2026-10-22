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
  shikshaMitraToast: { warning: vi.fn() },
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
  it('shows academic-start age with configured DOB help and permits creating an underage inquiry', async () => {
    const fixture = controller();
    const offering = { ...fixture.selectedOffering, boardId: 'board-1', mediumId: 'medium-1', standardId: 'standard-1' } as AdmissionOfferingListItem;
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
    expect(
      screen.getByText(/Birth certificate date. Age at academic year start.*4 years 3 months/)
    ).toBeVisible();
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

  it('uses form validation and shows every required field error', async () => {
    vi.mocked(useAdmissionInquiryDialog).mockImplementation(useValidationController);
    const { container } = render(<AdmissionInquiryFormPage />);

    expect(container.querySelector('form')).toHaveAttribute('novalidate');
    fireEvent.click(screen.getByRole('button', { name: 'Create inquiry' }));
    await waitFor(() => {
      expect(screen.getAllByText('Applicant first name is required').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Guardian mobile is required').length).toBeGreaterThan(0);
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

  it('keeps source details optional even when a saved policy required them', () => {
    const fixture = controller({ policy: { requireSourceDetailFor: [0] } });
    vi.mocked(useAdmissionInquiryDialog).mockReturnValue(
      fixture as unknown as ReturnType<typeof useAdmissionInquiryDialog>
    );
    render(<AdmissionInquiryFormPage />);

    expect(screen.getByRole('textbox', { name: 'Source details' })).not.toBeRequired();
    expect(
      screen.getByText('Optional context to help staff trace this inquiry.')
    ).toBeInTheDocument();
  });
});
