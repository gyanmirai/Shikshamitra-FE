import type { RefObject } from 'react';
import type { FormikProps } from 'formik';
import type {
  AdmissionFormPurpose,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';
import { isEqual } from 'src/utils/helper';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  Box,
  Grid,
  Stack,
  Radio,
  Button,
  RadioGroup,
  Typography,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { FormBuilderDetailFields } from './form-builder-detail-fields';
import { getNewAdmissionFormInitialValues } from '../admission-form-template-catalog';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  editing: boolean;
  starter: RefObject<CreateUpdateAdmissionForm>;
  nameConflictMessage?: string | null;
  checkingName?: boolean;
};

const starterStructure = ({
  sections,
  layoutType,
  fieldsPerRow,
  inheritance,
  printSettings,
}: CreateUpdateAdmissionForm) => ({
  sections,
  layoutType,
  fieldsPerRow,
  inheritance,
  printSettings,
});

export function FormBuilderDetails({
  formik,
  editing,
  starter,
  nameConflictMessage,
  checkingName,
}: Props) {
  const purpose = formik.values.purpose ?? 0;
  const [pendingPurpose, setPendingPurpose] = useState<AdmissionFormPurpose | null>(null);
  const pendingType = pendingPurpose === 1 ? 'Registration' : 'Inquiry';
  const purposeError = Boolean(
    (formik.touched.purpose || formik.submitCount > 0) && formik.errors.purpose
  );
  const applyFormType = (nextPurpose: AdmissionFormPurpose) => {
    const next = getNewAdmissionFormInitialValues(nextPurpose);
    starter.current = next;
    const { name, description, defaultLanguage, supportedLanguages } = formik.values;
    formik.setValues({ ...next, name, description, defaultLanguage, supportedLanguages });
    formik.setFieldTouched('sections', false, false);
    setPendingPurpose(null);
  };
  return (
    <Stack
      spacing={2}
      sx={{ width: 1, minWidth: 0, maxWidth: 1120, mx: 'auto', p: { xs: 1.5, sm: 2 } }}
    >
      <SectionCard gridProps={{ spacing: 0 }} paperProps={{ sx: { mb: 0, p: { xs: 2, sm: 2 } } }}>
        <Grid size={{ xs: 12 }}>
          <Typography
            component="h2"
            variant="h6"
            sx={{ pb: 1, mb: 1.5, borderBottom: '1px dashed', borderColor: 'divider' }}
          >
            Form Type
          </Typography>
          <RadioGroup
            row
            name="purpose"
            aria-label="Form Type"
            value={purpose}
            onChange={(event) => {
              const nextPurpose = Number(event.target.value) as AdmissionFormPurpose;
              if (nextPurpose === purpose || editing) return;
              if (isEqual(starterStructure(formik.values), starterStructure(starter.current))) {
                applyFormType(nextPurpose);
              } else setPendingPurpose(nextPurpose);
            }}
            onBlur={() => formik.setFieldTouched('purpose', true)}
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            {[
              {
                value: 0,
                label: 'Inquiry Form',
                description: 'Start with student and parent details.',
                icon: 'mdi:account-question-outline',
              },
              {
                value: 1,
                label: 'Registration Form',
                description: 'Start with student, family, address and academic details.',
                icon: 'mdi:file-document-edit-outline',
              },
            ].map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                disabled={editing || formik.isSubmitting}
                control={
                  <Radio
                    size="small"
                    icon={<Iconify icon="mdi:radiobox-blank" width={24} />}
                    checkedIcon={<Iconify icon="mdi:check-circle" width={24} />}
                    sx={{
                      p: 0,
                      '&.Mui-checked': { color: 'success.main' },
                      '&.Mui-checked.Mui-disabled': { color: 'success.main' },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', minWidth: 0 }}>
                    <Box
                      sx={{
                        display: 'grid',
                        placeItems: 'center',
                        width: 36,
                        height: 36,
                        flexShrink: 0,
                        borderRadius: 1,
                        bgcolor: 'action.hover',
                        color: 'text.secondary',
                      }}
                    >
                      <Iconify icon={option.icon} width={20} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">{option.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Box>
                  </Box>
                }
                labelPlacement="start"
                sx={{
                  m: 0,
                  p: 1.25,
                  minHeight: { xs: 64, sm: 72, lg: 64 },
                  minWidth: 0,
                  justifyContent: 'space-between',
                  gap: 1,
                  border: 1,
                  borderRadius: 1.5,
                  borderColor: purpose === option.value ? 'text.primary' : 'divider',
                  bgcolor: 'background.paper',
                  '& .MuiFormControlLabel-label': { minWidth: 0, color: 'text.primary' },
                }}
              />
            ))}
          </RadioGroup>
          {purposeError && <FormHelperText error>{formik.errors.purpose}</FormHelperText>}
        </Grid>
      </SectionCard>
      <SectionCard gridProps={{ spacing: 0 }} paperProps={{ sx: { mb: 0, p: { xs: 2, sm: 2 } } }}>
        <Grid size={{ xs: 12 }}>
          <Typography
            component="h2"
            variant="h6"
            tabIndex={-1}
            sx={{ pb: 1, mb: 1.5, borderBottom: '1px dashed', borderColor: 'divider' }}
          >
            Form Details
          </Typography>
          <FormBuilderDetailFields
            formik={formik}
            nameConflictMessage={nameConflictMessage}
            checkingName={checkingName}
          />
        </Grid>
      </SectionCard>
      <ConfirmDialog
        open={pendingPurpose !== null}
        onClose={() => setPendingPurpose(null)}
        title={`Switch to ${pendingType}?`}
        content="This replaces the fields and layout with the defaults for this form type. Your form name, description and languages will be kept."
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mdi:swap-horizontal" />}
            size="small"
            onClick={() => pendingPurpose !== null && applyFormType(pendingPurpose)}
          >
            Switch form type
          </Button>
        }
      />
    </Stack>
  );
}
