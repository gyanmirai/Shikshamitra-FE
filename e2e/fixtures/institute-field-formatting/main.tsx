import 'src/global.css';

import { useState } from 'react';
import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import auth, { setPermissions } from 'src/redux/auth/authSlice';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { defaultSettings } from 'src/components/settings/config-settings';
import { Box, Alert, Stack, Button, TextField, CssBaseline } from '@mui/material';
import { useInstituteFieldPreview } from 'src/components/institute-field-formatting/use-institute-field-preview';
import { InstituteFieldFormattingPopover } from 'src/components/institute-field-formatting/institute-field-formatting-popover';

const pages = [
  { scope: 'buildings', title: 'Buildings', field: 'buildingName' },
  { scope: 'roomTypes', title: 'Room Types', field: 'roomTypeName' },
  { scope: 'rooms', title: 'Rooms', field: 'roomName' },
  { scope: 'shifts', title: 'Shift Management', field: 'shiftName' },
  { scope: 'schoolIdentity', title: 'School Identity', field: 'principalName' },
  { scope: 'schoolDocuments', title: 'School Documents', field: 'name' },
] as const;
type Page = (typeof pages)[number];
const params = new URLSearchParams(window.location.search);
const store = configureStore({
  reducer: { auth, confirmPopup, [api.reducerPath]: api.reducer },
  middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
});
const permissions = [
  'ShikshaMitra.Module.InstituteSetup.BuildingManagement',
  'ShikshaMitra.Module.InstituteSetup.RoomTypeManagement',
  'ShikshaMitra.Module.InstituteSetup.RoomManagement.Room',
  'InstituteSetup.ShiftManagement',
  'InstituteSetup.SchoolIdentity',
  'InstituteSetup.SchoolDocuments',
].flatMap((prefix) =>
  [
    'View',
    ...(params.get('access') === 'view'
      ? []
      : ['Add', 'Edit', 'ManageDefaults', 'AccessSignature']),
  ].map((action) => ({ name: `${prefix}.${action}`, isGranted: true }))
);
store.dispatch(setPermissions(permissions));

function Entry({ page }: { page: Page }) {
  const [value, setValue] = useState('');
  const preview = useInstituteFieldPreview(page.scope, page.field, value);
  return (
    <TextField
      fullWidth
      size="small"
      label="New entry"
      value={value}
      helperText={preview}
      onChange={(event) => setValue(event.target.value)}
    />
  );
}
function Workspace() {
  const [selected, setSelected] = useState<Page>(
    pages.find((page) => page.scope === params.get('scope')) ?? pages[0]
  );
  const [mode, setMode] = useState<'light' | 'dark'>(
    params.get('theme') === 'dark' ? 'dark' : 'light'
  );
  return (
    <ThemeProvider
      key={mode}
      theme={createTheme({ ...defaultSettings, colorScheme: mode })}
      defaultMode={mode}
      modeStorageKey={`institute-formatting-${mode}`}
    >
      <CssBaseline />
      <Box sx={{ p: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Alert
          severity="info"
          action={
            <Button color="inherit" onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
              Use {mode === 'light' ? 'dark' : 'light'} theme
            </Button>
          }
        >
          Local test workspace. Settings use synthetic school data and in-memory storage.
        </Alert>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {pages.map((page) => (
            <Button
              key={page.scope}
              variant={selected.scope === page.scope ? 'contained' : 'outlined'}
              onClick={() => setSelected(page)}
            >
              {page.title}
            </Button>
          ))}
        </Stack>
        <CustomBreadcrumbs
          heading={selected.title}
          description="Configure the text case used for new entries."
          links={[{ name: 'Institute Setup' }, { name: selected.title }]}
          action={<InstituteFieldFormattingPopover key={selected.scope} scope={selected.scope} />}
        />
        <Box sx={{ maxWidth: 600, px: 1 }}>
          <Entry key={selected.scope} page={selected} />
        </Box>
      </Box>
      <Toaster />
    </ThemeProvider>
  );
}
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <Workspace />
  </Provider>
);
