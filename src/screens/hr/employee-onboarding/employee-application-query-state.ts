import type { EmployeeApplication } from 'src/redux/hr/employeeOnboardingApi';

export function resolveCurrentEmployeeApplication(
  requestedId: string | undefined,
  currentData: EmployeeApplication | undefined,
  fallbacks: readonly EmployeeApplication[] = []
) {
  if (!requestedId) {
    return undefined;
  }

  if (currentData?.id === requestedId) {
    return currentData;
  }

  return fallbacks.find((application) => application.id === requestedId);
}
