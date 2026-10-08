import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageType,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { ensureAdmissionFormStageConfiguration } from 'src/redux/student/admissions/admission-form-stage-policy';

export const WORKFLOW_TEMPLATE_IDS = ['standard', 'simple', 'assessment', 'selective'] as const;

export type WorkflowTemplateId = (typeof WORKFLOW_TEMPLATE_IDS)[number];
export type WorkflowStarterId = WorkflowTemplateId | 'empty';

export type WorkflowTemplateStageDefinition = {
  code: string;
  name: string;
  stageType: AdmissionWorkflowStageType;
  description: string;
};

export type AdmissionWorkflowTemplateDefinition = {
  id: WorkflowTemplateId;
  name: string;
  description: string;
  bestFor: string;
  icon: string;
  recommended?: boolean;
  stages: readonly WorkflowTemplateStageDefinition[];
};

type WorkflowTemplate = {
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
};

export const ADMISSION_WORKFLOW_TEMPLATES: readonly AdmissionWorkflowTemplateDefinition[] = [
  {
    id: 'standard',
    name: 'Standard admission',

    icon: 'mdi:school-outline',
    recommended: true,
    stages: [
      {
        code: 'APPLICATION_FORM',
        name: 'Application form submitted',
        stageType: 1,
        description: 'Collect and submit the school-defined applicant and guardian information.',
      },
      {
        code: 'DOCUMENT_VERIFICATION',
        name: 'Documents verified',
        stageType: 5,
        description: 'Collect and verify only the documents required by the school.',
      },
      {
        code: 'APPLICATION_REVIEW',
        name: 'Application reviewed',
        stageType: 6,
        description: 'Review the application, evidence, and staff recommendation.',
      },
      {
        code: 'ADMISSION_DECISION',
        name: 'Admission decision recorded',
        stageType: 7,
        description: 'Approve, waitlist, or reject the application and close the journey.',
      },
    ],
    description: '',
    bestFor: ''
  },
  {
    id: 'simple',
    name: 'Simple admission',


    icon: 'mdi:lightning-bolt-outline',
    stages: [
      {
        code: 'APPLICATION_FORM',
        name: 'Application form submitted',
        stageType: 1,
        description: 'Collect the applicant and guardian information required by the school.',
      },
      {
        code: 'DOCUMENT_VERIFICATION',
        name: 'Documents verified',
        stageType: 5,
        description: 'Check the required identity, age, transfer, and supporting documents.',
      },
      {
        code: 'ADMISSION_DECISION',
        name: 'Admission decision recorded',
        stageType: 7,
        description: 'Approve, waitlist, or reject the application and close the journey.',
      },
    ],
    description: '',
    bestFor: ''
  },
  {
    id: 'assessment',
    name: 'Assessment-based admission',
    bestFor: 'Schools using entrance tests, interactions, interviews, or merit screening',
    icon: 'mdi:clipboard-text-outline',
    stages: [
      {
        code: 'APPLICATION_FORM',
        name: 'Application form submitted',
        stageType: 1,
        description: 'Collect and submit the school-defined applicant and guardian information.',
      },
      {
        code: 'ELIGIBILITY_CHECK',
        name: 'Eligibility checked',
        stageType: 3,
        description: 'Evaluate age, prior study, residency, or other configured admission rules.',
      },
      {
        code: 'ENTRANCE_ASSESSMENT',
        name: 'Entrance assessment completed',
        stageType: 2,
        description: 'Schedule and record the configured test, interaction, or interview outcome.',
      },
      {
        code: 'DOCUMENT_VERIFICATION',
        name: 'Documents verified',
        stageType: 5,
        description: 'Collect and verify only the documents required by the school.',
      },
      {
        code: 'APPLICATION_REVIEW',
        name: 'Application reviewed',
        stageType: 6,
        description: 'Review the application, evidence, assessment, and staff recommendation.',
      },
      {
        code: 'ADMISSION_DECISION',
        name: 'Admission decision recorded',
        stageType: 7,
        description: 'Approve, waitlist, or reject the application and close the journey.',
      },
    ],
    description: '',
  },
  {
    id: 'selective',
    name: 'Selective admission with offer',

    bestFor: 'Large, private, residential, or highly selective schools',
    icon: 'mdi:email-seal-outline',
    stages: [
      {
        code: 'APPLICATION_FORM',
        name: 'Application form submitted',
        stageType: 1,
        description: 'Collect and submit the school-defined applicant and guardian information.',
      },
      {
        code: 'APPLICATION_FEE',
        name: 'Application fee verified',
        stageType: 4,
        description: 'Collect, verify, or formally waive the configured application fee.',
      },
      {
        code: 'ELIGIBILITY_CHECK',
        name: 'Eligibility checked',
        stageType: 3,
        description: 'Evaluate age, prior study, residency, or other configured admission rules.',
      },
      {
        code: 'ENTRANCE_ASSESSMENT',
        name: 'Entrance assessment completed',
        stageType: 2,
        description: 'Schedule and record the configured test, interaction, or interview outcome.',
      },
      {
        code: 'DOCUMENT_VERIFICATION',
        name: 'Documents verified',
        stageType: 5,
        description: 'Collect and verify only the documents required by the school.',
      },
      {
        code: 'APPLICATION_REVIEW',
        name: 'Application reviewed',
        stageType: 6,
        description: 'Review the complete application and record the staff recommendation.',
      },
      {
        code: 'ADMISSION_DECISION',
        name: 'Admission decision recorded',
        stageType: 7,
        description: 'Authorize an approval, waitlist, or rejection decision.',
      },
      {
        code: 'ADMISSION_OFFER',
        name: 'Admission offer completed',
        stageType: 8,
        description: 'Issue the approved offer and record the family response.',
      },
    ],
    description: '',
  },
] as const;

export const STANDARD_ADMISSION_JOURNEY = ADMISSION_WORKFLOW_TEMPLATES[0].stages;

export const EMPTY_WORKFLOW_STARTER = {
  id: 'empty',
  name: 'Blank workflow',
  bestFor: 'Schools with a fully custom process',
  icon: 'mdi:pencil-outline',
  stages: [],
  description: '',
} as const;

export const ADMISSION_WORKFLOW_STARTERS = [
  ...ADMISSION_WORKFLOW_TEMPLATES,
  EMPTY_WORKFLOW_STARTER,
] as const;

export const isWorkflowTemplateId = (value: unknown): value is WorkflowTemplateId =>
  typeof value === 'string' && WORKFLOW_TEMPLATE_IDS.includes(value as WorkflowTemplateId);

export const getWorkflowTemplateDefinition = (id: unknown) =>
  isWorkflowTemplateId(id)
    ? ADMISSION_WORKFLOW_TEMPLATES.find((template) => template.id === id)
    : undefined;

export const getWorkflowStarterDefinition = (id: unknown) =>
  ADMISSION_WORKFLOW_STARTERS.find((template) => template.id === id);

export function findMatchingWorkflowTemplate(
  stages: AdmissionWorkflowStage[]
): WorkflowTemplateId | undefined {
  const orderedStages = [...stages].sort((left, right) => left.displayOrder - right.displayOrder);
  return ADMISSION_WORKFLOW_TEMPLATES.find(
    (template) =>
      template.stages.length === orderedStages.length &&
      template.stages.every(
        (stage, index) =>
          stage.code === orderedStages[index].code &&
          stage.stageType === orderedStages[index].stageType
      )
  )?.id;
}

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
  priority: number
): AdmissionWorkflowTransition => ({
  id: crypto.randomUUID(),
  fromStageId,
  toStageId,
  priority,
  isDefault: true,
});

export function getAdmissionWorkflowTemplate(
  templateId: WorkflowTemplateId,
  formDefinitionId?: string
): WorkflowTemplate {
  const definition = getWorkflowTemplateDefinition(templateId) ?? ADMISSION_WORKFLOW_TEMPLATES[0];
  const formConfiguration = formDefinitionId
    ? ensureAdmissionFormStageConfiguration(JSON.stringify({ formDefinitionId }))
    : undefined;
  const stages = definition.stages.map((item, index) =>
    stage(item.code, item.name, item.stageType, index, {
      description: item.description,
      isEntryStage: index === 0,
      isTerminalStage: index === definition.stages.length - 1,
      configurationJson: item.stageType === 1 ? formConfiguration : undefined,
    })
  );

  return {
    stages,
    transitions: stages
      .slice(0, -1)
      .map((item, index) => transition(item.id, stages[index + 1].id, 0)),
  };
}

export function getRegistrationWorkflowTemplate(formDefinitionId?: string): WorkflowTemplate {
  return getAdmissionWorkflowTemplate('standard', formDefinitionId);
}
