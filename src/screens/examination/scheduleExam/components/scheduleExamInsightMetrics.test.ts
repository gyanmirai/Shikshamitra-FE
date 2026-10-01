import { describe, expect, it } from 'vitest';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';

import { buildScheduleExamInsightMetrics } from './scheduleExamInsightMetrics';

describe('Schedule Exam insight metrics', () => {
  it('uses server counts, including zero, instead of counts from the current page', () => {
    const metrics = buildScheduleExamInsightMetrics({
      summary: { pendingCount: 0, publishedCount: 4, completedCount: 5 },
      rows: [{ status: examScheduledStatus.Pending }],
    });

    expect(metrics.find((metric) => metric.id === 'draft-exams')).toMatchObject({
      value: 0,
    });
    expect(metrics.find((metric) => metric.id === 'published-exams')).toMatchObject({
      value: 4,
    });
    expect(metrics.find((metric) => metric.id === 'completed-exams')).toMatchObject({
      value: 5,
    });
  });

  it('labels a count derived from paginated rows as visible-page data', () => {
    const metrics = buildScheduleExamInsightMetrics({
      rows: [{ status: examScheduledStatus.Pending, issueCount: 1 }],
    });

    expect(metrics.find((metric) => metric.id === 'needs-attention')).toMatchObject({
      value: 1,
      helper: 'Visible page only',
    });
  });
});
