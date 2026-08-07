import { AUDIT_ALL_SENTINEL, ACADEMIC_AUDIT_ACTION_OPTIONS } from '../academicAudit.constants';

type ActionOption = { label: string; value: string };

/**
 * Returns true when the value represents the "show all" sentinel.
 */
export const isAllSentinel = (value: string): boolean => !value || value === AUDIT_ALL_SENTINEL;

/**
 * Maps each sub-module code to the exact action strings the backend records
 * for that module. When a sub-module is not listed here the caller falls back
 * to the generic `ACADEMIC_AUDIT_ACTION_OPTIONS`.
 *
 * Why a static map?
 * The audit API has no "distinct actions" endpoint.  The action strings are
 * determined by the backend domain events and rarely change, so a curated
 * lookup is the simplest, fastest approach.  If a new sub-module introduces
 * non-standard action strings, add an entry here.
 */
const SUBMODULE_ACTION_MAP: Record<string, ActionOption[]> = {
  academic_calendar: [
    { label: 'All Actions', value: AUDIT_ALL_SENTINEL },
    { label: 'Day Added', value: 'Dayadded' },
    { label: 'Day Deleted', value: 'Daydeleted' },
    { label: 'Day Updated', value: 'Dayupdated' },
    { label: 'Calendar Published', value: 'Calendarpublished' },
  ],
  // Other sub-modules use the generic action set (created, updated, deleted …).
  // Add entries here when a sub-module logs non-standard action strings.
};

/**
 * Returns the action-filter dropdown options appropriate for a given sub-module.
 *
 * - If `subModuleCode` is the "all" sentinel → generic options.
 * - If the sub-module has a curated entry → that entry.
 * - Otherwise → generic options (works for modules whose backend actions match
 *   the generic labels, e.g. `created`, `updated`).
 */
export function getActionOptionsForSubModule(subModuleCode: string): ActionOption[] {
  if (isAllSentinel(subModuleCode)) return ACADEMIC_AUDIT_ACTION_OPTIONS;

  return SUBMODULE_ACTION_MAP[subModuleCode] ?? ACADEMIC_AUDIT_ACTION_OPTIONS;
}

/**
 * Checks whether a given action value is present in the option set for a
 * sub-module.  Used to decide whether to auto-clear the action filter when
 * the user switches sub-modules.
 */
export function isActionValidForSubModule(action: string, subModuleCode: string): boolean {
  if (isAllSentinel(action)) return true; // "All Actions" is always valid
  const options = getActionOptionsForSubModule(subModuleCode);
  return options.some((opt) => opt.value === action);
}
