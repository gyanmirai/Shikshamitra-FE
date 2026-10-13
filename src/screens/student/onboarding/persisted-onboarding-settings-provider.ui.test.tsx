import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { useOnboardingSettings } from './onboarding-settings-context';
import { defaultOnboardingSettings } from './onboarding-settings-model';
import { PersistedOnboardingSettingsProvider } from './persisted-onboarding-settings-provider';

const mocks = vi.hoisted(() => ({
  year: { id: 'year-a', name: '2026-2027' },
  query: {} as Record<string, unknown>,
  pathname: '/student/onboarding/setup',
}));

vi.mock('next/navigation', () => ({ usePathname: () => mocks.pathname }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({
    heading,
    links,
  }: {
    heading: string;
    links: Array<{ name: string; href?: string }>;
  }) => (
    <header>
      <h1>{heading}</h1>
      <nav aria-label="Breadcrumb">
        {links.map((link) =>
          link.href ? (
            <a key={link.name} href={link.href}>
              {link.name}
            </a>
          ) : (
            <span key={link.name}>{link.name}</span>
          )
        )}
      </nav>
    </header>
  ),
}));
vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({ globalState: { currentYear: mocks.year } }),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentOnboardingSettingsQuery: () => mocks.query,
  useSaveStudentOnboardingSettingsMutation: () => [vi.fn()],
  useDeleteStudentOnboardingSettingsMutation: () => [vi.fn()],
}));

const record = (year: string | null, documents: boolean) => ({
  id: year ?? 'school',
  academicYearId: year,
  schemaVersion: 1,
  concurrencyStamp: 'stamp',
  configurationJson: JSON.stringify({
    ...defaultOnboardingSettings,
    readinessAccess: { ...defaultOnboardingSettings.readinessAccess, requireDocuments: documents },
  }),
});

function Probe() {
  const { scope, settings } = useOnboardingSettings();
  return (
    <div data-testid="saved-settings">
      {scope.academicYearId}:{String(settings.readinessAccess.requireDocuments)}
    </div>
  );
}
const view = () => (
  <PersistedOnboardingSettingsProvider>
    <Probe />
  </PersistedOnboardingSettingsProvider>
);

describe('Persisted onboarding settings year isolation', () => {
  beforeEach(() => {
    mocks.year = { id: 'year-a', name: '2026-2027' };
    mocks.pathname = '/student/onboarding/setup';
    const rows = [record('year-a', true)];
    mocks.query = { data: rows, currentData: rows, isLoading: false, isError: false };
  });

  it('waits for the selected year instead of mounting defaults from the previous response', () => {
    const { rerender } = render(view());
    expect(screen.getByTestId('saved-settings')).toHaveTextContent('year-a:true');
    mocks.year = { id: 'year-b', name: '2027-2028' };
    mocks.query = { ...mocks.query, currentData: undefined, isFetching: true };
    rerender(view());
    expect(screen.queryByTestId('saved-settings')).not.toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Loading onboarding configuration' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Student Setup' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Student' })).toHaveAttribute(
      'href',
      '/student/dashboard'
    );
    const nextRows = [record('year-b', false)];
    mocks.query = { data: nextRows, currentData: nextRows, isLoading: false, isError: false };
    rerender(view());
    expect(screen.getByTestId('saved-settings')).toHaveTextContent('year-b:false');
  });

  it('does not expose previous-year settings when the selected-year request fails', () => {
    mocks.query = { ...mocks.query, currentData: undefined, isError: true, refetch: vi.fn() };
    render(view());
    expect(screen.queryByTestId('saved-settings')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('could not be loaded');
  });

  it('inherits saved school rules when the selected year has no override', () => {
    const rows = [record(null, false)];
    mocks.query = { ...mocks.query, data: rows, currentData: rows };
    render(view());
    expect(screen.getByTestId('saved-settings')).toHaveTextContent('year-a:false');
  });

  it('keeps malformed saved configuration blocked rather than substituting defaults', () => {
    const rows = [{ ...record('year-a', true), configurationJson: '{invalid' }];
    mocks.query = { ...mocks.query, data: rows, currentData: rows };
    render(view());
    expect(screen.queryByTestId('saved-settings')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'saved rules have not been replaced with defaults'
    );
  });

  it.each([
    ['/student/onboarding/settings/readiness-access', 'Onboarding Settings'],
    ['/student/onboarding/settings/numbering-placement', 'Onboarding Settings'],
    ['/student/onboarding/settings', 'Onboarding Settings'],
  ])(
    'keeps the %s page context visible during loading and a retryable error',
    (pathname, heading) => {
      mocks.pathname = pathname;
      mocks.query = { ...mocks.query, currentData: undefined, isLoading: true };
      const { rerender } = render(view());
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Onboarding' })).toHaveAttribute(
        'href',
        '/student/onboarding/setup'
      );
      expect(screen.queryByTestId('saved-settings')).not.toBeInTheDocument();
      const refetch = vi.fn();
      mocks.query = { ...mocks.query, isLoading: false, isError: true, refetch };
      rerender(view());
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('could not be loaded');
      expect(screen.queryByTestId('saved-settings')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
      expect(refetch).toHaveBeenCalledOnce();
    }
  );
});
