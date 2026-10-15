import dayjs from 'dayjs';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import CustomDialog from 'src/components/customDialog';
import { useGetClassQuery } from 'src/redux/class/classApi';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useGetDivisionQuery } from 'src/redux/division/divisionApi';
import { ClassForm } from 'src/components/academic-setup/class-setup';
import { DivisionForm } from 'src/components/academic-setup/division-setup';
import { defaultSettings } from 'src/components/settings/config-settings';
import { AcademicSetupContext } from 'src/components/academic-setup/academic-setup-context';
import { Box, Alert, Stack, Button, Typography, CssBaseline } from '@mui/material';

dayjs.extend(customParseFormat);
const { stageId } = await (await fetch('/fixture/context')).json();
const store = configureStore({
  reducer: { confirmPopup: () => ({ isChanges: false }), [api.reducerPath]: api.reducer },
  middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
});

function Workspace() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [onboarding, setOnboarding] = useState(false);
  const [dialog, setDialog] = useState('');
  const [editStandard, setEditStandard] = useState<null | {
    id: string;
    name: string;
    ageLowerLimit: number;
  }>(null);
  const [editDivision, setEditDivision] = useState<null | {
    id: string;
    name: string;
    strength: number;
  }>(null);
  const { data: standards } = useGetClassQuery(undefined);
  const { data: divisions } = useGetDivisionQuery(undefined);
  const stageStandards = (standards?.items ?? []).filter(
    (item: { educationMediumStageId: string }) => item.educationMediumStageId === stageId
  );
  const classOne = stageStandards.find((item: { name: string }) => item.name === 'Class 1');
  const close = () => {
    setDialog('');
    setEditStandard(null);
    setEditDivision(null);
  };
  const theme = createTheme({ ...defaultSettings, colorScheme: mode });
  return (
    <ThemeProvider
      theme={theme}
      defaultMode={mode}
      modeStorageKey={`academic-test-${mode}`}
      key={mode}
    >
      <CssBaseline />
      <AcademicSetupContext.Provider value={{ isOnboarding: onboarding }}>
        <Box sx={{ p: 2, maxWidth: 1000, mx: 'auto' }}>
          <Alert severity="info">
            Disposable regression fixture: production Academic Setup forms and real ABP API;
            synthetic authentication.
          </Alert>
          <Typography variant="h5" sx={{ my: 2 }}>
            Academic hierarchy: CBSE / English / Primary
          </Typography>
          <Stack spacing={1} direction="row" useFlexGap flexWrap="wrap">
            <Button
              onClick={() => {
                setOnboarding(false);
                setDialog('Add Standard');
              }}
            >
              Add Standard
            </Button>
            <Button
              onClick={() => {
                setOnboarding(true);
                setDialog('Onboarding Standard');
              }}
            >
              Onboarding Standard
            </Button>
            <Button
              onClick={() => {
                setOnboarding(false);
                setDialog('Add Division');
              }}
              disabled={!classOne}
            >
              Add Division
            </Button>
            <Button onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
              Toggle Theme
            </Button>
            <Button
              disabled={!classOne}
              onClick={() => {
                setOnboarding(true);
                setDialog('Onboarding Division');
              }}
            >
              Onboarding Division
            </Button>
          </Stack>
          <Typography variant="h6" sx={{ mt: 2 }}>
            Standards
          </Typography>
          {stageStandards.map((item: { id: string; name: string; ageLowerLimit: number }) => (
            <Stack key={item.id} direction="row" spacing={2} alignItems="center">
              <Typography>{item.name}</Typography>
              <Button
                onClick={() => {
                  setEditStandard(item);
                  setOnboarding(false);
                  setDialog('Edit Standard');
                }}
              >
                Edit {item.name}
              </Button>
            </Stack>
          ))}
          <Typography variant="h6" sx={{ mt: 2 }}>
            Class 1 divisions
          </Typography>
          {(divisions?.items ?? []).map(
            (item: { id: string; name: string; strength: number; roomNumber?: string }) => (
              <Stack key={item.id} direction="row" spacing={2} alignItems="center">
                <Typography>
                  {item.name}: {item.strength} seats; saved room: {item.roomNumber || 'unassigned'}
                </Typography>
                <Button
                  onClick={() => {
                    setEditDivision(item);
                    setOnboarding(false);
                    setDialog('Edit Division');
                  }}
                >
                  Edit Division {item.name}
                </Button>
                <Button
                  onClick={() => {
                    setEditDivision(item);
                    setOnboarding(true);
                    setDialog('Onboarding Edit Division');
                  }}
                >
                  Onboarding Edit Division {item.name}
                </Button>
              </Stack>
            )
          )}
          <CustomDialog title={dialog} open={Boolean(dialog)} handleClose={close}>
            {dialog.includes('Standard') ? (
              <ClassForm
                key={dialog + (editStandard?.id ?? '')}
                handleClose={close}
                editData={editStandard}
                organizationId={stageId}
                existingStandards={stageStandards}
              />
            ) : dialog.includes('Division') && classOne ? (
              <DivisionForm
                key={dialog + (editDivision?.id ?? '')}
                handleClose={close}
                editData={editDivision}
                classId={classOne.id}
                existingDivisions={(divisions?.items ?? []).filter(
                  (item: { standardId: string }) => item.standardId === classOne.id
                )}
              />
            ) : null}
          </CustomDialog>
        </Box>
      </AcademicSetupContext.Provider>
      <Toaster />
    </ThemeProvider>
  );
}
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <Workspace />
  </Provider>
);
