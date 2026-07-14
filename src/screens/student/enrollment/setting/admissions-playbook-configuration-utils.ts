import type {
  AdmissionCrmSlotTemplateDto,
  AdmissionCrmPlaybookUpsertDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import {
  AdmissionInquiryStage,
  AdmissionCrmRegistrationPath,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

const normalizeTime = (value: string) => (value.length === 5 ? `${value}:00` : value);

const normalizeSlotTemplate = (
  template: AdmissionCrmSlotTemplateDto
): AdmissionCrmSlotTemplateDto => ({
  ...template,
  code: template.code.trim(),
  name: template.name.trim(),
  examDefinitionCode: template.examDefinitionCode.trim(),
  campus: template.campus?.trim() || null,
  roomOrHall: template.roomOrHall?.trim() || null,
  reportingTime: normalizeTime(template.reportingTime),
  startTime: normalizeTime(template.startTime),
  endTime: normalizeTime(template.endTime),
  blackoutDates: template.blackoutDates.filter(Boolean),
});

export const createDefaultAdmissionPlaybook = (): AdmissionCrmPlaybookUpsertDto => ({
  name: '',
  isFallback: false,
  registrationPath: AdmissionCrmRegistrationPath.RegistrationAfterExam,
  applicability: {},
  stages: [
    {
      code: 'EXAM_READY',
      displayName: 'Exam ready',
      reportingMilestone: AdmissionInquiryStage.ExamReady,
      order: 10,
      isRequired: true,
      isParentVisible: true,
      slaHours: 24,
      allowedNextStageCodes: ['EXAM_SCHEDULED'],
    },
    {
      code: 'EXAM_SCHEDULED',
      displayName: 'Exam scheduled',
      reportingMilestone: AdmissionInquiryStage.ExamScheduled,
      order: 20,
      isRequired: true,
      isParentVisible: true,
      slaHours: 48,
      allowedNextStageCodes: ['EXAM_COMPLETED'],
    },
    {
      code: 'EXAM_COMPLETED',
      displayName: 'Exam completed',
      reportingMilestone: AdmissionInquiryStage.ExamCompleted,
      order: 30,
      isRequired: true,
      isParentVisible: true,
      slaHours: 48,
      allowedNextStageCodes: ['ADMISSION_READY'],
    },
    {
      code: 'ADMISSION_READY',
      displayName: 'Admission ready',
      reportingMilestone: AdmissionInquiryStage.Eligible,
      order: 40,
      isRequired: true,
      isParentVisible: true,
      slaHours: null,
      allowedNextStageCodes: [],
    },
  ],
  rounds: [],
  seatPlans: [],
  examDefinitions: [],
  slotTemplates: [],
  assignmentRules: [],
  notes: '',
});

export const prepareAdmissionPlaybookPayload = (
  form: AdmissionCrmPlaybookUpsertDto
): AdmissionCrmPlaybookUpsertDto => ({
  ...form,
  name: form.name.trim(),
  applicability: Object.fromEntries(
    Object.entries(form.applicability).map(([key, value]) => [key, value?.trim() || null])
  ),
  stages: form.stages.map((stage) => ({
    ...stage,
    code: stage.code.trim(),
    displayName: stage.displayName.trim(),
    allowedNextStageCodes: stage.allowedNextStageCodes.map((code) => code.trim()).filter(Boolean),
  })),
  rounds: form.rounds.map((round) => ({
    ...round,
    code: round.code.trim(),
    name: round.name.trim(),
  })),
  seatPlans: form.seatPlans.map((plan) => ({
    ...plan,
    code: plan.code.trim(),
    roundCode: plan.roundCode?.trim() || null,
    campus: plan.campus?.trim() || null,
    desiredClass: plan.desiredClass?.trim() || null,
    board: plan.board?.trim() || null,
    medium: plan.medium?.trim() || null,
    applicantCategory: plan.applicantCategory?.trim() || null,
  })),
  examDefinitions: form.examDefinitions.map((exam) => ({
    ...exam,
    code: exam.code.trim(),
    name: exam.name.trim(),
    roundCode: exam.roundCode?.trim() || null,
    campus: exam.campus?.trim() || null,
    desiredClass: exam.desiredClass?.trim() || null,
    board: exam.board?.trim() || null,
    medium: exam.medium?.trim() || null,
    instructions: exam.instructions?.trim() || null,
    components: exam.components.map((component) => ({
      ...component,
      code: component.code.trim(),
      name: component.name.trim(),
    })),
    resultRule: {
      ...exam.resultRule,
      tieBreakerCodes: exam.resultRule.tieBreakerCodes.map((code) => code.trim()).filter(Boolean),
    },
  })),
  slotTemplates: form.slotTemplates.map(normalizeSlotTemplate),
  assignmentRules: form.assignmentRules.map((rule) => ({
    ...rule,
    code: rule.code.trim(),
    name: rule.name.trim(),
    trigger: rule.trigger.trim(),
    slotTemplateCode: rule.slotTemplateCode?.trim() || null,
  })),
  notes: form.notes?.trim() || null,
});

export type AdmissionPlaybookEditorStep = 0 | 1 | 2 | 3 | 4;

export const validateAdmissionPlaybookStep = (
  form: AdmissionCrmPlaybookUpsertDto,
  step: AdmissionPlaybookEditorStep
): string[] => {
  const errors: string[] = [];

  if (step === 0) {
    if (!form.name.trim()) errors.push('Playbook name is required.');
    const scopeValues = Object.values(form.applicability).filter((value) => value?.trim());
    if (form.isFallback && scopeValues.length) {
      errors.push('A fallback playbook cannot have applicability filters.');
    }
    if (!form.isFallback && !scopeValues.length) {
      errors.push('Add at least one applicability filter or mark the playbook as fallback.');
    }
  }

  if (step === 1) {
    if (!form.stages.length) errors.push('At least one stage is required.');
    const stageCodes = form.stages.map((stage) => stage.code.trim().toLowerCase());
    if (new Set(stageCodes).size !== stageCodes.length) errors.push('Stage codes must be unique.');
  }

  if (step === 3) {
    form.examDefinitions.forEach((exam) => {
      const weight = exam.components.reduce(
        (total, component) => total + Number(component.weightPercentage || 0),
        0
      );
      if (exam.components.length && weight !== 100) {
        errors.push(`${exam.name || exam.code || 'Exam'} component weights must total 100%.`);
      }
    });
  }

  if (step === 4) {
    form.slotTemplates.forEach((slot) => {
      if (slot.reportingTime > slot.startTime || slot.startTime >= slot.endTime) {
        errors.push(`${slot.name || slot.code || 'Slot'} has an invalid time sequence.`);
      }
    });
  }

  return errors;
};

export const findAdmissionPlaybookValidationIssue = (form: AdmissionCrmPlaybookUpsertDto) => {
  const steps: AdmissionPlaybookEditorStep[] = [0, 1, 2, 3, 4];
  return steps
    .map((step) => ({ step, message: validateAdmissionPlaybookStep(form, step)[0] }))
    .find((issue): issue is { step: AdmissionPlaybookEditorStep; message: string } =>
      Boolean(issue.message)
    );
};

export const validateAdmissionPlaybook = (form: AdmissionCrmPlaybookUpsertDto): string[] =>
  ([0, 1, 2, 3, 4] as AdmissionPlaybookEditorStep[]).flatMap((step) =>
    validateAdmissionPlaybookStep(form, step)
  );
