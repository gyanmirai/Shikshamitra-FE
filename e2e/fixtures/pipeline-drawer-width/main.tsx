import 'simplebar-react/dist/simplebar.min.css';

import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createTheme } from 'src/theme/create-theme';
import { Scrollbar } from 'src/components/scrollbar';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { defaultSettings } from 'src/components/settings/config-settings';
import { AdmissionProfilePhotoField } from 'src/screens/student/admissions/admission-profile-photo-field';
import { AdmissionSectionFields } from 'src/screens/student/admissions/components/admission-section-fields';
import {
  Box,
  Stack,
  Paper,
  Button,
  Drawer,
  Checkbox,
  TextField,
  Typography,
  CssBaseline,
  FormControlLabel,
} from '@mui/material';

const stages = [
  'Entrance assessment',
  'Admission form',
  'Document verification',
  'Payment',
  'Admission finalization',
];
const fields = [
  { code: 'photo', fieldType: 0, validationJson: '{"format":"photo"}' },
  ...['First name', 'Middle name', 'Last name', 'Gender', 'Email'].map((code) => ({
    code,
    fieldType: 0,
  })),
];

function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <Button size="small" onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
      Change theme
    </Button>
  );
}

/** Real shared controls in the Pipeline body's flex/fieldset composition; no API or mutations. */
function Fixture() {
  const [focused, setFocused] = useState(false);
  const [stage, setStage] = useState('Admission form');
  const [busy, setBusy] = useState(false);
  return (
    <ThemeProvider theme={createTheme(defaultSettings)} defaultMode="light">
      <CssBaseline />
      <Drawer
        open
        anchor="right"
        slotProps={{
          paper: {
            role: 'dialog',
            'aria-label': 'Synthetic applicant',
            sx: {
              width: { xs: '100%', md: focused ? '100%' : '84vw' },
              maxWidth: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            },
          },
        }}
      >
        <Stack
          component="header"
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          sx={{ p: 2, flexShrink: 0 }}
        >
          <Typography variant="h6">Synthetic applicant · Layout test</Typography>
          <Button size="small" onClick={() => setFocused(!focused)}>
            {focused ? 'Exit focus mode' : 'Focus mode'}
          </Button>
          <ThemeToggle />
          <FormControlLabel
            control={
              <Checkbox size="small" checked={busy} onChange={(_, checked) => setBusy(checked)} />
            }
            label="Simulate saving"
          />
        </Stack>
        <Stack direction="row" spacing={1} sx={{ px: 2, flexShrink: 0, overflowX: 'auto' }}>
          {stages.map((name) => (
            <Button key={name} size="small" onClick={() => setStage(name)}>
              {name}
            </Button>
          ))}
        </Stack>
        <Scrollbar
          data-testid="drawer-scrollbar"
          fillContent
          sx={{ flex: '1 1 auto', minHeight: 0 }}
        >
          <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
              <FormBusyRegion fillContent busy={busy} showOverlay={false}>
                <Stack spacing={2} sx={{ flex: 1, minWidth: 0, p: 2 }}>
                  <Paper variant="outlined" data-testid="stage-panel" sx={{ p: 1.5 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {stage}
                    </Typography>
                    {stage === 'Admission form' ? (
                      <AdmissionSectionFields
                        fields={fields}
                        columns={2}
                        renderField={(field) =>
                          field.code === 'photo' ? (
                            <AdmissionProfilePhotoField
                              field={{ label: 'Student profile photo', required: false }}
                              value=""
                              disabled={busy}
                              onChange={() => {}}
                            />
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              label={field.code}
                              defaultValue={field.code === 'First name' ? 'Sample' : ''}
                            />
                          )
                        }
                      />
                    ) : (
                      <Typography>
                        Existing stage content remains within the shared drawer body.
                      </Typography>
                    )}
                  </Paper>
                  <Box sx={{ height: 120, flexShrink: 0 }}>
                    <Scrollbar
                      data-testid="nested-scrollbar"
                      sx={{ height: 120, flexGrow: 0 }}
                      slotProps={{ content: { display: 'block' } }}
                    >
                      <Paper variant="outlined" sx={{ width: 1500, p: 2 }}>
                        Wide embedded stage content
                      </Paper>
                    </Scrollbar>
                  </Box>
                  <Stack spacing={1}>
                    {Array.from({ length: 15 }, (_, index) => (
                      <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                        Saved detail {index + 1}
                      </Paper>
                    ))}
                  </Stack>
                  <Typography>End of stage details</Typography>
                </Stack>
              </FormBusyRegion>
            </Box>
          </Box>
        </Scrollbar>
        <Stack
          component="footer"
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          sx={{ p: 1.5, flexShrink: 0, borderTop: 1, borderColor: 'divider' }}
        >
          <Button size="small" variant="outlined" disabled={busy}>
            End journey
          </Button>
          <Button size="small" variant="contained" disabled={busy}>
            Continue admission
          </Button>
        </Stack>
      </Drawer>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(<Fixture />);
