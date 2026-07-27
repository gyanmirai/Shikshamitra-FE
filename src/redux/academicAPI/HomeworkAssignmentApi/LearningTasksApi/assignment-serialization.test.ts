import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';
import {
  AssignmentSubmissionType,
  AssignmentEvaluationMethod,
} from 'src/enums/assignment';

import { serializeAssignmentFormData } from './assignment-serialization';

const baseValues = {
  academicYearId: 'year-1',
  classId: 'standard-1',
  subjectId: 'subject-1',
  title: '  Plant Project  ',
  assignmentTypeId: 'type-1',
  totalMarks: 25,
  description: 'Instructions',
  submissionType: AssignmentSubmissionType.FileUpload,
  evaluationRequired: true,
  evaluationMethod: AssignmentEvaluationMethod.Marks,
  chapterIds: ['chapter-1', 'chapter-2'],
  attachment: null,
  removeAttachment: false,
  divisions: [
    {
      divisionId: 'division-1',
      publishDate: dayjs('2026-08-01T09:00:00.000Z'),
      dueDate: dayjs('2026-08-03T09:00:00.000Z'),
    },
  ],
};

describe('assignment FormData serialization', () => {
  it('uses agreed V2 field names and repeated chapter keys', () => {
    const formData = serializeAssignmentFormData(baseValues);

    expect(formData.get('AcademicYearId')).toBe('year-1');
    expect(formData.get('Title')).toBe('Plant Project');
    expect(formData.get('EvaluationRequired')).toBe('true');
    expect(formData.get('EvaluationMethod')).toBe('0');
    expect(formData.getAll('ChapterIds')).toEqual(['chapter-1', 'chapter-2']);
    expect(formData.get('RemoveAttachment')).toBe('false');
    expect(formData.get('DivisionSchedules[0].PublishAt')).toBe(
      '2026-08-01T09:00:00.000Z'
    );
  });

  it('omits nullable overrides so assignment type defaults can apply', () => {
    const formData = serializeAssignmentFormData({
      ...baseValues,
      totalMarks: '',
      submissionType: null,
      evaluationRequired: null,
      evaluationMethod: null,
    });

    expect(formData.has('SubmissionType')).toBe(false);
    expect(formData.has('EvaluationRequired')).toBe(false);
    expect(formData.has('EvaluationMethod')).toBe(false);
    expect(formData.has('TotalMarks')).toBe(false);
  });

  it('appends exactly one singular attachment key', () => {
    const file = new File(['content'], 'project.pdf', { type: 'application/pdf' });
    const formData = serializeAssignmentFormData({ ...baseValues, attachment: file });

    expect(formData.getAll('Attachment')).toHaveLength(1);
    expect(formData.getAll('attachment')).toHaveLength(0);
    expect((formData.get('Attachment') as File).name).toBe('project.pdf');
  });

  it('does not resubmit an existing backend attachment', () => {
    const formData = serializeAssignmentFormData({
      ...baseValues,
      attachment: {
        name: 'existing.pdf',
        filePath: 'https://files.example/existing.pdf',
        url: 'https://files.example/existing.pdf',
      },
    });

    expect(formData.has('Attachment')).toBe(false);
    expect(formData.get('RemoveAttachment')).toBe('false');
  });

  it('serializes explicit attachment removal without an attachment key', () => {
    const formData = serializeAssignmentFormData({
      ...baseValues,
      totalMarks: '',
      attachment: null,
      removeAttachment: true,
      evaluationRequired: false,
      evaluationMethod: AssignmentEvaluationMethod.NoEvaluation,
    });

    expect(formData.has('Attachment')).toBe(false);
    expect(formData.has('TotalMarks')).toBe(false);
    expect(formData.get('RemoveAttachment')).toBe('true');
    expect(formData.get('EvaluationMethod')).toBe('5');
  });
});
