import type { SeatingPlanListRow } from '../../types';

interface SeatingPlanAction {
  label: string;
  icon: string;
}

const MANAGE_PLANS_ACTION: SeatingPlanAction = {
  label: 'Manage plans',
  icon: 'mdi:clipboard-edit-outline',
};

const VIEW_SEATING_ACTION: SeatingPlanAction = {
  label: 'View seating',
  icon: 'mdi:seat-outline',
};

export function getSeatingPlanPrimaryAction(status: SeatingPlanListRow['status']) {
  return status === 'published' ? VIEW_SEATING_ACTION : MANAGE_PLANS_ACTION;
}

/** Opens the phase promised by the row action instead of making users repeat
 * the session-inbox step after they have already chosen a session. */
export function getSeatingPlanPrimaryStep(_status: SeatingPlanListRow['status']): number {
  return 0;
}
