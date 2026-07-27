import type { AssignmentV2Dto, AssignmentTypeDto } from 'src/redux/academicAPI/HomeworkAssignmentApi/contracts';

import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';
import {
  AssignmentStatus,
  AssignmentTypeStatus,
  AssignmentSubmissionType,
  AssignmentEvaluationMethod,
} from 'src/enums/assignment';

import {
  getAssignmentInitialValues,
  hasAssignmentTypeOverrides,
  assignmentValidationSchema,
  applyAssignmentTypeDefaults,
} from './assignmentFormData';

const assignmentType: AssignmentTypeDto = {
  id: 'type-1',
  academicMediumId: 'medium-1',
  assignmentTypeName: 'Project',
  defaultSubmissionType: AssignmentSubmissionType.FileUpload,
  defaultMarks: null,
  defaultDueDays: 2,
  evaluationRequired: true,
  defaultEvaluationMethod: AssignmentEvaluationMethod.Rubric,
  status: AssignmentTypeStatus.Active,
  usageCount: 0,
};

const assignment: AssignmentV2Dto = {
  id: 'assignment-1',
  academicMediumId: 'medium-1',
  academicYearId: 'year-1',
  standardId: 'standard-1',
  standardName: 'Class 8',
  subjectId: 'subject-1',
  subjectName: 'Science',
  title: 'Plant Project',
  assignmentTypeId: 'type-1',
  assignmentTypeName: 'Project',
  evaluationRequired: true,
  evaluationMethod: AssignmentEvaluationMethod.Marks,
  totalMarks: 25,
  description: 'Complete the project.',
  attachment: '/files/project.pdf',
  submissionType: AssignmentSubmissionType.FileUpload,
  status: AssignmentStatus.Draft,
  chapterIds: ['chapter-1'],
  divisionSchedules: [
    {
      divisionId: 'division-1',
      divisionName: 'A',
      publishAt: '2026-08-01T09:00:00.000Z',
      dueAt: '2026-08-03T09:00:00.000Z',
      isPublished: false,
    },
  ],
  createdAt: '2026-07-27T00:00:00.000Z',
  createdBy: 'Teacher',
  updatedAt: '2026-07-27T00:00:00.000Z',
  updatedBy: 'Teacher',
};

describe('assignment form data', () => {
  it('preserves chapters and initializes a singular backend attachment', () => {
    const values = getAssignmentInitialValues(assignment, '', 'fallback-year');

    expect(values.academicYearId).toBe('year-1');
    expect(values.chapterIds).toEqual(['chapter-1']);
    expect(values.attachment).toMatchObject({
      name: 'project.pdf',
      filePath: '/files/project.pdf',
    });
    expect(values.removeAttachment).toBe(false);
  });

  it('applies assignment type defaults while preserving a valid rubric choice', () => {
    const values = getAssignmentInitialValues(null, 'standard-1', 'year-1');
    values.rubricTemplateId = 'rubric-1';
    values.divisions = [
      {
        divisionId: 'division-1',
        publishDate: dayjs('2026-08-01T09:00:00.000Z'),
        dueDate: dayjs('2026-08-05T09:00:00.000Z'),
      },
    ];

    const applied = applyAssignmentTypeDefaults(values, assignmentType);

    expect(applied.evaluationMethod).toBe(AssignmentEvaluationMethod.Rubric);
    expect(applied.totalMarks).toBe('');
    expect(applied.rubricTemplateId).toBe('rubric-1');
    expect(applied.divisions[0].dueDate?.toISOString()).toBe('2026-08-03T09:00:00.000Z');
  });

  it('detects an exact schedule-time override, not only whole-day differences', () => {
    const values = applyAssignmentTypeDefaults(
      {
        ...getAssignmentInitialValues(null, 'standard-1', 'year-1'),
        divisions: [
          {
            divisionId: 'division-1',
            publishDate: dayjs('2026-08-01T09:00:00.000Z'),
            dueDate: dayjs('2026-08-03T09:30:00.000Z'),
          },
        ],
      },
      assignmentType
    );

    values.divisions[0].dueDate = dayjs('2026-08-03T09:30:00.000Z');
    expect(hasAssignmentTypeOverrides(values, assignmentType)).toBe(true);
  });

  it('guards missing academic-year boundaries and only requires rubric on create', async () => {
    const values = applyAssignmentTypeDefaults(
      {
        ...getAssignmentInitialValues(null, 'standard-1', 'year-1'),
        title: 'Plant Project',
        subjectId: 'subject-1',
        description: 'Complete the project.',
        divisions: [
          {
            divisionId: 'division-1',
            publishDate: dayjs('2026-08-01T09:00:00.000Z'),
            dueDate: dayjs('2026-08-03T09:00:00.000Z'),
          },
        ],
      },
      assignmentType
    );

    await expect(assignmentValidationSchema({ id: 'year-1' }).validate(values)).rejects.toThrow(
      'Rubric Template is required for Rubric evaluation'
    );
    await expect(assignmentValidationSchema({ id: 'year-1' }, true).validate(values)).resolves.toBeTruthy();
  });
});
