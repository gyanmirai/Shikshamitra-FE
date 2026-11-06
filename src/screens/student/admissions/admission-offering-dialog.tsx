'use client';

import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type {
  AdmissionOffering,
  AdmissionOfferingWriteInput,
} from 'src/redux/student/admissions/admission-offerings-api';

import { useId, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Link, Stack, Drawer, Button, Divider, IconButton, Typography } from '@mui/material';

import { AdmissionDialogTitle } from './admission-dialog-title';
import { useAdmissionCloseGuard } from './use-admission-close-guard';
import { useAdmissionOfferingForm } from './use-admission-offering-form';
import { AdmissionOfferingReadiness } from './admission-offering-readiness';
import { AdmissionOfferingEditDrawer } from './admission-offering-edit-drawer';
import { AdmissionOfferingCycleContext } from './admission-offering-cycle-context';
import { AdmissionOfferingHierarchyFields } from './admission-offering-hierarchy-fields';
import { AdmissionOfferingConfigurationFields } from './admission-offering-configuration-fields';

type Props = {
  open: boolean;
  onClose: () => void;
  cycle: AdmissionCycle;
  cycles: AdmissionCycle[];
  mode?: 'create' | 'edit' | 'clone';
  offering?: AdmissionOffering | null;
  loadingDetail?: boolean;
  detailError?: string | null;
  onRetryDetail?: () => void;
  saving: boolean;
  onSave: (values: AdmissionOfferingWriteInput, admissionCycleId: string) => Promise<void>;
  onDeactivate?: () => void;
};

export function AdmissionOfferingDialog(props: Props) {
  const {
    open,
    onClose,
    cycle,
    cycles,
    mode = 'create',
    offering,
    saving,
    onSave,
    loadingDetail,
    detailError,
    onRetryDetail,
    onDeactivate,
  } = props;

  if (mode === 'edit') {
    return (
      <AdmissionOfferingEditDrawer
        open={open}
        cycle={cycle}
        offering={offering}
        loadingDetail={loadingDetail}
        detailError={detailError}
        onRetryDetail={onRetryDetail}
        saving={saving}
        onClose={onClose}
        onSave={onSave}
        onDeactivate={onDeactivate}
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
}: Omit<Props, 'loadingDetail' | 'detailError' | 'onRetryDetail'>) {
  const titleId = useId();
  const [targetCycleId, setTargetCycleId] = useState(cycle.id);
  const targetCycle =
    mode === 'clone' ? (cycles.find((item) => item.id === targetCycleId) ?? cycle) : cycle;
  const form = useAdmissionOfferingForm({ open, cycle: targetCycle, mode, offering, onSave });
  const closeDialog = () => {
    form.formik.resetForm();
    form.clearReadiness();
    onClose();
  };
  const guard = useAdmissionCloseGuard(
    form.formik.dirty || targetCycleId !== cycle.id,
    saving || form.validating || form.formik.isSubmitting,
    open
  );
  const cancelDialog = () => guard.requestNavigation(closeDialog);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={saving || form.validating ? undefined : cancelDialog}
      PaperProps={{
        'aria-labelledby': titleId,
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
          <Typography id={titleId} variant="h6" component="h2">
            <AdmissionDialogTitle
              title={mode === 'clone' ? 'Clone Admission Offering' : 'Add Admission Offering'}
              helpText="An offering connects a class to its published admission workflow and forms."
              helpLabel="Admission Offering Information"
            />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure the class, published workflow, and forms.
          </Typography>
        </Box>
        <IconButton
          aria-label="Close Admission Offering"
          disabled={saving || form.validating}
          onClick={cancelDialog}
        >
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>
      <Divider />

      <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2 }}>
        <FormSectionCard
          title="Academic Identity"
          icon={GlobalIcons.notebook}
          descriptionTooltip="Choose the admission cycle and academic class that will own this offering."
          titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
        >
          <Stack spacing={2}>
            {mode === 'clone' && (
              <ShakingTextField error={Boolean(!targetCycleId && form.formik.submitCount > 0)}>
                <CustomSelect
                  options={cycles}
                  label="Target admission cycle"
                  required
                  error={Boolean(!targetCycleId && form.formik.submitCount > 0)}
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
                  helperText={
                    !targetCycleId && form.formik.submitCount > 0
                      ? 'Choose a target admission cycle.'
                      : 'Choose the cycle that should receive the cloned offering.'
                  }
                />
              </ShakingTextField>
            )}
            <AdmissionOfferingCycleContext cycle={targetCycle} />
            <Box component="p" sx={{ m: 0, typography: 'body2', color: 'text.secondary' }}>
              Connect this class and admission track to the dates, workflow, and forms used for new
              inquiries or direct registrations.
            </Box>
            {form.queryFailed && (
              <StudentFeedback notificationKey="STU-0118" presentation="toast" severity="error">
                Some academic or admission configuration options could not be loaded. Retry before
                saving.
              </StudentFeedback>
            )}
            {form.hierarchyEmpty && (
              <StudentFeedback
                notificationKey="STU-0119"
                presentation="persistent"
                severity="warning"
              >
                No academic hierarchy is configured for this academic year. Configure the board,
                medium, stage, and standards in Institute Setup before creating an offering.{' '}
                <Link href="/setting/academic-setup/" underline="hover">
                  Open Institute Setup
                </Link>
              </StudentFeedback>
            )}
            {mode === 'clone' && (
              <StudentFeedback notificationKey="STU-0120" presentation="inline" severity="info">
                Select a valid academic identity for the target cycle. Its cycle dates apply
                automatically. The source offering&apos;s workflow, forms, and code will be copied
                and revalidated by the server. Applications are never copied.
              </StudentFeedback>
            )}
            <AdmissionOfferingHierarchyFields
              compact
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
          </Stack>
        </FormSectionCard>
        {mode !== 'clone' && (
          <FormSectionCard
            title="Admission Configuration"
            icon={GlobalIcons.notebook}
            descriptionTooltip="Choose the published workflow and forms used by applicants for this offering."
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
          >
            <AdmissionOfferingConfigurationFields
              compact
              formik={form.formik}
              fetchWorkflows={form.fetchWorkflows}
              fetchInquiryForms={form.fetchInquiryForms}
            />
          </FormSectionCard>
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
          {mode === 'clone' ? 'Clone as Inactive' : 'Save as Inactive'}
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
          {mode === 'clone' ? 'Clone and Activate' : 'Validate and Activate'}
        </LoadingButton>
      </Stack>
      {guard.confirmation}
    </Drawer>
  );
}
