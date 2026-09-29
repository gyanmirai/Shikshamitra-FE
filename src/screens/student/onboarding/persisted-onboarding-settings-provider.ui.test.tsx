import { render, screen } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useOnboardingSettings } from './onboarding-settings-context';
import { defaultOnboardingSettings } from './onboarding-settings-model';
import { PersistedOnboardingSettingsProvider } from './persisted-onboarding-settings-provider';

const mocks = vi.hoisted(() => ({
  year: { id: 'year-a', name: '2026-2027' },
  query: {} as Record<string, unknown>,
}));

vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) => select({ globalState: { currentYear: mocks.year } }),
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentOnboardingSettingsQuery: () => mocks.query,
  useSaveStudentOnboardingSettingsMutation: () => [vi.fn()],
  useDeleteStudentOnboardingSettingsMutation: () => [vi.fn()],
}));

const record = (year: string | null, documents: boolean) => ({
  id: year ?? 'school', academicYearId: year, schemaVersion: 1, concurrencyStamp: 'stamp',
  configurationJson: JSON.stringify({ ...defaultOnboardingSettings,
    readinessAccess: { ...defaultOnboardingSettings.readinessAccess, requireDocuments: documents },
  }),
});

function Probe() {
  const { scope, settings } = useOnboardingSettings();
  return <div data-testid="saved-settings">{scope.academicYearId}:{String(settings.readinessAccess.requireDocuments)}</div>;
}
const view = () => <PersistedOnboardingSettingsProvider><Probe /></PersistedOnboardingSettingsProvider>;

describe('Persisted onboarding settings year isolation', () => {
  beforeEach(() => {
    mocks.year = { id: 'year-a', name: '2026-2027' };
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
    expect(screen.getByRole('progressbar', { name: 'Loading onboarding configuration' })).toBeInTheDocument();
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
    expect(screen.getByRole('alert')).toHaveTextContent('saved rules have not been replaced with defaults');
  });
});
