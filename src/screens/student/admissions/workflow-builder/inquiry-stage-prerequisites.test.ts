import { it, expect, describe } from 'vitest';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { DEFAULT_INQUIRY_POLICY } from 'src/redux/student/admissions/admission-inquiry-policy';

import { getInquiryStageError } from './inquiry-stage-prerequisites';

const stage: AdmissionWorkflowStage = {
  id: 'inquiry',
  code: 'INQUIRY',
  name: 'Inquiry',
  stageType: 0,
  displayOrder: 0,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: true,
  isTerminalStage: false,
  configurationJson: JSON.stringify({ inquiry: DEFAULT_INQUIRY_POLICY }),
};

describe('managed inquiry placement', () => {
  it('accepts one required entry Inquiry', () => {
    expect(getInquiryStageError(stage, [stage])).toBeUndefined();
  });
  it('requires entry placement and prevents skip', () => {
    expect(getInquiryStageError({ ...stage, isEntryStage: false }, [stage])).toContain('entry');
    expect(getInquiryStageError({ ...stage, allowManualSkip: true }, [stage])).toContain('skip');
  });
  it('allows only one managed Inquiry', () => {
    expect(getInquiryStageError(stage, [stage, { ...stage, id: 'other' }])).toContain('only one');
  });
});
