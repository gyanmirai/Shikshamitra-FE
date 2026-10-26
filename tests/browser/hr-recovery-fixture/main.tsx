import { useState } from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { hrPermissions } from 'src/constants/hr-menus';
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { Box, Stack, Button, TextField, Typography } from '@mui/material';
import { defaultSettings } from 'src/components/settings/config-settings';
import { hrRecoveryMiddleware } from 'src/redux/hr/hr-recovery-middleware';
import { HrRecoveryProvider } from 'src/screens/hr/recovery/hr-recovery-provider';
import { HrSetupLink, HrSetupRefresh } from 'src/screens/hr/recovery/hr-setup-controls';

// Real recovery components + real RTK mutation lifecycle; synthetic responses only.
const fixtureApi = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    save: builder.mutation<{}, string>({
      queryFn: async (mode) =>
        mode === 'success'
          ? { data: {} }
          : {
              error: {
                status: mode === 'network' ? 'FETCH_ERROR' : mode === 'forbidden' ? 403 : 400,
                data: {
                  error: {
                    code: 'HR:Employee:010201',
                    message: 'One or more business rules were violated.',
                  },
                  ...(mode === 'fields'
                    ? {
                        errors: {
                          BankName: ['Enter a bank name.'],
                          MonthlyAmount: ['Enter a positive amount.'],
                        },
                      }
                    : {}),
                },
              },
            },
    }),
  }),
});
const allPermissions = [
  hrPermissions.root,
  hrPermissions.payroll.root,
  hrPermissions.payroll.settings.root,
  hrPermissions.payroll.compensationRevisionActions.view,
  hrPermissions.payroll.settings.salaryTemplateActions.view,
];
const initialAuth = {
  user: { sub: 'synthetic-user', tenantid: 'synthetic-tenant' },
  permissions: allPermissions.map((name) => ({ name, isGranted: true })),
  loading: false,
  permissionsInitialized: true,
};
const store = configureStore({
  reducer: {
    auth: (currentState: typeof initialAuth | undefined, action: any) => {
      const state = currentState ?? initialAuth;
      return action.type === 'fixture/revoke' ? { ...state, permissions: [] } : state;
    },
    confirmPopup: () => ({ isChanges: false }),
    [fixtureApi.reducerPath]: fixtureApi.reducer,
  },
  middleware: (getDefault) => getDefault().concat(hrRecoveryMiddleware, fixtureApi.middleware),
});

function Form() {
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState(false);
  const [refreshFails, setRefreshFails] = useState(false);
  const [refreshes, setRefreshes] = useState(0);
  const [save, request] = fixtureApi.useSaveMutation();
  const { requestNavigation, confirmation } = useUnsavedNavigation(Boolean(value) && !saved, {
    push: (href) => window.location.assign(href),
  });
  return (
    <Stack spacing={2} sx={{ maxWidth: 720, p: 2 }}>
      <Typography variant="h4" component="h1">
        Synthetic HR Recovery Form
      </Typography>
      <Typography>
        No authentication, real staff records, backend writes or credentials. The form is a harness;
        recovery components and middleware are production code.
      </Typography>
      <TextField
        label="Synthetic draft note"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setSaved(false);
        }}
      />
      <input aria-label="Synthetic attachment" type="file" />
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {['prerequisite', 'fields', 'network', 'forbidden', 'success'].map((mode) => (
          <Button
            key={mode}
            disabled={request.isLoading}
            onClick={async () => {
              const result = await save(mode);
              if ('data' in result) setSaved(true);
            }}
          >
            Submit {mode}
          </Button>
        ))}
      </Stack>
      <HrSetupLink setup="templates" />
      <HrSetupRefresh
        refresh={async () => {
          setRefreshes((count) => count + 1);
          if (refreshFails) throw new Error('synthetic');
        }}
      />
      <Button onClick={() => setRefreshFails((previous) => !previous)}>
        Refresh mode: {refreshFails ? 'failure' : 'success'}
      </Button>
      <output>Refresh count: {refreshes}</output>
      <Button onClick={() => store.dispatch({ type: 'fixture/revoke' })}>
        Remove synthetic setup access
      </Button>
      <Button
        onClick={() =>
          requestNavigation(() => {
            setValue('');
            setSaved(false);
          })
        }
      >
        Discard synthetic form
      </Button>
      <Typography role="status">
        {saved ? 'Synthetic save confirmed' : 'Unsaved synthetic form'}
      </Typography>
      {confirmation}
    </Stack>
  );
}

const setup = window.location.pathname.includes('/payroll/');
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider theme={createTheme(defaultSettings)}>
      {setup ? (
        <Box sx={{ p: 2 }}>
          <h1>Synthetic Setup Destination</h1>
          <p>
            Return to the original form tab. Setup success or cancellation never submits that form.
          </p>
        </Box>
      ) : (
        <HrRecoveryProvider>
          <Form />
        </HrRecoveryProvider>
      )}
    </ThemeProvider>
  </Provider>
);
