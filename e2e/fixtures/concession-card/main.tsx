import type { IConcessionRequestItem } from 'src/screens/finance/ConcessionAdmin/type';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { Box, Button, Stack, Typography, CssBaseline } from '@mui/material';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { financePermissions } from 'src/constants/finance-menu';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ConcessionItemCard from 'src/screens/finance/ConcessionAdmin/ConcessionItemCard';
import StudentInformationAccordion from 'src/screens/finance/ConcessionAdmin/StucentConcessionCard';
import 'simplebar-react/dist/simplebar.min.css';

const actions = financePermissions.fees.concessionActions;
const previewParams = new URLSearchParams(window.location.search);
const ownRequest = previewParams.get('own') === 'true';
const previewRole = previewParams.get('role') || 'staff';
function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <Button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
      Toggle preview theme
    </Button>
  );
}
const store = configureStore({
  reducer: {
    confirmPopup,
    auth: () => ({
      user: { sub: ownRequest ? 'maker' : 'checker', role: previewRole },
      permissions: [
        actions.edit,
        actions.approve,
        actions.reject,
        actions.delete,
        actions.viewDocument,
      ].map((name) => ({
        name,
        isGranted: true,
      })),
    }),
  },
});
const item: IConcessionRequestItem = {
  studentConcessionTypeRequestId: 'synthetic',
  concessionTypeId: 'sibling-tuition',
  concessionTypeName: 'Sibling Tuition Concession',
  status: 6,
  totalRequestedAmount: 275,
  totalAmount: 275,
  totalApprovedAmount: 0,
  totalReversedAmount: 0,
  netApprovedAmount: 0,
  feeHeads: [],
  requesterId: 'maker',
  submittedById: 'maker',
  createdAt: '2026-10-15T11:13:33Z',
  updatedAt: '2026-10-15T11:13:33Z',
  message: '',
  approvedAt: '',
  concurrencyStamp: 'synthetic-stamp',
  submittedDocuments: [],
  availableActions:
    ownRequest && previewRole === 'admin'
      ? ['edit', 'delete', 'approve', 'reject']
      : ['edit', 'delete'],
  requiredDocuments: [
    'Sibling Enrollment Certificate',
    'Additional Supporting Document With A Long Name To Verify Wrapping',
  ].map((documentName, n) => ({
    documentId: `doc-${n}`,
    documentName,
    isRequired: true,
    isUploaded: true,
    maxFileSizeBytes: 5 * 1024 * 1024,
    acceptedFormats: [],
    url: '/certificate.svg',
  })),
  timeline: [{ action: 'created', status: 6, occurredAt: '2026-10-15T11:13:33Z' }],
};
function Fixture() {
  const [lastAction, setLastAction] = React.useState('');
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  return (
    <Provider store={store}>
      <ThemeProvider
        theme={createTheme(defaultSettings)}
        defaultMode="light"
        modeStorageKey="concession-card-mode"
      >
        <CssBaseline />
        <Box sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'background.default', minHeight: '100dvh' }}>
          <Typography variant="body2" color="text.secondary" mb={1.5}>
            Student concession view · synthetic verification
          </Typography>
          <ThemeToggle />
          <StudentInformationAccordion
            student={{
              name: 'Aanya Example',
              grNumber: '10260',
              rollNo: '2',
              standardName: 'Class 1',
              divisionName: 'A',
              boardName: 'CBSE',
              educationMediumName: 'English',
            }}
          />
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            <ConcessionItemCard
              item={item}
              onEdit={() => setLastAction('Edit delegated')}
              onDelete={() => setDeleteOpen(true)}
              onOpenDocs={() => setLastAction('Document manager delegated')}
              onApprove={() =>
                setLastAction('Approval review opened for the administrator’s own request')
              }
              onReject={() =>
                setLastAction('Rejection review opened for the administrator’s own request')
              }
            />
            <ConcessionItemCard
              item={{
                ...item,
                studentConcessionTypeRequestId: 'synthetic-many',
                requiredDocuments: Array.from({ length: 8 }, (_, index) => ({
                  ...item.requiredDocuments![0],
                  documentId: `many-${index}`,
                  documentName: `Supporting certificate ${index + 1}`,
                })),
              }}
              onEdit={() => setLastAction('Edit delegated')}
              onDelete={() => setDeleteOpen(true)}
              onOpenDocs={() => setLastAction('Document manager delegated')}
              onApprove={() =>
                setLastAction('Approval review opened for the administrator’s own request')
              }
              onReject={() =>
                setLastAction('Rejection review opened for the administrator’s own request')
              }
            />
          </Box>
          <Typography role="status" sx={{ mt: 1 }}>
            {lastAction}
          </Typography>
          <ConfirmDialog
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            title="Delete"
            content="Delete this synthetic concession request?"
            action={
              <Button
                onClick={() => {
                  setDeleteOpen(false);
                  setLastAction('Delete confirmed');
                }}
              >
                Yes
              </Button>
            }
          />
        </Box>
      </ThemeProvider>
    </Provider>
  );
}
createRoot(document.getElementById('root')!).render(<Fixture />);
