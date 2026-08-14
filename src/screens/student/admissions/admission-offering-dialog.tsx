'use client';

import type { Standards, Organization } from 'src/types/school';
import type {
  AdmissionOffering,
  CreateUpdateAdmissionOffering,
} from 'src/redux/student/admissions/admission-cycles-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import CustomSelect from 'src/components/custom-select';
import { Grid, TextField, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useGetAdmissionFormsQuery } from 'src/redux/student/admissions/admission-forms-api';
import { useGetAdmissionWorkflowsQuery } from 'src/redux/student/admissions/admission-workflows-api';

type Props = {
  open: boolean;
  onClose: () => void;
  editingOffering?: AdmissionOffering | null;
  saving: boolean;
  boardId: string;
  mediumId: string;
  stages: Organization[];
  standards: Standards[];
  onSave: (values: CreateUpdateAdmissionOffering) => Promise<void>;
};

const schema = Yup.object({
  code: Yup.string().trim().required('Offering code is required'),
  stageId: Yup.string().required('Stage is required'),
  standardId: Yup.string().required('Standard is required'),
  openDate: Yup.string().required('Open date is required'),
  closeDate: Yup.string().required('Close date is required'),
});

export function AdmissionOfferingDialog({
  open,
  onClose,
  editingOffering,
  saving,
  boardId,
  mediumId,
  stages,
  standards,
  onSave,
}: Props) {
  const { data: workflows } = useGetAdmissionWorkflowsQuery({
    status: 1,
    maxResultCount: 100,
    skipCount: 0,
  });
  const { data: forms } = useGetAdmissionFormsQuery({
    status: 1,
    maxResultCount: 100,
    skipCount: 0,
  });
  const formik = useFormik<CreateUpdateAdmissionOffering>({
    enableReinitialize: true,
    initialValues: {
      campusId: editingOffering?.campusId ?? null,
      boardId,
      mediumId,
      stageId: editingOffering?.stageId ?? '',
      standardId: editingOffering?.standardId ?? '',
      code: editingOffering?.code ?? '',
      openDate: editingOffering?.openDate?.slice(0, 10) ?? '',
      closeDate: editingOffering?.closeDate?.slice(0, 10) ?? '',
      isActive: editingOffering?.isActive ?? true,
      workflowDefinitionId: editingOffering?.workflowDefinitionId ?? null,
      inquiryFormDefinitionId: editingOffering?.inquiryFormDefinitionId ?? null,
      applicationFormDefinitionId: editingOffering?.applicationFormDefinitionId ?? null,
    },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      await onSave(values);
      helpers.resetForm();
      onClose();
    },
  });

  const availableStandards = standards.filter(
    (standard) => standard.educationMediumStageId === formik.values.stageId
  );

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title={editingOffering ? 'Edit Admission Offering' : 'Add Admission Offering'}
      maxWidth="sm"
    >
      <DialogScrollContent>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12 }}>
            <CustomSelect
              options={workflows?.items ?? []}
              label="Published workflow"
              value={formik.values.workflowDefinitionId ?? ''}
              onChange={(value) => formik.setFieldValue('workflowDefinitionId', value || null)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ fullWidth: true, size: 'small' }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomSelect
              options={forms?.items ?? []}
              label="Published application form"
              value={formik.values.applicationFormDefinitionId ?? ''}
              onChange={(value) =>
                formik.setFieldValue('applicationFormDefinitionId', value || null)
              }
              labelKey="name"
              valueKey="id"
              formControlProps={{ fullWidth: true, size: 'small' }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomSelect
              options={forms?.items ?? []}
              label="Published inquiry form"
              value={formik.values.inquiryFormDefinitionId ?? ''}
              onChange={(value) => formik.setFieldValue('inquiryFormDefinitionId', value || null)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ fullWidth: true, size: 'small' }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              label="Offering code *"
              {...formik.getFieldProps('code')}
              error={formik.touched.code && Boolean(formik.errors.code)}
              helperText={formik.touched.code && formik.errors.code}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomSelect
              options={stages}
              label="Stage *"
              value={formik.values.stageId}
              onChange={(value) => {
                formik.setFieldValue('stageId', value);
                formik.setFieldValue('standardId', '');
              }}
              labelKey="name"
              valueKey="id"
              error={formik.touched.stageId && Boolean(formik.errors.stageId)}
              helperText={formik.touched.stageId ? String(formik.errors.stageId ?? '') : undefined}
              formControlProps={{ fullWidth: true, size: 'small' }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomSelect
              options={availableStandards}
              label="Standard *"
              value={formik.values.standardId}
              onChange={(value) => formik.setFieldValue('standardId', value)}
              labelKey="name"
              valueKey="id"
              disabled={!formik.values.stageId}
              error={formik.touched.standardId && Boolean(formik.errors.standardId)}
              helperText={
                formik.touched.standardId ? String(formik.errors.standardId ?? '') : undefined
              }
              formControlProps={{ fullWidth: true, size: 'small' }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Open date *"
              InputLabelProps={{ shrink: true }}
              {...formik.getFieldProps('openDate')}
              error={formik.touched.openDate && Boolean(formik.errors.openDate)}
              helperText={formik.touched.openDate && formik.errors.openDate}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Close date *"
              InputLabelProps={{ shrink: true }}
              {...formik.getFieldProps('closeDate')}
              error={formik.touched.closeDate && Boolean(formik.errors.closeDate)}
              helperText={formik.touched.closeDate && formik.errors.closeDate}
            />
          </Grid>
        </Grid>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <LoadingButton variant="outlined" size="small" onClick={onClose} disabled={saving}>
          Cancel
        </LoadingButton>
        <LoadingButton
          variant="contained"
          size="small"
          loading={saving}
          onClick={() => formik.handleSubmit()}
        >
          Save
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
