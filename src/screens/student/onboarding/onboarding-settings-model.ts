export type AssignmentModePolicy = 'automatic' | 'manual' | 'both';

export type ReadinessCheckKey = 'admission' | 'placement' | 'identifier' | 'documents' | 'accounts';

export type ApprovalMode = 'none' | 'always' | 'conditional';

export type ConditionalApprovalTrigger =
  | 'manual-identifier'
  | 'division-change'
  | 'capacity-override'
  | 'mid-year-admission'
  | 'incomplete-optional-check';

export type ReadinessCheckRule = {
  key: ReadinessCheckKey;
  label: string;
  required: boolean;
  blocking: boolean;
  owner: string;
};

export type OnboardingConfigurationScopeLevel = 'school' | 'academic-year';

export type OnboardingConfigurationScope = {
  level: OnboardingConfigurationScopeLevel;
  key: string;
  label: string;
  schoolName: string;
  schoolCode?: string;
  academicYearId?: string;
  academicYearName?: string;
};

export type OnboardingRules = {
  requireDocuments: boolean;
  requireIdentifiers: boolean;
  requireApproval: boolean;
  blockActivation: boolean;
};

export type AccountRules = {
  studentAccount: boolean;
  guardianAccount: boolean;
  verifiedGuardianContact: boolean;
  deliveryTiming: 'after-activation' | 'manual-release';
};

export type ReadinessAccessRules = OnboardingRules &
  AccountRules & {
    approvalMode: ApprovalMode;
    approvalTriggers: ConditionalApprovalTrigger[];
    checks: ReadinessCheckRule[];
  };

export type OnboardingProfile = {
  id: string;
  name: string;
  description: string;
  admissionRoutes: string[];
  applicability: AcademicApplicableRule;
  rules: ReadinessAccessRules;
};

export type AcademicApplicabilityMode = 'all' | 'selected';

export type BoardApplicabilityMode = AcademicApplicabilityMode;

export type BoardApplicableRule = {
  boardMode: BoardApplicabilityMode;
  boardIds: string[];
};

export type AcademicApplicableRule = BoardApplicableRule & {
  mediumMode: AcademicApplicabilityMode;
  academicMediumIds: string[];
  stageMode: AcademicApplicabilityMode;
  academicMediumStageIds: string[];
  classMode: AcademicApplicabilityMode;
  standardIds: string[];
  divisionMode: AcademicApplicabilityMode;
  divisionIds: string[];
  includeFutureStructures: boolean;
};

export type AcademicPathContext = {
  boardId?: string | null;
  academicMediumId?: string | null;
  academicMediumStageId?: string | null;
  standardId?: string | null;
  divisionId?: string | null;
};

export type GrSequenceScope = 'school' | 'academic-year';

export type GrResetPolicy = 'continuous' | 'academic-year';

export type GrNumberConfiguration = AcademicApplicableRule & {
  id: string;
  name: string;
  prefix: string;
  startingNumber: number;
  padding: number;
  suffix: string;
  formatPattern: string;
  applicableProfileIds: string[];
  sequenceScope: GrSequenceScope;
  resetPolicy: GrResetPolicy;
  maximumNumber: number | null;
  manualEntryAllowed: boolean;
  requireManualReason: boolean;
  requireManualApproval: boolean;
  effectiveFrom: string;
  isActive: boolean;
};

export type GrNumberFormatContext = {
  academicYearName?: string;
  schoolCode?: string;
};

export type RollArrangeBy = 'studentName' | 'admissionDate' | 'admissionNumber' | 'grNumber';

export type RollArrangeType = 'ascending' | 'descending';

export type RollNumberScope = 'class-division' | 'class';

export type RollAssignmentTiming =
  'after-division' | 'during-activation' | 'first-academic-day' | 'manual-bulk';

export type MidYearRollHandling =
  'next-available' | 'insert-without-recalculation' | 'insert-and-recalculate' | 'manual';

export type RollOrderingRule = {
  field: RollArrangeBy;
  direction: RollArrangeType;
};

export type RollNumberConfiguration = AcademicApplicableRule & {
  id: string;
  classId: string;
  className: string;
  arrangeBy: RollArrangeBy;
  arrangeType: RollArrangeType;
  startingNumber: number;
  preserveExisting: boolean;
  numberingScope: RollNumberScope;
  assignmentTiming: RollAssignmentTiming;
  midYearHandling: MidYearRollHandling;
  orderingRules: RollOrderingRule[];
  allowIndividualLocks: boolean;
  requireChangeReason: boolean;
  requireApproval: boolean;
  effectiveFrom: string;
  isActive: boolean;
};

export type DivisionAssignmentStrategy =
  'next-available' | 'balance-count' | 'balance-tolerance' | 'sequential' | 'preserve-preferred';

export type OverCapacityBehavior = 'block' | 'approval';

export type DivisionChangeRules = {
  assignmentMode: AssignmentModePolicy;
  automaticStrategy: DivisionAssignmentStrategy;
  balanceTolerance: number;
  capacityRequired: boolean;
  capacityWarningThreshold: number;
  overCapacityBehavior: OverCapacityBehavior;
  requireReason: boolean;
  requireApproval: boolean;
  approvalRequiredAfter: string;
  recalculateRollNumber: boolean;
  notifyClassTeacher: boolean;
  effectiveDate: string;
};

export type DivisionChangeConfiguration = AcademicApplicableRule &
  DivisionChangeRules & {
    id: string;
    name: string;
    classId: string;
    className: string;
    isActive: boolean;
  };

export type DivisionChangeSettings = {
  configurations: DivisionChangeConfiguration[];
};

export type NumberingRules<TConfiguration> = {
  assignmentMode: AssignmentModePolicy;
  configurations: TConfiguration[];
};

export type OnboardingSettingsConfiguration = {
  readinessAccess: ReadinessAccessRules;
  onboardingProfiles: OnboardingProfile[];
  grNumber: NumberingRules<GrNumberConfiguration>;
  rollNumber: NumberingRules<RollNumberConfiguration>;
  divisionChange: DivisionChangeSettings;
};

export const defaultOnboardingRules: OnboardingRules = {
  requireDocuments: true,
  requireIdentifiers: true,
  requireApproval: true,
  blockActivation: true,
};

export const defaultAccountRules: AccountRules = {
  studentAccount: true,
  guardianAccount: true,
  verifiedGuardianContact: true,
  deliveryTiming: 'after-activation',
};

export const defaultReadinessAccessRules: ReadinessAccessRules = {
  ...defaultOnboardingRules,
  ...defaultAccountRules,
  approvalMode: 'always',
  approvalTriggers: ['manual-identifier', 'division-change', 'capacity-override'],
  checks: [
    {
      key: 'admission',
      label: 'Admission approved',
      required: true,
      blocking: true,
      owner: 'Admission team',
    },
    {
      key: 'placement',
      label: 'Class and Division',
      required: true,
      blocking: true,
      owner: 'Academic coordinator',
    },
    {
      key: 'identifier',
      label: 'GR and Roll numbers',
      required: true,
      blocking: true,
      owner: 'Student administrator',
    },
    {
      key: 'documents',
      label: 'Required documents',
      required: true,
      blocking: true,
      owner: 'Records team',
    },
    {
      key: 'accounts',
      label: 'Student and guardian access',
      required: true,
      blocking: false,
      owner: 'IT administrator',
    },
  ],
};

export const createAllAcademicApplicability = (): AcademicApplicableRule => ({
  boardMode: 'all',
  boardIds: [],
  mediumMode: 'all',
  academicMediumIds: [],
  stageMode: 'all',
  academicMediumStageIds: [],
  classMode: 'all',
  standardIds: [],
  divisionMode: 'all',
  divisionIds: [],
  includeFutureStructures: false,
});

const cloneReadinessRules = (rules: ReadinessAccessRules): ReadinessAccessRules => ({
  ...rules,
  approvalTriggers: [...rules.approvalTriggers],
  checks: rules.checks.map((check) => ({ ...check })),
});

export const defaultOnboardingProfiles: OnboardingProfile[] = [
  {
    id: 'fresh-admission',
    name: 'Fresh admission',
    description: 'Standard first-time admission readiness and access requirements.',
    admissionRoutes: ['Fresh admission'],
    applicability: createAllAcademicApplicability(),
    rules: cloneReadinessRules(defaultReadinessAccessRules),
  },
  {
    id: 'transfer-student',
    name: 'Transfer student',
    description: 'Transfer admission checks with controlled approval for exceptions.',
    admissionRoutes: ['Transfer student'],
    applicability: createAllAcademicApplicability(),
    rules: cloneReadinessRules(defaultReadinessAccessRules),
  },
  {
    id: 'mid-year-admission',
    name: 'Mid-year admission',
    description: 'Expedited placement with approval for the mid-year exception.',
    admissionRoutes: ['Mid-year admission'],
    applicability: createAllAcademicApplicability(),
    rules: {
      ...cloneReadinessRules(defaultReadinessAccessRules),
      approvalMode: 'conditional',
      approvalTriggers: ['mid-year-admission', 'capacity-override', 'manual-identifier'],
    },
  },
  {
    id: 'returning-student',
    name: 'Returning student',
    description: 'Reconfirm identity, placement, access, and changed information.',
    admissionRoutes: ['Returning student'],
    applicability: createAllAcademicApplicability(),
    rules: {
      ...cloneReadinessRules(defaultReadinessAccessRules),
      approvalMode: 'conditional',
      approvalTriggers: ['division-change', 'incomplete-optional-check'],
    },
  },
];

export const defaultGrNumberConfiguration: GrNumberConfiguration = {
  ...createAllAcademicApplicability(),
  id: 'default-gr-series',
  name: 'Default GR series',
  prefix: 'GR-',
  startingNumber: 1,
  padding: 6,
  suffix: '',
  formatPattern: '{PREFIX}{SEQUENCE}{SUFFIX}',
  applicableProfileIds: defaultOnboardingProfiles.map((profile) => profile.id),
  sequenceScope: 'school',
  resetPolicy: 'continuous',
  maximumNumber: null,
  manualEntryAllowed: true,
  requireManualReason: true,
  requireManualApproval: true,
  effectiveFrom: '',
  isActive: true,
};

export const defaultRollNumberConfiguration: RollNumberConfiguration = {
  ...createAllAcademicApplicability(),
  id: 'default-roll-rule',
  classId: '*',
  className: 'All classes',
  arrangeBy: 'studentName',
  arrangeType: 'ascending',
  startingNumber: 1,
  preserveExisting: true,
  numberingScope: 'class-division',
  assignmentTiming: 'after-division',
  midYearHandling: 'next-available',
  orderingRules: [
    { field: 'studentName', direction: 'ascending' },
    { field: 'admissionNumber', direction: 'ascending' },
  ],
  allowIndividualLocks: true,
  requireChangeReason: true,
  requireApproval: false,
  effectiveFrom: '',
  isActive: true,
};

export const defaultDivisionChangeRules: DivisionChangeRules = {
  assignmentMode: 'both',
  automaticStrategy: 'balance-count',
  balanceTolerance: 2,
  capacityRequired: false,
  capacityWarningThreshold: 5,
  overCapacityBehavior: 'approval',
  requireReason: true,
  requireApproval: true,
  approvalRequiredAfter: '',
  recalculateRollNumber: true,
  notifyClassTeacher: false,
  effectiveDate: '',
};

export const defaultDivisionChangeConfiguration: DivisionChangeConfiguration = {
  ...defaultDivisionChangeRules,
  ...createAllAcademicApplicability(),
  id: 'default-division-rule',
  name: 'Default Division rule',
  classId: '*',
  className: 'All classes',
  isActive: true,
};

export const defaultOnboardingSettings: OnboardingSettingsConfiguration = {
  readinessAccess: defaultReadinessAccessRules,
  onboardingProfiles: defaultOnboardingProfiles,
  grNumber: {
    assignmentMode: 'both',
    configurations: [defaultGrNumberConfiguration],
  },
  rollNumber: {
    assignmentMode: 'both',
    configurations: [defaultRollNumberConfiguration],
  },
  divisionChange: {
    configurations: [defaultDivisionChangeConfiguration],
  },
};

export const defaultOnboardingConfigurationScope: OnboardingConfigurationScope = {
  level: 'school',
  key: 'school:current',
  label: 'Current school',
  schoolName: 'Current school',
};

const getYearTokens = (academicYearName?: string) => {
  const years = academicYearName?.match(/\d{2,4}/g) ?? [];
  return {
    year: academicYearName?.trim() || 'YEAR',
    yearShort: years.length ? years.map((year) => year.slice(-2)).join('-') : 'YY',
  };
};

export const formatGrNumber = (
  configuration: GrNumberConfiguration,
  offset = 0,
  context: GrNumberFormatContext = {}
) => {
  const value = configuration.startingNumber + offset;
  const sequence = String(value).padStart(configuration.padding, '0');
  const { year, yearShort } = getYearTokens(context.academicYearName);
  const pattern = configuration.formatPattern || '{PREFIX}{SEQUENCE}{SUFFIX}';

  return pattern
    .replaceAll('{PREFIX}', configuration.prefix)
    .replaceAll('{SEQUENCE}', sequence)
    .replaceAll('{SUFFIX}', configuration.suffix)
    .replaceAll('{YEAR_SHORT}', yearShort)
    .replaceAll('{YEAR}', year)
    .replaceAll('{SCHOOL_CODE}', context.schoolCode?.trim() || 'SCHOOL');
};

const isSelectedValueApplicable = (
  mode: AcademicApplicabilityMode,
  selectedIds: string[],
  value?: string | null
) => mode === 'all' || Boolean(value && selectedIds.includes(value));

const getStandardApplicability = (
  configuration: AcademicApplicableRule & { classId?: string }
): Pick<AcademicApplicableRule, 'classMode' | 'standardIds'> => {
  if (configuration.standardIds.length) {
    return { classMode: configuration.classMode, standardIds: configuration.standardIds };
  }
  if (configuration.classId && configuration.classId !== '*') {
    return { classMode: 'selected', standardIds: [configuration.classId] };
  }
  return { classMode: configuration.classMode, standardIds: configuration.standardIds };
};

export const isAcademicApplicabilityMatch = (
  configuration: AcademicApplicableRule & { classId?: string },
  context: AcademicPathContext = {}
) => {
  const standardApplicability = getStandardApplicability(configuration);
  return (
    isSelectedValueApplicable(configuration.boardMode, configuration.boardIds, context.boardId) &&
    isSelectedValueApplicable(
      configuration.mediumMode,
      configuration.academicMediumIds,
      context.academicMediumId
    ) &&
    isSelectedValueApplicable(
      configuration.stageMode,
      configuration.academicMediumStageIds,
      context.academicMediumStageId
    ) &&
    isSelectedValueApplicable(
      standardApplicability.classMode,
      standardApplicability.standardIds,
      context.standardId
    ) &&
    isSelectedValueApplicable(
      configuration.divisionMode,
      configuration.divisionIds,
      context.divisionId
    )
  );
};

export const getAcademicApplicabilityScore = (
  configuration: AcademicApplicableRule & { classId?: string }
) => {
  const standardApplicability = getStandardApplicability(configuration);
  return (
    (configuration.boardMode === 'selected' ? 16 : 0) +
    (configuration.mediumMode === 'selected' ? 8 : 0) +
    (configuration.stageMode === 'selected' ? 4 : 0) +
    (standardApplicability.classMode === 'selected' ? 2 : 0) +
    (configuration.divisionMode === 'selected' ? 1 : 0)
  );
};

export const compareAcademicApplicability = (
  first: AcademicApplicableRule & { classId?: string },
  second: AcademicApplicableRule & { classId?: string }
) => getAcademicApplicabilityScore(second) - getAcademicApplicabilityScore(first);

const selectedTargetsOverlap = (
  firstMode: AcademicApplicabilityMode,
  firstIds: string[],
  secondMode: AcademicApplicabilityMode,
  secondIds: string[]
) =>
  firstMode === 'all' ||
  secondMode === 'all' ||
  (firstMode === 'selected' &&
    secondMode === 'selected' &&
    firstIds.some((id) => secondIds.includes(id)));

export const academicTargetsOverlap = (
  first: AcademicApplicableRule & { classId?: string },
  second: AcademicApplicableRule & { classId?: string }
) => {
  const firstStandard = getStandardApplicability(first);
  const secondStandard = getStandardApplicability(second);
  return (
    selectedTargetsOverlap(first.boardMode, first.boardIds, second.boardMode, second.boardIds) &&
    selectedTargetsOverlap(
      first.mediumMode,
      first.academicMediumIds,
      second.mediumMode,
      second.academicMediumIds
    ) &&
    selectedTargetsOverlap(
      first.stageMode,
      first.academicMediumStageIds,
      second.stageMode,
      second.academicMediumStageIds
    ) &&
    selectedTargetsOverlap(
      firstStandard.classMode,
      firstStandard.standardIds,
      secondStandard.classMode,
      secondStandard.standardIds
    ) &&
    selectedTargetsOverlap(
      first.divisionMode,
      first.divisionIds,
      second.divisionMode,
      second.divisionIds
    )
  );
};

export const getAcademicApplicabilityValidationError = (configuration: AcademicApplicableRule) => {
  const requirements: Array<[AcademicApplicabilityMode, string[], string]> = [
    [configuration.boardMode, configuration.boardIds, 'Board'],
    [configuration.mediumMode, configuration.academicMediumIds, 'Medium'],
    [configuration.stageMode, configuration.academicMediumStageIds, 'School Level'],
    [configuration.classMode, configuration.standardIds, 'Class'],
    [configuration.divisionMode, configuration.divisionIds, 'Division'],
  ];
  const missing = requirements.find(([mode, ids]) => mode === 'selected' && ids.length === 0);
  return missing ? `Select at least one ${missing[2]}.` : null;
};

export const isGrConfigurationApplicable = (
  configuration: GrNumberConfiguration,
  profileId?: string,
  effectiveDate = new Date().toISOString().slice(0, 10),
  context: AcademicPathContext = {}
) =>
  configuration.isActive &&
  (!configuration.effectiveFrom || configuration.effectiveFrom <= effectiveDate) &&
  isAcademicApplicabilityMatch(configuration, context) &&
  Boolean(profileId && configuration.applicableProfileIds.includes(profileId));

export const findRollNumberConfiguration = (
  configurations: RollNumberConfiguration[],
  context: AcademicPathContext = {},
  effectiveDate = new Date().toISOString().slice(0, 10)
) =>
  [...configurations]
    .filter(
      (configuration) =>
        configuration.isActive &&
        (!configuration.effectiveFrom || configuration.effectiveFrom <= effectiveDate) &&
        isAcademicApplicabilityMatch(configuration, context)
    )
    .sort(compareAcademicApplicability)[0] ?? defaultRollNumberConfiguration;

export const findDivisionChangeConfiguration = (
  configurations: DivisionChangeConfiguration[],
  context: AcademicPathContext = {},
  effectiveDate = new Date().toISOString().slice(0, 10)
) =>
  [...configurations]
    .filter(
      (configuration) =>
        configuration.isActive &&
        (!configuration.effectiveDate || configuration.effectiveDate <= effectiveDate) &&
        isAcademicApplicabilityMatch(configuration, context)
    )
    .sort(compareAcademicApplicability)[0] ?? defaultDivisionChangeConfiguration;

export const getDivisionAssignmentMode = (
  configurations: DivisionChangeConfiguration[]
): AssignmentModePolicy => {
  const modes = new Set(
    configurations.filter((item) => item.isActive).map((item) => item.assignmentMode)
  );
  if (modes.size !== 1) return 'both';
  return modes.values().next().value ?? 'both';
};

export const getDefaultAssignmentMode = (policy: AssignmentModePolicy) =>
  policy === 'manual' ? 'manual' : 'automatic';

export const isAssignmentModeAllowed = (
  policy: AssignmentModePolicy,
  mode: Exclude<AssignmentModePolicy, 'both'>
) => policy === 'both' || policy === mode;

export const findOnboardingProfile = (
  profiles: OnboardingProfile[],
  admissionRoute: string,
  context: AcademicPathContext = {}
) =>
  profiles
    .filter(
      (profile) =>
        profile.admissionRoutes.includes(admissionRoute) &&
        isAcademicApplicabilityMatch(profile.applicability, context)
    )
    .sort((first, second) =>
      compareAcademicApplicability(first.applicability, second.applicability)
    )[0];

export const getEffectiveReadinessRules = (
  settings: OnboardingSettingsConfiguration,
  admissionRoute: string,
  context: AcademicPathContext = {}
) =>
  findOnboardingProfile(settings.onboardingProfiles, admissionRoute, context)?.rules ??
  settings.readinessAccess;

export const isApprovalTriggerRequired = (
  rules: ReadinessAccessRules,
  trigger: ConditionalApprovalTrigger
) =>
  rules.approvalMode === 'always' ||
  (rules.approvalMode === 'conditional' && rules.approvalTriggers.includes(trigger));

export const isStudentApprovalRequired = (rules: ReadinessAccessRules, admissionRoute: string) => {
  if (rules.approvalMode === 'always') return true;
  return (
    admissionRoute === 'Mid-year admission' &&
    isApprovalTriggerRequired(rules, 'mid-year-admission')
  );
};
