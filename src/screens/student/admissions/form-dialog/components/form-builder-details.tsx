import type { FormikProps } from 'formik';
import type {
  AdmissionForm,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Stack, Paper, Button, Typography } from '@mui/material';
import { useLazyGetAdmissionFormQuery } from 'src/redux/student/admissions/admission-forms-api';

import { getAdmissionFormInitialValues } from '../form-dialog-model';
import { FormBuilderDetailFields } from './form-builder-detail-fields';
import { FormTemplateChooser, type AdmissionFormStarter } from './form-template-chooser';
import {
  cloneSchoolFormAsStarter,
  getSystemAdmissionFormTemplate,
} from '../admission-form-template-catalog';

type Props = { formik: FormikProps<CreateUpdateAdmissionForm>; editing: boolean };

export function FormBuilderDetails({ formik, editing }: Props) {
  const [pendingStarter, setPendingStarter] = useState<{
    label: string;
    values: CreateUpdateAdmissionForm;
  } | null>(null);
  const [getSchoolForm, schoolFormQuery] = useLazyGetAdmissionFormQuery();
  const createStarter = (starter: AdmissionFormStarter) =>
    starter === 'blank' ? getAdmissionFormInitialValues() : getSystemAdmissionFormTemplate(starter);
  const applyStarter = (values: CreateUpdateAdmissionForm) => {
    formik.setValues(values);
    formik.setTouched({});
    setPendingStarter(null);
  };
  const selectStarter = (starter: AdmissionFormStarter) => {
    const values = createStarter(starter);
    const label = starter === 'blank' ? 'Blank form' : values.name;
    if (formik.dirty) setPendingStarter({ label, values });
    else applyStarter(values);
  };
  const selectSchoolForm = async (form: AdmissionForm) => {
    try {
      const source = await getSchoolForm(form.id).unwrap();
      const values = cloneSchoolFormAsStarter(source);
      const pending = { label: source.name, values };
      if (formik.dirty) setPendingStarter(pending);
      else applyStarter(values);
      return true;
    } catch {
      shikshaMitraToast.error({
        message: 'This school form could not be loaded. Try again before creating a copy.',
      });
      return false;
    }
  };
  return (
    <Stack spacing={2} sx={{ width: 1, maxWidth: 1000, mx: 'auto', p: { xs: 1.5, sm: 3 } }}>
      {!editing && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
          <FormTemplateChooser
            onSelect={selectStarter}
            onSelectSchoolForm={selectSchoolForm}
            applyingSchoolForm={schoolFormQuery.isFetching}
          />
        </Paper>
      )}
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Form details
        </Typography>
        <FormBuilderDetailFields formik={formik} />
      </Paper>
      <Typography variant="body2" color="text.secondary">
        Next, add the questions and information you want applicants to provide. Nothing is published
        when you save a draft.
      </Typography>
      <ConfirmDialog
        open={Boolean(pendingStarter)}
        onClose={() => setPendingStarter(null)}
        title={`Replace this draft with ${pendingStarter?.label ?? 'this template'}?`}
        content={`This replaces the form details, sections, and fields you have entered with ${(pendingStarter?.label ?? 'the selected template').toLowerCase()}.`}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mdi:swap-horizontal" />}
            onClick={() => pendingStarter && applyStarter(pendingStarter.values)}
          >
            Replace draft
          </Button>
        }
      />
    </Stack>
  );
}
