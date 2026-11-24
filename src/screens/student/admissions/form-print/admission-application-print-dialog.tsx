import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { Stack, Button, Typography, CircularProgress } from '@mui/material';
import { useGetAdmissionApplicationFormQuery } from 'src/redux/student/admissions/admission-applications-api';

import { AdmissionQueryError } from '../admission-query-error';
import { getSavedRegistrationPrintMode } from './form-print-model';
import { AdmissionFormPrintWorkspace } from './admission-form-print-workspace';

export function AdmissionApplicationPrintDialog({
  applicationId,
  initialMode,
  currentStepId,
  onClose,
}: {
  applicationId: string;
  initialMode: 'auto' | 'blank' | 'filled';
  currentStepId?: string | null;
  onClose: () => void;
}) {
  // Refetch after Save and preview; never print a cached pre-save revision.
  const query = useGetAdmissionApplicationFormQuery(applicationId, {
    refetchOnMountOrArgChange: true,
  });
  // The hook can expose a settled cache entry before its mount refetch starts.
  const [cachedRequestId] = useState(() => (query.isFetching ? undefined : query.requestId));
  const awaitingFreshResult = cachedRequestId !== undefined && cachedRequestId === query.requestId;
  const form = query.currentData;
  const persistedValues = form?.persistedValues ?? [];
  const automaticMode = initialMode === 'auto';
  return (
    <CustomDialog
      open
      fullScreen
      hasForm={false}
      guardUnsavedChanges={false}
      title="Print Registration Form"
      handleClose={onClose}
      paperProps={{ sx: { borderRadius: 0, m: 0, height: '100dvh', backgroundImage: 'none' } }}
    >
      {query.isFetching || awaitingFreshResult ? (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 3 }} role="status">
          <CircularProgress size={22} />
          <Typography>Loading saved Registration form…</Typography>
        </Stack>
      ) : query.isError ? (
        <Stack sx={{ p: 2 }}>
          <AdmissionQueryError onRetry={query.refetch} />
        </Stack>
      ) : form ? (
        <AdmissionFormPrintWorkspace
          form={form.definition}
          settings={form.definition.printSettings}
          values={automaticMode ? persistedValues : (form.persistedValues ?? form.values)}
          inquiryContextSections={form.inquiryContextSections}
          inquiryContextValues={form.inquiryContextValues}
          initialMode={
            initialMode === 'auto' ? getSavedRegistrationPrintMode(persistedValues) : initialMode
          }
          currentStepId={currentStepId}
          academicYearId={form.academicYearId}
          registrationNumber={form.applicationNumber}
          academicDetails={form.printAcademicDetails}
          readOnly
        />
      ) : (
        <Typography sx={{ p: 3 }}>
          No saved Registration form is available for this application.
        </Typography>
      )}
      <Stack
        direction="row"
        sx={{
          px: 2,
          py: 1.5,
          borderTop: 1,
          borderColor: 'divider',
          flexShrink: 0,
          justifyContent: 'flex-end',
        }}
      >
        <Button
          size="small"
          variant="outlined"
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Close
        </Button>
      </Stack>
    </CustomDialog>
  );
}
