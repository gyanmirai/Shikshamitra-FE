'use client';

import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Alert, Button, AlertTitle, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { LoadingButton } from 'src/components/loading-button';

import { useBulkAdmissionOffering } from './use-bulk-admission-offering';
import { AdmissionOfferingCycleContext } from './admission-offering-cycle-context';
import { BulkAdmissionHierarchyFields } from './bulk-admission-hierarchy-fields';
import { BulkAdmissionConfigurationFields } from './bulk-admission-configuration-fields';

import type { BulkOfferingValues } from './bulk-admission-offering-model';

type Props = { open: boolean; cycle: AdmissionCycle; onClose: () => void };

export function BulkAdmissionOfferingDialog({ open, cycle, onClose }: Props) {
  const bulk = useBulkAdmissionOffering(cycle, open, onClose);
  const change = (field: keyof BulkOfferingValues, value: unknown) => {
    bulk.clearPreview();
    bulk.formik.setFieldValue(field, value);
  };
  const cancelDialog = () => {
    if (
      bulk.formik.dirty &&
      !window.confirm('You have unsaved changes. Do you want to discard them?')
    )
      return;
    onClose();
  };

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      maxWidth="md"
      title={
        <Box component="span" display="flex" alignItems="center" gap={1}>
          Bulk Create Admission Offerings
          <CustomTooltip
            arrow
            title="Preview validates every selected standard. Nothing is created unless every row is valid."
          >
            <Iconify icon={GlobalIcons.info} color="info.main" />
          </CustomTooltip>
        </Box>
      }
    >
      <DialogScrollContent dividers sx={{ display: 'grid', gap: 2 }}>
        <AdmissionOfferingCycleContext cycle={cycle} />
        <Alert severity="info">
          Preview first. Nothing is created until you choose whether to create the complete batch as
          inactive preparation or activate every ready Offering.
        </Alert>
        <BulkAdmissionHierarchyFields
          formik={bulk.formik}
          hierarchy={bulk.hierarchy}
          standards={bulk.standards}
          loading={bulk.optionsLoading}
          change={change}
        />
        <BulkAdmissionConfigurationFields
          formik={bulk.formik}
          cycle={cycle}
          fetchWorkflows={bulk.fetchWorkflows}
          fetchForms={bulk.fetchForms}
          change={change}
        />
        {bulk.preview?.items.map((item) => {
          const state = item.canActivate
            ? { severity: 'success' as const, title: 'Ready to activate' }
            : item.canSaveInactive
              ? { severity: 'info' as const, title: 'Can be saved as inactive' }
              : { severity: 'error' as const, title: 'Cannot be saved' };
          return (
            <Alert key={item.standardId} severity={state.severity}>
              <AlertTitle>
                {item.code} · {state.title}
              </AlertTitle>
              {!item.canActivate && item.errors.map((error) => error.message).join(' ')}
            </Alert>
          );
        })}
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={cancelDialog}
          disabled={bulk.loading}
        >
          Cancel
        </Button>
        {!bulk.preview ? (
          <LoadingButton
            variant="contained"
            size="small"
            startIcon={<Iconify icon={GlobalIcons.eye} />}
            loading={bulk.loading && bulk.submitIntent === 'preview'}
            disabled={bulk.loading || bulk.optionsLoading}
            onClick={bulk.previewOfferings}
          >
            Preview Offerings
          </LoadingButton>
        ) : (
          <>
            <LoadingButton
              variant="outlined"
              size="small"
              startIcon={<Iconify icon="mdi:content-save-outline" />}
              loading={bulk.loading && bulk.submitIntent === 'inactive'}
              disabled={bulk.loading || !bulk.canSaveInactive}
              onClick={bulk.createInactive}
            >
              Create as inactive
            </LoadingButton>
            <LoadingButton
              variant="contained"
              size="small"
              startIcon={<Iconify icon="mdi:check-decagram-outline" />}
              loading={bulk.loading && bulk.submitIntent === 'activate'}
              disabled={bulk.loading || !bulk.canActivate}
              onClick={bulk.createActive}
            >
              Create and activate
            </LoadingButton>
          </>
        )}
      </DialogActions>
    </CustomDialog>
  );
}
