import { getIn } from 'formik';

import type { useSlotForm } from '../useSlotForm';

export type SlotFormik = ReturnType<typeof useSlotForm>['formik'];

export function getSlotConfigurationErrors(
  formik: SlotFormik,
  configIndex: number,
  slotCount: number
) {
  const prefix = `slotConfigurations[${configIndex}]`;
  const fieldError = (path: string): string | undefined => {
    const error: unknown = getIn(formik.errors, path);
    return (formik.submitCount > 0 || getIn(formik.touched, path)) && typeof error === 'string'
      ? error
      : undefined;
  };
  const slotErrors = Object.fromEntries(
    Array.from({ length: slotCount }, (_, index) => [
      index,
      {
        startTime: fieldError(`${prefix}.timeSlots[${index}].startTime`),
        endTime: fieldError(`${prefix}.timeSlots[${index}].endTime`),
        slotType: fieldError(`${prefix}.timeSlots[${index}].slotType`),
      },
    ])
  );
  const weekRange = fieldError(`${prefix}.weekRange`);
  const totalSlots = fieldError(`${prefix}.totalSlots`);
  const timeSlots = fieldError(`${prefix}.timeSlots`);
  return {
    weekRange,
    totalSlots,
    timeSlots,
    slotErrors,
    hasError: Boolean(
      weekRange ||
      totalSlots ||
      timeSlots ||
      Object.values(slotErrors).some((error) => error.startTime || error.endTime || error.slotType)
    ),
  };
}
