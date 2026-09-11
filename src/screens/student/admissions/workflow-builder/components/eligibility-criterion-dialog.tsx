import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionEligibilityCriterion } from 'src/redux/student/admissions/admission-eligibility-policy';

import { useFormik } from 'formik';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Alert, Stack, Button, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { eligibilityCriterionSchema } from 'src/redux/student/admissions/admission-eligibility-validation';

import { EligibilityAgeFields } from './eligibility-age-fields';
import { EligibilityCriterionBasics } from './eligibility-criterion-basics';
import { AdmissionConditionFormPicker } from './admission-condition-form-picker';
import { EligibilitySourceStageFields } from './eligibility-source-stage-fields';

export function EligibilityCriterionDialog({
  initial,
  forms,
  stages,
  stageOrder,
  existingCodes,
  readOnly,
  onClose,
  onSave,
}: {
  initial: AdmissionEligibilityCriterion;
  forms: AdmissionForm[];
  stages: AdmissionWorkflowStage[];
  stageOrder: number;
  existingCodes: string[];
  readOnly: boolean;
  onClose: () => void;
  onSave: (value: AdmissionEligibilityCriterion) => void;
}) {
  const discard = useBoolean();
  const formik = useFormik<AdmissionEligibilityCriterion>({
    initialValues: initial,
    validationSchema: eligibilityCriterionSchema,
    validate: (value) =>
      existingCodes.includes(value.code.toUpperCase())
        ? { code: 'This criterion code is already in use.' }
        : {},
    onSubmit: (value) => {
      if (readOnly) return;
      onSave({ ...value, name: value.name.trim(), failureMessage: value.failureMessage?.trim() });
      onClose();
    },
  });
  const close = () => {
    if (formik.dirty && !readOnly) discard.onTrue();
    else onClose();
  };
  const value = formik.values;
  return (
    <>
      <CustomDialog
        open
        hasForm={false}
        title={readOnly ? 'Eligibility criterion' : 'Configure eligibility criterion'}
        handleClose={close}
        maxWidth="sm"
        hasUnsavedChanges={false}
      >
        <Box
          component="form"
          noValidate
          onSubmit={(event) => {
            event.stopPropagation();
            formik.handleSubmit(event);
          }}
        >
          <DialogScrollContent>
            <Stack spacing={2}>
              <EligibilityCriterionBasics formik={formik} readOnly={readOnly} />
              {value.kind === 'age' && (
                <EligibilityAgeFields
                  value={value}
                  onChange={formik.setValues}
                  readOnly={readOnly}
                />
              )}
              {(value.kind === 'application' || value.kind === 'inquiry') && (
                <AdmissionConditionFormPicker
                  forms={forms}
                  json={value.conditionJson}
                  source={value.kind}
                  formDefinitionId={value.formDefinitionId ?? ''}
                  onFormDefinitionChange={(id) =>
                    formik.setValues({ ...value, formDefinitionId: id, conditionJson: null })
                  }
                  strictTypes
                  readOnly={readOnly}
                  onChange={(conditionJson) => formik.setFieldValue('conditionJson', conditionJson)}
                />
              )}
              {(value.kind === 'assessment' || value.kind === 'documents') && (
                <EligibilitySourceStageFields
                  value={value}
                  stages={stages}
                  stageOrder={stageOrder}
                  onChange={formik.setValues}
                  readOnly={readOnly}
                />
              )}
              {formik.submitCount > 0 &&
                Object.values(formik.errors).map((error) => (
                  <Alert severity="error" key={String(error)}>
                    {String(error)}
                  </Alert>
                ))}
            </Stack>
          </DialogScrollContent>
          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
            <Button size="small" variant="outlined" onClick={close}>
              {readOnly ? 'Close' : 'Cancel'}
            </Button>
            {!readOnly && (
              <Button size="small" variant="contained" type="submit">
                Save criterion
              </Button>
            )}
          </DialogActions>
        </Box>
      </CustomDialog>
      <ConfirmDialog
        open={discard.value}
        onClose={discard.onFalse}
        title="Discard criterion changes?"
        content="Your changes have not been added to the stage draft."
        action={
          <Button color="error" variant="contained" onClick={onClose}>
            Discard changes
          </Button>
        }
      />
    </>
  );
}
