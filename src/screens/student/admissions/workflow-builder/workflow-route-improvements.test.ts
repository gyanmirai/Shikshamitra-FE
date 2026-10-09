import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { it, expect, describe } from 'vitest';

import { simulateWorkflowRoute } from './workflow-route-simulator';
import { conditionFormDetail } from './document-condition-test-fixture';
import { isValidRouteNumber, getRouteConditionFields } from './workflow-condition-catalog';
import {
  simpleRouteKey,
  getRouteSaveError,
  getSequentialAppendRoute,
} from './workflow-route-diagnostics';

const start: AdmissionWorkflowStage = {
  id: 'start',
  code: 'FORM',
  name: 'Application form',
  stageType: 1,
  displayOrder: 0,
  isEntryStage: true,
  isTerminalStage: false,
  isRequired: true,
  allowManualSkip: false,
  configurationJson: JSON.stringify({ formDefinitionId: conditionFormDetail.id }),
};
const assessment: AdmissionWorkflowStage = {
  ...start,
  id: 'assessment',
  code: 'ASSESSMENT',
  name: 'Assessment',
  stageType: 2,
  displayOrder: 1,
  isEntryStage: false,
  configurationJson: JSON.stringify({ assessment: { enabled: true, version: 1 } }),
};
const done: AdmissionWorkflowStage = {
  ...start,
  id: 'done',
  code: 'DONE',
  name: 'Done',
  stageType: 7,
  displayOrder: 2,
  isEntryStage: false,
  isTerminalStage: true,
  configurationJson: undefined,
};
const link: AdmissionWorkflowTransition = {
  id: 'route',
  fromStageId: start.id,
  toStageId: assessment.id,
  priority: 0,
  isDefault: true,
};
const completion: AdmissionWorkflowTransition = {
  ...link,
  id: 'completion',
  fromStageId: assessment.id,
  toStageId: done.id,
};
const rule = (value: string, operator = 'Equals') =>
  JSON.stringify({ field: 'assessment.outcome', operator, value });

describe('admission next-step safety and form fields', () => {
  it('accepts a list of numeric values only for list comparisons', () => {
    expect(isValidRouteNumber('40,50', 'Equals')).toBe(false);
    expect(isValidRouteNumber('40,50', 'In')).toBe(true);
    expect(isValidRouteNumber('40,', 'In')).toBe(false);
    expect(isValidRouteNumber('-2.5', 'GreaterThan')).toBe(true);
    expect(isValidRouteNumber('', 'GreaterThan')).toBe(false);
    expect(isValidRouteNumber('', 'IsEmpty')).toBe(true);
  });
  it('does not flatten array rules into scalar duplicate keys', () => {
    expect(
      simpleRouteKey(
        JSON.stringify({ field: 'application.CATEGORY', operator: 'In', value: ['a,b', 'c'] })
      )
    ).toBeUndefined();
    expect(
      simpleRouteKey(
        JSON.stringify({ field: 'application.CATEGORY', operator: 'In', value: ['a', 'b,c'] })
      )
    ).toBeUndefined();
  });
  it('rejects configuring routes from retired stages', () => {
    const offer: AdmissionWorkflowStage = { ...assessment, stageType: 8, isEntryStage: true };
    expect(getRouteSaveError(completion, [offer, done], [])).toMatch(/retired stage/);
    expect(simulateWorkflowRoute([offer, done], [completion], {}).status).toBe('blocked');
  });
  it('offers fields only from published ancestor forms and excludes display-only fields', () => {
    const fields = getRouteConditionFields(
      [conditionFormDetail],
      [start, assessment, done],
      [link],
      assessment.id
    );
    expect(fields.map((item) => item.value)).toEqual([
      'application.status',
      'application.PREVIOUS_SCHOOL',
    ]);
    expect(
      getRouteConditionFields([conditionFormDetail], [start, assessment], [], assessment.id).map(
        (item) => item.value
      )
    ).toEqual(['application.status']);
  });
  it('connects a new simple journey but never rewires existing stages, branches, or terminal stages', () => {
    expect(getSequentialAppendRoute([start], [], assessment)).toMatchObject({
      fromStageId: start.id,
      toStageId: assessment.id,
      isDefault: true,
    });
    expect(getSequentialAppendRoute([start, assessment], [link], done)).toMatchObject({
      fromStageId: assessment.id,
      toStageId: done.id,
    });
    expect(getSequentialAppendRoute([start, assessment], [link], assessment)).toBeUndefined();
    expect(
      getSequentialAppendRoute(
        [start, assessment],
        [{ ...link, isDefault: false, conditionRuleJson: rule('passed') }],
        done
      )
    ).toBeUndefined();
    expect(
      getSequentialAppendRoute([{ ...start, isTerminalStage: true }], [], assessment)
    ).toBeUndefined();
  });
  it('rejects the same condition leading to different destinations while retaining different comparisons', () => {
    const existing = {
      ...completion,
      id: 'existing',
      isDefault: false,
      conditionRuleJson: rule('failed'),
    };
    expect(
      getRouteSaveError(
        { ...existing, id: 'new', toStageId: start.id, conditionRuleJson: rule('FAILED') },
        [start, assessment, done],
        [existing]
      )
    ).toMatch(/already/);
    expect(
      getRouteSaveError(
        { ...existing, id: 'new', conditionRuleJson: rule('failed', 'NotEquals') },
        [start, assessment, done],
        [existing]
      )
    ).toBeUndefined();
  });
  it.each(['failed', 'absent', 'retake'])(
    'blocks assessment %s on the usual path but accepts its explicit outcome path',
    (outcome) => {
      expect(
        simulateWorkflowRoute(
          [assessment, done].map((item) => ({ ...item, isEntryStage: item.id === assessment.id })),
          [completion],
          { 'assessment.outcome': outcome }
        ).status
      ).toBe('blocked');
      const paths = [{ ...completion, isDefault: false, conditionRuleJson: rule(outcome) }];
      expect(
        simulateWorkflowRoute([{ ...assessment, isEntryStage: true }, done], paths, {
          'assessment.outcome': outcome,
        }).status
      ).toBe('completed');
    }
  );
  it('requires fee structure confirmation instead of settlement before continuing', () => {
    const payment: AdmissionWorkflowStage = {
      ...assessment,
      stageType: 4,
      isEntryStage: true,
      configurationJson: JSON.stringify({ payment: { enabled: true } }),
    };
    expect(
      simulateWorkflowRoute([payment, done], [completion], {
        'payment.status': 'pending',
      }).status
    ).toBe('blocked');
    expect(
      simulateWorkflowRoute([payment, done], [completion], {
        'payment.status': 'feeStructureConfirmed',
      }).status
    ).toBe('completed');
  });
  it('does not treat a blank number as zero in route tests', () => {
    const paths = [
      {
        ...completion,
        isDefault: false,
        conditionRuleJson: JSON.stringify({
          field: 'application.MARKS',
          operator: 'LessThan',
          value: '40',
        }),
      },
    ];
    expect(
      simulateWorkflowRoute([{ ...assessment, stageType: 7, isEntryStage: true }, done], paths, {
        'application.MARKS': '',
      }).status
    ).toBe('blocked');
  });
});
