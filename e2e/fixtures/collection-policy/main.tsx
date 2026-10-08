import 'simplebar-react/dist/simplebar.min.css';
import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { Box, Stack, Button, Typography, CssBaseline } from '@mui/material';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import CollectionPolicyDrawer from 'src/screens/finance/policies/components/CollectionPolicyDrawer';
import CollectionLateFeeSection from 'src/screens/finance/policies/components/collection/CollectionLateFeeSection';
import CollectionSummaryPanel from 'src/screens/finance/policies/components/collection/CollectionSummaryPanel';
import { useCollectionPolicyForm } from 'src/screens/finance/policies/hooks/useCollectionPolicyForm';
const store = configureStore({
  reducer: { globalState: () => ({ currentYear: { id: 'synthetic-year', name: '2026–27' } }) },
});
const saved = {
  id: 'saved-policy',
  policyName: 'Saved collection policy',
  description: 'Saved description',
  status: 'Draft',
  gracePeriodDays: 22,
  enableLateFee: true,
  lateFeeApplyOnFeeHeads: ['tuition'],
  lateFeeType: 'Flat',
  flatAmount: 50,
} as any;
function Preview() {
  const form = useCollectionPolicyForm({
    open: true,
    onClose: () => {},
    academicYearId: 'synthetic-year',
  });
  return (
    <Stack direction="row" sx={{ minHeight: 700 }}>
      <Box sx={{ flex: 1, minWidth: 0, p: 2 }}>
        <CollectionLateFeeSection {...form} />
      </Box>
      <CollectionSummaryPanel {...form} />
    </Stack>
  );
}
function Fixture() {
  const { setMode } = useColorScheme();
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [preview, setPreview] = useState(false);
  return (
    <Box sx={{ p: 2 }}>
      <Typography>Collection policy regression · synthetic data · no backend writes</Typography>
      <Stack direction="row" spacing={1} sx={{ my: 2 }}>
        <Button onClick={() => setMode('light')}>Light theme</Button>
        <Button onClick={() => setMode('dark')}>Dark theme</Button>
        <Button
          onClick={() => {
            setEditData(null);
            setOpen(true);
          }}
        >
          Create collection policy
        </Button>
        <Button
          onClick={() => {
            setEditData(saved);
            setOpen(true);
          }}
        >
          Edit saved policy
        </Button>
        <Button
          onClick={() => {
            setEditData({ ...saved, id: undefined, policyName: 'Saved collection policy copy' });
            setOpen(true);
          }}
        >
          Duplicate policy
        </Button>
        <Button onClick={() => setPreview(!preview)}>Toggle simulation fixture</Button>
      </Stack>
      {preview && <Preview />}
      <CollectionPolicyDrawer
        open={open}
        onClose={() => setOpen(false)}
        editData={editData}
        academicYearId="synthetic-year"
      />
    </Box>
  );
}
createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={createTheme(defaultSettings)}>
    <CssBaseline />
    <Provider store={store}>
      <Fixture />
    </Provider>
  </ThemeProvider>
);
