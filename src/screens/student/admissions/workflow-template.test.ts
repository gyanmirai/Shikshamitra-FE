import { it, expect, describe } from 'vitest';
import { DEFAULT_FORM_STAGE_POLICY } from 'src/redux/student/admissions/admission-form-stage-policy';

import { getRegistrationWorkflowTemplate } from './workflow-template';

describe('standard admissions workflow template', () => {
  it('creates the five-stage inquiry-to-approval journey in order', () => {
    const template = getRegistrationWorkflowTemplate('form-1');

    expect(template.stages.map((stage) => stage.code)).toEqual([
      'BASIC_INQUIRY',
      'PHYSICAL_FORM_ISSUED',
      'ENTRANCE_EXAM_PASSED',
      'DETAILED_REGISTRATION',
      'VERIFY_APPROVE_ADMISSION',
    ]);
    expect(template.stages.map((stage) => stage.stageType)).toEqual([0, 11, 2, 1, 7]);
    expect(template.stages[0].isEntryStage).toBe(true);
    expect(template.stages.at(-1)?.isTerminalStage).toBe(true);
  });

  it('attaches the selected detailed form and connects every stage sequentially', () => {
    const template = getRegistrationWorkflowTemplate('form-1');
    const detailedRegistration = template.stages.find(
      (stage) => stage.code === 'DETAILED_REGISTRATION'
    );
    const stageIndex = new Map(template.stages.map((stage, index) => [stage.id, index]));

    expect(JSON.parse(detailedRegistration?.configurationJson ?? '')).toEqual({
      formDefinitionId: 'form-1',
      form: { ...DEFAULT_FORM_STAGE_POLICY, enabled: false },
    });
    expect(template.transitions).toHaveLength(4);
    expect(
      template.transitions.map((item) => [
        stageIndex.get(item.fromStageId),
        stageIndex.get(item.toStageId),
      ])
    ).toEqual([
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ]);
    expect(template.transitions.every((item) => item.isDefault)).toBe(true);
  });
});
