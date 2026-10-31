import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { isEqual } from 'src/utils/helper';
import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Stack, Button, Typography } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import { FormBuilderDetailFields } from './form-builder-detail-fields';
import { getBlankAdmissionFormInitialValues } from '../form-dialog-model';
import { getSystemAdmissionFormTemplate } from '../admission-form-template-catalog';
import { FormTemplateChooser, type AdmissionFormStarter } from './form-template-chooser';
import {
  changeNewFormPurpose,
  hasOnlyInquiryDefaults,
  withoutInquiryDefaults,
} from '../inquiry-default-fields';

type Props = { formik: FormikProps<CreateUpdateAdmissionForm>; editing: boolean };

export function FormBuilderDetails({ formik, editing }: Props) {
  const purpose = formik.values.purpose ?? 0;
  const [selectedStarter, setSelectedStarter] = useState<AdmissionFormStarter | null>(() =>
    formik.values.sections.every((section) => section.fields.length === 0) ||
    hasOnlyInquiryDefaults(formik.values)
      ? 'blank'
      : null
  );
  const [pendingStarter, setPendingStarter] = useState<{
    label: string;
    values: CreateUpdateAdmissionForm;
    starter: AdmissionFormStarter;
  } | null>(null);
  const purposeError = Boolean(
    (formik.touched.purpose || formik.submitCount > 0) && formik.errors.purpose
  );
  useEffect(() => {
    setSelectedStarter((starter) =>
      starter === 'blank' ||
      starter === (purpose === 0 ? 'admission-inquiry' : 'admission-application')
        ? starter
        : null
    );
    setPendingStarter(null);
  }, [purpose]);
  const createStarter = (starter: AdmissionFormStarter) =>
    starter === 'blank'
      ? getBlankAdmissionFormInitialValues(purpose)
      : getSystemAdmissionFormTemplate(starter);
  const applyStarter = (values: CreateUpdateAdmissionForm, starter: AdmissionFormStarter) => {
    formik.setValues({ ...values, purpose, code: '' });
    formik.setTouched({});
    setSelectedStarter(starter);
    setPendingStarter(null);
  };
  const selectStarter = (starter: AdmissionFormStarter) => {
    const values = createStarter(starter);
    const label = starter === 'blank' ? 'Blank form' : values.name;
    const hasDraftChanges = !isEqual(
      { ...withoutInquiryDefaults(formik.values), purpose: formik.initialValues.purpose },
      withoutInquiryDefaults(formik.initialValues)
    );
    if (hasDraftChanges) setPendingStarter({ label, values, starter });
    else applyStarter(values, starter);
  };
  return (
    <Stack
      spacing={2}
      sx={{ width: 1, minWidth: 0, maxWidth: 1120, mx: 'auto', p: { xs: 1.5, sm: 2 } }}
    >
      <Box sx={{ width: { xs: 1, sm: 280 }, maxWidth: 1 }}>
        <ShakingTextField error={purposeError}>
          <CustomSelect
            name="purpose"
            label="Form type"
            required
            size="small"
            fullWidth
            options={[
              { label: 'Inquiry', value: 0 },
              { label: 'Registration', value: 1 },
            ]}
            value={purpose}
            disabled={editing}
            onChange={(value) =>
              formik.setValues(
                changeNewFormPurpose(
                  formik.values,
                  Number(value) as CreateUpdateAdmissionForm['purpose']
                )
              )
            }
            onBlur={() => formik.setFieldTouched('purpose', true)}
            error={purposeError}
            helperText={purposeError ? formik.errors.purpose : undefined}
          />
        </ShakingTextField>
      </Box>
      {!editing && (
        <Box component="section" aria-label="Form templates">
          <FormTemplateChooser
            purpose={purpose}
            selectedStarter={selectedStarter}
            onSelect={selectStarter}
          />
        </Box>
      )}
      <SectionCard gridProps={{ spacing: 0 }} paperProps={{ sx: { mb: 0, p: { xs: 2, sm: 2 } } }}>
        <Grid size={{ xs: 12 }}>
          <Typography
            component="h2"
            variant="h6"
            tabIndex={-1}
            sx={{ pb: 1, mb: 1.5, borderBottom: '1px dashed', borderColor: 'divider' }}
          >
            Form details
          </Typography>
          <FormBuilderDetailFields formik={formik} />
        </Grid>
      </SectionCard>
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
              pendingStarter && applyStarter(pendingStarter.values, pendingStarter.starter)
            }
          >
            Replace draft
          </Button>
        }
      />
    </Stack>
  );
}
