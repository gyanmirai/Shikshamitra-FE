import { it, expect, describe } from 'vitest';

import {
  isAiReportBusyStage,
  AI_REPORT_ACTIVITY_COPY,
} from './ai-report-activity-config';

describe('AI report activity configuration', () => {
  it('provides concise conversational copy for every loading stage', () => {
    expect(Object.keys(AI_REPORT_ACTIVITY_COPY)).toEqual([
      'planning',
      'generating',
      'queued',
      'processing',
    ]);
    expect(AI_REPORT_ACTIVITY_COPY.planning.status).toBe('Thinking');
    expect(AI_REPORT_ACTIVITY_COPY.processing.status).toBe('Creating your PDF');
  });

  it('only marks loading stages as busy', () => {
    expect(isAiReportBusyStage('planning')).toBe(true);
    expect(isAiReportBusyStage('processing')).toBe(true);
    expect(isAiReportBusyStage('planned')).toBe(false);
    expect(isAiReportBusyStage('ready')).toBe(false);
    expect(isAiReportBusyStage('failed')).toBe(false);
  });
});
