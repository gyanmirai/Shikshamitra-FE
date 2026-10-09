import type { AdmissionFormStage } from 'src/redux/student/admissions/admission-form-stage-api';
import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';

import { ApplicationFormStage } from './application-form-stage';

const state = vi.hoisted(() => ({
  summary: undefined as AdmissionFormStage | undefined,
  busy: false,
  canEdit: true,
  canReopen: true,
  loading: false,
  error: false,
  verify: vi.fn(),
  setAction: vi.fn(),
  retry: vi.fn(),
}));

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('./form-stage-reason-dialog', () => ({
  FormStageReasonDialog: () => <div>Reason dialog</div>,
}));
vi.mock('./hooks/use-application-form-stage', () => ({
  useApplicationFormStage: () => ({
    action: null,
    setAction: state.setAction,
    summary: state.summary,
    busy: state.busy,
    query: {
      isLoading: state.loading,
      isFetching: false,
      isError: state.error,
      refetch: state.retry,
    },
    verifySection: state.verify,
    submitReason: vi.fn(),
    canEdit: state.canEdit,
    canReopen: state.canReopen,
  }),
}));

function renderStage() {
  const complete = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ApplicationFormStage
        applicationId="application"
        stage={{ id: 'stage', name: 'Application form' } as AdmissionApplicationStage}
        canAdvance
        advancing={false}
        onComplete={complete}
        compact
      />
    </ThemeProvider>
  );
  return complete;
}

beforeEach(() => {
  vi.clearAllMocks();
  state.busy = false;
  state.canEdit = true;
  state.canReopen = true;
  state.loading = false;
  state.error = false;
  state.summary = {
    applicationId: 'application',
    stageId: 'stage',
    formStatus: 0,
    canVerify: false,
    submissionAttempts: 0,
    canComplete: false,
    isOverdue: false,
    canRequestCorrection: false,
    blockers: ['Submit the form before verification.'],
    policy: { responsibility: 'staff', maxSubmissionAttempts: 3 },
    sections: [
      {
        sectionId: 'student',
        sectionCode: 'student',
        sectionName: 'Student details',
        required: true,
        verified: false,
      },
    ],
  } as AdmissionFormStage;
});

describe('compact form-stage verification', () => {
  it('starts with a compact disclosure and preserves policy, blockers and disabled controls inside it', async () => {
    const user = userEvent.setup();
    renderStage();
    expect(screen.queryByText('Managed application form')).not.toBeInTheDocument();
    expect(screen.queryByText('Owner: staff')).not.toBeInTheDocument();
    const disclosure = screen.getByRole('button', { name: /Section verification/ });
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Submit the application before staff verification.')).toBeVisible();
    await user.click(disclosure);
    expect(screen.getByText('0 of 3 submission attempts used')).toBeVisible();
    expect(screen.getByText('Submit the form before verification.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Verify' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Continue admission' })).toBeDisabled();
  });

  it('opens submitted verification automatically and retains Verify and Request correction', async () => {
    const user = userEvent.setup();
    Object.assign(state.summary!, { formStatus: 1, canVerify: true, canRequestCorrection: true });
    renderStage();
    expect(screen.getByRole('button', { name: /Section verification/ })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    await user.click(screen.getByRole('button', { name: 'Verify' }));
    expect(state.verify).toHaveBeenCalledWith(state.summary!.sections[0]);
    await user.click(screen.getByRole('button', { name: 'Request correction' }));
    expect(state.setAction).toHaveBeenCalledWith({ type: 'correction' });
  });

  it('keeps denied verification disabled and ready admission continuation governed by the server', async () => {
    const user = userEvent.setup();
    Object.assign(state.summary!, {
      formStatus: 1,
      canVerify: true,
      canComplete: true,
      blockers: [],
    });
    state.canEdit = false;
    state.canReopen = false;
    const complete = renderStage();
    expect(screen.getByRole('button', { name: 'Verify' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Request correction' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continue admission' }));
    expect(complete).toHaveBeenCalledOnce();
  });

  it('keeps an error retry path available', async () => {
    state.error = true;
    renderStage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Retry/i }));
    expect(state.retry).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: 'Continue admission' })).not.toBeInTheDocument();
  });
});
