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
