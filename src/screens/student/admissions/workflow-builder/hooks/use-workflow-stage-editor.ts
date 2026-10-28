import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import * as Yup from 'yup';
import { useEffect } from 'react';
import { useFormik } from 'formik';
import { useBoolean } from 'src/hooks/use-boolean';
import { getDocumentConfigurationError } from 'src/redux/student/admissions/admission-document-policy-validation';
import { getAdmissionFormStageConfigurationError } from 'src/redux/student/admissions/admission-form-stage-policy';
import {
  readStageConfiguration,
  getAssessmentConfigurationError,
} from 'src/redux/student/admissions/admission-assessment-policy';

import {
  isApplicationStageType,
  normalizeStageConfiguration,
} from '../workflow-stage-configuration';

type Props = {
  open: boolean;
  stage: AdmissionWorkflowStage | null;
  stageTypes: AdmissionWorkflowStageTypeMetadata[];
  stages: AdmissionWorkflowStage[];
  forms: AdmissionForm[];
  readOnly: boolean;
  onClose: () => void;
  onSave: (stage: AdmissionWorkflowStage) => void;
};

const schema = Yup.object({
  name: Yup.string().trim().max(128).required('Stage name is required'),
  code: Yup.string()
    .trim()
    .uppercase()
    .matches(/^[A-Z][A-Z0-9_-]*$/, 'Use uppercase letters, numbers, hyphens, or underscores')
    .max(64)
    .required('Stage code is required'),
  description: Yup.string().trim().max(512),
});

const emptyStage: AdmissionWorkflowStage = {
  id: '',
  code: '',
  name: '',
  stageType: 1,
  displayOrder: 0,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: false,
  isTerminalStage: false,
};

export function useWorkflowStageEditor({
  open,
  stage,
  stageTypes,
  stages,
  forms,
  readOnly,
  onClose,
  onSave,
}: Props) {
  const discard = useBoolean();
  const formik = useFormik<AdmissionWorkflowStage>({
    enableReinitialize: true,
    initialValues: normalizeStageConfiguration(stage ?? emptyStage),
    validationSchema: schema,
    validate: (values) => validateConfiguration(values, stageTypes, stages, forms),
    onSubmit: (values, helpers) => {
      if (readOnly || !isApplicationStageType(values.stageType)) return;
      onSave({
        ...normalizeStageConfiguration(values),
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        description: values.description?.trim() || undefined,
        allowManualSkip:
          values.isRequired || [1, 2, 4, 5].includes(values.stageType)
            ? false
            : values.allowManualSkip,
      });
      helpers.resetForm({ values });
      onClose();
    },
  });

  useEffect(() => {
    if (!open || !formik.dirty) return undefined;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [open, formik.dirty]);

  const close = () => {
    discard.onFalse();
    formik.resetForm();
    onClose();
  };

  const metadata = stageTypes.find((item) => item.type === formik.values.stageType);
  const formId = readStageConfiguration(formik.values.configurationJson)?.formDefinitionId;
  const formDefinitionId = typeof formId === 'string' ? formId : '';

  return {
    formik,
    validationSchema: schema,
    metadata,
    discard,
    close,
    formDefinitionId,
    forms,
    requestClose: () => {
      if (!readOnly && formik.dirty) discard.onTrue();
      else close();
    },
  };
}

function validateConfiguration(
  values: AdmissionWorkflowStage,
  stageTypes: AdmissionWorkflowStageTypeMetadata[],
  stages: AdmissionWorkflowStage[],
  forms: AdmissionForm[]
) {
  if (
    stages.some(
      (stage) =>
        stage.id !== values.id &&
        stage.code.trim().toUpperCase() === values.code.trim().toUpperCase()
    )
  ) {
    return { code: 'Another stage already uses this code' };
  }
  if (!isApplicationStageType(values.stageType)) {
    return {
      stageType: 'Choose Form, Assessment, Payment, Document verification or Admission Decision.',
    };
  }
  if (values.stageType === 2) {
    const error = getAssessmentConfigurationError(values.configurationJson);
    return error ? { configurationJson: error } : {};
  }
  if (values.stageType === 5) {
    const error = getDocumentConfigurationError(values.configurationJson);
    return error ? { configurationJson: error } : {};
  }
  if (values.stageType === 1) {
    const selectedId = readStageConfiguration(values.configurationJson)?.formDefinitionId;
    if (forms.some((form) => form.id === selectedId && form.purpose === 0)) {
      return {
        configurationJson:
          'Select a published registration form. Inquiry forms cannot be used in this stage.',
      };
    }
    const error = getAdmissionFormStageConfigurationError(values.configurationJson, forms);
    return error ? { configurationJson: error } : {};
  }
  if (!stageTypes.find((item) => item.type === values.stageType)?.supportsFormAttachment) return {};
  const formId = readStageConfiguration(values.configurationJson)?.formDefinitionId;
  return typeof formId === 'string' && formId.trim()
    ? {}
    : { configurationJson: 'Select a published form version' };
}
