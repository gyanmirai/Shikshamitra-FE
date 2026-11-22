import { CycleDateField } from './cycle-date-fields';
import { getMinimumClosingDate } from './cycle-date-limits';

import type { CycleConfigurationState } from './use-cycle-configuration';

export function CycleWindowFields({
  state,
  disabled,
}: {
  state: CycleConfigurationState;
  disabled: boolean;
}) {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    startDateError,
    endDateError,
    minimumDate,
  } = state;
  return (
    <>
      <CycleDateField
        name="startDate"
        value={startDate}
        onChange={setStartDate}
        minimumDate={minimumDate}
        error={startDateError}
        disabled={disabled}
      />
      <CycleDateField
        name="endDate"
        value={endDate}
        onChange={setEndDate}
        minimumDate={getMinimumClosingDate(startDate, minimumDate)}
        error={endDateError}
        disabled={disabled}
      />
    </>
  );
}
