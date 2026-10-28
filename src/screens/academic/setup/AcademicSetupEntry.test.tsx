import type { AcademicSetupVisitStatus } from 'src/redux/academic-setup/types';

import { StrictMode } from 'react';
import { vi, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import AcademicSetupEntry from './AcademicSetupEntry';

let pathname = '/academic/dashboard';
let search = '';
const replace = vi.fn();
const router = { replace };
const refetch = vi.fn();
const query = vi.fn();
const recordVisit = vi.fn((_body: { settingKey?: string }) => ({
  unwrap: () => Promise.resolve({}),
}));
const school = { accountMode: 'tenant', tenantId: 'school-1' };
let auth = {
  sessionContext: school,
  user: { sub: 'user-1' },
  permissions: [
    { name: 'Academics.CurriculumManagement.Settings.SubjectCreation.View', isGranted: true },
  ],
};
let status: {
  currentData?: AcademicSetupVisitStatus;
  isLoading: boolean;
  isError: boolean;
  refetch: typeof refetch;
};

vi.mock('react-redux', () => ({ useSelector: () => auth }));
vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useSearchParams: () => new URLSearchParams(search),
  useRouter: () => router,
}));
vi.mock('src/redux/academic-setup/api', () => ({
  useAcademicSetupVisitStatusQuery: (...args: unknown[]) => {
    query(...args);
    return status;
  },
  useRecordAcademicSetupVisitMutation: () => [recordVisit, { isLoading: false }],
}));
vi.mock('src/components/loading-screen', () => ({ SplashScreen: () => <div>Checking setup</div> }));

const entry = () => (
  <StrictMode>
    <AcademicSetupEntry>
      <div>Academic manager</div>
    </AcademicSetupEntry>
  </StrictMode>
);
const visited = (value: boolean, canAccessSetup = true): AcademicSetupVisitStatus => ({
  hasVisitedConfiguration: value,
  canAccessSetup,
  firstVisitedAt: null,
});

beforeEach(() => {
  pathname = '/academic/dashboard';
  search = '';
  auth = {
    sessionContext: school,
    user: { sub: 'user-1' },
    permissions: [
      { name: 'Academics.CurriculumManagement.Settings.SubjectCreation.View', isGranted: true },
    ],
  };
  status = { isLoading: false, isError: false, refetch };
  replace.mockReset();
  refetch.mockReset();
  query.mockReset();
  recordVisit.mockReset();
  recordVisit.mockImplementation(() => ({ unwrap: () => Promise.resolve({}) }));
});

it('hides ordinary content until visit status is known and scopes its cache to identity', () => {
  render(entry());
  expect(screen.getByText('Checking setup')).toBeInTheDocument();
  expect(screen.queryByText('Academic manager')).not.toBeInTheDocument();
  expect(query).toHaveBeenCalledWith(
    'school-1:user-1',
    expect.objectContaining({ skip: false, refetchOnMountOrArgChange: true })
  );
  expect(replace).not.toHaveBeenCalled();
});

it('redirects an unvisited school once in StrictMode and retains the safe query string', () => {
  status.currentData = visited(false);
  search = 'medium=english&class=6';
  render(entry());
  expect(replace).toHaveBeenCalledTimes(1);
  expect(replace).toHaveBeenCalledWith(
    '/academic/setup?source=automatic&returnTo=%2Facademic%2Fdashboard%3Fmedium%3Denglish%26class%3D6'
  );
  expect(screen.queryByText('Academic manager')).not.toBeInTheDocument();
});

it('shows ordinary content after a visit or when the server denies setup access', () => {
  status.currentData = visited(true);
  const { rerender } = render(entry());
  expect(screen.getByText('Academic manager')).toBeInTheDocument();
  status.currentData = visited(false, false);
  rerender(entry());
  expect(screen.getByText('Academic manager')).toBeInTheDocument();
  expect(replace).not.toHaveBeenCalled();
});

it('keeps ordinary content usable on read failure and offers an explicit retry', () => {
  status.isError = true;
  render(entry());
  expect(screen.getByText('Academic manager')).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('could not check');
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(refetch).toHaveBeenCalledTimes(1);
  expect(replace).not.toHaveBeenCalled();
});

it('records exact configuration visits once per entry without hiding the manager', async () => {
  pathname = '/academic/curriculumSetting/subjectCreation/';
  const { rerender } = render(entry());
  expect(screen.getByText('Academic manager')).toBeInTheDocument();
  await waitFor(() => expect(recordVisit).toHaveBeenCalledTimes(1));
  expect(recordVisit).toHaveBeenCalledWith({ settingKey: 'subjects' });
  expect(query).toHaveBeenLastCalledWith(
    'school-1:user-1',
    expect.objectContaining({ skip: true })
  );
  search = 'filter=math';
  rerender(entry());
  expect(recordVisit).toHaveBeenCalledTimes(1);
  pathname = '/academic/dashboard';
  status.currentData = visited(true);
  rerender(entry());
  pathname = '/academic/curriculumSetting/subjectCreation';
  rerender(entry());
  await waitFor(() => expect(recordVisit).toHaveBeenCalledTimes(2));
  auth = { ...auth, user: { sub: 'user-2' } };
  rerender(entry());
  await waitFor(() => expect(recordVisit).toHaveBeenCalledTimes(3));
});

it('preserves configuration content after a failed visit write and retries without duplicate entry writes', async () => {
  pathname = '/academic/curriculumSetting/subjectCreation';
  recordVisit.mockImplementationOnce(() => ({
    unwrap: () => Promise.reject(new Error('Unavailable')),
  }));
  render(entry());
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('could not save'));
  expect(screen.getByText('Academic manager')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  await waitFor(() => expect(recordVisit).toHaveBeenCalledTimes(2));
});

it('skips hosts, users without a configuration View and the standalone setup route', () => {
  auth = { ...auth, sessionContext: { accountMode: 'host', tenantId: '' } };
  const { rerender } = render(entry());
  expect(query).toHaveBeenLastCalledWith(
    expect.any(String),
    expect.objectContaining({ skip: true })
  );
  auth = { ...auth, sessionContext: school, permissions: [] };
  rerender(entry());
  expect(query).toHaveBeenLastCalledWith(
    expect.any(String),
    expect.objectContaining({ skip: true })
  );
  auth = {
    ...auth,
    permissions: [
      { name: 'Academics.CurriculumManagement.Settings.SubjectCreation.View', isGranted: true },
    ],
  };
  pathname = '/academic/setup';
  rerender(entry());
  expect(query).toHaveBeenLastCalledWith(
    expect.any(String),
    expect.objectContaining({ skip: true })
  );
  expect(screen.getByText('Academic manager')).toBeInTheDocument();
  expect(recordVisit).not.toHaveBeenCalled();
  expect(replace).not.toHaveBeenCalled();
});
