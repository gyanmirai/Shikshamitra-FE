import { it, expect, describe } from 'vitest';
import { DEFAULT_FORM_STAGE_POLICY } from 'src/redux/student/admissions/admission-form-stage-policy';

import {
  WORKFLOW_TEMPLATE_IDS,
  ADMISSION_WORKFLOW_TEMPLATES,
  getAdmissionWorkflowTemplate,
  getRegistrationWorkflowTemplate,
} from './workflow-template';

describe('admissions workflow templates', () => {
  it('offers school-ready starting points for simple through selective admissions', () => {
    expect(WORKFLOW_TEMPLATE_IDS).toEqual(['standard', 'simple', 'assessment', 'selective']);
    expect(ADMISSION_WORKFLOW_TEMPLATES.map((template) => template.name)).toEqual([
      'Standard admission',
      'Simple direct admission',
      'Assessment-based admission',
      'Selective admission with offer',
    ]);
    expect(ADMISSION_WORKFLOW_TEMPLATES.filter((template) => template.recommended)).toHaveLength(1);
  });

  it.each(WORKFLOW_TEMPLATE_IDS)(
    'creates an editable, sequential, runtime-supported %s journey',
    (templateId) => {
      const template = getAdmissionWorkflowTemplate(templateId, 'form-1');
      const stageIndex = new Map(template.stages.map((stage, index) => [stage.id, index]));

      expect(template.stages[0].isEntryStage).toBe(true);
      expect(template.stages.at(-1)?.isTerminalStage).toBe(true);
      expect(template.stages.filter((stage) => stage.isEntryStage)).toHaveLength(1);
      expect(template.stages.filter((stage) => stage.isTerminalStage)).toHaveLength(1);
      expect(template.stages.every((stage) => ![9, 10, 11, 12].includes(stage.stageType))).toBe(
        true
      );
      expect(new Set(template.stages.map((stage) => stage.id)).size).toBe(template.stages.length);
      expect(template.transitions).toHaveLength(template.stages.length - 1);
      expect(
        template.transitions.map((item) => [
          stageIndex.get(item.fromStageId),
          stageIndex.get(item.toStageId),
        ])
      ).toEqual(template.stages.slice(0, -1).map((_stage, index) => [index, index + 1]));
      expect(template.transitions.every((item) => item.isDefault)).toBe(true);
    }
  );

  it('attaches the selected published form to every template application stage', () => {
    WORKFLOW_TEMPLATE_IDS.forEach((templateId) => {
      const template = getAdmissionWorkflowTemplate(templateId, 'form-1');
      const applicationForm = template.stages.find((stage) => stage.stageType === 1);

      expect(JSON.parse(applicationForm?.configurationJson ?? '')).toEqual({
        formDefinitionId: 'form-1',
        form: { ...DEFAULT_FORM_STAGE_POLICY, enabled: false },
      });
    });
  });

  it('keeps the existing standard-template helper compatible', () => {
    const template = getRegistrationWorkflowTemplate('form-1');

    expect(template.stages.map((stage) => stage.code)).toEqual([
      'BASIC_INQUIRY',
      'APPLICATION_FORM',
      'DOCUMENT_VERIFICATION',
      'APPLICATION_REVIEW',
      'ADMISSION_DECISION',
    ]);
  });
});
