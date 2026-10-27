import type {
  StudentOnboardingCase,
  StudentIdentifierSeries,
  StudentOnboardingSettingsRecord,
} from 'src/redux/student/onboarding/student-onboarding-types';

import { mapOnboardingCaseToItem } from './student-onboarding-model';
import { getOnboardingMessage } from './student-onboarding-messages';
import { getStudentSetupAssignmentEligibility } from './student-setup-assignment-model';

import type { AssignmentModePolicy } from '../onboarding-settings-model';
import type { StudentSetupAssignmentServices } from './student-setup-assignment-model';

export type QuickAcademicMode = 'automatic' | 'manual' | '';
export type QuickAcademicValues = {
  divisionId: string;
  divisionReason: string;
  numberSeriesId: string;
  grMode: QuickAcademicMode;
  grValue: string;
  grReason: string;
  rollMode: QuickAcademicMode;
  rollValue: string;
  rollReason: string;
};
export type QuickAcademicField = 'division' | 'gr' | 'roll';

/** Never convert an absent or malformed school configuration into permission to auto-assign. */
export function readQuickGrMode(
  records: StudentOnboardingSettingsRecord[] | undefined,
  academicYearId: string
): AssignmentModePolicy | undefined {
  const record =
    records?.find((item) => item.academicYearId === academicYearId) ??
    records?.find((item) => !item.academicYearId);
  if (!record || record.schemaVersion !== 1) return undefined;
  try {
    const mode = JSON.parse(record.configurationJson)?.grNumber?.assignmentMode;
    return ['automatic', 'manual', 'both'].includes(mode) ? mode : undefined;
  } catch {
    return undefined;
  }
}

export function quickAcademicInitialValues(
  item: StudentOnboardingCase,
  grPolicy?: AssignmentModePolicy
): QuickAcademicValues {
  return {
    divisionId: item.divisionId ?? '',
    divisionReason: '',
    numberSeriesId: '',
    grMode: item.grNumber
      ? 'manual'
      : item.grNumberLocked
        ? 'automatic'
        : grPolicy === 'manual'
          ? 'manual'
          : grPolicy
            ? 'automatic'
            : '',
    grValue: item.grNumber ?? '',
    grReason: '',
    rollMode: item.rollNumber
      ? 'manual'
      : item.rollNumberLocked
        ? 'automatic'
        : item.rollAssignmentMode === 'manual'
          ? 'manual'
          : item.rollAssignmentMode
            ? 'automatic'
            : '',
    rollValue: item.rollNumber ? String(item.rollNumber) : '',
    rollReason: '',
  };
}

export const quickAcademicSeries = (
  series: StudentIdentifierSeries[],
  item: StudentOnboardingCase
) =>
  series.filter(
    (candidate) =>
      candidate.identifierType === 0 &&
      candidate.isActive &&
      candidate.academicYearId === item.academicYearId &&
      (!candidate.standardId || candidate.standardId === item.intendedStandardId) &&
      (candidate.maximumSequence == null || candidate.nextSequence <= candidate.maximumSequence)
  );

const checkCase = (current: StudentOnboardingCase, baseline: StudentOnboardingCase) => {
  if (
    current.id !== baseline.id ||
    current.academicYearId !== baseline.academicYearId ||
    current.intendedStandardId !== baseline.intendedStandardId ||
    current.intendedBoardId !== baseline.intendedBoardId ||
    current.intendedMediumId !== baseline.intendedMediumId ||
    current.intendedStageId !== baseline.intendedStageId
  )
    throw new Error('The academic context changed. Reopen this student before saving.');
  if (!current.concurrencyStamp) throw new Error('Reload this student before saving.');
};

/** The case is refreshed before every dependent command. Completed fields are acknowledged
 * immediately so a later failure can be retried without repeating a successful assignment. */
export async function saveQuickAcademic({
  baseline,
  values,
  grPolicy,
  services,
  onSaved,
}: {
  baseline: StudentOnboardingCase;
  values: QuickAcademicValues;
  grPolicy?: AssignmentModePolicy;
  services: StudentSetupAssignmentServices;
  onSaved: (field: QuickAcademicField, saved: StudentOnboardingCase) => void;
}): Promise<StudentOnboardingCase> {
  let current = await services.getCase(baseline.id);
  checkCase(current, baseline);
  const divisionChanged = Boolean(values.divisionId && values.divisionId !== baseline.divisionId);
  const grChanged =
    values.grMode === 'automatic'
      ? !baseline.grNumber
      : Boolean(values.grValue.trim() && values.grValue.trim() !== baseline.grNumber);
  let rollChanged =
    values.rollMode === 'automatic'
      ? !baseline.rollNumber
      : Boolean(values.rollValue.trim() && Number(values.rollValue) !== baseline.rollNumber);
  if (!divisionChanged && !grChanged && !rollChanged) return current;
  let expectedRoll = baseline.rollNumber ?? null;
  if (current.studentEnrollmentId || [4, 5, 6].includes(current.status))
    throw new Error('This student is no longer editable in Student Setup.');

  const refresh = async () => {
    current = await services.getCase(baseline.id);
    checkCase(current, baseline);
    return current;
  };
  if (divisionChanged) {
    if (current.divisionId !== baseline.divisionId && current.divisionId !== values.divisionId)
      throw new Error('Division changed in another session. Reopen this student and review it.');
    if (current.divisionId !== values.divisionId) {
      current = await services.setPlacement({
        id: current.id,
        concurrencyStamp: current.concurrencyStamp,
        divisionId: values.divisionId,
        reason: values.divisionReason.trim() || undefined,
      });
    }
    // A successful placement command clears an unlocked Roll number. This is our own
    // dependent change, not another user's identifier edit. Do not reuse its old status.
    expectedRoll = current.rollNumber ?? null;
    rollChanged =
      rollChanged ||
      (!current.rollNumber &&
        (values.rollMode === 'automatic' ||
          Boolean(values.rollMode === 'manual' && values.rollValue.trim())));
    onSaved('division', current);
  }

  if (grChanged) {
    await refresh();
    if (!['manual', 'automatic'].includes(values.grMode))
      throw new Error('Select Auto or Manual for the GR number.');
    const requested = values.grValue.trim();
    if (current.grNumber && (values.grMode === 'automatic' || current.grNumber === requested)) {
      onSaved('gr', current);
    } else {
      if ((current.grNumber ?? null) !== (baseline.grNumber ?? null))
        throw new Error('GR number changed in another session. Reopen this student and review it.');
      const permission = getStudentSetupAssignmentEligibility(
        mapOnboardingCaseToItem(current),
        'gr-number',
        values.grMode as 'manual' | 'automatic',
        grPolicy
      );
      if (!permission.eligible)
        throw new Error(getOnboardingMessage(permission.reason, 'Review the GR number settings.'));
      if (current.grNumber && !values.grReason.trim())
        throw new Error('Explain why this number needs to change.');
      const available = quickAcademicSeries(await services.getSeries(current.id), current);
      const series = values.numberSeriesId
        ? available.find((item) => item.id === values.numberSeriesId)
        : available.length === 1
          ? available[0]
          : undefined;
      if (!series)
        throw new Error(
          available.length
            ? 'Select the GR numbering rule.'
            : 'No GR numbering rule is available. Ask an administrator to check the settings.'
        );
      current = await services.assignGr({
        id: current.id,
        concurrencyStamp: current.concurrencyStamp,
        numberSeriesId: series.id,
        ...(values.grMode === 'manual' ? { manualValue: requested } : {}),
        reason: values.grReason.trim() || undefined,
      });
      onSaved('gr', current);
    }
  }

  if (rollChanged) {
    await refresh();
    if (!['manual', 'automatic'].includes(values.rollMode))
      throw new Error('Select Auto or Manual for the roll number.');
    const requested = Number(values.rollValue);
    if (
      current.rollNumber &&
      (values.rollMode === 'automatic' || current.rollNumber === requested)
    ) {
      onSaved('roll', current);
    } else {
      if ((current.rollNumber ?? null) !== expectedRoll)
        throw new Error(
          'Roll number changed in another session. Reopen this student and review it.'
        );
      if (!divisionChanged && current.divisionId !== baseline.divisionId)
        throw new Error('Division changed in another session. Review the Roll number again.');
      const permission = getStudentSetupAssignmentEligibility(
        mapOnboardingCaseToItem(current),
        'roll-number',
        values.rollMode as 'manual' | 'automatic'
      );
      if (!permission.eligible)
        throw new Error(
          getOnboardingMessage(permission.reason, 'Review the roll number settings.')
        );
      if (current.rollNumber && current.rollChangeReasonRequired && !values.rollReason.trim())
        throw new Error('Explain why this number needs to change.');
      // Placement must already be saved: proposals belong to the actual server-side division.
      const preview = await services.previewRoll({
        id: current.id,
        rollAssignmentMode: values.rollMode as 'manual' | 'automatic',
        ...(values.rollMode === 'manual' ? { rollNumber: requested } : {}),
        reason: values.rollReason.trim() || undefined,
      });
      if (
        !preview.concurrencyStamp ||
        preview.concurrencyStamp !== current.concurrencyStamp ||
        preview.rollAssignmentMode !== values.rollMode ||
        !Number.isInteger(preview.proposedRollNumber) ||
        preview.proposedRollNumber <= 0 ||
        (values.rollMode === 'manual' && preview.proposedRollNumber !== requested)
      )
        throw new Error('The Roll proposal changed. Review this student and retry.');
      current = await services.assignRoll({
        id: current.id,
        concurrencyStamp: preview.concurrencyStamp,
        rollNumber: preview.proposedRollNumber,
        rollAssignmentMode: preview.rollAssignmentMode,
        reason: values.rollReason.trim() || undefined,
      });
      onSaved('roll', current);
    }
  }
  return current;
}
