import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import GlobalAcademicSearch from 'src/layouts/components/global-academic-search';
import { Box, Alert, Stack, Button, Typography, CssBaseline } from '@mui/material';
import globalReducer, {
  setCurrentYear,
  setCurrentBoard,
  setCurrentMedium,
} from 'src/redux/globalState/globalSlice';

import { FixtureThemeToggle } from './theme-toggle';
import { years, boards, fixtureState, installFixture } from './mock-api';

installFixture();
const initial = { currentYear: years[0], currentBoard: {}, currentMedium: {} };
const saved = localStorage.getItem('academic-context-fixture');
const store = configureStore({
  reducer: { globalState: globalReducer, [api.reducerPath]: api.reducer },
  preloadedState: { globalState: saved ? JSON.parse(saved) : initial },
  middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
});
store.subscribe(() =>
  localStorage.setItem('academic-context-fixture', JSON.stringify(store.getState().globalState))
);

function setScenario(name: string) {
  store.dispatch(setCurrentYear(name === 'empty' ? {} : name === 'complete' ? years[1] : years[0]));
  store.dispatch(
    setCurrentBoard(
      name === 'complete'
        ? boards[1]
        : name === 'stale'
          ? { id: 'deleted', name: 'Stale Board' }
          : {}
    )
  );
  store.dispatch(
    setCurrentMedium(
      name === 'complete'
        ? boards[1].educationMediums[0]
        : name === 'stale'
          ? { id: 'deleted', name: 'Stale Medium' }
          : {}
    )
  );
}

function App() {
  const theme = createTheme(defaultSettings);
  const go = (pathname: string) => {
    window.history.pushState({}, '', pathname);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme} defaultMode="light" storageManager={null} forceThemeRerender>
        <CssBaseline />
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1440, mx: 'auto' }}>
          <Alert severity="info">
            Synthetic academic context regression. Production selector, Redux and API hooks; fixture
            session and API data. No live school records.
          </Alert>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ my: 2 }}>
            <Button onClick={() => setScenario('partial')}>Partial context</Button>
            <Button onClick={() => setScenario('complete')}>Complete context</Button>
            <Button onClick={() => setScenario('empty')}>Empty context</Button>
            <Button onClick={() => setScenario('stale')}>Stale context</Button>
            <Button
              onClick={() => {
                fixtureState.restricted = true;
                store.dispatch(api.util.resetApiState());
              }}
            >
              Restrict scope
            </Button>
            <Button
              onClick={() => {
                fixtureState.scopeFailure = true;
                store.dispatch(api.util.resetApiState());
              }}
            >
              Fail scope
            </Button>
            <Button onClick={() => go('/student/dashboard')}>Student year selector</Button>
            <Button onClick={() => go('/academic/curriculumSubjects')}>
              Academic context selector
            </Button>
            <FixtureThemeToggle />
          </Stack>
          <Box component="header" sx={{ display: 'flex', justifyContent: 'flex-end', py: 2 }}>
            <GlobalAcademicSearch />
          </Box>
          <Typography variant="h5">Academic context regression</Typography>
          <Typography>Choose a context in the header to inspect its confirmation.</Typography>
        </Box>
        <Toaster />
      </ThemeProvider>
    </Provider>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
