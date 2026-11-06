import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';
import { Stack, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { useAdmissionDraftGuard } from './use-admission-draft-guard';
import { FormCloneFields } from './form-dialog/components/form-clone-fields';

export type AdmissionFormCloneValues = {
  name: string;
  code: string;
  description?: string | null;
};

type Props = {
  source: AdmissionForm | null;
  saving: boolean;
  onClose: () => void;
  onSave: (values: AdmissionFormCloneValues) => Promise<boolean>;
};

const schema = Yup.object({
  name: Yup.string().trim().max(128, 'Use 128 characters or fewer').required('Name is required'),
  description: Yup.string().trim().max(1024, 'Use 1,024 characters or fewer'),
});

export function getAdmissionFormCloneInitialValues(
  source: AdmissionForm
): AdmissionFormCloneValues {
  return {
    name: `${source.name} copy`,
    code: '',
    description: source.description ?? '',
  };
}

export function AdmissionFormCloneDialog({ source, saving, onClose, onSave }: Props) {
  return source ? (
    <AdmissionFormCloneEditor
      key={source.id}
      source={source}
      saving={saving}
      onClose={onClose}
      onSave={onSave}
    />
  ) : null;
}

function AdmissionFormCloneEditor({
  source,
  saving,
  onClose,
  onSave,
}: Props & { source: AdmissionForm }) {
  const formik = useFormik<AdmissionFormCloneValues>({
    initialValues: getAdmissionFormCloneInitialValues(source),
    validationSchema: schema,
    onSubmit: async (values) => {
      const saved = await onSave({
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        description: values.description?.trim() || undefined,
      });
      if (saved) onClose();
    },
  });
  const busy = saving || formik.isSubmitting;
  const guard = useAdmissionDraftGuard({ dirty: formik.dirty, busy, reset: formik.resetForm });
  const requestClose = () => guard.requestNavigation(onClose);

  return (
    <>
      <CustomDialog
        open
        handleClose={requestClose}
        guardUnsavedChanges={false}
        disableClose={busy}
        title="Clone Form as Draft"
        titleInfo="Copy the selected form version into an independent draft."
        maxWidth="sm"
        formProps={{
          noValidate: true,
          onSubmit: (event) => {
            event.preventDefault();
            formik.submitForm();
          },
        }}
      >
        <DialogScrollContent>
          <FormBusyRegion busy={busy} label="Cloning form…">
            <FormSectionCard
              title="Draft Details"
              icon={GlobalIcons.copy}
              descriptionTooltip="The clone receives a new generated identity. The source form and existing applications keep their original version."
            >
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Copy {source.name} · Version {source.version} into a new independent draft. The
                  original form and its applications remain unchanged.
                </Typography>
                <FormCloneFields formik={formik} />
              </Stack>
            </FormSectionCard>
          </FormBusyRegion>
        </DialogScrollContent>
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:close" />}
            disabled={busy}
            onClick={requestClose}
          >
            Cancel
          </Button>
          <LoadingButton
            size="small"
            variant="contained"
            type="submit"
            color="inherit"
            loading={busy}
            startIcon={<Iconify icon="mdi:content-copy" />}
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
      {guard.confirmation}
    </>
  );
}
