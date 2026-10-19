import { hrPaths } from 'src/constants/hr-menus';

export function salaryStructureHref(employeeId: string) {
  return `${hrPaths.payroll.structure}?${new URLSearchParams({ employeeId })}`;
}

export function salaryEditorHref(employeeId: string, returnTo: string, month?: string) {
  return `${hrPaths.payroll.salaryEditor(employeeId)}?${new URLSearchParams({ returnTo, ...(month ? { month } : {}) })}`;
}

/** Return navigation is limited to the two salary entry screens on this origin. */
export function resolveSalaryReturnHref(
  employeeId: string,
  returnTo: string | null,
  origin: string
) {
  const fallback = salaryStructureHref(employeeId);
  if (!returnTo?.trim()) return fallback;

  try {
    const destination = new URL(returnTo, origin);
    const pathname = destination.pathname.replace(/\/+$/, '');
    if (
      destination.origin !== new URL(origin).origin ||
      destination.username ||
      destination.password ||
      ![hrPaths.payroll.structure, hrPaths.employee.list].includes(pathname)
    ) {
      return fallback;
    }
    // Returning to a legacy setup link must not reopen the editor.
    if (destination.searchParams.get('setup') === 'salary') {
      destination.searchParams.delete('setup');
    }
    return `${pathname}${destination.search}${destination.hash}`;
  } catch {
    return fallback;
  }
}
