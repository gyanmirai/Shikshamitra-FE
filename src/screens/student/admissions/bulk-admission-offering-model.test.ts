import type { Standards } from 'src/types/school';

import { it, expect, describe } from 'vitest';

import {
  selectBulkClasses,
  bulkOfferingSchema,
  toBulkOfferingInput,
  bulkOfferingInitialValues,
} from './bulk-admission-offering-model';

const classes = [
  { id: 'class-1', name: 'Class 1', educationMediumStageId: 'primary' },
  { id: 'class-2', name: 'Class 2', educationMediumStageId: 'primary' },
  { id: 'class-9', name: 'Class 9', educationMediumStageId: 'secondary' },
] as Standards[];

describe('bulk offering class selection', () => {
  it('derives the required stage from the selected class and keeps a batch within it', () => {
    expect(selectBulkClasses(['class-1', 'class-2'], classes)).toEqual({
      stageId: 'primary',
      standardIds: ['class-1', 'class-2'],
    });
    expect(selectBulkClasses(['class-1', 'class-9'], classes)).toEqual({
      stageId: 'primary',
      standardIds: ['class-1'],
    });
    expect(selectBulkClasses([], classes)).toEqual({ stageId: '', standardIds: [] });
  });

  it('keeps the derived stage and empty campus in the preview and create payload', async () => {
    const selection = selectBulkClasses(['class-1', 'class-2'], classes);
    const values = {
      ...bulkOfferingInitialValues,
      boardId: 'board-1',
      mediumId: 'medium-1',
      ...selection,
    };

    await expect(bulkOfferingSchema.isValid(values)).resolves.toBe(true);
    const preview = toBulkOfferingInput(values, classes, true);
    expect(preview).toMatchObject({
      stageId: 'primary',
      campusId: null,
      previewOnly: true,
      items: [
        { standardId: 'class-1', code: 'ADM-CLASS-1' },
        { standardId: 'class-2', code: 'ADM-CLASS-2' },
      ],
    });
    expect(toBulkOfferingInput(values, classes, false)).toMatchObject({
      stageId: 'primary',
      previewOnly: false,
    });
  });
});
