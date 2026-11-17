import type { ReactNode } from 'react';

import { useState } from 'react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, within, fireEvent } from '@testing-library/react';

import { useStudentSetupFormState } from './embedding';
import StudentSetupWorkspace from './StudentSetupWorkspace';

const mocks = vi.hoisted(() => ({ save: vi.fn(), replace: vi.fn(), push: vi.fn(), unmount: vi.fn(),
  query: {} as { currentData?: unknown; data?: unknown; isFetching: boolean; isError: boolean; refetch: () => void } }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
  useSearchParams: () => new URLSearchParams('stage=admissions&setting=admission-periods') }));
vi.mock('src/redux/student/setup/api', () => ({
  useStudentSetupStateQuery: () => mocks.query,
  useSaveStudentSetupProgressMutation: () => [mocks.save, { isLoading: false, isError: false }],
}));
vi.mock('src/components/setup-flow', () => ({ SetupFlowShell: ({ children, footer }: {
  children: ReactNode; footer: ReactNode;
}) => <><main>{children}</main><footer>{footer}</footer></> }));
vi.mock('src/layouts/components/global-academic-search', () => ({ default: () => <div>Student context</div> }));
vi.mock('./StudentSetupManager', () => ({ default: function TestSetting() {
  const [dirty, setDirty] = useState(false);
  useStudentSetupFormState({ dirty, busy: false });
  return <button type="button" onClick={() => setDirty(true)}>{dirty ? 'Unsaved subject' : 'Edit subject'}</button>;
} }));
const state = { academicYearId: 'year-a', concurrencyStamp: 'v1', currentStageKey: 'admissions',
  currentSettingKey: 'admission-periods', deferredSettingKeys: [], reviewedAt: null,
  settings: [{ key: 'admission-periods', canView: true, canManage: true, configurationState: 'empty' }] };
const props = { scope: { tenantCacheKey: 'school-a', academicYearId: 'year-a' }, returnTo: '/student/dashboard', classes: [], permissions: [{name: 'Students.Admissions.View', isGranted: true}], prerequisite: 'School structure available.' };
beforeEach(() => {
  vi.clearAllMocks();
  mocks.query = { currentData: state, data: state, isFetching: false, isError: false, refetch: vi.fn() };
  mocks.save.mockReturnValue({ unwrap: () => Promise.resolve(state) });
});

describe('Student setup workspace draft safety', () => {
  it('announces saved progress in the footer without inserting feedback above the active setting', async () => {
    render(<StudentSetupWorkspace {...props} />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Save progress' })); });
    expect(within(screen.getByRole('main')).queryByText('Guide progress saved.')).not.toBeInTheDocument();
    expect(within(screen.getByRole('contentinfo')).getByRole('status', { name: 'Guide save status' })).toHaveTextContent('Saved');
  });

  it('locks guide saves, deferral and exit while the real setting reports an unsaved form', () => {
    render(<StudentSetupWorkspace {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit subject' }));
    ['Back', 'Save progress', 'Save & continue', 'Save & exit', 'Do this later', 'Exit setup'].forEach((name) => {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    });
    expect(screen.getByText('Save or cancel the open form before moving to another setting.')).toBeVisible();
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it('keeps the active unsaved form mounted through scope status refresh and failure', () => {
    const view = render(<StudentSetupWorkspace {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit subject' }));
    mocks.query = { ...mocks.query, currentData: undefined, isFetching: true };
    view.rerender(<StudentSetupWorkspace {...props} />);
    expect(screen.getByRole('button', { name: 'Unsaved subject' })).toBeVisible();
    mocks.query = { ...mocks.query, isFetching: false, isError: true };
    view.rerender(<StudentSetupWorkspace {...props} />);
    expect(screen.getByRole('button', { name: 'Unsaved subject' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save progress' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  it('locks new form input while an explicit conflict reload is pending', async () => {
    mocks.save.mockReturnValue({ unwrap: () => Promise.reject(Object.assign(new Error('Conflict'), { status: 409 })) });
    mocks.query.refetch = () => new Promise(() => {});
    render(<StudentSetupWorkspace {...props} />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Save progress' })); });
    fireEvent.click(screen.getByRole('button', { name: 'Reload' }));
    expect(screen.getByRole('button', { name: 'Edit subject' }).closest('[inert]')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Exit setup' })).toBeDisabled();
  });

  it('does not show the previous academic year from an unrelated warm query cache', () => {
    mocks.query = { ...mocks.query, currentData: undefined, data: state };
    render(<StudentSetupWorkspace {...props} scope={{ ...props.scope, academicYearId: 'year-b' }} />);
    expect(screen.queryByRole('button', { name: 'Edit subject' })).not.toBeInTheDocument();
    expect(screen.getByText('Loading setup…')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save progress' })).toBeDisabled();
  });

  it('does not mount a manager whose View grant was revoked in the current account', () => {
    render(<StudentSetupWorkspace {...props} permissions={[]} />);
    expect(screen.queryByRole('button', { name: 'Edit subject' })).not.toBeInTheDocument();
  });

  it('blocks new setting input throughout a pending move so a late draft cannot be discarded', () => {
    mocks.save.mockReturnValue({ unwrap: () => new Promise(() => {}) });
    render(<StudentSetupWorkspace {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save & continue' }));
    expect(screen.getByRole('button', { name: 'Edit subject' }).closest('[inert]')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Exit setup' })).toBeDisabled();
  });
});

