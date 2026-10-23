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
  canReopen: true,
  loading: false,
  fetching: false,
  error: false,
  setAction: vi.fn(),
  retry: vi.fn(),
}));

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({ confirmPopup: { isChanges: false } }),
  useDispatch: () => vi.fn(),
}));
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
      isFetching: state.fetching,
      isError: state.error,
      refetch: state.retry,
    },
    submitReason: vi.fn(),
    canReopen: state.canReopen,
  }),
}));

function renderStage(compact = true) {
  const complete = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ApplicationFormStage
        applicationId="application"
        stage={{ id: 'stage', name: 'Application form' } as AdmissionApplicationStage}
        canAdvance
        advancing={false}
        onComplete={complete}
        compact={compact}
      />
    </ThemeProvider>
  );
  return complete;
}

beforeEach(() => {
  vi.clearAllMocks();
  state.busy = false;
  state.canReopen = true;
  state.loading = false;
  state.fetching = false;
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
    blockers: ['Submit the application form.'],
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

describe('Form stage after section verification removal', () => {
  it.each([true, false])(
    'omits verification controls in compact=%s, including legacy required sections',
    (compact) => {
      renderStage(compact);
      expect(
        screen.queryByRole('button', { name: /Section verification|Verify Student details/ })
      ).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText('Student details')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Continue admission' })).toBeDisabled();
      if (!compact) expect(screen.getByText('Submit the application form.')).toBeVisible();
    }
  );

  it('retains the authorized correction action for a submitted form', async () => {
    Object.assign(state.summary!, { formStatus: 1, canRequestCorrection: true });
    renderStage();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Request correction' }));
    expect(state.setAction).toHaveBeenCalledWith({ type: 'correction' });
  });

  it('retains server readiness and permission checks', async () => {
    Object.assign(state.summary!, {
      formStatus: 1,
      canComplete: true,
      canRequestCorrection: true,
      blockers: [],
    });
    state.canReopen = false;
    const complete = renderStage();
    expect(screen.queryByRole('button', { name: 'Request correction' })).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Continue admission' }));
    expect(complete).toHaveBeenCalledOnce();
  });

  it('exposes the error and retry without a verification dialog', async () => {
    state.error = true;
    renderStage();
    await userEvent.setup().click(screen.getByRole('button', { name: /Retry/i }));
    expect(state.retry).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: 'Continue admission' })).not.toBeInTheDocument();
  });

  it.each([true, false])('uses skeletons instead of linear progress in compact=%s', (compact) => {
    state.fetching = true;
    state.busy = true;
    renderStage(compact);
    expect(screen.getByRole('status', { name: 'Loading Form stage' })).toBeVisible();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue admission' })).not.toBeInTheDocument();
  });

  it('does not expose a correction action when the server disallows correction', () => {
    renderStage();
    expect(screen.queryByRole('button', { name: 'Request correction' })).not.toBeInTheDocument();
  });
});
