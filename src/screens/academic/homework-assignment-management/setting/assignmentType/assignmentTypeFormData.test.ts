import { it, expect, describe } from 'vitest';
import {
  AssignmentTypeStatus,
  AssignmentSubmissionType,
  AssignmentEvaluationMethod,
} from 'src/enums/assignment';

import {
  mapAssignmentTypeFormToDto,
  getAssignmentTypeInitialValues,
  createAssignmentTypeValidationSchema,
} from './assignmentTypeFormData';

const validValues = {
  assignmentTypeName: '  Project Work  ',
  description: '  Long form project  ',
  defaultSubmissionType: AssignmentSubmissionType.FileUpload,
  defaultMarks: 20,
  defaultDueDays: 5,
  evaluationRequired: true,
  defaultEvaluationMethod: AssignmentEvaluationMethod.Marks,
  status: AssignmentTypeStatus.Active,
};

describe('assignment type form data', () => {
  it('creates explicit no-evaluation defaults', () => {
    const values = getAssignmentTypeInitialValues({
      id: 'type-1',
      academicMediumId: 'medium-1',
      assignmentTypeName: 'Reading',
      evaluationRequired: false,
      status: AssignmentTypeStatus.Active,
      usageCount: 0,
    });

    expect(values.defaultEvaluationMethod).toBe(AssignmentEvaluationMethod.NoEvaluation);
  });

  it('trims fields and removes marks when evaluation is disabled', () => {
    const dto = mapAssignmentTypeFormToDto({
      ...validValues,
      evaluationRequired: false,
      defaultEvaluationMethod: AssignmentEvaluationMethod.NoEvaluation,
    });

    expect(dto).toMatchObject({
      assignmentTypeName: 'Project Work',
      description: 'Long form project',
      defaultEvaluationMethod: AssignmentEvaluationMethod.NoEvaluation,
    });
    expect(dto.defaultMarks).toBeNull();
  });

  it('maps blank optional defaults to null and rejects supplied zero values', async () => {
    const schema = createAssignmentTypeValidationSchema(new Set());

    const blankDefaults = { ...validValues, defaultMarks: '', defaultDueDays: '' } as const;

    await expect(schema.validate(blankDefaults)).resolves.toBeTruthy();
    expect(mapAssignmentTypeFormToDto(blankDefaults)).toMatchObject({
      defaultMarks: null,
      defaultDueDays: null,
    });
    await expect(schema.validate({ ...validValues, defaultMarks: 0 })).rejects.toThrow(
      'Default marks must be at least 1'
    );
    await expect(schema.validate({ ...validValues, defaultDueDays: 0 })).rejects.toThrow(
      'Default due days must be at least 1'
    );
  });

  it('rejects unsupported grade and checklist evaluation methods', async () => {
    const schema = createAssignmentTypeValidationSchema(new Set());

    await expect(
      schema.validate({ ...validValues, defaultEvaluationMethod: AssignmentEvaluationMethod.Grade })
    ).rejects.toThrow('Select a supported evaluation method');
    await expect(
      schema.validate({
        ...validValues,
        defaultEvaluationMethod: AssignmentEvaluationMethod.Checklist,
      })
    ).rejects.toThrow('Select a supported evaluation method');
  });

  it('validates trimmed name length and duplicate names', async () => {
    const schema = createAssignmentTypeValidationSchema(new Set(['project work']));

    await expect(schema.validate({ ...validValues, assignmentTypeName: ' A ' })).rejects.toThrow(
      'Name must be at least 2 characters'
    );
    await expect(schema.validate(validValues)).rejects.toThrow(
      'This assignment type already exists'
    );
  });
});
