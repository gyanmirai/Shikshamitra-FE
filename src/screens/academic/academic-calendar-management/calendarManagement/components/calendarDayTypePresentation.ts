import type { SemanticColorName } from 'src/theme/styles';

import { DayType } from 'src/enums/academic-calendar';

export const DAY_TYPE_SEMANTIC_COLORS: Record<DayType, SemanticColorName> = {
  [DayType.WorkingDay]: 'success',
  [DayType.Holiday]: 'error',
  [DayType.Vacation]: 'warning',
  [DayType.HalfDay]: 'info',
  [DayType.Event]: 'secondary',
  [DayType.Exam]: 'primary',
  [DayType.PTM]: 'info',
  [DayType.EmergencyClosure]: 'error',
};

export function getDayTypeSemanticColor(dayType: DayType): SemanticColorName {
  return DAY_TYPE_SEMANTIC_COLORS[dayType] ?? 'primary';
}
