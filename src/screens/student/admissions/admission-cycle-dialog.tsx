'use client';

import type { AcademicYear } from 'src/types/school';
import type {
  AdmissionCycle,
  CreateUpdateAdmissionCycle,
} from 'src/redux/student/admissions/admission-cycles-api';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Grid, DialogActions } from '@mui/material';
import { LoadingButton } from 'src/components/loading-button';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { AdmissionDialogTitle } from './admission-dialog-title';
import { CycleDateFields } from './cycle-dialog/cycle-date-fields';
import { useAdmissionCloseGuard } from './use-admission-close-guard';
import { CycleDetailsFields } from './cycle-dialog/cycle-details-fields';
import { useAdmissionCycleForm } from './cycle-dialog/use-admission-cycle-form';

export type AdmissionCycleDialogProps = {
  open: boolean;
  onClose: () => void;
  academicYearId: string;
  academicYears: AcademicYear[];
  academicYearsLoading: boolean;
  academicYearsError: boolean;
  editingCycle?: AdmissionCycle | null;
  saving: boolean;
  onSave: (values: CreateUpdateAdmissionCycle) => Promise<void>;
};

export function AdmissionCycleDialog({
  open,
  onClose,
  academicYearId,
  academicYears,
  academicYearsLoading,
  academicYearsError,
  editingCycle,
  saving,
  onSave,
}: AdmissionCycleDialogProps) {
  const formik = useAdmissionCycleForm({ academicYearId, editingCycle, onSave, onClose });
  const closeWithoutSaving = () => {
    formik.resetForm();
    onClose();
  };

  const guard = useAdmissionCloseGuard(formik.dirty, saving || formik.isSubmitting, open);
  const handleClose = () => guard.requestNavigation(closeWithoutSaving);

  return (
    <CustomDialog
      open={open}
      guardUnsavedChanges={false}
      disableClose={saving || formik.isSubmitting}
      formProps={{
        onSubmit: (event) => {
          event.preventDefault();
          formik.handleSubmit();
        },
      }}
      handleClose={handleClose}
      title={
        <AdmissionDialogTitle
          title={editingCycle ? 'Edit Admission Cycle' : 'Create Admission Cycle'}
          helpText="Save the cycle as a draft first. Applicants can apply only after it is published and while the application window is open."
          helpLabel="Admission cycle information"
        />
      }
      maxWidth="sm"
    >
      <DialogScrollContent>
        <FormSectionCard
          title="Cycle Details"
          icon={GlobalIcons.admissionDetails}
          descriptionTooltip="Set the academic year and dates when applicants can submit. New cycles remain drafts until published."
        >
          <Grid container spacing={1.5}>
            <CycleDetailsFields
              formik={formik}
              academicYears={academicYears}
              academicYearsError={academicYearsError}
              academicYearsLoading={academicYearsLoading}
              saving={saving}
            />
            <CycleDateFields formik={formik} />
          </Grid>
        </FormSectionCard>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <LoadingButton
          variant="outlined"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={handleClose}
          disabled={saving}
        >
          Cancel
        </LoadingButton>
        <LoadingButton
          variant="contained"
          size="small"
          type="submit"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          loading={saving}
        >
          Submit
        </LoadingButton>
      </DialogActions>
      {guard.confirmation}
    </CustomDialog>
  );
}
