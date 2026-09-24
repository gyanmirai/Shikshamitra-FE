import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { it, expect, describe } from 'vitest';

import {
  getStageGuidance,
  getStageStatusColor,
  getStageStatusLabel,
  getWorkflowProgress,
  getStageActionLabel,
  isAdmissionDecisionStage,
  hasManagedStageWorkspace,
  canRetrySubmittedFormHandoff,
  canRequestNormalStageAdvance,
  canStageTypeCompleteForStatus,
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
  it('uses semantic shared-label states without treating skipped stages as completed', () => {
    expect(getStageStatusLabel(0)).toBe('Not started');
    expect(getStageStatusLabel(1)).toBe('Current step');
    expect(getStageStatusLabel(2)).toBe('Completed');
    expect(getStageStatusColor(2)).toBe('success');
    expect(getStageStatusColor(3)).toBe('warning');
    expect(getStageStatusColor(1)).toBe('default');
  });

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

  it('matches the backend status rules before exposing manual completion', () => {
    expect(canCompleteStageFromProgress(stage({ stageType: 1 }), 0, true)).toBe(false);
    expect(canCompleteStageFromProgress(stage({ stageType: 7 }), 1, true)).toBe(false);
    expect(canCompleteStageFromProgress(stage({ stageType: 7 }), 6, true)).toBe(true);
    expect(canCompleteStageFromProgress(stage({ stageType: 7 }), 5, true)).toBe(true);
    expect(canCompleteStageFromProgress(stage({ stageType: 7 }), 3, true)).toBe(true);
    expect(canCompleteStageFromProgress(stage({ stageType: 5 }), 0, true)).toBe(false);
    expect(canCompleteStageFromProgress(stage({ stageType: 5 }), 1, true)).toBe(true);
    expect(getStageGuidance(stage({ stageType: 7 }), 1)).toContain('approve or reject');
  });

  it('keeps assessment and custom-stage exceptions aligned with the backend', () => {
    expect(canStageTypeCompleteForStatus(stage({ stageType: 2 }), 0)).toBe(true);
    expect(canStageTypeCompleteForStatus(stage({ stageType: 2 }), 3)).toBe(false);
    expect(canStageTypeCompleteForStatus(stage({ stageType: 11 }), 0)).toBe(true);
  });

  it('leaves status ownership with managed payment, review, offer, and seat runtimes', () => {
    expect(
      canRequestNormalStageAdvance(stage({ stageType: 4, paymentStageEnabled: true }), 0)
    ).toBe(true);
    expect(canRequestNormalStageAdvance(stage({ stageType: 6, reviewEnabled: true }), 3)).toBe(
      true
    );
    expect(canRequestNormalStageAdvance(stage({ stageType: 5 }), 0)).toBe(false);
  });

  it('offers a recovery handoff for a submitted legacy Form stage only', () => {
    const legacyForm = stage({ stageType: 1, formStageEnabled: false });

    expect(canRetrySubmittedFormHandoff(legacyForm, 1)).toBe(true);
    expect(canRetrySubmittedFormHandoff(legacyForm, 0)).toBe(false);
    expect(canRetrySubmittedFormHandoff(stage({ stageType: 1, formStageEnabled: true }), 1)).toBe(
      false
    );
    expect(getStageGuidance(legacyForm, 1)).toContain('submitted');
  });

  it('separates managed stage workspaces and decision stages from manual steps', () => {
    expect(hasManagedStageWorkspace(stage({ stageType: 5 }))).toBe(false);
    expect(
      hasManagedStageWorkspace(stage({ stageType: 5, documentVerificationEnabled: true }))
    ).toBe(true);
    expect(isAdmissionDecisionStage(stage({ stageType: 5 }))).toBe(false);
    expect(isAdmissionDecisionStage(stage({ stageType: 6 }))).toBe(false);
    expect(isAdmissionDecisionStage(stage({ stageType: 6, reviewEnabled: true }))).toBe(true);
    expect(isAdmissionDecisionStage(stage({ stageType: 7 }))).toBe(true);
    expect(isAdmissionDecisionStage(stage({ stageType: 10 }))).toBe(true);
  });
});
