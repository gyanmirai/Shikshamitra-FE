import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { it, expect, describe } from 'vitest';

import { compareWorkflowVersions } from './workflow-version-comparison';

const version = (
  name: string,
  priority = 0
): Pick<AdmissionWorkflow, 'stages' | 'transitions'> => ({
  stages: [
    {
      id: 'inquiry',
      code: 'INQUIRY',
      name: 'Inquiry',
      stageType: 0,
      displayOrder: 0,
      isRequired: true,
      allowManualSkip: false,
      isEntryStage: true,
      isTerminalStage: false,
    },
    {
      id: 'decision',
      code: 'DECISION',
      name,
      stageType: 7,
      displayOrder: 1,
      isRequired: true,
      allowManualSkip: false,
      isEntryStage: false,
      isTerminalStage: true,
    },
  ],
  transitions: [
    {
      id: 'route',
      fromStageId: 'inquiry',
      toStageId: 'decision',
      priority,
      isDefault: true,
    },
  ],
});

describe('compareWorkflowVersions', () => {
  it('matches stages and routes by stable codes instead of copied ids', () => {
    const baseline = version('Decision');
    const candidate = version('Admission decision');
    candidate.stages = candidate.stages.map((stage) => ({ ...stage, id: `copy-${stage.id}` }));
    candidate.transitions = candidate.transitions.map((route) => ({
      ...route,
      fromStageId: `copy-${route.fromStageId}`,
      toStageId: `copy-${route.toStageId}`,
    }));

    const comparison = compareWorkflowVersions(baseline, candidate);

    expect(comparison.stageChanges).toEqual([
      expect.objectContaining({ kind: 'changed', label: 'Admission decision' }),
    ]);
    expect(comparison.routeChanges).toEqual([]);
  });

  it('reports route priority changes', () => {
    const comparison = compareWorkflowVersions(version('Decision'), version('Decision', 5));

    expect(comparison.routeChanges).toEqual([
      expect.objectContaining({ kind: 'changed', detail: 'Priority changed from 0 to 5' }),
    ]);
  });

  it('does not report configuration changes caused only by JSON property order', () => {
    const baseline = version('Decision');
    const candidate = version('Decision');
    baseline.stages[0].configurationJson = '{"enabled":true,"mode":"managed"}';
    candidate.stages[0].configurationJson = '{"mode":"managed","enabled":true}';

    expect(compareWorkflowVersions(baseline, candidate).hasChanges).toBe(false);
  });
});
