import 'src/global.css';

import { useState } from 'react';
import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import auth from 'src/redux/auth/authSlice';
import CustomDialog from 'src/components/customDialog';
import { Box, Alert, Button, CssBaseline, Typography } from '@mui/material';
import globalState from 'src/redux/globalState/globalSlice';
import TimetableBoard from 'src/components/timetable/TimetableBoard';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetDivisionByIdQuery } from 'src/redux/division/divisionApi';
import { defaultSettings } from 'src/components/settings/config-settings';
import { DivisionManagementForm } from 'src/components/academic-setup/division-management-form';

import { rooms, divisionId, standardId } from './mock-server';
import { pt, makeSlots } from './data';

const store = configureStore({
  reducer: { auth, globalState, confirmPopup, [api.reducerPath]: api.reducer },
  middleware: (defaults) => defaults().concat(api.middleware),
});
setupListeners(store.dispatch);

function Workspace() {
  const [slots, setSlots] = useState(makeSlots);
  const [edit, setEdit] = useState(false);
  const [open, setOpen] = useState(true);
  const division = useGetDivisionByIdQuery(divisionId);
  const currentRoom = rooms.find((room) => room.id === division.currentData?.roomId)?.roomName;
  const theme =
    new URLSearchParams(window.location.search).get('theme') === 'dark' ? 'dark' : 'light';
  const schedule = () =>
    setSlots((current) => {
      const index = current.MONDAY.findIndex((slot) => !slot.subjects?.length);
      if (index < 0) return current;
      return {
        ...current,
        MONDAY: current.MONDAY.map((slot, i) =>
          i === index ? { ...slot, subjects: [pt], subjectId: pt.subjectId } : slot
        ),
      };
    });
  return (
    <ThemeProvider
      theme={createTheme({ ...defaultSettings, colorScheme: theme })}
      defaultMode={theme}
      modeStorageKey={`room-sync-${theme}`}
    >
      <CssBaseline />
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Alert severity="info">
          Local regression workspace with synthetic data. Uses the production division form, API
          clients and timetable board.
        </Alert>
        <Typography variant="h5">Class 5 / Division A</Typography>
        <Typography>
          Division home room: {division.isFetching ? 'Loading' : currentRoom || 'None'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={() => setEdit(true)}>
            Edit Division A
          </Button>
          <Button onClick={schedule}>Schedule Pt in next empty slot</Button>
          <Button onClick={() => setOpen(!open)}>
            {open ? 'Close timetable' : 'Open timetable'}
          </Button>
        </Box>
        {open && (
          <Box data-testid="board" sx={{ height: 520 }}>
            <TimetableBoard
              slots={slots}
              onChange={setSlots}
              subjects={[pt]}
              selectedClass="5"
              selectedDivision="A"
              standardId={standardId}
              divisionId={divisionId}
            />
          </Box>
        )}
        <Box component="table" aria-label="Draft room assignments" sx={{ textAlign: 'left' }}>
          <thead>
            <tr>
              <th>Monday</th>
              <th>Subject</th>
              <th>Room</th>
            </tr>
          </thead>
          <tbody>
            {slots.MONDAY.map((slot) => (
              <tr key={slot.id}>
                <td>{slot.startTime}</td>
                <td>{slot.subjects?.map((s) => s.name).join(' | ') || 'Empty'}</td>
                <td>
                  {slot.subjects?.map((s) => s.roomName || 'Unassigned').join(' | ') ||
                    'Unassigned'}
                </td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
      {edit && division.data && (
        <CustomDialog title="Edit Division A" open handleClose={() => setEdit(false)} maxWidth="sm">
          <DivisionManagementForm
            classId={standardId}
            editData={division.data}
            handleClose={() => setEdit(false)}
          />
        </CustomDialog>
      )}
      <Toaster />
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <Workspace />
  </Provider>
);
