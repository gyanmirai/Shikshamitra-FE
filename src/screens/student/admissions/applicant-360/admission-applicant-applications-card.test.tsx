import type { AdmissionApplicant360 } from 'src/redux/student/admissions/admission-applicants-api';

import { it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings';

import { AdmissionApplicantApplicationsCard } from './admission-applicant-applications-card';

type Application = AdmissionApplicant360['applications'][number];

const renderCard = (applications: Application[]) =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionApplicantApplicationsCard applications={applications} />
    </ThemeProvider>
  );

const application: Application = {
  id: 'application-1',
  applicationNumber: 'APP/2026/001',
  status: 4,
  creationTime: '2026-09-18T08:00:00Z',
  stages: [
    {
      code: 'FORM',
      name: 'Application form',
      stageType: 0,
      status: 2,
      displayOrder: 1,
      completedAt: '2026-09-18T08:30:00Z',
    },
    {
      code: 'REVIEW',
      name: 'Review and verify',
      stageType: 1,
      status: 1,
      displayOrder: 2,
      enteredAt: '2026-09-18T08:30:00Z',
    },
  ],
};

describe('AdmissionApplicantApplicationsCard', () => {
  it('shows a useful first-use state when no application exists', () => {
    renderCard([]);

    expect(screen.getByText('No application started')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to next action' })).toHaveAttribute(
      'href',
      '#next-action'
    );
  });

  it('shows the current stage, readable status, and application destination', () => {
    renderCard([application]);

    expect(screen.getByText('APP-2026-000001')).toBeInTheDocument();
    expect(screen.getByText('In review')).toBeInTheDocument();
    expect(screen.getAllByText('Review and verify').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Open application' })).toHaveAttribute(
      'href',
      '/student/admissions/applications/application-1'
    );
  });
});
