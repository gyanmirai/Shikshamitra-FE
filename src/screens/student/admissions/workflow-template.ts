import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

type WorkflowTemplate = {
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
};

const stage = (
  code: string,
  name: string,
  stageType: AdmissionWorkflowStage['stageType'],
  displayOrder: number,
  options: Partial<AdmissionWorkflowStage> = {}
): AdmissionWorkflowStage => ({
  id: crypto.randomUUID(),
  code,
  name,
  stageType,
  displayOrder,
  description: undefined,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: false,
  isTerminalStage: false,
  ...options,
});

const transition = (
  fromStageId: string,
  toStageId: string,
  priority: number,
  options: Partial<AdmissionWorkflowTransition> = {}
): AdmissionWorkflowTransition => ({
  id: crypto.randomUUID(),
  fromStageId,
  toStageId,
  priority,
  isDefault: true,
  ...options,
});

export function getRegistrationWorkflowTemplate(formDefinitionId?: string): WorkflowTemplate {
  const formConfiguration = formDefinitionId ? JSON.stringify({ formDefinitionId }) : undefined;
  const stages = [
    stage('INQUIRY', 'Inquiry', 0, 0, { isEntryStage: true }),
    stage('REGISTRATION_FORM_INITIAL', 'Registration form', 1, 1, {
      configurationJson: formConfiguration,
      description: 'Collect the student registration details before the entrance exam.',
    }),
    stage('REGISTRATION_FEE', 'Registration fee', 4, 2, {
      configurationJson: JSON.stringify({ paymentPurpose: 'registration_fee', required: true }),
    }),
    stage('ENTRANCE_EXAM', 'Entrance exam', 2, 3, {
      configurationJson: JSON.stringify({ scoreField: 'assessment.score', maximumScore: 100 }),
    }),
    stage('ELIGIBILITY', 'Eligibility', 3, 4, {
      configurationJson: JSON.stringify({ rule: 'assessment.score >= 90' }),
    }),
    stage('REGISTRATION_FORM_FINAL', 'Registration form', 1, 5, {
      configurationJson: formConfiguration,
      description: 'Collect the remaining registration details from the eligible applicant.',
    }),
    stage('DOCUMENT_VERIFICATION', 'Document verification', 5, 6),
    stage('THREE_MONTH_FEES', 'First three months fees', 4, 7, {
      configurationJson: JSON.stringify({
        paymentPurpose: 'first_three_months_fees',
        required: true,
      }),
    }),
    stage('ADMISSION_DONE', 'Admission done', 10, 8, {
      isTerminalStage: true,
      description: 'Admission is completed after the first three months fees are paid.',
    }),
    stage('NOT_ELIGIBLE', 'Not eligible', 11, 9, {
      isTerminalStage: true,
      isRequired: false,
      description: 'The entrance exam score is below the 90% eligibility threshold.',
    }),
  ];

  const byCode = (code: string) => stages.find((item) => item.code === code)!.id;
  const defaultTransition = (from: string, to: string, priority: number) =>
    transition(byCode(from), byCode(to), priority);

  return {
    stages,
    transitions: [
      defaultTransition('INQUIRY', 'REGISTRATION_FORM_INITIAL', 0),
      defaultTransition('REGISTRATION_FORM_INITIAL', 'REGISTRATION_FEE', 0),
      transition(byCode('REGISTRATION_FEE'), byCode('ENTRANCE_EXAM'), 0, {
        isDefault: false,
        conditionRuleJson: JSON.stringify({
          field: 'payment.registration_fee_status',
          operator: 'Equals',
          value: 'Paid',
        }),
      }),
      transition(byCode('ENTRANCE_EXAM'), byCode('ELIGIBILITY'), 0, {
        isDefault: false,
        conditionRuleJson: JSON.stringify({
          field: 'assessment.score',
          operator: 'GreaterThanOrEqual',
          value: '90',
        }),
      }),
      transition(byCode('ENTRANCE_EXAM'), byCode('NOT_ELIGIBLE'), 1, {
        isDefault: false,
        conditionRuleJson: JSON.stringify({
          field: 'assessment.score',
          operator: 'LessThan',
          value: '90',
        }),
      }),
      defaultTransition('ELIGIBILITY', 'REGISTRATION_FORM_FINAL', 0),
      defaultTransition('REGISTRATION_FORM_FINAL', 'DOCUMENT_VERIFICATION', 0),
      defaultTransition('DOCUMENT_VERIFICATION', 'THREE_MONTH_FEES', 0),
      transition(byCode('THREE_MONTH_FEES'), byCode('ADMISSION_DONE'), 0, {
        isDefault: false,
        conditionRuleJson: JSON.stringify({
          field: 'payment.first_three_months_fees_status',
          operator: 'Equals',
          value: 'Paid',
        }),
      }),
    ],
  };
}
