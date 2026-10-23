import type { AcademicYear } from 'src/types/school';
import type { FileData } from 'src/components/custom-upload';
import type {
  AssignmentV2Dto,
  AssignmentTypeDto,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/contracts';
import type {
  AssignmentFormDataValue,
  AssignmentScheduleFormValue,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/assignment-serialization';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { learningTaskDateTime } from 'src/utils/learning-task-date-time';
import {
  evaluationUsesMarks,
  AssignmentSubmissionType,
  AssignmentEvaluationMethod,
  ASSIGNMENT_SUPPORTED_EVALUATION_METHODS,
} from 'src/enums/assignment';

export interface AssignmentFormValues extends AssignmentFormDataValue {
  className: string;
  subjectName: string;
  submissionType: AssignmentSubmissionType;
  evaluationRequired: boolean;
  evaluationMethod: AssignmentEvaluationMethod;
  rubricTemplateId: string;
}

export const getEffectiveEvaluation = (assignmentType?: AssignmentTypeDto | null) => {
  const evaluationRequired = assignmentType?.evaluationRequired ?? true;
  const evaluationMethod = evaluationRequired
    ? (assignmentType?.defaultEvaluationMethod ?? AssignmentEvaluationMethod.Marks)
    : AssignmentEvaluationMethod.NoEvaluation;

  return { evaluationRequired, evaluationMethod };
};

type AssignmentInitialData = Partial<Omit<AssignmentV2Dto, 'attachment'>> & {
  attachment?: string | FileData | null;
};

const normalizeAttachment = (attachment?: string | FileData | null): FileData | null => {
  if (!attachment) return null;
  if (typeof attachment !== 'string') return attachment;

  return {
    name: decodeURIComponent(attachment.split('?')[0].split('/').pop() || 'Attachment'),
    filePath: attachment,
    url: attachment,
  };
};

export const getAssignmentInitialValues = (
  editData: AssignmentInitialData | null | undefined,
  classId: string,
  academicYearId: string
): AssignmentFormValues => {
  const evaluationRequired = editData?.evaluationRequired ?? true;
  const evaluationMethod = evaluationRequired
    ? (editData?.evaluationMethod ??
      editData?.defaultEvaluationMethod ??
      AssignmentEvaluationMethod.Marks)
    : AssignmentEvaluationMethod.NoEvaluation;

  return {
    academicYearId: editData?.academicYearId ?? academicYearId,
    title: editData?.title ?? '',
    description: editData?.description ?? '',
    className: editData?.standardName ?? '',
    classId: editData?.standardId ?? classId,
    totalMarks: editData?.totalMarks ?? '',
    divisions:
      editData?.divisionSchedules?.map((division) => ({
        divisionId: division.divisionId,
        divisionName: division.divisionName,
        publishDate: division.publishAt ? learningTaskDateTime(division.publishAt) : null,
        dueDate: division.dueAt ? learningTaskDateTime(division.dueAt) : null,
        status: division.isPublished ? 1 : 0,
      })) ?? [],
    subjectName: editData?.subjectName ?? '',
    subjectId: editData?.subjectId ?? '',
    submissionType: editData?.submissionType ?? AssignmentSubmissionType.OnlineText,
    attachment: normalizeAttachment(editData?.attachment),
    removeAttachment: false,
    assignmentTypeId: editData?.assignmentTypeId ?? '',
    evaluationRequired,
    evaluationMethod,
    chapterIds: editData?.chapterIds ?? [],
    rubricTemplateId: '',
  };
};

export const applyAssignmentTypeDefaults = (
  values: AssignmentFormValues,
  assignmentType: AssignmentTypeDto
): AssignmentFormValues => {
  const { evaluationRequired, evaluationMethod } = getEffectiveEvaluation(assignmentType);
  const usesMarks = evaluationUsesMarks(evaluationRequired, evaluationMethod);

  return {
    ...values,
    assignmentTypeId: assignmentType.id,
    submissionType: assignmentType.defaultSubmissionType ?? values.submissionType,
    totalMarks: usesMarks ? (assignmentType.defaultMarks ?? values.totalMarks) : '',
    evaluationRequired,
    evaluationMethod,
    rubricTemplateId:
      evaluationMethod === AssignmentEvaluationMethod.Rubric ? values.rubricTemplateId : '',
    divisions: values.divisions.map((division) => ({
      ...division,
      dueDate:
        assignmentType.defaultDueDays != null && division.publishDate
          ? division.publishDate.add(assignmentType.defaultDueDays, 'day')
          : division.dueDate,
    })),
  };
};

const scheduleMatchesDefault = (schedule: AssignmentScheduleFormValue, defaultDueDays: number) =>
  !schedule.publishDate ||
  !schedule.dueDate ||
  schedule.dueDate.valueOf() - schedule.publishDate.valueOf() ===
    defaultDueDays * 24 * 60 * 60 * 1000;

export const hasAssignmentTypeOverrides = (
  values: AssignmentFormValues,
  assignmentType?: AssignmentTypeDto | null
) => {
  if (!assignmentType) return false;

  const { evaluationRequired, evaluationMethod } = getEffectiveEvaluation(assignmentType);
  if (
    values.evaluationRequired !== evaluationRequired ||
    values.evaluationMethod !== evaluationMethod
  ) {
    return true;
  }
  if (
    assignmentType.defaultSubmissionType != null &&
    values.submissionType !== assignmentType.defaultSubmissionType
  ) {
    return true;
  }
  if (
    evaluationUsesMarks(evaluationRequired, evaluationMethod) &&
    assignmentType.defaultMarks != null &&
    Number(values.totalMarks) !== assignmentType.defaultMarks
  ) {
    return true;
  }
  return (
    assignmentType.defaultDueDays != null &&
    values.divisions.some(
      (schedule) => !scheduleMatchesDefault(schedule, assignmentType.defaultDueDays as number)
    )
  );
};

const validAcademicYear = (currentYear?: Partial<AcademicYear> | null) =>
  Boolean(
    currentYear?.id &&
    currentYear.startDate &&
    currentYear.endDate &&
    dayjs(currentYear.startDate).isValid() &&
    dayjs(currentYear.endDate).isValid()
  );

export const assignmentValidationSchema = (
  currentYear?: Partial<AcademicYear> | null,
  isEdit = false
) => {
  const hasAcademicYear = validAcademicYear(currentYear);
  const minDate = hasAcademicYear ? dayjs(currentYear?.startDate) : null;
  const maxDate = hasAcademicYear ? dayjs(currentYear?.endDate) : null;

  const scheduleDate = (label: string) =>
    Yup.mixed()
      .test('is-valid-dayjs', `${label} is required`, (value) =>
        Boolean(value && dayjs(value as dayjs.ConfigType).isValid())
      )
      .test('min-date', `${label} is outside the selected academic year`, (value) =>
        !value || !minDate ? true : dayjs(value as dayjs.ConfigType).isSameOrAfter(minDate, 'day')
      )
      .test('max-date', `${label} is outside the selected academic year`, (value) =>
        !value || !maxDate ? true : dayjs(value as dayjs.ConfigType).isSameOrBefore(maxDate, 'day')
      )
      .required(`${label} is required`);

  return Yup.object({
    academicYearId: Yup.string().required('Select an academic year before creating an assignment'),
    title: Yup.string()
      .trim()
      .min(3, 'Assignment Title must be at least 3 characters')
      .required('Assignment Title is required'),
    classId: Yup.string().required('Class is required'),
    divisions: Yup.array()
      .of(
        Yup.object({
          divisionId: Yup.string().required('Division is required'),
          publishDate: scheduleDate('Publish Date'),
          dueDate: scheduleDate('Due Date').test(
            'after-publish',
            'Due date/time must be after publish date/time',
            function validateDueDate(value) {
              return (
                !value ||
                !this.parent.publishDate ||
                dayjs(value as dayjs.ConfigType).isAfter(dayjs(this.parent.publishDate))
              );
            }
          ),
        })
      )
      .min(1, 'At least one Division is required'),
    totalMarks: Yup.number().when(['evaluationRequired', 'evaluationMethod'], {
      is: (required: boolean, method: AssignmentEvaluationMethod) =>
        evaluationUsesMarks(required, method),
      then: (schema) =>
        schema
          .required('Total Marks is required')
          .min(1, 'Total Marks must be at least 1')
          .max(999, 'Total Marks cannot exceed 999')
          .integer('Total Marks must be a whole number'),
      otherwise: (schema) => schema.transform(() => undefined).optional(),
    }),
    subjectId: Yup.string().required('Subject is required'),
    description: Yup.string().required('Description is required'),
    submissionType: Yup.number()
      .oneOf(Object.values(AssignmentSubmissionType).filter(Number.isInteger) as number[])
      .required('Submission type is required'),
    assignmentTypeId: Yup.string().required('Assignment Type is required'),
    evaluationRequired: Yup.boolean().required(),
    evaluationMethod: Yup.number()
      .oneOf(ASSIGNMENT_SUPPORTED_EVALUATION_METHODS, 'Select a supported evaluation method')
      .required(),
    rubricTemplateId: Yup.string().when('evaluationMethod', {
      is: AssignmentEvaluationMethod.Rubric,
      then: (schema) =>
        isEdit
          ? schema.optional()
          : schema.required('Rubric Template is required for Rubric evaluation'),
      otherwise: (schema) => schema.optional(),
    }),
  });
};
