import { studentPaths } from 'src/constants/student-menu';

import { safeStudentReturnTo } from '../student-setup-model';

type Setting = 'admission-stages' | 'admission-forms';

function safeOriginalReturnTo(value: string | null | undefined) {
  if (!value || safeStudentReturnTo(value) !== value) return undefined;
  const query = new URL(value, 'https://school.invalid').searchParams;
  return [...query.keys()].some((key) => key.toLowerCase() === 'returnto') ? undefined : value;
}

export function studentSetupReturnUrl(setting: Setting, guideYear?: string | null, returnTo?: string | null) {
  const params = new URLSearchParams({ stage: 'admissions', setting });
  if (guideYear) params.set('guideYear', guideYear);
  const original = safeOriginalReturnTo(returnTo);
  if (original) params.set('returnTo', original);
  return `${studentPaths.setupGuide}?${params}`;
}

export const studentSetupWorkflowReturnUrl = studentSetupReturnUrl('admission-stages');

export function getStudentSetupReturnUrl(value: string | null, setting: Setting) {
  if (!value?.startsWith(`${studentPaths.setupGuide}?`)) return undefined;
  const params = new URLSearchParams(value.slice(studentPaths.setupGuide.length + 1));
  if (params.get('stage') !== 'admissions' || params.get('setting') !== setting) return undefined;
  if ([...params.keys()].some((key) => !['stage', 'setting', 'guideYear', 'returnTo'].includes(key))) return undefined;
  const year = params.get('guideYear');
  if (year && !/^[a-zA-Z0-9-]{1,100}$/.test(year)) return undefined;
  const original = params.get('returnTo');
  if (params.has('returnTo') && !safeOriginalReturnTo(original)) return undefined;
  return studentSetupReturnUrl(setting, year, original);
}

export const getStudentSetupWorkflowReturnUrl = (value: string | null) =>
  getStudentSetupReturnUrl(value, 'admission-stages');
