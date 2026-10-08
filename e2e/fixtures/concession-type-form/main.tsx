import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Button, CssBaseline, Dialog, Typography } from '@mui/material';

import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import ConcessionTypeForm from 'src/screens/finance/settings/ConcessionTypeSetting/Components/ConcessionTypeForm';
import ConcessionTypeVersionHistoryDrawer from 'src/screens/finance/settings/ConcessionTypeSetting/Components/ConcessionTypeVersionHistoryDrawer';

import 'simplebar-react/dist/simplebar.min.css';

const store = configureStore({
  reducer: {
    confirmPopup: confirmPopupReducer,
    globalState: () => ({ currentYear: { id: 'synthetic-year' } }),
  },
});

function Fixture() {
  const [open, setOpen] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [saved, setSaved] = React.useState('');
  React.useEffect(() => {
    const onSaved = (event: Event) =>
      setSaved(JSON.stringify((event as CustomEvent).detail.documents?.[0]?.acceptedFormats));
    window.addEventListener('fixture-saved', onSaved);
    return () => window.removeEventListener('fixture-saved', onSaved);
  }, []);
  const openState = {
    value: open,
    onTrue: () => setOpen(true),
    onFalse: () => setOpen(false),
    onToggle: () => setOpen((value) => !value),
  } as any;

  return (
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CssBaseline />
        <Box sx={{ p: 3 }}>
          <Typography variant="h5">Concession Type · synthetic unlocked document</Typography>
          <Button onClick={() => setOpen(true)}>Edit existing concession</Button>
          <Button onClick={() => setHistoryOpen(true)}>View legacy version history</Button>
          {saved && <Typography role="status">Saved formats: {saved}</Typography>}
          <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
            <Typography variant="h6" sx={{ p: 2 }}>
              Update Concession Type
            </Typography>
            {open && (
              <ConcessionTypeForm
                open={openState}
                editData={{ id: 'synthetic-concession', isUsedInDownstream: false }}
                onClose={() => setOpen(false)}
              />
            )}
          </Dialog>
          <ConcessionTypeVersionHistoryDrawer
            open={historyOpen}
            concessionTypeId="synthetic-concession"
            concessionTypeName="Synthetic sibling concession"
            onClose={() => setHistoryOpen(false)}
          />
        </Box>
      </ThemeProvider>
    </Provider>
  );
}

createRoot(document.getElementById('root')!).render(<Fixture />);
