'use client';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  DialogActions,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import type {
  AdmissionWorkflow,
  AdmissionWorkflowStageType,
  CreateUpdateAdmissionWorkflow,
} from 'src/redux/student/admissions/admission-workflows-api';

type Props = {
  open: boolean;
  onClose: () => void;
  editing?: AdmissionWorkflow | null;
  saving: boolean;
  onSave: (value: CreateUpdateAdmissionWorkflow) => Promise<void>;
};
const schema = Yup.object({
  name: Yup.string().trim().required('Workflow name is required'),
  code: Yup.string().trim().required('Workflow code is required'),
});
const newStage = (order: number) => ({
  id: crypto.randomUUID(),
  code: `STAGE_${order + 1}`,
  name: `Stage ${order + 1}`,
  stageType: 11 as AdmissionWorkflowStageType,
  displayOrder: order,
  isRequired: true,
  allowManualSkip: false,
});

export function AdmissionWorkflowDialog({ open, onClose, editing, saving, onSave }: Props) {
  const formik = useFormik<CreateUpdateAdmissionWorkflow>({
    enableReinitialize: true,
    initialValues: {
      name: editing?.name ?? '',
      code: editing?.code ?? '',
      stages: editing?.stages ?? [newStage(0), newStage(1)],
      transitions: editing?.transitions ?? [],
    },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      try {
        const stages = values.stages.map((stage, index) => ({ ...stage, displayOrder: index }));
        await onSave({
          ...values,
          stages,
          transitions: stages.slice(1).map((stage, index) => ({
            id: crypto.randomUUID(),
            fromStageId: stages[index].id,
            toStageId: stage.id,
            priority: index,
          })),
        });
        helpers.resetForm();
        onClose();
      } catch (error) {
        shikshaMitraToast.error({
          message:
            (error as { data?: { detail?: string } })?.data?.detail || 'Failed to save workflow',
        });
      }
    },
  });
  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title={editing ? 'Edit Workflow' : 'Create Workflow'}
      maxWidth="md"
    >
      <DialogScrollContent>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              fullWidth
              size="small"
              label="Workflow name *"
              {...formik.getFieldProps('name')}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Code *"
              {...formik.getFieldProps('code')}
              error={formik.touched.code && Boolean(formik.errors.code)}
              helperText={formik.touched.code && formik.errors.code}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle2">Workflow stages</Typography>
              <Button
                size="small"
                startIcon={<Iconify icon="mdi:plus" />}
                onClick={() =>
                  formik.setFieldValue('stages', [
                    ...formik.values.stages,
                    newStage(formik.values.stages.length),
                  ])
                }
              >
                Add stage
              </Button>
            </Stack>
            {formik.values.stages.map((stage, index) => (
              <Stack key={stage.id} direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ width: 24 }}>
                  {index + 1}
                </Typography>
                <TextField
                  size="small"
                  label="Code"
                  value={stage.code}
                  onChange={(e) => formik.setFieldValue(`stages[${index}].code`, e.target.value)}
                />
                <TextField
                  size="small"
                  fullWidth
                  label="Stage name"
                  value={stage.name}
                  onChange={(e) => formik.setFieldValue(`stages[${index}].name`, e.target.value)}
                />
                <IconButton
                  disabled={formik.values.stages.length < 2}
                  onClick={() =>
                    formik.setFieldValue(
                      'stages',
                      formik.values.stages.filter((_, i) => i !== index)
                    )
                  }
                >
                  <Iconify icon="mdi:delete-outline" />
                </IconButton>
              </Stack>
            ))}
          </Grid>
        </Grid>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2 }}>
        <LoadingButton variant="outlined" size="small" onClick={onClose} disabled={saving}>
          Cancel
        </LoadingButton>
        <LoadingButton
          variant="contained"
          size="small"
          loading={saving}
          onClick={() => formik.handleSubmit()}
        >
          Save draft
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
