import type { AdmissionApplicant360 } from 'src/redux/student/admissions/admission-applicants-api';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { expectStudentErrorToast } from 'src/test/student-toast-test-fixture';

import AdmissionApplicant360Screen from './admission-applicant-360';

const state = vi.hoisted(() => ({
  replace: vi.fn(),
  refetch: vi.fn(),
  query: vi.fn(),
  search: '',
  permissions: [] as { name: string; isGranted: boolean }[],
  result: {} as {
    currentData?: AdmissionApplicant360;
    isLoading?: boolean;
    isFetching?: boolean;
    isError?: boolean;
  },
}));
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'applicant-1' }),
  useRouter: () => ({ replace: state.replace }),
  useSearchParams: () => new URLSearchParams(state.search),
}));
vi.mock('react-redux', () => ({
  useSelector: (select: (value: unknown) => unknown) =>
    select({ auth: { permissions: state.permissions } }),
}));
vi.mock('src/redux/student/admissions/admission-applicants-api', () => ({
  useGetAdmissionApplicant360Query: (...args: unknown[]) => {
    state.query(...args);
    return { ...state.result, refetch: state.refetch };
  },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/scrollbar', () => ({
  Scrollbar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('./application-detail/application-applicant-identity-dialog', () => ({
  ApplicationApplicantIdentityDialog: ({ onClose }: { onClose: () => void }) => (
    <div>
      Focused identity editor
      <button type="button" onClick={onClose}>
        Close editor
      </button>
    </div>
  ),
}));
vi.mock('./application-detail/application-applicant-notes-dialog', () => ({
  ApplicationApplicantNotesDialog: ({ onClose }: { onClose: () => void }) => (
    <div>
      Focused applicant notes
      <button type="button" onClick={onClose}>
        Close notes
      </button>
    </div>
  ),
}));

const fixture: AdmissionApplicant360 = {
  applicant: { id: 'applicant-1', familyId: 'family-1', firstName: 'Parth', lastName: 'Patel' },
  applications: [],
  activities: [],
  notes: [],
};
const application = (id: string, status = 0) =>
  ({ id, applicationNumber: `APP-${id}`, status }) as AdmissionApplicant360['applications'][number];

describe('saved applicant URL recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.search = '';
    state.permissions = [
      'Students.Admissions.Applicants.View',
      'Students.Admissions.Applicants.Add',
      'Students.Admissions.Applications.View',
    ].map((name) => ({ name, isGranted: true }));
    state.result = { currentData: fixture };
  });
  it('shows loading then a toast error without the legacy overview or retry row', async () => {
    state.result = { isFetching: true };
    const view = render(<AdmissionApplicant360Screen />);
    expect(screen.getByRole('status', { name: 'Loading Applicant Record' })).toBeInTheDocument();
    state.result = { isError: true };
    view.rerender(<AdmissionApplicant360Screen />);
    await expectStudentErrorToast('Applicant record could not be loaded. Try again.');
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(state.refetch).not.toHaveBeenCalled();
    expect(screen.queryByText('Applicant essentials')).not.toBeInTheDocument();
  });
  it('opens the single application workspace with its filtered list return context', () => {
    state.search = new URLSearchParams({
      returnTo: '/student/admissions/pipeline?page=2&owner=mine',
    }).toString();
    state.result = { currentData: { ...fixture, applications: [application('one')] } };
    render(<AdmissionApplicant360Screen />);
    expect(state.replace).toHaveBeenCalledWith(
      '/student/admissions/pipeline/applications/one?returnTo=%2Fstudent%2Fadmissions%2Fpipeline%3Fpage%3D2%26owner%3Dmine'
    );
  });
  it('requires an explicit selection when multiple applications exist', () => {
    state.result = {
      currentData: { ...fixture, applications: [application('one'), application('two', 11)] },
    };
    render(<AdmissionApplicant360Screen />);
    expect(state.replace).not.toHaveBeenCalled();
    expect(
      screen
        .getAllByRole('link', { name: 'Open Application' })
        .map((link) => link.getAttribute('href'))
    ).toEqual([
      '/student/admissions/pipeline/applications/one?returnTo=%2Fstudent%2Fadmissions%2Fapplications',
      '/student/admissions/pipeline/applications/two?returnTo=%2Fstudent%2Fadmissions%2Fapplications',
    ]);
    expect(screen.getByRole('button', { name: 'Edit Identity' })).toBeDisabled();
  });
  it('retains Inquiry recovery for applicants with no application and does not start direct admission', () => {
    state.search = 'inquiryId=inquiry-1';
    render(<AdmissionApplicant360Screen />);
    expect(screen.getByText(/Move to next stage/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Manage Inquiry' })).toHaveAttribute(
      'href',
      '/student/admissions/inquiries?inquiryId=inquiry-1'
    );
    expect(screen.queryByRole('button', { name: /Start Admission/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Applicant Notes' }));
    expect(screen.getByText('Focused applicant notes')).toBeInTheDocument();
  });
  it('opens an old identity repair bookmark directly and closes to a safe list', () => {
    state.search = new URLSearchParams({
      editIdentity: '1',
      returnTo: 'https://evil.example',
    }).toString();
    render(<AdmissionApplicant360Screen />);
    expect(state.query).toHaveBeenCalledWith('applicant-1', { skip: true });
    expect(screen.getByText('Focused identity editor')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close editor' }));
    expect(state.replace).toHaveBeenCalledWith('/student/admissions/applications');
  });
  it('fails closed without applicant View even if a previous result is present', () => {
    state.permissions = [{ name: 'Students.Admissions.Applications.View', isGranted: true }];
    state.result = { currentData: { ...fixture, applications: [application('one')] } };
    render(<AdmissionApplicant360Screen />);
    expect(state.query).toHaveBeenCalledWith('applicant-1', { skip: true });
    expect(state.replace).not.toHaveBeenCalled();
    expect(screen.getByText(/permission to view this applicant/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Open Application' })).not.toBeInTheDocument();
  });
  it('does not open applications when only Applicant permissions are granted', () => {
    state.permissions = state.permissions.filter((entry) => !entry.name.includes('Applications.'));
    state.result = { currentData: { ...fixture, applications: [application('one')] } };
    render(<AdmissionApplicant360Screen />);
    expect(state.replace).not.toHaveBeenCalled();
    expect(screen.getByText(/permission to open admission applications/)).toBeInTheDocument();
  });
});
