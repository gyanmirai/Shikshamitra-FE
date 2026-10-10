import { studentPaths } from 'src/constants/student-menu';

/** Return only to an originating admission workbench, including its shareable filters. */
export function getApplicationReturnUrl(value: string | null): string {
  const fallback = studentPaths.enrollment.applications;
  const { pipeline, assessments } = studentPaths.enrollment;
  if (!value || value.includes('\\') || value.includes('#')) return fallback;
  if (
    [...value].some((character) => character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127)
  ) {
    return fallback;
  }
  if (
    ![fallback, pipeline, assessments].some(
      (path) => value === path || value.startsWith(`${path}?`)
    )
  )
    return fallback;
  return value;
}

/** Preserve an assessment return, but never carry queue filters across the phase handoff. */
export function getApplicationPhaseReturnUrl(value: string | null, hasReachedDecision: boolean) {
  const returnUrl = getApplicationReturnUrl(value);
  const { applications, pipeline } = studentPaths.enrollment;
  if (hasReachedDecision && (returnUrl === pipeline || returnUrl.startsWith(`${pipeline}?`))) {
    return applications;
  }
  if (
    !hasReachedDecision &&
    (returnUrl === applications || returnUrl.startsWith(`${applications}?`))
  ) {
    return pipeline;
  }
  return returnUrl;
}

/** Phase comes from the server; an unknown phase is resolved by the detail screen. */
export function getApplicationWorkspaceUrl(
  id: string,
  returnTo: string | null,
  hasReachedDecision?: boolean
) {
  const safeReturn =
    hasReachedDecision === undefined
      ? getApplicationReturnUrl(returnTo)
      : getApplicationPhaseReturnUrl(returnTo, hasReachedDecision);
  const [pathname, query] = safeReturn.split('?');
  const params = new URLSearchParams(query);
  params.delete('application');
  const returnUrl = params.size ? `${pathname}?${params}` : pathname;
  const workspace =
    hasReachedDecision === true
      ? studentPaths.enrollment.decisionWorkspace(id)
      : studentPaths.enrollment.applicantWorkspace(id);
  return `${workspace}?${new URLSearchParams({
    returnTo: returnUrl,
  })}`;
}
