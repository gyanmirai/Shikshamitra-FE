import type {
  AssessmentAttempt,
  ApplicationAssessment,
  AssessmentSubjectScore,
  AssessmentEffectiveProfile,
} from 'src/redux/student/admissions/admission-assessment-types';

import { sumDecimal } from 'src/utils/sum-decimal';

export type AssessmentSubjectValues = Record<string, string>;

export const assessmentPassRuleLabels = {
  overall: 'Overall passing marks',
  everySubject: 'Pass every subject',
  both: 'Overall and every subject',
};

export function assessmentResultProfile(
  assessment: ApplicationAssessment,
  attempt?: AssessmentAttempt
) {
  return attempt?.effectiveProfile ?? assessment.effectiveProfile ?? null;
}

export function assessmentSubjectValues(attempt?: AssessmentAttempt): AssessmentSubjectValues {
  return Object.fromEntries(
    (attempt?.subjectScores ?? []).map(({ code, marks }) => [
      code,
      marks == null ? '' : String(marks),
    ])
  );
}

export function assessmentSubjectPayload(
  profile: AssessmentEffectiveProfile,
  values: AssessmentSubjectValues = {}
): AssessmentSubjectScore[] {
  return profile.subjects.map(({ code }) => ({
    code,
    marks: values[code] == null || values[code].trim() === '' ? null : Number(values[code]),
  }));
}

/** Drafts may be incomplete. Both writes reject invalid, foreign or out-of-range scores. */
export function validateAssessmentSubjectValues(
  profile: AssessmentEffectiveProfile,
  values: AssessmentSubjectValues = {},
  draft = false
) {
  const errors: Record<string, string> = {};
  if (!profile.subjects.length) return { _profile: 'This assessment has no configured subjects.' };
  const allowedCodes = new Set(profile.subjects.map(({ code }) => code));
  if (Object.keys(values).some((code) => !allowedCodes.has(code)))
    errors._profile = 'The assessment subjects changed. Reopen the result before saving.';
  profile.subjects.forEach(({ code, name, totalMarks }) => {
    const raw = values[code]?.trim() ?? '';
    if (!raw && draft) return;
    const marks = raw ? Number(raw) : Number.NaN;
    if (!Number.isFinite(marks) || marks < 0 || marks > totalMarks)
      errors[code] = `Enter ${name} marks between 0 and ${totalMarks}`;
  });
  return errors;
}

export function assessmentProfileTotal(profile: AssessmentEffectiveProfile) {
  return sumDecimal(profile.subjects.map((subject) => subject.totalMarks));
}

export function assessmentEnteredTotal(
  profile: AssessmentEffectiveProfile,
  values: AssessmentSubjectValues
) {
  return sumDecimal(
    profile.subjects.map(({ code }) => {
      const raw = values[code]?.trim();
      return raw && Number.isFinite(Number(raw)) ? Number(raw) : 0;
    })
  );
}

/** Identical profile names alone cannot establish identical columns, limits or pass rules. */
export function assessmentProfileKey(profile: AssessmentEffectiveProfile | null) {
  return profile ? JSON.stringify(profile) : 'single-result';
}
