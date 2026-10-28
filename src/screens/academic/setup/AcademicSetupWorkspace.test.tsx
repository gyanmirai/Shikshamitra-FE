import type { ReactNode } from 'react';

import { useState } from 'react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, within, fireEvent } from '@testing-library/react';

import { useAcademicSetupFormState } from './embedding';
import AcademicSetupWorkspace from './AcademicSetupWorkspace';

const mocks = vi.hoisted(() => ({ save: vi.fn(), replace: vi.fn(), push: vi.fn(), unmount: vi.fn(),
  query: {} as { currentData?: unknown; data?: unknown; isFetching: boolean; isError: boolean; refetch: () => void } }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
  useSearchParams: () => new URLSearchParams('stage=curriculum&setting=subjects') }));
vi.mock('src/redux/academic-setup/api', () => ({
  useAcademicSetupStateQuery: () => mocks.query,
  useSaveAcademicSetupProgressMutation: () => [mocks.save, { isLoading: false, isError: false }],
}));
vi.mock('src/components/setup-flow', () => ({ SetupFlowShell: ({ children, footer }: {
  children: ReactNode; footer: ReactNode;
}) => <><main>{children}</main><footer>{footer}</footer></> }));
vi.mock('src/layouts/components/global-academic-search', () => ({ default: () => <div>Academic context</div> }));
vi.mock('./AcademicSetupSettingPanel', () => ({ default: function TestSetting() {
  const [dirty, setDirty] = useState(false);
  useAcademicSetupFormState({ dirty, busy: false });
  return <button type="button" onClick={() => setDirty(true)}>{dirty ? 'Unsaved subject' : 'Edit subject'}</button>;
} }));
const state = { academicYearId: 'year-a', concurrencyStamp: 'v1', currentStageKey: 'curriculum',
  currentSettingKey: 'subjects', deferredSettingKeys: [], reviewedAt: null,
  settings: [{ key: 'subjects', canView: true, canManage: true, configurationState: 'empty' }] };
const props = { scope: { tenantCacheKey: 'school-a', academicYearId: 'year-a' }, returnTo: '/academic/dashboard', classes: [] };
beforeEach(() => {
  vi.clearAllMocks();
  mocks.query = { currentData: state, data: state, isFetching: false, isError: false, refetch: vi.fn() };
  mocks.save.mockReturnValue({ unwrap: () => Promise.resolve(state) });
});

describe('Academic setup workspace draft safety', () => {
  it('announces saved progress in the footer without inserting feedback above the active setting', async () => {
    render(<AcademicSetupWorkspace {...props} />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Save progress' })); });
    expect(within(screen.getByRole('main')).queryByText('Guide progress saved.')).not.toBeInTheDocument();
    expect(within(screen.getByRole('contentinfo')).getByRole('status', { name: 'Guide save status' })).toHaveTextContent('Saved');
  });

  it('locks guide saves, deferral and exit while the real setting reports an unsaved form', () => {
    render(<AcademicSetupWorkspace {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit subject' }));
    ['Back', 'Save progress', 'Save & continue', 'Save & exit', 'Do this later', 'Exit setup'].forEach((name) => {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    });
    expect(screen.getByText('Save or cancel the open form before moving to another setting.')).toBeVisible();
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it('keeps the active unsaved form mounted through scope status refresh and failure', () => {
    const view = render(<AcademicSetupWorkspace {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit subject' }));
    mocks.query = { ...mocks.query, currentData: undefined, isFetching: true };
    view.rerender(<AcademicSetupWorkspace {...props} />);
    expect(screen.getByRole('button', { name: 'Unsaved subject' })).toBeVisible();
    mocks.query = { ...mocks.query, isFetching: false, isError: true };
    view.rerender(<AcademicSetupWorkspace {...props} />);
    expect(screen.getByRole('button', { name: 'Unsaved subject' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save progress' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  it('locks new form input while an explicit conflict reload is pending', async () => {
    mocks.save.mockReturnValue({ unwrap: () => Promise.reject(Object.assign(new Error('Conflict'), { status: 409 })) });
    mocks.query.refetch = () => new Promise(() => {});
    render(<AcademicSetupWorkspace {...props} />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Save progress' })); });
    fireEvent.click(screen.getByRole('button', { name: 'Reload' }));
    expect(screen.getByRole('button', { name: 'Edit subject' }).closest('[inert]')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Exit setup' })).toBeDisabled();
  });
});
