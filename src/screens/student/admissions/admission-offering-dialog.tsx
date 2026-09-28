'use client';

import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type {
  AdmissionOffering,
  AdmissionOfferingWriteInput,
} from 'src/redux/student/admissions/admission-offerings-api';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { LoadingButton } from 'src/components/loading-button';
import {
  Box,
  Link,
  Alert,
  Stack,
  Drawer,
  Button,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';

import { AdmissionDialogTitle } from './admission-dialog-title';
import { useAdmissionOfferingForm } from './use-admission-offering-form';
import { AdmissionOfferingReadiness } from './admission-offering-readiness';
import { AdmissionOfferingEditDrawer } from './admission-offering-edit-drawer';
import { AdmissionOfferingCycleContext } from './admission-offering-cycle-context';
import { AdmissionOfferingWindowFields } from './admission-offering-window-fields';
import { AdmissionOfferingHierarchyFields } from './admission-offering-hierarchy-fields';
import { AdmissionOfferingConfigurationFields } from './admission-offering-configuration-fields';

type Props = {
  open: boolean;
  onClose: () => void;
  cycle: AdmissionCycle;
  cycles: AdmissionCycle[];
  mode?: 'create' | 'edit' | 'clone';
  offering?: AdmissionOffering | null;
  saving: boolean;
  onSave: (values: AdmissionOfferingWriteInput, admissionCycleId: string) => Promise<void>;
};

export function AdmissionOfferingDialog(props: Props) {
  const { open, onClose, cycle, cycles, mode = 'create', offering, saving, onSave } = props;

  if (mode === 'edit' && offering) {
    return (
      <AdmissionOfferingEditDrawer
        open={open}
        cycle={cycle}
        offering={offering}
        saving={saving}
        onClose={onClose}
        onSave={onSave}
      />
    );
  }

  return (
    <AdmissionOfferingLegacyDialog
      open={open}
      onClose={onClose}
      cycle={cycle}
      cycles={cycles}
      mode={mode}
      offering={offering}
      saving={saving}
      onSave={onSave}
    />
  );
}

function AdmissionOfferingLegacyDialog({
  open,
  onClose,
  cycle,
  cycles,
  mode = 'create',
  offering,
  saving,
  onSave,
}: Props) {
  const [targetCycleId, setTargetCycleId] = useState(cycle.id);
  const targetCycle =
    mode === 'clone' ? (cycles.find((item) => item.id === targetCycleId) ?? cycle) : cycle;
  const form = useAdmissionOfferingForm({ open, cycle: targetCycle, mode, offering, onSave });
  const closeDialog = () => {
    form.formik.resetForm();
    form.clearReadiness();
    onClose();
  };
  const cancelDialog = () => {
    if (
      form.formik.dirty &&
      !window.confirm('You have unsaved changes. Do you want to discard them?')
    )
      return;
    closeDialog();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={saving || form.validating ? undefined : cancelDialog}
      PaperProps={{
        sx: {
          width: { xs: 1, sm: 760 },
          maxWidth: 1,
          height: '100dvh',
          display: 'flex',
          overflow: 'hidden',
        },
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography id="admission-offering-drawer-title" variant="h6" component="div">
            <AdmissionDialogTitle
              title={mode === 'clone' ? 'Clone Admission Offering' : 'Add Admission Offering'}
              helpText="An offering connects a class and admission track to its entry mode, workflow, and forms."
              helpLabel="Admission offering information"
            />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure the class, admission track, entry mode, dates, workflow, and published forms.
          </Typography>
        </Box>
        <IconButton
          aria-label="Close admission offering"
          disabled={saving || form.validating}
          onClick={cancelDialog}
        >
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>
      <Divider />

      <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2 }}>
        {mode === 'clone' && (
          <CustomSelect
            options={cycles}
            label="Target admission cycle *"
            labelKey="name"
            valueKey="id"
            value={targetCycle.id}
            onChange={(value) => {
              setTargetCycleId(String(value));
              form.formik.setValues({
                ...form.formik.values,
                campusId: null,
                boardId: '',
                mediumId: '',
                stageId: '',
                standardId: '',
              });
              form.clearReadiness();
            }}
            helperText="Choose the cycle that should receive the cloned intake."
          />
        )}
        <AdmissionOfferingCycleContext cycle={targetCycle} />
        <Box component="p" sx={{ m: 0, typography: 'body2', color: 'text.secondary' }}>
          Connect this class and admission track to the dates, workflow, and forms used for new
          inquiries or direct registrations.
        </Box>
        {form.queryFailed && (
          <Alert severity="error">
            Some academic or admission configuration options could not be loaded. Retry before
            saving.
          </Alert>
        )}
        {form.hierarchyEmpty && (
          <Alert severity="warning">
            No academic hierarchy is configured for this academic year. Configure the board, medium,
            stage, and standards in Institute Setup before creating an offering.{' '}
            <Link href="/setting/academic-setup/" underline="hover">
              Open Institute Setup
            </Link>
          </Alert>
        )}
        {mode === 'clone' && (
          <Alert severity="info">
            Select a valid academic identity for the target cycle. The source offering&apos;s dates,
            workflow, forms, and code will be copied and revalidated by the server. Applications are
            never copied.
          </Alert>
        )}
        <AdmissionOfferingHierarchyFields
          formik={form.formik}
          hierarchy={form.hierarchy}
          standards={form.standards}
          hierarchyLoading={form.hierarchyLoading}
          standardsLoading={form.standardsLoading}
          identityLocked={false}
          initialCampus={
            offering?.campusId && offering.campusName
              ? {
                  id: offering.campusId,
                  name: offering.campusName,
                  code: '',
                  isActive: true,
                }
              : null
          }
        />
        {mode !== 'clone' && (
          <>
            <Divider />
            <AdmissionOfferingWindowFields formik={form.formik} cycle={targetCycle} />
            <Divider />
            <AdmissionOfferingConfigurationFields
              formik={form.formik}
              fetchWorkflows={form.fetchWorkflows}
              fetchInquiryForms={form.fetchInquiryForms}
              fetchRegistrationForms={form.fetchRegistrationForms}
            />
          </>
        )}
        <AdmissionOfferingReadiness result={form.readiness} />
      </Stack>
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1}
        sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
      >
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={cancelDialog}
          disabled={saving || form.validating}
        >
          Cancel
        </Button>
        <LoadingButton
          variant="outlined"
          size="small"
          startIcon={<Iconify icon="mdi:content-save-outline" />}
          loading={
            form.submitIntent === 'inactive' &&
            (saving || form.validating || form.formik.isSubmitting)
          }
          disabled={form.queryFailed || form.hierarchyEmpty || Boolean(form.submitIntent)}
          onClick={() => form.submitWithActiveState(false)}
        >
          {mode === 'clone' ? 'Clone as inactive' : 'Save as inactive'}
        </LoadingButton>
        <LoadingButton
          variant="contained"
          size="small"
          startIcon={<Iconify icon="mdi:check-decagram-outline" />}
          loading={
            form.submitIntent === 'activate' &&
            (saving || form.validating || form.formik.isSubmitting)
          }
          disabled={form.queryFailed || form.hierarchyEmpty || Boolean(form.submitIntent)}
          onClick={() => form.submitWithActiveState(true)}
        >
          {mode === 'clone' ? 'Clone and activate' : 'Validate and activate'}
        </LoadingButton>
      </Stack>
    </Drawer>
  );
}
