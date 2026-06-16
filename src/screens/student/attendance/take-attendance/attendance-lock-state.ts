export type AttendanceLockButtonStateInput = {
  isLocked: boolean;
  attendanceDayId?: string;
  isLockLoading: boolean;
  isUnlockLoading: boolean;
  canManageLock: boolean;
};

export const getAttendanceLockButtonState = ({
  isLocked,
  attendanceDayId,
  isLockLoading,
  isUnlockLoading,
  canManageLock,
}: AttendanceLockButtonStateInput) => {
  const isLoading = isLockLoading || isUnlockLoading;

  return {
    title: !canManageLock
      ? 'You do not have permission to lock or unlock attendance'
      : isLocked
        ? 'Click to unlock attendance'
        : 'Click to lock attendance',
    label: isLocked ? 'Unlock' : 'Lock',
    variant: isLocked ? ('contained' as const) : ('outlined' as const),
    color: isLocked ? ('error' as const) : ('inherit' as const),
    disabled: !canManageLock || !attendanceDayId || isLoading,
  };
};
