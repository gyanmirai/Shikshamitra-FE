export const STALE_SHIFT_ERROR =
  'Selected shift is no longer available. Please choose another shift.';

export type EmployeeShiftOption = {
  id?: string | null;
};

export const resolveSelectedShiftOption = <TShift extends EmployeeShiftOption>(
  shifts: TShift[] | null | undefined,
  selectedShiftId: string | null | undefined
): TShift | null => {
  if (!selectedShiftId) return null;
  return (shifts || []).find((shift) => shift.id === selectedShiftId) || null;
};

export const isStaleSelectedShift = <TShift extends EmployeeShiftOption>(
  shifts: TShift[] | null | undefined,
  selectedShiftId: string | null | undefined,
  isLoading = false
) => Boolean(selectedShiftId && !isLoading && !resolveSelectedShiftOption(shifts, selectedShiftId));
