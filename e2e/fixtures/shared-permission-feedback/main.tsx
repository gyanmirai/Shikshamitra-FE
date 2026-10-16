import React from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { Snackbar } from 'src/components/snackbar';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { shikshaMitraToast } from 'src/components/toast';
import { useDeleteBoardMutation } from 'src/redux/board/boardApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useGetPayrollPoliciesQuery } from 'src/redux/hr/hr-policy-api';
import { defaultSettings } from 'src/components/settings/config-settings';
import { useUpdateSectionManagementMutation } from 'src/redux/library/settingApi';
import { Box, Alert, Stack, Button, Typography, CssBaseline } from '@mui/material';
import { useAddFuelTypeMutation } from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

const probeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    sharedFeedbackUnknownProbe: builder.query<unknown, void>({
      query: () => ({ url: '/fixture/new-resource' }),
    }),
  }),
});
const store = configureStore({
  reducer: { [api.reducerPath]: api.reducer },
  middleware: (defaults) => defaults().concat(api.middleware),
});
type Failure = { status?: unknown; data?: { message?: string }; error?: unknown };
type Report = (error: Failure) => void;

function PayrollProbe({ sequence, report }: { sequence: number; report: Report }) {
  const query = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPayrollPoliciesQuery,
    params: { academicYearId: 'synthetic-year', maxResultCount: sequence + 1 },
  });
  React.useEffect(() => {
    if (query.error) report(query.error);
  }, [query.error, report]);
  return null;
}

function Fixture() {
  const scenario = new URLSearchParams(window.location.search).get('response') || 'forbidden';
  const suppress = new URLSearchParams(window.location.search).get('ownership') === 'silent';
  const [queryCount, setQueryCount] = React.useState(0);
  const [lastError, setLastError] = React.useState('No request yet');
  const [busy, setBusy] = React.useState(false);
  const [addFuel] = useAddFuelTypeMutation();
  const [deleteBoard] = useDeleteBoardMutation();
  const [unknown] = probeApi.useLazySharedFeedbackUnknownProbeQuery();
  const [updateSection] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateSectionManagementMutation,
    popupConfig: { error: !suppress },
  });
  const report = React.useCallback((error: Failure) => {
    const parsed = parseApiProblemDetail(error);
    setLastError(
      JSON.stringify(
        { status: error.status, errorCode: parsed.errorCode, detail: parsed.detail },
        null,
        2
      )
    );
  }, []);
  const invoke = async (
    operation: () => Promise<unknown>,
    feedback: 'legacy' | 'parsed' | 'automatic'
  ) => {
    setBusy(true);
    try {
      await operation();
    } catch (error) {
      const failure = error as Failure;
      report(failure);
      if (feedback === 'legacy')
        shikshaMitraToast.error({ message: failure.data?.message || 'Failed to save fuel type' });
      if (feedback === 'parsed')
        shikshaMitraToast.error({ message: parseApiProblemDetail(error).detail });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={2} sx={{ p: { xs: 2, md: 4 }, maxWidth: 960, mx: 'auto' }}>
      <Typography variant="h4">Shared Permission Feedback</Typography>
      <Alert severity="info">
        Synthetic HTTP responses with production API clients, error handling and notifications. No
        external service or school data is used.
      </Alert>
      <Typography variant="body2">
        Response: {scenario}. Library error owner: {suppress ? 'inline only' : 'automatic toast'}.
      </Typography>
      <Stack direction="row" gap={1} flexWrap="wrap">
        <Button variant="outlined" onClick={() => setQueryCount((count) => count + 1)}>
          Load HR policies (GET)
        </Button>
        <Button variant="outlined" onClick={() => setQueryCount((count) => count + 3)}>
          Load three HR policy requests
        </Button>
        <Button
          variant="outlined"
          disabled={busy}
          onClick={() =>
            invoke(
              () =>
                addFuel({
                  academicMediumId: 'synthetic-medium',
                  body: { name: 'Synthetic fuel', isActive: true },
                }).unwrap(),
              'legacy'
            )
          }
        >
          Add transport fuel (POST)
        </Button>
        <Button
          variant="outlined"
          disabled={busy}
          onClick={() =>
            invoke(
              () =>
                updateSection({
                  sectionId: 'synthetic-section',
                  academicYearId: 'synthetic-year',
                  body: { sectionName: 'Synthetic section' },
                }).unwrap(),
              'automatic'
            )
          }
        >
          Update library section (PUT)
        </Button>
        <Button
          variant="outlined"
          disabled={busy}
          onClick={() => invoke(() => deleteBoard('synthetic-board').unwrap(), 'parsed')}
        >
          Delete academic board (DELETE)
        </Button>
        <Button
          variant="outlined"
          disabled={busy}
          onClick={() => invoke(() => unknown().unwrap(), 'parsed')}
        >
          Load unknown resource
        </Button>
        <Button onClick={() => shikshaMitraToast.dismiss()}>Dismiss notifications</Button>
      </Stack>
      {Array.from({ length: queryCount }, (_, sequence) => (
        <PayrollProbe key={sequence} sequence={sequence} report={report} />
      ))}
      <Typography variant="h6">Last API error</Typography>
      <Box
        component="pre"
        data-testid="last-error"
        sx={{
          m: 0,
          p: 2,
          bgcolor: 'background.neutral',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
        }}
      >
        {lastError}
      </Box>
      <Snackbar />
    </Stack>
  );
}

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider theme={createTheme(defaultSettings)} defaultMode="system">
      <CssBaseline />
      <Fixture />
    </ThemeProvider>
  </Provider>
);
