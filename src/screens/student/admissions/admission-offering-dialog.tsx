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
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Link, Alert, Button, Divider, DialogActions } from '@mui/material';

import { AdmissionDialogTitle } from './admission-dialog-title';
import { useAdmissionOfferingForm } from './use-admission-offering-form';
import { AdmissionOfferingReadiness } from './admission-offering-readiness';
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

export function AdmissionOfferingDialog({
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
    <CustomDialog
      open={open}
      handleClose={closeDialog}
      maxWidth="md"
      title={
        <AdmissionDialogTitle
          title={
            mode === 'clone'
              ? 'Clone Admission Offering'
              : offering
                ? 'Edit Admission Offering'
                : 'Add Admission Offering'
          }
          helpText="An offering connects one cycle and academic standard to the workflow and forms used for new admissions."
          helpLabel="Admission offering information"
        />
      }
    >
      <DialogScrollContent dividers sx={{ display: 'grid', gap: 2 }}>
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
          Connect one academic intake to the dates, workflow and forms used for new inquiries and
          applications.
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
        {offering && !offering.canEditIdentity && (
          <Alert severity="info">
            Academic identity is locked because applications already reference this offering.
            Operational dates, code, workflow, and forms can still be updated.
          </Alert>
        )}
        {mode === 'edit' && offering && offering.applicationCount > 0 && (
          <Alert severity="warning" variant="outlined">
            This offering has {offering.applicationCount}{' '}
            {offering.applicationCount === 1 ? 'application' : 'applications'}. Workflow and form
            changes apply only to future applications; existing applications keep their frozen
            versions.
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
          identityLocked={mode === 'edit' && Boolean(offering && !offering.canEditIdentity)}
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
              fetchForms={form.fetchForms}
              initialWorkflow={
                offering?.workflowDefinitionId && offering.workflowName && offering.workflowVersion
                  ? {
                      id: offering.workflowDefinitionId,
                      name: offering.workflowName,
                      version: offering.workflowVersion,
                    }
                  : null
              }
              initialInquiryForm={
                offering?.inquiryFormDefinitionId &&
                offering.inquiryFormName &&
                offering.inquiryFormVersion
                  ? {
                      id: offering.inquiryFormDefinitionId,
                      name: offering.inquiryFormName,
                      version: offering.inquiryFormVersion,
                    }
                  : null
              }
              initialApplicationForm={
                offering?.applicationFormDefinitionId &&
                offering.applicationFormName &&
                offering.applicationFormVersion
                  ? {
                      id: offering.applicationFormDefinitionId,
                      name: offering.applicationFormName,
                      version: offering.applicationFormVersion,
                    }
                  : null
              }
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
        {mode === 'edit' ? (
          <LoadingButton
            variant="contained"
            size="small"
            startIcon={<Iconify icon="mdi:content-save-outline" />}
            loading={saving || form.validating || form.formik.isSubmitting}
            disabled={form.queryFailed || form.hierarchyEmpty}
            onClick={() => form.formik.handleSubmit()}
          >
            Save changes
          </LoadingButton>
        ) : (
          <>
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
          </>
        )}
      </DialogActions>
    </CustomDialog>
  );
}
