import { createRef } from 'react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import {
  StatutoryProfileEditor,
  type StatutoryProfileEditHandle,
} from './statutory-profile-editor';

const state = vi.hoisted(() => ({ query: {} as any, save: vi.fn(), toast: vi.fn() }));
const profile = {
  applyPf: true,
  pfNumber: '7',
  uanNumber: '',
  pfDisabledReason: '',
  applyEsic: true,
  esicInsuranceNumber: '',
  esicDisabledReason: '',
};
vi.mock('src/redux/hr/statutory-profile-api', () => ({
  emptyStatutoryProfile: {
    applyPf: true,
    applyEsic: true,
    pfNumber: '',
    uanNumber: '',
    esicInsuranceNumber: '',
  },
  hasStatutoryNumber: (value: string) => !!value?.trim() && value.trim() !== '0',
  useGetStaffStatutoryProfileQuery: () => state.query,
  useSaveStaffStatutoryProfileMutation: () => [state.save, { isLoading: false }],
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: state.toast, error: state.toast },
}));
vi.mock('src/hooks/use-unsaved-navigation', () => ({
  useUnsavedNavigation: () => ({ confirmation: null }),
}));

describe('shared statutory registration editor', () => {
  beforeEach(() => {
    state.query = {
      currentData: {
        employeeId: 'staff-1',
        profile: { ...profile },
        effectiveMonth: '2026-10',
        concurrencyStamp: 'stamp-1',
        canManagePf: true,
        canManageEsic: true,
        canViewPf: true,
        canViewEsic: true,
      },
      requestId: 'read-1',
      isFetching: false,
    };
    state.save.mockReset();
    state.toast.mockReset();
  });
  afterEach(cleanup);

  it('lets Staff Edit save registration through its Save & Next handle', async () => {
    const ref = createRef<StatutoryProfileEditHandle>();
    state.save.mockImplementation((input) => ({
      unwrap: async () => ({
        ...state.query.currentData,
        profile: input.profile,
        concurrencyStamp: 'saved-stamp',
      }),
    }));
    render(<StatutoryProfileEditor employeeId="staff-1" editorRef={ref} />);
    expect(
      screen.queryByRole('button', { name: 'Save registration details' })
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('PF number'), { target: { value: '164' } });
    let result: boolean | undefined;
    await act(async () => {
      result = await ref.current!.save();
    });
    expect(result).toBe(true);
    expect(state.save).toHaveBeenCalledWith(
      expect.objectContaining({ profile: expect.objectContaining({ pfNumber: '164' }) })
    );
  });

  it('keeps Staff Edit on the same step when an opt-out reason is missing', async () => {
    const ref = createRef<StatutoryProfileEditHandle>();
    render(<StatutoryProfileEditor employeeId="staff-1" editorRef={ref} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Apply PF' }));
    let result: boolean | undefined;
    await act(async () => {
      result = await ref.current!.save();
    });
    expect(result).toBe(false);
    expect(state.save).not.toHaveBeenCalled();
    expect(screen.getByText('Enter a reason for turning PF off.')).toBeVisible();
  });

  it('retains a dirty draft and its original concurrency stamp across background refresh', async () => {
    state.save.mockImplementation(() => ({
      unwrap: async () => {
        throw Object.assign(new Error('Refresh required'), {
          status: 409,
          data: { detail: 'Refresh required' },
        });
      },
    }));
    const view = render(<StatutoryProfileEditor employeeId="staff-1" />);
    fireEvent.change(screen.getByLabelText('PF number'), { target: { value: '164' } });
    state.query = {
      ...state.query,
      requestId: 'read-2',
      currentData: {
        ...state.query.currentData,
        concurrencyStamp: 'stamp-2',
        profile: { ...profile, pfNumber: '246' },
      },
    };
    view.rerender(<StatutoryProfileEditor employeeId="staff-1" />);
    expect(screen.getByLabelText('PF number')).toHaveValue('164');
    fireEvent.click(screen.getByRole('button', { name: 'Save registration details' }));
    await waitFor(() => expect(state.save).toHaveBeenCalled());
    expect(state.save.mock.calls[0][0]).toMatchObject({
      concurrencyStamp: 'stamp-1',
      profile: { pfNumber: '164' },
    });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save registration details' })).toBeEnabled()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save registration details' }));
    await waitFor(() => expect(state.save).toHaveBeenCalledTimes(2));
    expect(state.save.mock.calls[1][0].idempotencyKey).toBe(
      state.save.mock.calls[0][0].idempotencyKey
    );
  });

  it('allows pending numbers while requiring a reason for a deliberate opt-out', async () => {
    const callback = vi.fn();
    render(
      <StatutoryProfileEditor
        employeeId="staff-1"
        draftMode
        onDraftChange={callback}
        grossSalary={25000}
      />
    );
    await waitFor(() =>
      expect(callback).toHaveBeenLastCalledWith(expect.objectContaining({ valid: true }))
    );
    fireEvent.click(screen.getByRole('switch', { name: 'Apply PF' }));
    await waitFor(() =>
      expect(callback).toHaveBeenLastCalledWith(expect.objectContaining({ valid: false }))
    );
    fireEvent.change(screen.getByLabelText('Reason for turning PF off'), {
      target: { value: 'Registration dispute' },
    });
    await waitFor(() =>
      expect(callback).toHaveBeenLastCalledWith(
        expect.objectContaining({
          valid: true,
          profile: expect.objectContaining({ applyPf: false, applyEsic: true }),
        })
      )
    );
    expect(screen.getByText(/No ESIC insurance number is recorded/)).toBeVisible();
  });

  it('requires an explicit PF choice above the boundary even when an ESIC-only version exists', async () => {
    state.query.currentData.profile.versionId = 'esi-only-version';
    const callback = vi.fn();
    render(
      <StatutoryProfileEditor
        employeeId="staff-1"
        draftMode
        grossSalary={25001}
        onDraftChange={callback}
      />
    );
    await waitFor(() =>
      expect(callback).toHaveBeenLastCalledWith(
        expect.objectContaining({ valid: false, pfChoice: null })
      )
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Opt in to PF' }));
    await waitFor(() =>
      expect(callback).toHaveBeenLastCalledWith(
        expect.objectContaining({ valid: true, pfChoice: true })
      )
    );
  });

  it('adopts the atomic salary save response without restoring an older cached profile', async () => {
    const view = render(<StatutoryProfileEditor employeeId="staff-1" draftMode />);
    fireEvent.change(screen.getByLabelText('PF number'), { target: { value: '248' } });
    const saved = {
      ...state.query.currentData,
      profile: { ...profile, pfNumber: '248' },
      concurrencyStamp: 'saved-stamp',
    };
    await act(async () =>
      view.rerender(<StatutoryProfileEditor employeeId="staff-1" draftMode savedProfile={saved} />)
    );
    expect(screen.getByLabelText('PF number')).toHaveValue('248');
  });
});
