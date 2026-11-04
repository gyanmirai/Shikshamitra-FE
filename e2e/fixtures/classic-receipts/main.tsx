import 'simplebar-react/dist/simplebar.min.css';

import React from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { Box, Stack, Button, Typography, CssBaseline } from '@mui/material';
import RefundReceiptDialog from 'src/screens/finance/feeRefund/Components/RefundReceiptDialog';
import ReceiptPreviewDialog from 'src/screens/finance/InvoiceAndReceipt/Components/ReceiptManagement/Components/ReceiptPreviewDialog';

import { api } from './mock-service';

const store = configureStore({ reducer: { [api.reducerPath]: api.reducer, confirmPopup },
  middleware: (getDefault) => getDefault({ serializableCheck: false }).concat(api.middleware) });

function Fixture() {
  const [selected, setSelected] = React.useState<string | null>(null);
  return <Box sx={{ p: 3 }}>
    <Typography variant="h4">Classic receipt validation</Typography>
    <Typography sx={{ mb: 2 }}>Synthetic data with production preview components. No financial writes.</Typography>
    <Stack direction="row" gap={1} flexWrap="wrap">
      {['Fee', 'Provisional fee', 'Charge', 'Combined', 'Refund', 'Provisional refund'].map((name) =>
        <Button key={name} variant="outlined" onClick={() => setSelected(name)}>{name}</Button>)}
    </Stack>
    {selected?.toLowerCase().includes('refund') ?
      <RefundReceiptDialog refundId={selected} provisional={selected === 'Provisional refund'} onClose={() => setSelected(null)} /> :
      selected ? <ReceiptPreviewDialog receiptId={selected} onClose={() => setSelected(null)} /> : null}
  </Box>;
}
createRoot(document.getElementById('root')!).render(<Provider store={store}>
  <ThemeProvider theme={createTheme(defaultSettings)}><CssBaseline/><Fixture/></ThemeProvider>
</Provider>);
