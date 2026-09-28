import type { FormikProps } from 'formik';
import type {
  AdmissionForm,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Stack, Paper, Button, Typography } from '@mui/material';
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
  const [selectedStarter, setSelectedStarter] = useState<AdmissionFormStarter | null>('blank');
  const [selectedTemplateLabel, setSelectedTemplateLabel] = useState('Blank form');
  const [pendingStarter, setPendingStarter] = useState<{
    label: string;
    values: CreateUpdateAdmissionForm;
    starter: AdmissionFormStarter | null;
  } | null>(null);
  const [getSchoolForm, schoolFormQuery] = useLazyGetAdmissionFormQuery();
  const createStarter = (starter: AdmissionFormStarter) =>
    starter === 'blank'
      ? getAdmissionFormInitialValues(undefined, formik.values.purpose)
      : getSystemAdmissionFormTemplate(starter);
  const applyStarter = (
    values: CreateUpdateAdmissionForm,
    starter: AdmissionFormStarter | null = null,
    templateLabel = 'Blank form'
  ) => {
    formik.setValues(values);
    formik.setTouched({});
    setSelectedStarter(starter);
    setSelectedTemplateLabel(templateLabel);
    setPendingStarter(null);
  };
  const selectStarter = (starter: AdmissionFormStarter) => {
    const values = createStarter(starter);
    const label = starter === 'blank' ? 'Blank form' : values.name;
    if (formik.dirty) setPendingStarter({ label, values, starter });
    else applyStarter(values, starter, label);
  };
  const selectSchoolForm = async (form: AdmissionForm) => {
    try {
      const source = await getSchoolForm(form.id).unwrap();
      const values = cloneSchoolFormAsStarter(source);
      const pending = { label: source.name, values, starter: null };
      if (formik.dirty) setPendingStarter(pending);
      else applyStarter(values, null, source.name);
      return true;
    } catch {
      shikshaMitraToast.error({
        message: 'This school form could not be loaded. Try again before creating a copy.',
      });
      return false;
    }
  };
  return (
    <Stack sx={{ width: 1, maxWidth: 1180, mx: 'auto', p: { xs: 1.5, sm: 2.5 } }}>
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: editing
              ? 'minmax(0, 1fr)'
              : { xs: 'minmax(0, 1fr)', md: 'minmax(280px, 0.42fr) minmax(0, 1fr)' },
          }}
        >
          {!editing && (
            <Box
              component="aside"
              aria-label="Form templates"
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRight: { md: 1 },
                borderBottom: { xs: 1, md: 0 },
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <FormTemplateChooser
                selectedStarter={selectedStarter}
                selectedTemplateLabel={selectedTemplateLabel}
                onSelect={selectStarter}
                onSelectSchoolForm={selectSchoolForm}
                applyingSchoolForm={schoolFormQuery.isFetching}
              />
            </Box>
          )}
          <Stack spacing={2.5} sx={{ p: { xs: 2, sm: 3 } }}>
            <Box>
              <Typography component="h2" variant="h6" tabIndex={-1}>
                Form details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You can change these settings later.
              </Typography>
            </Box>
            <FormBuilderDetailFields formik={formik} />
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'action.hover' }}
            >
              <Iconify icon="mdi:information-outline" width={20} />
              <Typography variant="body2" color="text.secondary">
                Saving a draft does not publish the form.
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Paper>
      <ConfirmDialog
        open={Boolean(pendingStarter)}
        onClose={() => setPendingStarter(null)}
        title={`Replace this draft with ${pendingStarter?.label ?? 'this template'}?`}
        content={`This replaces the form details, sections, and fields you have entered with ${(pendingStarter?.label ?? 'the selected template').toLowerCase()}.`}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mdi:swap-horizontal" />}
            size="small"
            sx={{ minHeight: 44, bgcolor: 'common.black', color: 'common.white' }}
            onClick={() =>
              pendingStarter &&
              applyStarter(pendingStarter.values, pendingStarter.starter, pendingStarter.label)
            }
          >
            Replace draft
          </Button>
        }
      />
    </Stack>
  );
}
