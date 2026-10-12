import type { Standards } from 'src/types/school';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import {
  selectBulkClasses,
  bulkOfferingSchema,
  toBulkOfferingInput,
  getConfiguredBulkClassIds,
  bulkOfferingInitialValues,
} from './bulk-admission-offering-model';

const classes = [
  { id: 'class-1', name: 'Class 1', educationMediumStageId: 'primary' },
  { id: 'class-2', name: 'Class 2', educationMediumStageId: 'primary' },
  { id: 'class-9', name: 'Class 9', educationMediumStageId: 'secondary' },
] as Standards[];
const admissionCycle = { id: 'cycle-2', status: 1, windowStatus: 1 } as AdmissionCycle;

describe('bulk offering class selection', () => {
  it.each([true, false])(
    'uses cycle dates for previewOnly=%s even with stale custom-date values',
    async (previewOnly) => {
      const values = {
        ...bulkOfferingInitialValues,
        admissionCycle,
        boardId: 'board-1',
        mediumId: 'medium-1',
        standardIds: ['class-1'],
        useCycleDates: false,
        openDate: dayjs('2026-10-20'),
        closeDate: dayjs('2026-10-05'),
      };
      await expect(bulkOfferingSchema.isValid(values)).resolves.toBe(true);
      expect(toBulkOfferingInput(values, classes, previewOnly)).toMatchObject({
        useCycleDates: true,
        openDate: null,
        closeDate: null,
        previewOnly,
      });
    }
  );
  it('matches configured classes by both class and school level', () => {
    expect(
      getConfiguredBulkClassIds(classes, [
        { standardId: 'class-1', stageId: 'primary' },
        { standardId: 'class-1', stageId: 'primary' },
        { standardId: 'class-2', stageId: 'secondary' },
        { standardId: 'class-9', stageId: 'secondary' },
        { standardId: 'missing', stageId: 'primary' },
      ])
    ).toEqual(['class-1', 'class-9']);
  });
  it('requires an explicit published and open cycle rather than defaulting to the page cycle', async () => {
    const values = {
      ...bulkOfferingInitialValues,
      boardId: 'board-1',
      mediumId: 'medium-1',
      standardIds: ['class-1'],
    };
    await expect(bulkOfferingSchema.validateAt('admissionCycle', values)).rejects.toThrow(
      'Admission cycle is required'
    );
    await expect(bulkOfferingSchema.isValid({ ...values, admissionCycle })).resolves.toBe(true);
    await Promise.all(
      [
        { status: 0, windowStatus: 1 },
        { status: 1, windowStatus: 0 },
        { status: 2, windowStatus: 3 },
        { status: 3, windowStatus: 4 },
      ].map((invalid) =>
        expect(
          bulkOfferingSchema.isValid({
            ...values,
            admissionCycle: { ...admissionCycle, ...invalid },
          })
        ).resolves.toBe(false)
      )
    );
  });
  it('permits activation without intake profiles while retaining workflow and inquiry form requirements', async () => {
    const values = {
      ...bulkOfferingInitialValues,
      admissionCycle,
      boardId: 'board-1',
      mediumId: 'medium-1',
      standardIds: ['class-1'],
      workflowDefinitionId: 'workflow-1',
      inquiryFormDefinitionId: 'inquiry-1',
      isActive: true,
    };
    await expect(bulkOfferingSchema.isValid(values)).resolves.toBe(true);
    expect(toBulkOfferingInput(values, classes, false)).toMatchObject({
      inquiryIntakeProfileId: null,
      counsellorAssignmentProfileId: null,
      isActive: true,
    });
    await expect(bulkOfferingSchema.isValid({ ...values, workflowDefinitionId: '' })).resolves.toBe(
      false
    );
    await expect(
      bulkOfferingSchema.isValid({ ...values, inquiryFormDefinitionId: '' })
    ).resolves.toBe(false);
  });

  it('retains classes across school levels and removes only missing or duplicate IDs', () => {
    expect(selectBulkClasses(['class-1', 'class-9', 'class-1', 'missing'], classes)).toEqual({
      standardIds: ['class-1', 'class-9'],
    });
    expect(selectBulkClasses([], classes)).toEqual({ standardIds: [] });
  });

  it('serializes missing optional configuration as null, not an invalid empty GUID', () => {
    expect(toBulkOfferingInput(bulkOfferingInitialValues, classes, true)).toMatchObject({
      workflowDefinitionId: null,
      inquiryFormDefinitionId: null,
      inquiryIntakeProfileId: null,
      counsellorAssignmentProfileId: null,
    });
  });

  it('lets the server derive each school level and application form for preview and create', async () => {
    const values = {
      ...bulkOfferingInitialValues,
      admissionCycle,
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

  it.each([1, 2, 3] as const)(
    'serializes special type %i and generates distinct bounded codes',
    (track) => {
      const standards = [
        { id: '00000000-0000-0000-0000-000000000001', name: 'Class 1' },
        { id: '00000000-0000-0000-0000-000000000002', name: 'Class 1' },
        { id: '00000000-0000-0000-0000-000000000003', name: 'कक्षा' },
        { id: '00000000-0000-0000-0000-000000000004', name: 'A'.repeat(100) },
      ] as Standards[];
      const values = {
        ...bulkOfferingInitialValues,
        track,
        entryMode: 1 as const,
        standardIds: standards.map((item) => item.id),
        inquiryFormDefinitionId: 'old-inquiry',
        inquiryIntakeProfileId: 'old-intake',
        counsellorAssignmentProfileId: 'assignment',
      };
      const input = toBulkOfferingInput(values, standards, true);
      expect(input).toMatchObject({
        track,
        entryMode: 1,
        inquiryFormDefinitionId: null,
        inquiryIntakeProfileId: null,
        counsellorAssignmentProfileId: 'assignment',
      });
      const codes = input.items.map((item) => item.code);
      expect(new Set(codes).size).toBe(4);
      codes.forEach((code) => expect(code.length).toBeLessThanOrEqual(64));
      expect(codes[0]).not.toBe(
        toBulkOfferingInput({ ...values, track: 0 }, standards, true).items[0].code
      );
      expect(toBulkOfferingInput(values, standards, false).items).toEqual(input.items);
    }
  );

  it('requires an inquiry form only for inquiry-first activation and enforces RTE registration entry', async () => {
    const values = {
      ...bulkOfferingInitialValues,
      admissionCycle,
      boardId: 'board',
      mediumId: 'medium',
      standardIds: ['class-1'],
      workflowDefinitionId: 'registration-workflow',
      track: 1,
      entryMode: 1,
      isActive: true,
    };
    await expect(bulkOfferingSchema.isValid(values)).resolves.toBe(true);
    await expect(bulkOfferingSchema.isValid({ ...values, entryMode: 0 })).resolves.toBe(false);
    await expect(bulkOfferingSchema.isValid({ ...values, track: 0 })).resolves.toBe(false);
    await expect(bulkOfferingSchema.isValid({ ...values, track: 2 })).resolves.toBe(true);
    await expect(bulkOfferingSchema.isValid({ ...values, track: 3, entryMode: 0 })).resolves.toBe(
      false
    );
  });
});
