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
  beforeEach(() => vi.clearAllMocks());

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

  it('shows an actionable fetch failure even when cached form data exists', () => {
    mocks.query.mockReturnValue({
      currentData: { definition: {} },
      isFetching: false,
      isError: true,
      refetch: mocks.refetch,
    });
    render(
      <AdmissionApplicationPrintDialog
        applicationId="app-2"
        initialMode="blank"
        onClose={vi.fn()}
      />
    );
    expect(mocks.workspace).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Retry saved form' }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });
});
