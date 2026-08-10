import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  AdmissionCrmWorkUrgency,
  AdmissionCrmWorkspaceSection,
  AdmissionCrmRecommendedAction,
} from 'src/redux/student/admissions-crm/operations-governance-contracts';

import { AdmissionCrmLeadPriority } from 'src/redux/student/admissions-crm/core-leads-contracts';

import { ApplicantWorkContext } from './applicant-work-context';

describe('ApplicantWorkContext', () => {
  it('keeps the selected My Work instruction visible in the applicant workspace', () => {
    render(
      <ApplicantWorkContext
        workItem={{
          key: 'task:one',
          leadId: 'lead-1',
          priority: AdmissionCrmLeadPriority.Hot,
          title: 'Call the guardian',
          details: 'Confirm the preferred entrance assessment date.',
          dueAt: '2026-07-24T17:00:00Z',
          urgency: AdmissionCrmWorkUrgency.DueToday,
          assignedDisplayName: 'Admissions Counselor',
          recommendedAction: AdmissionCrmRecommendedAction.ScheduleExam,
          recommendedSection: AdmissionCrmWorkspaceSection.EntranceExam,
        }}
      />
    );

    expect(screen.getByRole('complementary', { name: 'Current work' })).toBeVisible();
    expect(screen.getByText('Call the guardian')).toBeVisible();
    expect(screen.getByText('Confirm the preferred entrance assessment date.')).toBeVisible();
    expect(screen.getByText('Schedule exam')).toBeVisible();
    expect(screen.getByText('Assigned to Admissions Counselor')).toBeVisible();
  });
});
