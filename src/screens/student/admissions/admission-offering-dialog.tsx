'use client';

import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type {
  AdmissionOffering,
  AdmissionOfferingWriteInput,
} from 'src/redux/student/admissions/admission-offerings-api';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Alert, Button, Divider, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { useAdmissionOfferingForm } from './use-admission-offering-form';
import { AdmissionOfferingReadiness } from './admission-offering-readiness';
import { AdmissionOfferingWindowFields } from './admission-offering-window-fields';
import { AdmissionOfferingHierarchyFields } from './admission-offering-hierarchy-fields';
import { AdmissionOfferingConfigurationFields } from './admission-offering-configuration-fields';

type Props = {
  open: boolean;
  onClose: () => void;
  cycle: AdmissionCycle;
  mode?: 'create' | 'edit' | 'clone';
  offering?: AdmissionOffering | null;
  saving: boolean;
  onSave: (values: AdmissionOfferingWriteInput) => Promise<void>;
};

export function AdmissionOfferingDialog({
  open,
  onClose,
  cycle,
  mode = 'create',
  offering,
  saving,
  onSave,
}: Props) {
  const form = useAdmissionOfferingForm({ open, cycle, mode, offering, onSave });
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
    <CustomDialog
      open={open}
      handleClose={closeDialog}
      maxWidth="md"
      title={
        <Box component="span" display="flex" alignItems="center" gap={1}>
          {mode === 'clone'
            ? 'Clone Admission Offering'
            : offering
              ? 'Edit Admission Offering'
              : 'Add Admission Offering'}
          <CustomTooltip
            arrow
            title="An offering connects one cycle and academic standard to the workflow and forms used for new admissions."
          >
            <Iconify icon={GlobalIcons.info} color="info.main" />
          </CustomTooltip>
        </Box>
      }
    >
      <DialogScrollContent dividers sx={{ display: 'grid', gap: 2 }}>
        {form.queryFailed && (
          <Alert severity="error">
            Some academic or admission configuration options could not be loaded. Retry before
            saving.
          </Alert>
        )}
        {offering && !offering.canEditIdentity && (
          <Alert severity="info">
            Academic identity is locked because applications already reference this offering.
            Operational dates, code, workflow, and forms can still be updated.
          </Alert>
        )}
        {mode === 'clone' && (
          <Alert severity="info">
            Select a new academic identity and code. The source offering&apos;s dates, workflow, and
            forms will be copied and revalidated by the server.
          </Alert>
        )}
        <AdmissionOfferingHierarchyFields
          formik={form.formik}
          hierarchy={form.hierarchy}
          standards={form.standards}
          hierarchyLoading={form.hierarchyLoading}
          standardsLoading={form.standardsLoading}
          identityLocked={mode === 'edit' && Boolean(offering && !offering.canEditIdentity)}
        />
        {mode !== 'clone' && (
          <>
            <Divider />
            <AdmissionOfferingWindowFields formik={form.formik} cycle={cycle} />
            <Divider />
            <AdmissionOfferingConfigurationFields
              formik={form.formik}
              workflows={form.workflows}
              forms={form.forms}
              loading={form.configurationLoading}
              statusLocked={mode === 'edit'}
            />
          </>
        )}
        <AdmissionOfferingReadiness result={form.readiness} />
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
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
        <Button
          variant="contained"
          size="small"
          startIcon={<Iconify icon={mode === 'clone' ? GlobalIcons.copy : GlobalIcons.submit} />}
          loading={saving || form.validating || form.formik.isSubmitting}
          disabled={form.queryFailed}
          onClick={() => form.formik.handleSubmit()}
        >
          {mode === 'clone' ? 'Clone' : 'Save'}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
