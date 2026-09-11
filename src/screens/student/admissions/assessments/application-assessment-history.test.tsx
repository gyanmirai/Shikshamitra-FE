import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { Provider } from 'react-redux';
import { it, vi, expect } from 'vitest';
import { api } from 'src/redux/service';
import { addIcon } from '@iconify/react';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import auth, { setPermissions } from 'src/redux/auth/authSlice';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { render, screen, cleanup } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import { stagePath, assessmentResponse } from 'src/redux/student/admissions/assessment-test-fixture';

import { ApplicationAssessments } from './application-assessments';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });
vi.mock('@mui/icons-material', async () => {
  const [Close, Info, Error, CheckCircle, WarningAmber] = await Promise.all([
    import('@mui/icons-material/Close'), import('@mui/icons-material/Info'), import('@mui/icons-material/Error'),
    import('@mui/icons-material/CheckCircle'), import('@mui/icons-material/WarningAmber'),
  ]);
  return { Close: Close.default, Info: Info.default, Error: Error.default, CheckCircle: CheckCircle.default, WarningAmber: WarningAmber.default };
});
addIcon('mdi:chevron-down', { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
const completedStage: AdmissionApplicationStage = {
  id: 'stage-1', definitionStageId: 'definition-1', name: 'Entrance exam', code: 'ASSESSMENT',
  stageType: 2, assessmentEnabled: true, status: 2, displayOrder: 0, allowManualSkip: false,
};
function setup(canView: boolean) {
  clearCachedAuthSession();
  const store = configureStore({ reducer: { auth, [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware) });
  store.dispatch(setPermissions([{ name: 'Students.Admissions.Assessments.View', isGranted: canView }]));
  render(<Provider store={store}><ThemeProvider theme={createTheme(defaultSettings)}>
    <ApplicationAssessments applicationId="application-1" admissionOfferingId="offering-1"
      stages={[completedStage]} canAdvance={false} advancing={false} onComplete={vi.fn()} />
  </ThemeProvider></Provider>);
  return store;
}

it('fetches completed assessment history only when expanded and keeps action controls absent', async () => {
  let requests = 0;
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get(stagePath, () => {
      requests += 1;
      return HttpResponse.json({ ...assessmentResponse, attempts: [{
        id: 'attempt-1', attemptNumber: 1, status: 'completed', outcome: 'passed', attendance: 'present',
        marks: 85, concurrencyStamp: 'attempt-stamp', createdAt: '2026-09-10T10:00:00Z',
        sessionId: 'session-1', sessionName: 'Entrance exam morning', sessionLocation: 'Assessment hall A',
        sessionStartsAt: '2026-09-20T10:00:00Z', sessionEndsAt: '2026-09-20T11:00:00Z',
      }] });
    })
  );
  const store = setup(true);
  expect(requests).toBe(0);
  await userEvent.click(screen.getByRole('button', { name: /Entrance exam · Assessment history/ }));
  expect(await screen.findByText(/Marks: 85/)).toBeInTheDocument();
  expect(screen.getByText(/Scheduled:/)).toHaveTextContent('20 Sep 2026');
  expect(screen.getByText(/Scheduled:/)).toHaveTextContent('Assessment hall A');
  expect(screen.queryByText(/Without scheduled session/)).not.toBeInTheDocument();
  expect(requests).toBe(1);
  expect(screen.queryByRole('button', { name: 'Record result' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Complete assessment step' })).not.toBeInTheDocument();
  cleanup();
  store.dispatch(api.util.resetApiState());
});

it('does not fetch restricted completed-stage evidence when the viewer lacks assessment access', async () => {
  let requests = 0;
  mswServer.use(http.get(stagePath, () => { requests += 1; return HttpResponse.json(assessmentResponse); }));
  const store = setup(false);
  await userEvent.click(screen.getByRole('button', { name: /Entrance exam · Assessment history/ }));
  expect(screen.getByText('Assessment access is required to view these results.')).toBeInTheDocument();
  expect(requests).toBe(0);
  cleanup();
  store.dispatch(api.util.resetApiState());
});
