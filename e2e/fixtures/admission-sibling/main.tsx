import 'simplebar-react/dist/simplebar.min.css';

import type { DuplicateMatch } from 'src/redux/student/admissions/admission-inquiries-api';

import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Snackbar } from 'src/components/snackbar';
import { Scrollbar } from 'src/components/scrollbar';
import { createTheme } from 'src/theme/create-theme';
import { FormSectionCard } from 'src/components/form-section-card';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { defaultSettings } from 'src/components/settings/config-settings';
import { Box, Stack, Button, TextField, Typography, CssBaseline } from '@mui/material';
import { AdmissionInquiryDuplicateMatches } from 'src/screens/student/admissions/admission-inquiry-duplicate-matches';

const params = new URLSearchParams(window.location.search);
const long = params.has('long');
const parentName = long
  ? 'QA Father With A Very Long Saved Family Name For Responsive Review'
  : 'QA Father';
const email = long
  ? 'qa.parent.with.a.long.contact.address.for.responsive.review@example.com'
  : 'qa.parent@example.com';
const match: DuplicateMatch = {
  applicantId: 'synthetic-child-1',
  familyId: 'synthetic-family-1',
  applicantName: long
    ? 'QA Existing Child With A Very Long Saved Applicant Name'
    : 'QA Existing Child',
  existingInquiryId: 'synthetic-inquiry-1',
  existingInquiryNumber: 'INQ-2026-000030',
  guardianPhone: '9876543210',
  guardianEmail: email,
  canLinkFamily: !params.has('denied'),
  matchByEmail: true,
  matchByMobile: !params.has('emailOnly'),
  parents: params.has('noParents')
    ? []
    : [
        {
          sourceApplicantId: 'synthetic-child-1',
          relationship: 'father',
          name: parentName,
          firstName: 'QA',
          email,
          mobile: '9876543210',
        },
        {
          sourceApplicantId: 'synthetic-child-1',
          relationship: 'mother',
          name: 'QA Mother',
          firstName: 'QA',
          mobile: '9876543210',
        },
      ],
};

function Workspace() {
  const { mode, setMode } = useColorScheme();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [links, setLinks] = useState(0);
  const [separate, setSeparate] = useState(0);
  const [opened, setOpened] = useState('');
  return (
    <Stack sx={{ height: '100dvh', minHeight: 0, bgcolor: 'background.default' }}>
      <Stack direction="row" alignItems="center" useFlexGap flexWrap="wrap" gap={1} sx={{ p: 2 }}>
        <Typography component="h1" variant="h6" sx={{ mr: 'auto' }}>
          New inquiry · Synthetic UI test
        </Typography>
        <Button size="small" onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
          Change theme
        </Button>
      </Stack>
      <Scrollbar fillContent sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
        <Stack spacing={2} sx={{ p: 2, minWidth: 0 }}>
          <FormSectionCard title="Family Contact">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              <TextField
                size="small"
                label="Parent or guardian name"
                value="QA Parent"
                slotProps={{ input: { readOnly: true } }}
              />
              <TextField
                size="small"
                label="Mobile number"
                value={params.has('emailOnly') ? '9876543211' : '9876543210'}
                slotProps={{ input: { readOnly: true } }}
              />
            </Box>
          </FormSectionCard>
          <AdmissionInquiryDuplicateMatches
            matches={
              params.has('multi')
                ? [
                    match,
                    {
                      ...match,
                      applicantId: 'synthetic-child-2',
                      familyId: 'synthetic-family-2',
                      applicantName: 'QA Second Candidate',
                    },
                  ]
                : [match]
            }
            guardianPhone={params.has('emailOnly') ? '9876543211' : '9876543210'}
            guardianEmail={email}
            busy={busy}
            overrideReason={reason}
            onOverrideReasonChange={setReason}
            onOpenExisting={setOpened}
            onCreateSeparate={() => setSeparate((value) => value + 1)}
            onUseExisting={async () => {
              setLinks((value) => value + 1);
              setBusy(true);
              // Keep the real confirmation busy long enough to inspect its locks, then
              // finish locally without a control hidden behind the modal backdrop.
              await new Promise<void>((resolve) => {
                setTimeout(resolve, 1500);
              });
              setBusy(false);
            }}
          />
        </Stack>
      </Scrollbar>
      <Stack
        component="footer"
        spacing={1}
        sx={{ p: 2, flexShrink: 0, borderTop: 1, borderColor: 'divider' }}
      >
        <Typography variant="caption">
          Synthetic callbacks only. No real inquiry or parent account is changed.
        </Typography>
        <Typography component="output" aria-label="Sibling confirmations">
          {links}
        </Typography>
        <Typography component="output" aria-label="Separate family submissions">
          {separate}
        </Typography>
        <Typography component="output" aria-label="Opened inquiry">
          {opened}
        </Typography>
      </Stack>
      <Snackbar />
    </Stack>
  );
}

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={createTheme(defaultSettings)} defaultMode="light">
    <CssBaseline />
    <Workspace />
  </ThemeProvider>
);
