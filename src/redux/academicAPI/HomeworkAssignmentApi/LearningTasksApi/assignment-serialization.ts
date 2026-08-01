import type { Dayjs } from 'dayjs';
import type { FileData } from 'src/components/custom-upload';
import type { AssignmentSubmissionType, AssignmentEvaluationMethod } from 'src/enums/assignment';

import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

export interface AssignmentScheduleFormValue {
  divisionId: string;
  divisionName?: string;
  publishDate: Dayjs | null;
  dueDate: Dayjs | null;
  status?: number;
}

export interface AssignmentFormDataValue {
  academicYearId: string;
  classId: string;
  subjectId: string;
  title: string;
  assignmentTypeId: string;
  totalMarks: number | '';
  description: string;
  submissionType: AssignmentSubmissionType | null;
  evaluationRequired: boolean | null;
  evaluationMethod: AssignmentEvaluationMethod | null;
  chapterIds: string[];
  attachment: File | FileData | string | null;
  removeAttachment: boolean;
  divisions: AssignmentScheduleFormValue[];
}

export const serializeAssignmentFormData = (values: AssignmentFormDataValue) => {
  const formData = new FormData();
  formData.append('AcademicYearId', values.academicYearId);
  formData.append('StandardId', values.classId);
  formData.append('SubjectId', values.subjectId);
  formData.append('Title', values.title.trim());
  formData.append('AssignmentTypeId', values.assignmentTypeId);
  formData.append('Description', values.description);

  if (values.submissionType !== null) {
    formData.append('SubmissionType', String(values.submissionType));
  }
  if (values.evaluationRequired !== null) {
    formData.append('EvaluationRequired', String(values.evaluationRequired));
  }
  if (values.evaluationMethod !== null) {
    formData.append('EvaluationMethod', String(values.evaluationMethod));
  }

  if (values.totalMarks !== '') {
    formData.append('TotalMarks', String(values.totalMarks));
  }

  values.chapterIds.forEach((chapterId) => formData.append('ChapterIds', chapterId));

  if (values.attachment instanceof File) {
    formData.append('Attachment', values.attachment);
  }

  formData.append('RemoveAttachment', String(values.removeAttachment));

  values.divisions.forEach((division, index) => {
    formData.append(`DivisionSchedules[${index}].DivisionId`, division.divisionId);
    if (division.publishDate) {
      formData.append(
        `DivisionSchedules[${index}].PublishAt`,
        dateConvertor(division.publishDate.format(dateFormat))
      );
    }
    if (division.dueDate) {
      formData.append(
        `DivisionSchedules[${index}].DueAt`,
        dateConvertor(division.dueDate.format(dateFormat))
      );
    }
  });

  return formData;
};
