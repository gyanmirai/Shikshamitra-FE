import React from 'react';
import { createRoot } from 'react-dom/client';
import { Box, Stack, Button, Typography, CssBaseline, Alert } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import ConcessionRequestForm from 'src/screens/finance/Concession/Components/ConcessionRequestForm';
import ReasonApprovalForm from 'src/screens/finance/Concession/Components/ConcessionRequestApprove';
import ReadOnlyConcessionApprovalView from 'src/screens/finance/ConcessionAdmin/ReadOnlyConcessionApprovalView';
import { configure, commands, scenarios, isNewFormScenario, type Scenario } from './mock-api';

function Fixture() {
  const [mode, setMode] = React.useState<Scenario>('valid');
  const [revision, setRevision] = React.useState(0);
  const [outcome, setOutcome] = React.useState('');
  const [lastCommands, setLastCommands] = React.useState('');
  React.useEffect(() => {
    const listener = () => setLastCommands(JSON.stringify(commands, null, 2));
    window.addEventListener('fixture-command', listener);
    return () => window.removeEventListener('fixture-command', listener);
  }, []);
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 1, sm: 2 },
        gap: 1,
        overflowX: 'hidden',
      }}
    >
      <Typography variant="h6">Local concession update regression</Typography>
      <Typography variant="body2">
        Production form with synthetic data and mocked APIs. No live financial records are changed.
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        aria-label="Regression scenarios"
        sx={{
          maxHeight: { xs: 144, sm: 'none' },
          overflowY: 'auto',
          flexShrink: 0,
          alignContent: 'flex-start',
        }}
      >
        {scenarios.map((value) => (
          <Button
            size="small"
            key={value}
            variant={mode === value ? 'contained' : 'outlined'}
            onClick={() => {
              configure(value);
              setMode(value);
              setRevision((n) => n + 1);
              setOutcome('');
              setLastCommands('');
            }}
          >
            {value}
          </Button>
        ))}
      </Stack>
      {['approved-benefit', 'partial-benefit', 'approval-duplicate', 'reject-duplicate'].includes(
        mode
      ) && (
        <Typography variant="body2">
          Synthetic history: ₹200 already approved for School concession in 2026–2027. Proposed new
          or pending request: ₹1,000 for the same student, year and type.
        </Typography>
      )}
      {mode === 'pending-benefit' && (
        <Typography variant="body2">
          Synthetic history: another School concession request is Pending in this academic year.
        </Typography>
      )}
      {mode === 'self-request' && (
        <Typography variant="body2">
          Synthetic context excludes the currently edited request ID; no other Pending or Approved
          benefit exists.
        </Typography>
      )}
      {mode === 'policy-bypass' && (
        <Typography variant="body2">
          Synthetic history: ₹200 is already approved for School concession in 2026–2027. Choosing
          either policy or policy version must keep that type blocked.
        </Typography>
      )}
      {[
        'rejected-history',
        'cancelled-history',
        'reversed-history',
        'other-year',
        'other-type',
      ].includes(mode) && (
        <Typography variant="body2">
          History does not block School concession in this academic year. Select both eligible fees
          to request ₹1,000, or save a draft.
        </Typography>
      )}
      {outcome && <Alert severity="success">{outcome}</Alert>}
      <Box
        sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, minWidth: 0 }}
      >
        <Box
          sx={{
            flex: { md: 1 },
            width: '100%',
            minWidth: 0,
            height: { xs: '75vh', md: '80vh' },
            minHeight: { xs: 600, md: 640 },
          }}
        >
          {mode.startsWith('approval-') ? (
            <ReadOnlyConcessionApprovalView
              key={revision}
              mode="Approve"
              selectedItem={
                {
                  studentConcessionTypeRequestId: 'pending-1000',
                  concessionTypeName: 'School concession',
                } as any
              }
              onBack={() =>
                setOutcome(
                  commands.some((command) => command.action === 'approve')
                    ? 'Concession approved.'
                    : 'Returned to request actions. Reject and Cancel remain available.'
                )
              }
            />
          ) : mode === 'reject-duplicate' ? (
            <ReasonApprovalForm
              key={revision}
              mode="Reject"
              selectedConcession={
                {
                  studentConcessionTypeRequestId: 'pending-1000',
                  concurrencyStamp: 'pending-stamp',
                } as any
              }
              onClose={(_event, saved) => {
                if (saved)
                  setOutcome(
                    'Pending request rejected; the existing approved benefit remains unchanged.'
                  );
              }}
            />
          ) : (
            <ConcessionRequestForm
              key={revision}
              open
              student={
                {
                  studentId: 'student',
                  studentName: 'Synthetic student',
                  concessionTypeId: 'type',
                } as any
              }
              defaultBoardId="board"
              defaultMediumId="medium"
              defaultStandardId="class"
              defaultDivisionId="division"
              editData={isNewFormScenario(mode) ? undefined : ({ id: 'request' } as any)}
              onClose={(_event, saved) => {
                if (saved)
                  setOutcome(
                    commands.some((command) => ['submit', 'create-submit'].includes(command.action))
                      ? 'Concession submitted. Fixed concession: ₹1,000.'
                      : 'Concession draft saved.'
                  );
              }}
            />
          )}
        </Box>
        <Box
          component="pre"
          aria-label="Recorded API commands"
          sx={{
            width: { xs: '100%', md: 280 },
            flexShrink: 0,
            maxHeight: { xs: 260, md: '80vh' },
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
            m: 0,
            fontSize: 11,
          }}
        >
          {lastCommands || 'No command sent.'}
        </Box>
      </Box>
    </Box>
  );
}
createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={createTheme(defaultSettings)}>
    <CssBaseline />
    <Fixture />
  </ThemeProvider>
);
