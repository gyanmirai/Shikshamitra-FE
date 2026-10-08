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
  it('retains classes across school levels and removes only missing or duplicate IDs', () => {
    expect(selectBulkClasses(['class-1', 'class-9', 'class-1', 'missing'], classes)).toEqual({
      standardIds: ['class-1', 'class-9'],
    });
    expect(selectBulkClasses([], classes)).toEqual({ standardIds: [] });
  });

  it('lets the server derive each school level and application form for preview and create', async () => {
    const values = {
      ...bulkOfferingInitialValues,
      boardId: 'board-1',
      mediumId: 'medium-1',
      inquiryFormDefinitionId: 'inquiry-1',
      ...selectBulkClasses(['class-1', 'class-9'], classes),
    };
    await expect(bulkOfferingSchema.isValid(values)).resolves.toBe(true);
    const preview = toBulkOfferingInput(values, classes, true);
    expect(preview).toMatchObject({
      track: 0,
      entryMode: 0,
      campusId: null,
      previewOnly: true,
      inquiryFormDefinitionId: 'inquiry-1',
      applicationFormDefinitionId: null,
      items: [
        { standardId: 'class-1', code: 'ADM-CLASS-1' },
        { standardId: 'class-9', code: 'ADM-CLASS-9' },
      ],
    });
    expect(preview).not.toHaveProperty('stageId');
    expect(toBulkOfferingInput(values, classes, false)).toEqual({ ...preview, previewOnly: false });
  });

  it('generates distinct bounded codes for duplicate, non-Latin, punctuation, and long names', () => {
    const standards = [
      { id: '00000000-0000-0000-0000-000000000001', name: 'Class 1' },
      { id: '00000000-0000-0000-0000-000000000002', name: 'Class 1' },
      { id: '00000000-0000-0000-0000-000000000003', name: 'कक्षा' },
      { id: '00000000-0000-0000-0000-000000000004', name: '!!!' },
      { id: '00000000-0000-0000-0000-000000000005', name: 'A'.repeat(100) },
    ] as Standards[];
    const values = { ...bulkOfferingInitialValues, standardIds: standards.map((item) => item.id) };
    const preview = toBulkOfferingInput(values, standards, true);
    const codes = preview.items.map((item) => item.code);
    expect(new Set(codes).size).toBe(5);
    codes.forEach((code) => {
      expect(code.length).toBeLessThanOrEqual(64);
      expect(code).toMatch(/^ADM-[A-Z0-9-]+$/);
    });
    expect(toBulkOfferingInput(values, standards, false).items).toEqual(preview.items);
  });
});
