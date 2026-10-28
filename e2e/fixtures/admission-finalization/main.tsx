import 'simplebar-react/dist/simplebar.min.css';

import type {
  AdmissionApplication,
  AdmissionFinalizationResult,
  AdmissionFinalizationPreview,
} from 'src/redux/student/admissions/admission-applications-api';

import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { useRef, useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { createTheme } from 'src/theme/create-theme';
import { setPermissions } from 'src/redux/auth/authSlice';
import { studentPaths } from 'src/constants/student-menu';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { defaultSettings } from 'src/components/settings/config-settings';
import { Box, Stack, Button, Drawer, Typography, CssBaseline } from '@mui/material';
import { createDocumentTestStore } from 'src/redux/student/admissions/document-test-fixture';
import { useGetAdmissionApplicationQuery } from 'src/redux/student/admissions/admission-applications-api';
import { ApplicationDecisionCard } from 'src/screens/student/admissions/application-detail/application-decision-card';

const params = new URLSearchParams(window.location.search);
let application: AdmissionApplication = {
  id: 'application-synthetic',
  concurrencyStamp: 'submitted-stamp',
  applicationNumber: 'APP-QA-000001',
  applicantId: 'applicant-synthetic',
  applicantName: 'Synthetic applicant',
  admissionCycleId: 'cycle-synthetic',
  admissionOfferingId: 'offering-synthetic',
  standardName: 'Class 1',
  currentStageInstanceId: 'stage-finalization',
  hasReachedDecision: true,
  status: 1,
};
const preview: AdmissionFinalizationPreview = {
  applicationId: application.id,
  isReady: !params.has('identityMissing'),
  possibleMatches: [],
  linkedStudentId: null,
  items: [
    { key: 'approval', label: 'Admission approved', passed: true, detail: 'Ready' },
    { key: 'workflow', label: 'Admission workflow completed', passed: true, detail: 'Ready' },
    {
      key: 'identity',
      label: 'Core identity complete',
      passed: !params.has('identityMissing'),
      detail: params.has('identityMissing') ? 'Gender is required.' : 'Ready',
    },
    { key: 'guardian', label: 'Primary guardian contact valid', passed: true, detail: 'Ready' },
    {
      key: 'duplicate_resolution',
      label: 'Student identity resolved',
      passed: true,
      detail: 'Ready',
    },
  ],
  capturedStudentFields: [
    { key: 'Applicant.Nationality', label: 'Nationality', value: 'Sample value' },
  ],
};
const decisions: unknown[] = [];
const finalizations: unknown[] = [];
let readinessReads = 0;
let releaseFinalization: (() => void) | null = null;
const notify = () => window.dispatchEvent(new Event('fixture-finalization-command'));
const nativeFetch = window.fetch.bind(window);
// Synthetic transport only. These real API clients never contact a real application or backend.
window.fetch = async (input, init) => {
  const request = new Request(input, init);
  const path = new URL(request.url).pathname;
  if (path === '/api/auth/session') return Response.json(null);
  if (!path.startsWith('/api/student/enrollment/admissions/applications/')) {
    if (path.startsWith('/api/'))
      return Response.json({ detail: 'Fixture route unavailable' }, { status: 404 });
    return nativeFetch(input, init);
  }
  if (path.endsWith('/decision-history')) return Response.json([]);
  if (path.endsWith('/decision/approve')) {
    decisions.push(await request.json());
    application = { ...application, status: 6, concurrencyStamp: 'approved-stamp' };
    notify();
    return Response.json(application);
  }
  if (path.endsWith('/finalization-preview')) {
    readinessReads += 1;
    notify();
    if (params.has('readinessFailure') && readinessReads === 1)
      return Response.json({ detail: 'Synthetic readiness read unavailable' }, { status: 503 });
    return Response.json(preview);
  }
  if (path.endsWith('/finalize')) {
    finalizations.push(await request.json());
    const pending = new Promise<void>((resolve) => {
      releaseFinalization = resolve;
    });
    notify();
    await pending;
    application = {
      ...application,
      status: 11,
      concurrencyStamp: 'finalized-stamp',
      studentId: 'student-synthetic',
      onboardingCaseId: 'case-synthetic-123',
    };
    const result: AdmissionFinalizationResult = {
      application,
      studentId: 'student-synthetic',
      onboardingCaseId: 'case-synthetic-123',
      reusedExistingStudent: false,
    };
    return Response.json(result);
  }
  return Response.json(application);
};

const store = createDocumentTestStore();
store.dispatch(
  setPermissions(
    [
      'Students.Admissions.Applications.View',
      'Students.Admissions.Applications.Add',
      'Students.Onboarding.View',
    ].map((name) => ({ name, isGranted: true }))
  )
);

function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <Button size="small" onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
      Change theme
    </Button>
  );
}

function Workspace() {
  const query = useGetAdmissionApplicationQuery(application.id);
  const [journeyCompleted, setJourneyCompleted] = useState(false);
  const [preparationPending, setPreparationPending] = useState(false);
  const [destination, setDestination] = useState('');
  const [, refresh] = useState(0);
  const prepareRelease = useRef<(() => void) | null>(null);
  const prepareAttempts = useRef(0);
  useEffect(() => {
    const update = () => refresh((value) => value + 1);
    window.addEventListener('fixture-finalization-command', update);
    return () => window.removeEventListener('fixture-finalization-command', update);
  }, []);
  return (
    <Drawer
      open
      anchor="right"
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', lg: '92vw' },
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        useFlexGap
        flexWrap="wrap"
        gap={1}
        sx={{ p: 2, flexShrink: 0 }}
      >
        <Typography variant="subtitle2" sx={{ mr: 'auto' }}>
          Synthetic applicant · Finalization test
        </Typography>
        <ThemeToggle />
      </Stack>
      <Scrollbar fillContent sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>
        <Box sx={{ p: 1, minWidth: 0 }}>
          {destination ? (
            <Typography role="status" aria-label="Onboarding destination">
              {destination}
            </Typography>
          ) : query.data ? (
            <ApplicationDecisionCard
              application={query.data}
              journeyCompleted={journeyCompleted}
              compact
              onPrepareFinalization={async () => {
                prepareAttempts.current += 1;
                if (params.has('prepareFailure') && prepareAttempts.current === 1) return false;
                setPreparationPending(true);
                await new Promise<void>((resolve) => {
                  prepareRelease.current = resolve;
                });
                application = { ...application, concurrencyStamp: 'ready-stamp' };
                await query.refetch().unwrap();
                setJourneyCompleted(true);
                setPreparationPending(false);
                return true;
              }}
              onFinalized={(result) =>
                setDestination(
                  `${studentPaths.onboarding.setup}?case=${encodeURIComponent(result.onboardingCaseId)}`
                )
              }
            />
          ) : (
            <Typography>Loading synthetic application…</Typography>
          )}
        </Box>
      </Scrollbar>
      <Stack
        component="footer"
        spacing={0.5}
        sx={{ p: 1, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        <Typography variant="caption">Fixture controls — no real record is changed</Typography>
        {preparationPending && (
          <Button
            size="small"
            onClick={() => {
              prepareRelease.current?.();
              prepareRelease.current = null;
            }}
          >
            Release preparation
          </Button>
        )}
        {releaseFinalization && (
          <Button
            size="small"
            onClick={() => {
              releaseFinalization?.();
              releaseFinalization = null;
            }}
          >
            Release final save
          </Button>
        )}
        <Typography variant="caption" component="output" aria-label="Decision requests">
          {JSON.stringify(decisions)}
        </Typography>
        <Typography variant="caption" component="output" aria-label="Finalization requests">
          {JSON.stringify(finalizations)}
        </Typography>
        <Typography variant="caption" component="output" aria-label="Readiness reads">
          {readinessReads}
        </Typography>
      </Stack>
    </Drawer>
  );
}

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider theme={createTheme(defaultSettings)} defaultMode="light">
      <CssBaseline />
      <Workspace />
    </ThemeProvider>
  </Provider>
);
