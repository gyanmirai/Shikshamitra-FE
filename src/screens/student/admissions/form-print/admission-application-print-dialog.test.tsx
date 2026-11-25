import type { ReactNode } from 'react';

import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { AdmissionApplicationPrintDialog } from './admission-application-print-dialog';

const mocks = vi.hoisted(() => ({ query: vi.fn(), workspace: vi.fn(), refetch: vi.fn() }));
vi.mock('src/redux/student/admissions/admission-applications-api', () => ({
  useGetAdmissionApplicationFormQuery: mocks.query,
}));
vi.mock('./admission-form-print-workspace', () => ({
  AdmissionFormPrintWorkspace: (props: unknown) => {
    mocks.workspace(props);
    return <div>Saved form workspace</div>;
  },
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ children, title }: { children: ReactNode; title: string }) => (
    <div role="dialog" aria-label={title}>
      {children}
    </div>
  ),
}));
vi.mock('../admission-query-error', () => ({
  AdmissionQueryError: ({ onRetry }: { onRetry: () => void }) => (
    <button type="button" onClick={onRetry}>
      Retry saved form
    </button>
  ),
}));

describe('application saved Registration form print fetch', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    ['a partial text answer', '"New saved name"', 'filled'],
    ['a saved unchecked answer', 'false', 'filled'],
    ['a saved zero', '0', 'filled'],
    ['a saved answer in a repeated entry', JSON.stringify('["","Second school"]'), 'filled'],
    ['no stored answer value', undefined, 'blank'],
    ['a cleared null answer', 'null', 'blank'],
    ['a cleared text answer', '"  "', 'blank'],
    ['empty repeated entries', JSON.stringify('[""," ",null]'), 'blank'],
    ['an empty structured answer', '{"city":"","postalCode":null}', 'blank'],
  ])('selects the initial preview for %s', (_, valueJson, initialMode) => {
    const persistedValues = [{ fieldCode: 'REGISTRATION_ANSWER', valueJson }];
    mocks.query.mockReturnValue({
      currentData: {
        definition: { name: 'Registration', sections: [] },
        persistedValues,
        values: [{ fieldCode: 'PARENT', valueJson: '"Suggested parent"' }],
        inquiryContextValues: [{ fieldCode: 'NAME', valueJson: '"Saved Inquiry name"' }],
        applicationNumber: 'APP-024',
        printAcademicDetails: { className: 'Grade 1' },
      },
      isFetching: false,
      isError: false,
    });
    render(
      <AdmissionApplicationPrintDialog
        applicationId="app-saved"
        initialMode="auto"
        onClose={vi.fn()}
      />
    );
    expect(mocks.workspace).toHaveBeenCalledWith(
      expect.objectContaining({ initialMode, values: persistedValues })
    );
  });

  it.each([[undefined], [[]]])(
    'opens blank when the persisted answer collection is %j',
    (saved) => {
      mocks.query.mockReturnValue({
        currentData: {
          definition: { name: 'Registration', sections: [] },
          persistedValues: saved,
          values: [{ fieldCode: 'PARENT', valueJson: '"Suggested parent"' }],
        },
        isFetching: false,
        isError: false,
      });
      render(
        <AdmissionApplicationPrintDialog
          applicationId="app-saved"
          initialMode="auto"
          onClose={vi.fn()}
        />
      );
      expect(mocks.workspace).toHaveBeenCalledWith(
        expect.objectContaining({ initialMode: 'blank', values: [] })
      );
    }
  );

  it('prints persisted answers without automatic unsaved suggestions, including an empty saved form', () => {
    mocks.query.mockReturnValue({
      currentData: {
        definition: { name: 'Registration', sections: [] },
        values: [{ fieldCode: 'PARENT', valueJson: '"Suggested parent"' }],
        persistedValues: [],
        inquiryContextSections: [],
        inquiryContextValues: [],
      },
      isFetching: false,
      isError: false,
    });
    render(
      <AdmissionApplicationPrintDialog
        applicationId="app-saved"
        initialMode="filled"
        onClose={vi.fn()}
      />
    );
    expect(mocks.workspace).toHaveBeenCalledWith(expect.objectContaining({ values: [] }));
  });
  it('forces a fresh request and never renders cached pre-save answers during refetch', () => {
    const form = {
      definition: { name: 'Registration', sections: [], printSettings: {} },
      values: [{ fieldCode: 'NAME', valueJson: '"New saved name"' }],
      inquiryContextSections: [],
      inquiryContextValues: [],
      academicYearId: 'year-1',
      applicationNumber: 'APP-024',
    };
    mocks.query.mockReturnValue({
      currentData: form,
      data: { ...form, values: [{ fieldCode: 'NAME', valueJson: '"Old name"' }] },
      isFetching: true,
      isError: false,
    });
    const { rerender } = render(
      <AdmissionApplicationPrintDialog
        applicationId="app-1"
        initialMode="filled"
        currentStepId="family"
        onClose={vi.fn()}
      />
    );
    expect(mocks.query).toHaveBeenCalledWith('app-1', { refetchOnMountOrArgChange: true });
    expect(screen.getByRole('status')).toHaveTextContent('Loading saved Registration form');
    expect(mocks.workspace).not.toHaveBeenCalled();
    mocks.query.mockReturnValue({ currentData: form, isFetching: false, isError: false });
    rerender(
      <AdmissionApplicationPrintDialog
        applicationId="app-1"
        initialMode="filled"
        currentStepId="family"
        onClose={vi.fn()}
      />
    );
    expect(mocks.workspace).toHaveBeenLastCalledWith(
      expect.objectContaining({
        values: form.values,
        academicYearId: 'year-1',
        registrationNumber: 'APP-024',
        initialMode: 'filled',
        currentStepId: 'family',
        readOnly: true,
      })
    );
  });

  it('waits for a new result even when a settled cached request exists at launch', () => {
    const cachedForm = {
      definition: { name: 'Registration', sections: [] },
      persistedValues: [{ fieldCode: 'NAME', valueJson: '"Old name"' }],
    };
    mocks.query.mockReturnValue({
      requestId: 'cached',
      currentData: cachedForm,
      isFetching: false,
      isError: false,
    });
    const dialog = () => (
      <AdmissionApplicationPrintDialog
        applicationId="app-saved"
        initialMode="auto"
        onClose={vi.fn()}
      />
    );
    const { rerender } = render(dialog());
    expect(screen.getByRole('status')).toHaveTextContent('Loading saved Registration form');
    expect(mocks.workspace).not.toHaveBeenCalled();

    mocks.query.mockReturnValue({
      requestId: 'fresh',
      currentData: { ...cachedForm, persistedValues: [] },
      isFetching: false,
      isError: false,
    });
    rerender(dialog());
    expect(mocks.workspace).toHaveBeenCalledWith(expect.objectContaining({ initialMode: 'blank' }));
  });

  it('shows an actionable fetch failure even when cached form data exists', () => {
    mocks.query.mockReturnValue({
      currentData: { definition: {} },
      isFetching: false,
      isError: true,
      refetch: mocks.refetch,
    });
    render(
      <AdmissionApplicationPrintDialog applicationId="app-2" initialMode="auto" onClose={vi.fn()} />
    );
    expect(mocks.workspace).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Retry saved form' }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });
});
