import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { Box, CssBaseline, Typography } from '@mui/material';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { financePermissions } from 'src/constants/finance-menu';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import FeeCategoryTable from 'src/screens/finance/settings/FeeCategory/Components/FeeCategoryTable';
import FeeCategoryForm from 'src/screens/finance/settings/FeeCategory/Components/FeeCategoryForm';
import 'simplebar-react/dist/simplebar.min.css';
const dependencyMode = new URLSearchParams(window.location.search).has('dependencies');
const store = configureStore({
  reducer: {
    globalState: (state = { currentYear: { id: 'year' } }) => state,
    auth: (
      state = {
        permissions: Object.values(financePermissions.fees.settings.feeCategoryActions)
          .concat([
            `${financePermissions.fees.structureAssign}.View`,
            `${financePermissions.fees.settings.feeStructure}.View`,
          ])
          .map((name) => ({ name, isGranted: true })),
        permissionsInitialized: true,
        loading: false,
      }
    ) => state,
    confirmPopup: confirmPopupReducer,
  },
});
function Fixture() {
  const [count, setCount] = React.useState(0);
  const [editData, setEditData] = React.useState<any>(null);
  React.useEffect(() => {
    document.getElementById('fixture-loading')?.remove();
    const update = () => setCount((window as any).__feeHeadMutationCount);
    window.addEventListener('fixture-mutation', update);
    return () => window.removeEventListener('fixture-mutation', update);
  }, []);
  return (
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CssBaseline />
        <Box
          sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100dvh', minHeight: 0 }}
        >
          <Typography variant="h5">
            {dependencyMode ? 'Fee Head Dependency Checks' : 'Archived Fee Category'}
          </Typography>
          <Typography>
            Fixture status mutations: {count} · Synthetic data, no backend writes
          </Typography>
          <FeeCategoryTable
            archived={!dependencyMode}
            onAddFeeCategory={() => {}}
            setEditData={setEditData}
          />
          {editData && (
            <FeeCategoryForm
              open={{ value: true }}
              editData={editData}
              onClose={() => setEditData(null)}
            />
          )}
        </Box>
      </ThemeProvider>
    </Provider>
  );
}
createRoot(document.getElementById('root')!).render(<Fixture />);
