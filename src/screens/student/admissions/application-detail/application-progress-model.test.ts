import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { it, expect, describe } from 'vitest';

import {
  getStageGuidance,
  getWorkflowProgress,
  getStageActionLabel,
  canCompleteStageFromProgress,
} from './application-progress-model';

const stage = (overrides: Partial<AdmissionApplicationStage>): AdmissionApplicationStage => ({
  id: 'stage-1',
  definitionStageId: 'definition-1',
  code: 'BASIC_INQUIRY',
  name: 'Basic inquiry received',
  stageType: 0,
  displayOrder: 0,
  status: 0,
  allowManualSkip: false,
  ...overrides,
});

describe('application progress model', () => {
  it('counts completed and skipped steps as resolved progress', () => {
    const result = getWorkflowProgress([
      stage({ id: 'one', status: 2 }),
      stage({ id: 'two', status: 3 }),
      stage({ id: 'three', status: 1 }),
      stage({ id: 'four', status: 0 }),
    ]);

    expect(result).toEqual({ total: 4, completed: 2, percentage: 50 });
  });

  it('uses specific action labels for physical form, exam, and approval steps', () => {
    expect(getStageActionLabel(stage({ code: 'PHYSICAL_FORM_ISSUED' }))).toBe(
      'Confirm physical form issued'
    );
    expect(getStageActionLabel(stage({ stageType: 2 }))).toBe('Record entrance exam result');
    expect(getStageActionLabel(stage({ stageType: 7 }))).toBe('Finish admission workflow');
  });

  it('waits for form submission and the approval decision before manual completion', () => {
    expect(canCompleteStageFromProgress(stage({ stageType: 1 }), 0, true)).toBe(false);
    expect(canCompleteStageFromProgress(stage({ stageType: 7 }), 1, true)).toBe(false);
    expect(canCompleteStageFromProgress(stage({ stageType: 7 }), 6, true)).toBe(true);
    expect(getStageGuidance(stage({ stageType: 7 }), 1)).toContain('approve or reject');
  });
});
