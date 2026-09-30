import type { AdmissionFormField } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import AdmissionInquiryFormPage from './admission-inquiry-form-page';
import { useAdmissionInquiryDialog } from './use-admission-inquiry-dialog';
import {
  validateAdmissionInquiry,
  type AdmissionInquiryFormValues,
} from './admission-inquiry-model';

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

describe('New inquiry form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
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

  it('shows the saved-policy source detail requirement', () => {
    const fixture = controller({ policy: { requireSourceDetailFor: [0] } });
    vi.mocked(useAdmissionInquiryDialog).mockReturnValue(
      fixture as unknown as ReturnType<typeof useAdmissionInquiryDialog>
    );
    render(<AdmissionInquiryFormPage />);

    expect(screen.getByRole('textbox', { name: 'Source details' })).toBeRequired();
    expect(screen.getByText('Enter the website, event, person, or campaign that led to this inquiry.'))
      .toBeInTheDocument();
  });
});
