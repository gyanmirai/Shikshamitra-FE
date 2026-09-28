import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionDocumentTypeOption } from 'src/redux/student/admissions/admission-document-settings-api';
import type { AdmissionDocumentRequirementPolicy } from 'src/redux/student/admissions/admission-document-policy';

import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Alert, Stack, Button, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { emptyCondition } from 'src/redux/student/admissions/admission-condition-rule';
import { documentRequirementSchema } from 'src/redux/student/admissions/admission-document-policy-validation';

import { DocumentRequirementBasics } from './document-requirement-basics';
import { DocumentRequirementClasses } from './document-requirement-classes';
import { DocumentConditionFormPicker } from './document-condition-form-picker';
import { DocumentRequirementCollection } from './document-requirement-collection';
import {
  hasInquiryCondition,
  INQUIRY_RULE_REPLACEMENT_MESSAGE,
} from '../workflow-inquiry-retirement';

type Props = {
  initial: AdmissionDocumentRequirementPolicy;
  documentTypes: AdmissionDocumentTypeOption[];
  forms: AdmissionForm[];
  existingCodes: string[];
  onClose: () => void;
  onSave: (value: AdmissionDocumentRequirementPolicy) => void;
};
export function DocumentRequirementDialog({
  initial,
  documentTypes,
  forms,
  existingCodes,
  onClose,
  onSave,
}: Props) {
  const formik = useFormik<AdmissionDocumentRequirementPolicy>({
    initialValues: initial,
    validationSchema: documentRequirementSchema,
    validate: (values) => {
      const errors: { code?: string; documentTypeId?: string; conditionJson?: string } = {};
      if (values.requirement === 'conditional' && hasInquiryCondition(values.conditionJson)) {
        errors.conditionJson = INQUIRY_RULE_REPLACEMENT_MESSAGE;
      }
      if (existingCodes.includes(values.code)) errors.code = 'This document code is already in use';
      const mapped = documentTypes.find((item) => item.id === values.documentTypeId);
      if (
        values.collectionMode !== 'original' &&
        mapped &&
        !values.allowedExtensions.some((extension) => mapped.allowedExtensions.includes(extension))
      ) {
        errors.documentTypeId =
          'Choose a category that accepts at least one of the selected file formats.';
      }
      return errors;
    },
    onSubmit: (values) => {
      onSave({ ...values, name: values.name.trim(), description: values.description?.trim() });
      onClose();
    },
  });
  const error = (key: keyof AdmissionDocumentRequirementPolicy) =>
    Boolean(formik.touched[key] && formik.errors[key]);
  const requestClose = () => {
    if (!formik.dirty || window.confirm('You have unsaved changes. Do you want to discard them?'))
      onClose();
  };
  return (
    <CustomDialog
      open
      hasForm={false}
      title="Configure document requirement"
      handleClose={onClose}
      maxWidth="sm"
      guardUnsavedChanges={formik.dirty}
    >
      <Box
        component="form"
        onSubmit={(event) => {
          event.stopPropagation();
          formik.handleSubmit(event);
        }}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            <DocumentRequirementBasics formik={formik} />
            <DocumentRequirementClasses formik={formik} />
            <CustomSelect
              size="small"
              fullWidth
              label="When is it required?"
              value={formik.values.requirement}
              options={[
                {
                  value: 'required',
                  label: formik.values.standardIds
                    ? 'Required in selected classes'
                    : 'Required for every applicant',
                },
                { value: 'optional', label: 'Optional' },
                { value: 'conditional', label: 'Required when conditions match' },
              ]}
              onChange={(value) =>
                formik.setValues({
                  ...formik.values,
                  requirement: value as AdmissionDocumentRequirementPolicy['requirement'],
                  conditionJson:
                    value === 'conditional'
                      ? formik.values.conditionJson || JSON.stringify(emptyCondition())
                      : undefined,
                })
              }
            />
            {formik.values.requirement === 'conditional' && (
              <ShakingTextField error={error('conditionJson')}>
                <Stack spacing={1} onBlur={() => formik.setFieldTouched('conditionJson')}>
                  <DocumentConditionFormPicker
                    json={formik.values.conditionJson}
                    forms={forms}
                    onChange={(json) => formik.setFieldValue('conditionJson', json)}
                  />
                  {error('conditionJson') && (
                    <Alert severity="error">{formik.errors.conditionJson}</Alert>
                  )}
                </Stack>
              </ShakingTextField>
            )}
            <DocumentRequirementCollection formik={formik} documentTypes={documentTypes} />
          </Stack>
        </DialogScrollContent>
        <DialogActions
          sx={{ p: 2, boxShadow: 'var(--shadows-10)', '& .MuiButton-root': { minHeight: 44 } }}
        >
          <Button
            size="small"
            variant="outlined"
            onClick={requestClose}
            startIcon={<Iconify icon="mdi:close" />}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            type="submit"
            startIcon={<Iconify icon="mdi:content-save-outline" />}
          >
            Save requirement
          </Button>
        </DialogActions>
      </Box>
    </CustomDialog>
  );
}
