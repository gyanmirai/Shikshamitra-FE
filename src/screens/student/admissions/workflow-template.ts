import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

type WorkflowTemplate = {
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
};

export const STANDARD_ADMISSION_JOURNEY = [
  {
    code: 'BASIC_INQUIRY',
    name: 'Basic inquiry received',
    stageType: 0,
    description: 'Capture the learner and guardian contact details and confirm their interest.',
  },
  {
    code: 'PHYSICAL_FORM_ISSUED',
    name: 'Physical registration form issued',
    stageType: 11,
    description: 'Record whether the printed registration form was issued to the parent.',
  },
  {
    code: 'ENTRANCE_EXAM_PASSED',
    name: 'Entrance exam scheduled and passed',
    stageType: 2,
    description: 'Schedule the entrance exam and continue only after the learner passes.',
  },
  {
    code: 'DETAILED_REGISTRATION',
    name: 'Detailed registration completed',
    stageType: 1,
    description: 'Collect and submit the complete five-step student registration form.',
  },
  {
    code: 'VERIFY_APPROVE_ADMISSION',
    name: 'Verify and approve admission',
    stageType: 7,
    description: 'Verify the submitted record, approve the application, and close the journey.',
  },
] as const;

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
  const stages = STANDARD_ADMISSION_JOURNEY.map((item, index) =>
    stage(item.code, item.name, item.stageType, index, {
      description: item.description,
      isEntryStage: index === 0,
      isTerminalStage: index === STANDARD_ADMISSION_JOURNEY.length - 1,
      configurationJson: item.code === 'DETAILED_REGISTRATION' ? formConfiguration : undefined,
    })
  );

  const byCode = (code: string) => stages.find((item) => item.code === code)!.id;
  const defaultTransition = (from: string, to: string, priority: number) =>
    transition(byCode(from), byCode(to), priority);

  return {
    stages,
    transitions: [
      defaultTransition('BASIC_INQUIRY', 'PHYSICAL_FORM_ISSUED', 0),
      defaultTransition('PHYSICAL_FORM_ISSUED', 'ENTRANCE_EXAM_PASSED', 0),
      defaultTransition('ENTRANCE_EXAM_PASSED', 'DETAILED_REGISTRATION', 0),
      defaultTransition('DETAILED_REGISTRATION', 'VERIFY_APPROVE_ADMISSION', 0),
    ],
  };
}
