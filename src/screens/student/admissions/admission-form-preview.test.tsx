import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { addIcon } from '@iconify/react';
import { studentPaths } from 'src/constants/student-menu';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, screen, render, cleanup, fireEvent } from '@testing-library/react';

import AdmissionFormPreviewScreen from './admission-form-preview';

['lucide:info', 'eva:arrow-back-fill'].forEach((name) =>
  addIcon(name, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 })
);

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  search: '',
  form: undefined as AdmissionForm | undefined,
  isLoading: false,
  isError: false,
}));
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'form-1' }),
  useSearchParams: () => new URLSearchParams(mocks.search),
  useRouter: () => ({ replace: mocks.replace }),
}));
vi.mock('react-redux', () => ({ useSelector: () => ({ currentYear: { id: 'year-1' } }) }));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormQuery: () => ({
    data: mocks.form,
    isLoading: mocks.isLoading,
    isError: mocks.isError,
  }),
  useLazyGetAdmissionFormOptionsQuery: () => [vi.fn()],
}));
vi.mock('./form-preview/form-preview-content', () => ({
  FormPreviewContent: () => <div>Applicant fields</div>,
}));
vi.mock('src/components/student-feedback', () => ({
  StudentFeedback: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('admission form preview return controls', () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.search = '';
    mocks.isLoading = false;
    mocks.isError = false;
    mocks.form = {
      id: 'form-1',
      name: 'Test form',
      purpose: 0,
      sections: [],
    } as unknown as AdmissionForm;
  });

  it.each([0, 1] as const)(
    'returns purpose %s to its originating list from either control',
    async (purpose) => {
      mocks.form!.purpose = purpose;
      const origin = `${studentPaths.enrollment.settings.forms}?view=${purpose === 1 ? 'registration' : 'inquiry'}&page=3&search=Test`;
      mocks.search = new URLSearchParams({ returnTo: origin }).toString();
      await act(async () => {
        render(<AdmissionFormPreviewScreen />);
      });
      fireEvent.click(screen.getByRole('button', { name: 'Back' }));
      expect(mocks.replace).toHaveBeenLastCalledWith(origin);
      const close = screen.getByRole('button', { name: 'Back to Forms' });
      expect(close).toHaveClass('MuiButton-outlined');
      fireEvent.click(close);
      expect(mocks.replace).toHaveBeenLastCalledWith(origin);
    }
  );

  it.each(['loading', 'error'] as const)('keeps return controls available while %s', (state) => {
    mocks.form = undefined;
    mocks.isLoading = state === 'loading';
    mocks.isError = state === 'error';
    render(<AdmissionFormPreviewScreen />);
    expect(screen.getByRole('button', { name: 'Back' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Back to Forms' }));
    expect(mocks.replace).toHaveBeenCalledWith(studentPaths.enrollment.settings.forms);
  });

  it('uses the unified Forms list for a directly opened registration preview', async () => {
    mocks.form!.purpose = 1;
    await act(async () => {
      render(<AdmissionFormPreviewScreen />);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Back to Forms' }));
    expect(mocks.replace).toHaveBeenCalledWith(studentPaths.enrollment.settings.forms);
  });
});
