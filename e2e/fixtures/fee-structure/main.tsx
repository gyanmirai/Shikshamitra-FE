import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { CssBaseline, Box, Alert, Typography, Button } from '@mui/material';
import { Toaster } from 'sonner';
import { LocalizationProvider } from 'src/components/Localization-provider/localization-provider';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import FeeStructureWorkspaceCard from 'src/screens/finance/settings/FeeStructure/Components/FeeStructureWorkspaceCard';
import FeeStructureWorkspaceDialog from 'src/screens/finance/settings/FeeStructure/Components/FeeStructureWorkspaceDialog';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { financePermissions } from 'src/constants/finance-menu';
import 'simplebar-react/dist/simplebar.min.css';
import { readyFixture, pinnedPolicyFixture, incompleteHeadsFixture } from './mock-api';

const store = configureStore({
  reducer: {
    confirmPopup: confirmPopupReducer,
    auth: (
      state = {
        permissions: [
          { name: financePermissions.fees.settings.feeStructureActions.create, isGranted: true },
        ],
      }
    ) => state,
  },
});
function ThemeControls() {
  const { setMode } = useColorScheme();
  return (
    <Box sx={{ display: 'inline-flex', gap: 1 }}>
      <Button size="small" onClick={() => setMode('light')}>
        Light theme
      </Button>
      <Button size="small" onClick={() => setMode('dark')}>
        Dark theme
      </Button>
    </Box>
  );
}
function Fixture() {
  const [configured, setConfigured] = React.useState(false);
  const [pinned, setPinned] = React.useState(false);
  const [incomplete, setIncomplete] = React.useState(false);
  const [workspace, setWorkspace] = React.useState(false);
  return (
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <LocalizationProvider>
          <CssBaseline />
          <Box
            sx={{
              bgcolor: 'background.neutral',
              height: '100dvh',
              display: 'flex',
              overflow: 'hidden',
              p: { xs: 1, md: 2 },
            }}
          >
            <Box
              sx={{
                maxWidth: 1450,
                mx: 'auto',
                width: 1,
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Alert
                severity="info"
                sx={{ mb: 1, flexShrink: 0, display: { xs: 'none', md: 'flex' } }}
              >
                Component verification fixture · synthetic school data · no backend or financial
                transactions
              </Alert>
              <Typography variant="h5" sx={{ mb: 0.5, flexShrink: 0 }}>
                Manage Fee Structure
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, flexShrink: 0 }}>
                Synthetic data · no financial transactions · Class 5 · Primary · CBSE / English ·
                2026–27
              </Typography>
              <Box component="details" sx={{ mb: 1, flexShrink: 0 }}>
                <Typography component="summary" variant="caption" sx={{ cursor: 'pointer' }}>
                  Fixture controls
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                    flexShrink: 0,
                  }}
                >
                  <Button
                    size="small"
                    onClick={() => {
                      setConfigured(!configured);
                      setPinned(false);
                      setIncomplete(false);
                    }}
                  >
                    {configured ? 'Load empty draft fixture' : 'Load configured draft fixture'}
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setConfigured(true);
                      setPinned(true);
                      setIncomplete(false);
                    }}
                  >
                    Load saved policy overrides fixture
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setConfigured(true);
                      setPinned(false);
                      setIncomplete(true);
                      setWorkspace(false);
                    }}
                  >
                    Load incomplete fee heads fixture
                  </Button>
                  <ThemeControls />
                  <Button size="small" onClick={() => setWorkspace(!workspace)}>
                    {workspace ? 'Show component fixture' : 'Open full-screen workspace'}
                  </Button>
                </Box>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                {workspace ? (
                  <FeeStructureWorkspaceDialog
                    editData={{
                      id: 'metadata',
                      name: 'Main fee structure',
                      academicYearName: '2026–27',
                      boardName: 'CBSE',
                      mediumName: 'English',
                      feeStructureClasses: {},
                      classes: [
                        { id: 'class', name: 'Class 5' },
                        { id: 'other', name: 'Class 6' },
                        ...Array.from({ length: 6 }, (_, i) => ({
                          id: `class-${i + 7}`,
                          name: `Class ${i + 7}`,
                        })),
                      ],
                    }}
                    onClose={() => setWorkspace(false)}
                  />
                ) : (
                  <FeeStructureWorkspaceCard
                    key={`${configured}-${pinned}-${incomplete}`}
                    index={0}
                    initialData={{
                      name: '',
                      classId: 'class',
                      feeStructureMetaDataId: 'metadata',
                      feeHeads: [],
                      status: 1,
                      record: configured
                        ? incomplete
                          ? incompleteHeadsFixture
                          : pinned
                            ? pinnedPolicyFixture
                            : readyFixture
                        : undefined,
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
          <Toaster />
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
}
createRoot(document.getElementById('root')!).render(<Fixture />);
