import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdmissionCrmApplicantStepKey } from 'src/redux/student/admissions-crm/core-leads-contracts';

import { ApplicantJourneyNavigator } from './applicant-journey-navigator';

import type { ApplicantJourneyStep } from './applicant-journey-model';

const steps: ApplicantJourneyStep[] = [
  {
    stepKey: AdmissionCrmApplicantStepKey.Inquiry,
    id: 'inquiry',
    label: 'Inquiry',
    workspaceTab: 'inquiry',
    state: 'complete',
  },
  {
    stepKey: AdmissionCrmApplicantStepKey.Exam,
    id: 'exam',
    label: 'Entrance Exam',
    workspaceTab: 'exam',
    state: 'skipped',
    reason: 'Entrance exam is optional for this admission year.',
  },
  {
    stepKey: AdmissionCrmApplicantStepKey.Registration,
    id: 'registration',
    label: 'Registration',
    workspaceTab: 'registration',
    state: 'needs-review',
  },
  {
    stepKey: AdmissionCrmApplicantStepKey.Finance,
    id: 'finance',
    label: 'Finance',
    workspaceTab: 'finance',
    state: 'blocked',
    reason: 'Registration must be verified first.',
  },
  {
    stepKey: AdmissionCrmApplicantStepKey.Placement,
    id: 'placement',
    label: 'Class Placement',
    workspaceTab: 'offer',
    state: 'not-started',
  },
  {
    stepKey: AdmissionCrmApplicantStepKey.Activation,
    id: 'activation',
    label: 'Activation',
    workspaceTab: 'activation',
    state: 'not-started',
  },
];

const setCompact = (compact: boolean) => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation(() => ({
      matches: compact,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
};

describe('Applicant journey navigator', () => {
  beforeEach(() => setCompact(false));

  it('renders distinct text and keeps blocked, skipped, and future steps non-interactive', () => {
    const onSelect = vi.fn();
    render(
      <ApplicantJourneyNavigator
        steps={steps}
        currentStep={steps[2]}
        selectedTab="registration"
        onSelect={onSelect}
      />
    );

    expect(screen.getByText('Not required')).toBeVisible();
    expect(screen.queryByText('Registration must be verified first.')).not.toBeInTheDocument();
    expect(screen.getByText(/Needs review/)).toBeVisible();
    expect(screen.getByText('6')).toBeVisible();
    expect(screen.getAllByRole('button')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: /Registration.*Needs review/i }));
    expect(onSelect).toHaveBeenCalledWith('registration');
  });

  it('uses a vertical keyboard-operable stepper and exposes blocked reasons on hover', async () => {
    setCompact(true);
    render(
      <ApplicantJourneyNavigator
        steps={steps}
        currentStep={steps[2]}
        selectedTab="registration"
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByRole('navigation', { name: 'Admission journey' })).toBeVisible();
    expect(screen.getByRole('button', { name: /Inquiry.*Complete/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /Registration.*Needs review/i })).toBeVisible();
    const blockedStep = screen.getByRole('group', { name: /Finance, Blocked/ });
    expect(blockedStep).toHaveAttribute('tabindex', '0');
    fireEvent.mouseOver(blockedStep);
    expect(await screen.findByText('Registration must be verified first.')).toBeVisible();
    expect(
      screen.queryByText('Entrance exam is optional for this admission year.')
    ).not.toBeInTheDocument();
  });
});
