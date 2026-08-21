'use client';

import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Alert, Button, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { useBulkAdmissionOffering } from './use-bulk-admission-offering';
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
        <Alert severity="info">
          All-or-nothing: review the server validation preview, then create all valid offerings in
          one transaction.
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
          workflows={bulk.workflows}
          forms={bulk.forms}
          loading={bulk.optionsLoading}
          change={change}
        />
        {bulk.preview?.items.map((item) => (
          <Alert key={item.standardId} severity={item.isValid ? 'success' : 'error'}>
            <strong>{item.code}</strong>:{' '}
            {item.isValid ? 'Ready' : item.errors.map((error) => error.message).join(' ')}
          </Alert>
        ))}
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
        <Button
          variant="contained"
          size="small"
          startIcon={<Iconify icon={bulk.preview ? GlobalIcons.submit : GlobalIcons.eye} />}
          loading={bulk.loading}
          disabled={Boolean(bulk.preview && !bulk.preview.canCommit)}
          onClick={bulk.formik.submitForm}
        >
          {bulk.preview ? 'Create all' : 'Preview'}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
