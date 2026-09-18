import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { WorkflowRuntimeAnalytics } from './components/workflow-runtime-analytics';

describe('WorkflowRuntimeAnalytics', () => {
  it('shows a clear empty state before applications use the version', () => {
    render(
      <WorkflowRuntimeAnalytics
        analytics={{
          startedCount: 0,
          activeCount: 0,
          completedCount: 0,
          completionRatePercent: 0,
          stages: [],
        }}
      />
    );

    expect(screen.getByText(/appears after applications start/i)).toBeInTheDocument();
  });

  it('shows version-level and stage-level throughput without inventing missing durations', () => {
    render(
      <WorkflowRuntimeAnalytics
        analytics={{
          startedCount: 10,
          activeCount: 4,
          completedCount: 6,
          completionRatePercent: 60,
          averageCompletionHours: null,
          stages: [
            {
              definitionStageId: 'review',
              code: 'REVIEW',
              name: 'Application review',
              stageType: 6,
              displayOrder: 0,
              enteredCount: 10,
              activeCount: 4,
              completedCount: 5,
              skippedCount: 1,
              completionRatePercent: 60,
              averageDurationHours: 48,
              oldestActiveEnteredAt: null,
            },
          ],
        }}
      />
    );

    expect(screen.getByText('Application review')).toBeInTheDocument();
    expect(screen.getAllByText('60%')).toHaveLength(2);
    expect(screen.getByText('Average journey time: Not available yet')).toBeInTheDocument();
    expect(screen.getByText('Average stage time: 2.0 days')).toBeInTheDocument();
  });
});
