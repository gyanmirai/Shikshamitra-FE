import type { AssignmentTypeDto, AssignmentTypeUpsertDto } from 'src/redux/academicAPI/HomeworkAssignmentApi/contracts';

import * as Yup from 'yup';
import {
  evaluationUsesMarks,
  AssignmentTypeStatus,
  AssignmentSubmissionType,
  AssignmentEvaluationMethod,
  ASSIGNMENT_TYPE_EVALUATION_METHOD_OPTIONS,
} from 'src/enums/assignment';

export type OptionalNumber = number | '';

export interface AssignmentTypeFormValues {
  assignmentTypeName: string;
  description: string;
  defaultSubmissionType: AssignmentSubmissionType | '';
  defaultMarks: OptionalNumber;
  defaultDueDays: OptionalNumber;
  evaluationRequired: boolean;
  defaultEvaluationMethod: AssignmentEvaluationMethod | '';
  status: AssignmentTypeStatus;
}

const blankNumber = (value: unknown, originalValue: unknown) =>
  originalValue === '' || originalValue === null ? undefined : value;

export const getAssignmentTypeInitialValues = (
  editData?: AssignmentTypeDto | null
): AssignmentTypeFormValues => ({
  assignmentTypeName: editData?.assignmentTypeName ?? '',
  description: editData?.description ?? '',
  defaultSubmissionType: editData?.defaultSubmissionType ?? '',
  defaultMarks: editData?.defaultMarks ?? '',
  defaultDueDays: editData?.defaultDueDays ?? '',
  evaluationRequired: editData?.evaluationRequired ?? true,
  defaultEvaluationMethod:
    editData?.evaluationRequired === false
      ? AssignmentEvaluationMethod.NoEvaluation
      : (editData?.defaultEvaluationMethod ?? ''),
  status: editData?.status ?? AssignmentTypeStatus.Active,
});

export const createAssignmentTypeValidationSchema = (
  existingNames: ReadonlySet<string>,
  currentName?: string
) =>
  Yup.object({
    assignmentTypeName: Yup.string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .required('Name is required')
      .test('unique-assignment-type', 'This assignment type already exists', (value) => {
        const normalized = value?.trim().toLowerCase();
        if (!normalized || normalized === currentName?.trim().toLowerCase()) return true;
        return !existingNames.has(normalized);
      }),
    description: Yup.string().trim().max(250, 'Description cannot exceed 250 characters'),
    defaultSubmissionType: Yup.number()
      .transform(blankNumber)
      .oneOf(Object.values(AssignmentSubmissionType).filter(Number.isInteger) as number[])
      .optional(),
    defaultMarks: Yup.number()
      .transform(blankNumber)
      .when(['evaluationRequired', 'defaultEvaluationMethod'], {
        is: (required: boolean, method: AssignmentEvaluationMethod | '') =>
          evaluationUsesMarks(required, method === '' ? undefined : method),
        then: (schema) => schema.min(1, 'Default marks must be at least 1').optional(),
        otherwise: (schema) => schema.strip(),
      }),
    defaultDueDays: Yup.number()
      .transform(blankNumber)
      .integer('Due days must be a whole number')
      .min(1, 'Default due days must be at least 1')
      .optional(),
    evaluationRequired: Yup.boolean().required(),
    defaultEvaluationMethod: Yup.number()
      .transform(blankNumber)
      .when('evaluationRequired', {
        is: true,
        then: (schema) =>
          schema
            .oneOf(
              ASSIGNMENT_TYPE_EVALUATION_METHOD_OPTIONS.map((option) => option.value),
              'Select a supported evaluation method'
            )
            .required('Evaluation method is required'),
        otherwise: (schema) => schema.oneOf([AssignmentEvaluationMethod.NoEvaluation]).required(),
      }),
    status: Yup.number()
      .oneOf([AssignmentTypeStatus.Active, AssignmentTypeStatus.Inactive])
      .required('Status is required'),
  });

export const mapAssignmentTypeFormToDto = (
  values: AssignmentTypeFormValues
): AssignmentTypeUpsertDto => {
  const evaluationMethod = values.evaluationRequired
    ? (values.defaultEvaluationMethod as AssignmentEvaluationMethod)
    : AssignmentEvaluationMethod.NoEvaluation;
  const usesMarks = evaluationUsesMarks(values.evaluationRequired, evaluationMethod);

  return {
    assignmentTypeName: values.assignmentTypeName.trim(),
    description: values.description.trim() || null,
    defaultSubmissionType:
      values.defaultSubmissionType === '' ? null : values.defaultSubmissionType,
    defaultMarks: usesMarks && values.defaultMarks !== '' ? Number(values.defaultMarks) : null,
    defaultDueDays: values.defaultDueDays === '' ? null : Number(values.defaultDueDays),
    evaluationRequired: values.evaluationRequired,
    defaultEvaluationMethod: evaluationMethod,
    status: values.status,
  };
};
