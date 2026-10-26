import 'src/global.css';

import { useState } from 'react';
import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { useBoolean } from 'src/hooks/use-boolean';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { Box, Alert, Button, CssBaseline } from '@mui/material';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import authReducer, { setPermissions } from 'src/redux/auth/authSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import RoomForm from 'src/screens/setting/RoomManagement/RoomCreateManagement/components/AddRoomForm';

const store = configureStore({
  reducer: { auth: authReducer, confirmPopup, [api.reducerPath]: api.reducer },
  middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
});
store.dispatch(
  setPermissions(
    ['Add', 'View'].map((action) => ({
      name: `ShikshaMitra.Module.InstituteSetup.BuildingManagement.${action}`,
      isGranted: true,
    }))
  )
);

function Workspace() {
  const room = useBoolean();
  const [mode, setMode] = useState<'light' | 'dark'>(
    new URLSearchParams(window.location.search).get('theme') === 'dark' ? 'dark' : 'light'
  );
  return (
    <ThemeProvider
      theme={createTheme({ ...defaultSettings, colorScheme: mode })}
      defaultMode={mode}
      modeStorageKey={`room-capacity-${mode}`}
      key={mode}
    >
      <CssBaseline />
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Alert severity="info">
          Local test workspace. All buildings, floors, and room saves use synthetic data.
        </Alert>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={room.onTrue}>
            Add room
          </Button>
          <Button onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
            Use {mode === 'light' ? 'dark' : 'light'} theme
          </Button>
        </Box>
      </Box>
      {room.value && <RoomForm open={room} onClose={room.onFalse} />}
      <Toaster />
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <Workspace />
  </Provider>
);
