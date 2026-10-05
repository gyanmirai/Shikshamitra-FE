import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { HrReportBuilderReview } from './HrReportBuilderReview';

describe('HrReportBuilderReview', () => {
  it('summarizes builder state and warns when preview is stale', () => {
    render(
      <HrReportBuilderReview
        sourceLabel="Staff Reports"
        isPreviewStale
        state={{
          selectedSourceId: 'employee',
          selectedTemplate: null,
          reportName: 'Leadership Snapshot',
          columns: ['employeeCode', 'employeeName'],
          dateField: '',
          fromDate: '',
          toDate: '',
          month: '',
          conditions: [{ field: 'department', operator: 'equals', value: 'HR' }],
          sortField: '',
          sortDirection: 'asc',
          groups: ['department'],
          summaryField: '',
          chartType: 'bar',
          chartCategoryField: 'department',
          chartValueField: '',
          visibility: 'private',
        }}
      />
    );

    expect(screen.getByText('Leadership Snapshot')).toBeVisible();
    expect(screen.getByText('2 columns')).toBeVisible();
    expect(screen.getByText('1 filter')).toBeVisible();
    expect(screen.getByText('Preview has not been generated for the current setup.')).toBeVisible();
  });
});
