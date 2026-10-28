import { hrPaths } from 'src/constants/hr-menus';

export type OnboardingListContext = {
  page: number;
  pageSize: number;
  search: string;
  status: string;
};

// The existing application service accepts Guid IDs. Reject path fragments before issuing a read.
export const isEmployeeApplicationId = (id: string) =>
  /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(id);

export function readOnboardingListContext(params: Record<string, string>): OnboardingListContext {
  const page = Number(params.page);
  const pageSize = Number(params.pageSize);
  return {
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    pageSize: Number.isSafeInteger(pageSize) && pageSize > 0 && pageSize <= 500 ? pageSize : 10,
    search: params.search || '',
    status: /^(?:[0-8]|All)$/.test(params.status || '') ? params.status : 'All',
  };
}

export function onboardingReturnHref(context: OnboardingListContext, applicationId?: string) {
  const params = new URLSearchParams({
    page: String(context.page),
    pageSize: String(context.pageSize),
    ...(context.search ? { search: context.search } : {}),
    ...(context.status !== 'All' ? { status: context.status } : {}),
    ...(applicationId && isEmployeeApplicationId(applicationId)
      ? { application: applicationId.toLowerCase() }
      : {}),
  });
  return `${hrPaths.employee.onboarding}?${params}`;
}

export function onboardingFinalizeHref(applicationId: string, returnTo: string) {
  return `${hrPaths.employee.onboardingFinalize(applicationId)}?${new URLSearchParams({ returnTo })}`;
}

/** Only the owning onboarding screen and its known list/detail parameters may be a return target. */
export function resolveOnboardingReturnHref(returnTo: string | null, origin: string) {
  try {
    if (!returnTo?.trim()) return hrPaths.employee.onboarding;
    const destination = new URL(returnTo, origin);
    if (
      destination.origin !== new URL(origin).origin ||
      destination.username ||
      destination.password ||
      destination.pathname.replace(/\/+$/, '') !== hrPaths.employee.onboarding
    )
      return hrPaths.employee.onboarding;
    const params = Object.fromEntries(destination.searchParams);
    return onboardingReturnHref(readOnboardingListContext(params), params.application);
  } catch {
    return hrPaths.employee.onboarding;
  }
}
