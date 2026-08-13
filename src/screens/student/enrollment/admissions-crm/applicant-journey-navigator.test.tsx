import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
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

const onBack = vi.fn();
const scrollIntoView = vi.fn();

const setMedia = (compact: boolean, reducedMotion = false) => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? reducedMotion : compact,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
};

const renderJourney = (
  selectedTab: 'inquiry' | 'registration' = 'registration',
  onSelect = vi.fn()
) =>
  render(
    <ApplicantJourneyNavigator
      steps={steps}
      currentStep={steps[2]}
      selectedTab={selectedTab}
      returnHref="/student/enrollment/pipeline"
      onBack={onBack}
      onSelect={onSelect}
    />
  );

describe('Applicant journey navigator', () => {
  beforeEach(() => {
    setMedia(false);
    scrollIntoView.mockReset();
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('uses a horizontal stepper and keeps blocked, skipped, and future steps non-interactive', () => {
    const onSelect = vi.fn();
    const { container } = renderJourney('registration', onSelect);

    expect(container.querySelector('.MuiStepper-horizontal')).toBeInTheDocument();
    expect(container.querySelectorAll('.MuiStepIcon-root')).toHaveLength(steps.length);
    expect(screen.getByText('Not required')).toBeVisible();
    expect(screen.getByText('Current')).toBeVisible();
    expect(screen.getAllByRole('button')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: /Registration.*Current/i }));
    expect(onSelect).toHaveBeenCalledWith('registration');
  });

  it('distinguishes the backend current step from the viewed URL section', () => {
    renderJourney('inquiry');

    const currentStep = screen.getByText('Registration').closest('.MuiStep-root');
    const viewedStep = screen.getByText('Inquiry').closest('.MuiStep-root');
    expect(currentStep).toHaveAttribute('aria-current', 'step');
    expect(currentStep).not.toHaveAttribute('data-viewed');
    expect(viewedStep).toHaveAttribute('data-viewed', 'true');
    expect(screen.getByRole('button', { name: /Inquiry.*Complete/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('centers the viewed step in the phone rail and disables motion when requested', () => {
    setMedia(true, true);
    renderJourney('registration');

    expect(scrollIntoView).toHaveBeenCalledWith({
      block: 'nearest',
      inline: 'center',
      behavior: 'auto',
    });
  });

  it('exposes blocked reasons without making the step a button', async () => {
    renderJourney();

    const blockedStep = screen.getByRole('group', { name: /Finance, Blocked/ });
    expect(blockedStep).toHaveAttribute('tabindex', '0');
    fireEvent.mouseOver(blockedStep);
    expect(await screen.findByText('Registration must be verified first.')).toBeVisible();
    expect(screen.queryByRole('button', { name: /Finance/i })).not.toBeInTheDocument();
  });
});
