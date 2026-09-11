import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import { admissionOfferingSchema } from './admission-offering-schema';
import { getAdmissionHierarchyOptions } from './admission-hierarchy-options';
import {
  toOfferingWriteInput,
  getOfferingInitialValues,
  isAdmissionOfferingConfigurationIncomplete,
} from './admission-offering-model';

describe('Admission Offering form rules', () => {
  it('marks an offering incomplete until all published configuration references are selected', () => {
    expect(
      isAdmissionOfferingConfigurationIncomplete({
        workflowDefinitionId: 'workflow-1',
        inquiryFormDefinitionId: 'inquiry-1',
        applicationFormDefinitionId: null,
      })
    ).toBe(true);
    expect(
      isAdmissionOfferingConfigurationIncomplete({
        workflowDefinitionId: 'workflow-1',
        inquiryFormDefinitionId: 'inquiry-1',
        applicationFormDefinitionId: 'application-1',
      })
    ).toBe(false);
  });

  it('inherits cycle dates without sending copied date values', () => {
    const input = toOfferingWriteInput({
      ...getOfferingInitialValues(),
      boardId: 'board',
      mediumId: 'medium',
      stageId: 'stage',
      standardId: 'standard',
      code: 'GRADE-5',
      openDate: dayjs('2026-10-01'),
      closeDate: dayjs('2027-03-31'),
      useCycleDates: true,
    });

    expect(input.openDate).toBeNull();
    expect(input.closeDate).toBeNull();
  });

  it('serializes override dates as DateTimeOffset values', () => {
    const input = toOfferingWriteInput({
      ...getOfferingInitialValues(),
      boardId: 'board',
      mediumId: 'medium',
      stageId: 'stage',
      standardId: 'standard',
      code: 'GRADE-5',
      openDate: dayjs('2026-10-01'),
      closeDate: dayjs('2027-03-31'),
      useCycleDates: false,
    });

    expect(input.openDate).toMatch(/^2026-10-01T00:00:00[+-]\d{2}:\d{2}$/);
    expect(input.closeDate).toMatch(/^2027-03-31T00:00:00[+-]\d{2}:\d{2}$/);
  });

  it('rejects a close date before the open date', async () => {
    await expect(
      admissionOfferingSchema.validate({
        ...getOfferingInitialValues(),
        boardId: 'board',
        mediumId: 'medium',
        stageId: 'stage',
        standardId: 'standard',
        code: 'GRADE-5',
        useCycleDates: false,
        openDate: dayjs('2026-10-02'),
        closeDate: dayjs('2026-10-01'),
      })
    ).rejects.toThrow('Close date must be on or after the open date');
  });

  it('derives only valid child options for the selected hierarchy', () => {
    const options = getAdmissionHierarchyOptions(
      [
        {
          id: 'stage-1',
          label: 'Primary',
          stageName: 'Primary',
          mediumId: 'english',
          mediumName: 'English',
          boardId: 'cbse',
          boardName: 'CBSE',
          academicYearId: 'year',
        },
        {
          id: 'stage-2',
          label: 'Secondary',
          stageName: 'Secondary',
          mediumId: 'english',
          mediumName: 'English',
          boardId: 'cbse',
          boardName: 'CBSE',
          academicYearId: 'year',
        },
        {
          id: 'stage-3',
          label: 'Primary',
          stageName: 'Primary',
          mediumId: 'gujarati',
          mediumName: 'Gujarati',
          boardId: 'gseb',
          boardName: 'GSEB',
          academicYearId: 'year',
        },
      ],
      'cbse',
      'english'
    );

    expect(options.boards).toHaveLength(2);
    expect(options.mediums.map((item) => item.id)).toEqual(['english']);
    expect(options.stages.map((item) => item.id)).toEqual(['stage-1', 'stage-2']);
  });
});
