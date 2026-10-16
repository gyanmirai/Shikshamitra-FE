import { it, expect, describe } from 'vitest';

import { getAttendanceLockButtonState } from './attendance-lock-state';

describe('student attendance lock button state', () => {
  it('allows locked attendance to be unlocked when an attendance day exists', () => {
    const state = getAttendanceLockButtonState({
      isLocked: true,
      attendanceDayId: 'attendance-day-1',
      isLockLoading: false,
      isUnlockLoading: false,
      canManageLock: true,
    });

    expect(state.label).toBe('Unlock');
    expect(state.title).toBe('Click to unlock attendance');
    expect(state.disabled).toBe(false);
  });

  it('blocks lock and unlock actions without an attendance day or while loading', () => {
    expect(
      getAttendanceLockButtonState({
        isLocked: false,
        attendanceDayId: undefined,
        isLockLoading: false,
        isUnlockLoading: false,
        canManageLock: true,
      }).disabled
    ).toBe(true);

    expect(
      getAttendanceLockButtonState({
        isLocked: true,
        attendanceDayId: 'attendance-day-1',
        isLockLoading: false,
        isUnlockLoading: true,
        canManageLock: true,
      }).disabled
    ).toBe(true);
  });

  it('blocks lock and unlock actions without the Add/Update permission', () => {
    const state = getAttendanceLockButtonState({
      isLocked: true,
      attendanceDayId: 'attendance-day-1',
      isLockLoading: false,
      isUnlockLoading: false,
      canManageLock: false,
    });

    expect(state.disabled).toBe(true);
    expect(state.title).toBe('You do not have permission to lock or unlock attendance');
  });
});
