export const ACADEMIC_CONTEXT_CHANGE_EVENT = 'student-academic-context-change';

export type AcademicContextChangeRequest = {
  proceed: () => void;
  guards: { blocked: boolean; request: () => void; approve?: () => void }[];
};

function collectGuards(proceed: () => void) {
  const detail: AcademicContextChangeRequest = { proceed, guards: [] };
  window.dispatchEvent(new CustomEvent(ACADEMIC_CONTEXT_CHANGE_EVENT, { detail }));
  return detail.guards;
}

export function guardStudentNavigation(proceed: () => void): boolean {
  const commit = () => {
    const approved = collectGuards(proceed);
    if (approved.some((guard) => guard.blocked)) return;
    approved.forEach((guard) => guard.approve?.());
    proceed();
  };
  const guards = collectGuards(commit);
  if (guards.some((guard) => guard.blocked)) return true;
  const owner = guards[0];
  if (!owner) return false;
  owner.request();
  return true;
}

export const guardAcademicContextChange = guardStudentNavigation;
