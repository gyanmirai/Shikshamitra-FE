import { sumDecimal } from 'src/utils/sum-decimal';

export type AdmissionAssessmentPassRule = 'overall' | 'everySubject' | 'both';
export type AdmissionAssessmentSubjectPolicy = {
  code: string;
  subjectId?: string | null;
  name: string;
  totalMarks: number;
  passingMarks?: number | null;
};
export type AdmissionAssessmentClassProfile = {
  id: string;
  name: string;
  boardId: string;
  mediumId: string;
  standardIds: string[];
  passRule: AdmissionAssessmentPassRule;
  passingMarks: number;
  subjects: AdmissionAssessmentSubjectPolicy[];
};

export type AdmissionAssessmentPolicy = {
  version: 1 | 2;
  enabled: boolean;
  schedulingEnabled: boolean;
  attendanceRequired: boolean;
  scoringEnabled: boolean;
  totalMarks: number;
  passingMarks: number;
  reviewRequired: boolean;
  maxAttempts: number;
  scoringMode?: 'total' | 'subjects';
  classProfiles?: AdmissionAssessmentClassProfile[];
};

export const DEFAULT_ASSESSMENT_POLICY: AdmissionAssessmentPolicy = {
  version: 1,
  enabled: true,
  schedulingEnabled: false,
  attendanceRequired: false,
  scoringEnabled: true,
  totalMarks: 100,
  passingMarks: 40,
  reviewRequired: false,
  maxAttempts: 1,
};

export function readStageConfiguration(json?: string): Record<string, unknown> | null {
  if (!json) return {};
  try {
    const value: unknown = JSON.parse(json);
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function readAdmissionAssessmentPolicy(json?: string): AdmissionAssessmentPolicy | null {
  const value = readStageConfiguration(json)?.assessment;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const policy = value as Record<string, unknown>;
  if (policy.version !== 1 && policy.version !== 2) return null;
  const booleans = [
    'enabled',
    'schedulingEnabled',
    'attendanceRequired',
    'scoringEnabled',
    'reviewRequired',
  ];
  const numbers = ['totalMarks', 'passingMarks', 'maxAttempts'];
  if (booleans.some((key) => typeof policy[key] !== 'boolean')) return null;
  if (numbers.some((key) => typeof policy[key] !== 'number' || !Number.isFinite(policy[key])))
    return null;
  if (
    policy.version === 2 &&
    (!['total', 'subjects'].includes(String(policy.scoringMode)) ||
      !Array.isArray(policy.classProfiles) ||
      !policy.classProfiles.every(isClassProfile))
  )
    return null;
  return policy as AdmissionAssessmentPolicy;
}

function isClassProfile(value: unknown): value is AdmissionAssessmentClassProfile {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const profile = value as Record<string, unknown>;
  return (
    ['id', 'name', 'boardId', 'mediumId', 'passRule'].every(
      (key) => typeof profile[key] === 'string'
    ) &&
    typeof profile.passingMarks === 'number' &&
    Number.isFinite(profile.passingMarks) &&
    Array.isArray(profile.standardIds) &&
    profile.standardIds.every((id) => typeof id === 'string') &&
    Array.isArray(profile.subjects) &&
    profile.subjects.every((subject: unknown) => {
      if (!subject || typeof subject !== 'object' || Array.isArray(subject)) return false;
      const item = subject as Record<string, unknown>;
      return (
        ['code', 'name'].every((key) => typeof item[key] === 'string') &&
        (item.subjectId == null || typeof item.subjectId === 'string') &&
        typeof item.totalMarks === 'number' &&
        Number.isFinite(item.totalMarks) &&
        (item.passingMarks == null ||
          (typeof item.passingMarks === 'number' && Number.isFinite(item.passingMarks)))
      );
    })
  );
}

export function assessmentProfileTotal(profile: AdmissionAssessmentClassProfile) {
  return sumDecimal(profile.subjects.map(({ totalMarks }) => totalMarks));
}

export function getAssessmentClassProfileError(
  profile: AdmissionAssessmentClassProfile,
  profiles: AdmissionAssessmentClassProfile[] = []
): string | undefined {
  if (!profile.id.trim() || profile.id.length > 64)
    return 'The class profile identity is invalid. Re-add this profile.';
  if (!profile.name.trim() || profile.name.length > 128)
    return 'Use a class profile name of 1 to 128 characters.';
  if (
    !profile.boardId ||
    !profile.mediumId ||
    profile.standardIds.length === 0 ||
    profile.standardIds.some((id) => !id.trim())
  )
    return 'Choose the board, medium and at least one class for this profile.';
  if (
    new Set(profile.standardIds).size !== profile.standardIds.length ||
    profiles.some(
      (other) =>
        other.id !== profile.id && other.standardIds.some((id) => profile.standardIds.includes(id))
    )
  )
    return 'A class can belong to only one assessment profile.';
  if (!['overall', 'everySubject', 'both'].includes(profile.passRule))
    return 'Choose a valid pass rule.';
  if (!profile.subjects.length) return 'Add at least one subject to this class profile.';
  const codes = new Set<string>();
  const names = new Set<string>();
  const subjectIds = new Set<string>();
  const subjectError = profile.subjects
    .map((subject) => {
      const name = subject.name.trim().toLocaleLowerCase();
      const code = subject.code.trim().toLocaleLowerCase();
      if (!name || subject.name.length > 128) return 'Use a subject name of 1 to 128 characters.';
      if (!code || subject.code.length > 64)
        return 'A subject identity is invalid. Remove and re-add the subject.';
      if (
        codes.has(code) ||
        names.has(name) ||
        (subject.subjectId && subjectIds.has(subject.subjectId))
      )
        return 'Each subject can appear only once in a class profile.';
      codes.add(code);
      names.add(name);
      if (subject.subjectId) subjectIds.add(subject.subjectId);
      if (
        !Number.isFinite(subject.totalMarks) ||
        subject.totalMarks <= 0 ||
        subject.totalMarks > 10000
      )
        return 'Each subject maximum must be greater than zero and no more than 10,000.';
      if (
        (profile.passRule !== 'overall' && subject.passingMarks == null) ||
        (subject.passingMarks != null &&
          (!Number.isFinite(subject.passingMarks) ||
            subject.passingMarks < 0 ||
            subject.passingMarks > subject.totalMarks))
      )
        return 'Enter passing marks between zero and the maximum for every subject.';
      return undefined;
    })
    .find(Boolean);
  if (subjectError) return subjectError;
  const total = assessmentProfileTotal(profile);
  if (total <= 0 || total > 10000)
    return 'Combined subject marks must be greater than zero and no more than 10,000.';
  if (
    !Number.isFinite(profile.passingMarks) ||
    profile.passingMarks < 0 ||
    profile.passingMarks > total
  )
    return 'Overall passing marks must be between zero and the combined subject marks.';
  return undefined;
}

export function writeAdmissionAssessmentPolicy(
  json: string | undefined,
  policy: AdmissionAssessmentPolicy
) {
  const configuration = readStageConfiguration(json);
  if (!configuration)
    throw new Error('The stage configuration could not be read. Reopen the stage.');
  const previous = configuration.assessment;
  if (previous !== undefined && !readAdmissionAssessmentPolicy(json)) {
    throw new Error(
      'These assessment settings are unsupported or incomplete. Reload the workflow.'
    );
  }
  const extra =
    previous && typeof previous === 'object' && !Array.isArray(previous) ? previous : {};
  return JSON.stringify({ ...configuration, assessment: { ...extra, ...policy } });
}

export function getAssessmentConfigurationError(json?: string): string | undefined {
  if (json && json.length > 64000)
    return 'Assessment settings are too large. Reduce class profiles or subjects to 64,000 characters or fewer.';
  const configuration = readStageConfiguration(json);
  if (!configuration)
    return 'The stage settings could not be read. Reopen the stage before saving.';
  if (configuration.assessment === undefined) return undefined;
  const policy = readAdmissionAssessmentPolicy(json);
  if (!policy)
    return 'These assessment settings are unsupported or incomplete. Reload the workflow.';
  if (!policy.enabled) return undefined;
  if (policy.version === 2 && policy.scoringMode === 'subjects' && !policy.scoringEnabled)
    return 'Turn on marks-based results to use subject-wise marks.';
  if (!Number.isInteger(policy.maxAttempts) || policy.maxAttempts < 1 || policy.maxAttempts > 10) {
    return 'Enter a maximum of 1 to 10 attempts, including the first assessment.';
  }
  if (policy.version === 2 && policy.scoringMode === 'subjects' && policy.scoringEnabled) {
    const profiles = policy.classProfiles ?? [];
    if (!profiles.length) return 'Add a class assessment profile before saving.';
    if (new Set(profiles.map((profile) => profile.id.toLowerCase())).size !== profiles.length)
      return 'Each class assessment profile must have a unique identity.';
    return profiles
      .map((profile) => getAssessmentClassProfileError(profile, profiles))
      .find(Boolean);
  }
  if (policy.scoringEnabled && (policy.totalMarks <= 0 || policy.totalMarks > 10000)) {
    return 'Total marks must be greater than zero and no more than 10,000.';
  }
  if (
    policy.scoringEnabled &&
    (policy.passingMarks < 0 || policy.passingMarks > policy.totalMarks)
  ) {
    return 'Passing marks must be between zero and the total marks.';
  }
  return undefined;
}
