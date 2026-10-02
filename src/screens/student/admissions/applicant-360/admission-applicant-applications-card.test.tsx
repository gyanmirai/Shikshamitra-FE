import type { AdmissionApplicant360 } from 'src/redux/student/admissions/admission-applicants-api';

import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { ADMISSION_APPLICATION_PERMISSIONS } from '../admission-application-permissions';
import { AdmissionApplicantApplicationsCard } from './admission-applicant-applications-card';

let grantedPermissions: { name: string; isGranted: boolean }[] = [];

vi.mock('react-redux', () => ({
  useSelector: () => grantedPermissions,
}));

vi.mock('../admission-applicant-notes', () => ({
  default: () => <div>Notes editor</div>,
}));
vi.mock('../fee-selection/admission-fee-selection-panel', () => ({
  default: ({ applicationId }: { applicationId: string }) => (
    <div>Fee selection for {applicationId}</div>
  ),
}));

vi.mock('./admission-applicant-start-card', () => ({
  AdmissionApplicantStartCard: () => <div>Start application controls</div>,
}));

const baseData: AdmissionApplicant360 = {
  applicant: {
    id: 'applicant-1',
    familyId: 'family-1',
    firstName: 'Parth',
    lastName: 'Patel',
    dateOfBirth: '2020-09-21',
    gender: null,
  },
  family: { id: 'family-1', familyNumber: 'FAM/2026/001' },
  primaryGuardian: { firstName: 'Sanjay', mobile: '8893303939' },
  applications: [],
  activities: [],
  notes: [],
};

const application: AdmissionApplicant360['applications'][number] = {
  id: 'application-1',
  applicationNumber: 'APP/2026/001',
  status: 4,
  assignedCounsellorId: 'counsellor-1',
  assignedCounsellorName: 'Anita Shah',
  creationTime: '2026-09-18T08:00:00Z',
  lastSavedAt: '2026-09-18T09:00:00Z',
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
    {
      code: 'DECISION',
      name: 'Admission decision',
      stageType: 2,
      status: 0,
      displayOrder: 3,
    },
  ],
};

const renderCard = (data: AdmissionApplicant360) =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionApplicantApplicationsCard applicantId="applicant-1" data={data} />
    </ThemeProvider>
  );

describe('AdmissionApplicantApplicationsCard', () => {
  beforeEach(() => {
    grantedPermissions = [];
  });

  it('keeps the real first-use controls when no application exists', () => {
    renderCard(baseData);

    expect(screen.getByText('Applicant essentials')).toBeInTheDocument();
    expect(screen.getByText('Start application controls')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Open application' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Team notes/ })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('shows the runtime journey, current stage, disclosure sections, and destination', () => {
    renderCard({ ...baseData, applications: [application] });

    expect(screen.getByText('Admission journey')).toBeInTheDocument();
    expect(screen.getByText('Fee selection for application-1')).toBeInTheDocument();
    expect(screen.getAllByText('Review and verify').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Current step').length).toBeGreaterThan(0);
    expect(screen.getByText('Required before finalization.')).toBeInTheDocument();

    const openApplicationLinks = screen.getAllByRole('link', { name: 'Open application' });
    expect(openApplicationLinks).toHaveLength(1);
    openApplicationLinks.forEach((link) =>
      expect(link).toHaveAttribute('href', '/student/admissions/applications/application-1')
    );

    const information = screen.getByRole('button', { name: 'Application information' });
    expect(information).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(information);
    expect(information).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('APP-2026-000001')).toBeInTheDocument();
    expect(screen.getByText('Journey counsellor')).toBeInTheDocument();
    expect(screen.getByText('Anita Shah')).toBeInTheDocument();
  });

  it('shows the workflow override only when the existing manage permission is granted', () => {
    const data = { ...baseData, applications: [application] };
    const { unmount } = renderCard(data);
    expect(screen.queryByRole('link', { name: /Override route/ })).not.toBeInTheDocument();
    unmount();

    grantedPermissions = [{ name: ADMISSION_APPLICATION_PERMISSIONS.manage, isGranted: true }];
    renderCard(data);

    const overrideLinks = screen.getAllByRole('link', { name: /Override route/ });
    expect(overrideLinks).toHaveLength(1);
    overrideLinks.forEach((link) =>
      expect(link).toHaveAttribute('href', '/student/admissions/applications/application-1')
    );
  });
});
