import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import { getAdmissionHierarchyOptions } from './admission-hierarchy-options';
import { bulkOfferingSchema, bulkOfferingInitialValues } from './bulk-admission-offering-model';
import {
  admissionOfferingSchema,
  admissionOfferingIdentitySchema,
} from './admission-offering-schema';
import {
  getAdmissionApiError,
  toOfferingWriteInput,
  getOfferingInitialValues,
  isAdmissionOfferingConfigurationIncomplete,
} from './admission-offering-model';

describe('Admission Offering form rules', () => {
  it('starts new single and bulk offerings as inactive preparation', () => {
    expect(getOfferingInitialValues().isActive).toBe(false);
    expect(getOfferingInitialValues()).toMatchObject({ track: 0, entryMode: 0 });
    expect(bulkOfferingInitialValues.isActive).toBe(false);
  });

  it('preserves selected admission types for unused and used offerings', () => {
    const legacy = {
      boardId: 'board',
      mediumId: 'medium',
      stageId: 'stage',
      standardId: 'standard',
      code: 'LEGACY',
      track: 1 as const,
      entryMode: 1 as const,
      useCycleDates: true,
      isActive: false,
    };
    expect(getOfferingInitialValues({ ...legacy, applicationCount: 0 })).toMatchObject({
      track: 1,
      entryMode: 1,
    });
    expect(getOfferingInitialValues({ ...legacy, applicationCount: 1 })).toMatchObject({
      track: 1,
      entryMode: 1,
    });
    expect(getOfferingInitialValues(legacy)).toMatchObject({ track: 1, entryMode: 1 });
  });

  it('requires an inquiry form but permits an Offering without an intake setup', () => {
    expect(
      isAdmissionOfferingConfigurationIncomplete({
        entryMode: 0,
        workflowDefinitionId: 'workflow-1',
        inquiryFormDefinitionId: null,
        applicationFormDefinitionId: null,
        inquiryIntakeProfileId: 'inquiry-profile-1',
        counsellorAssignmentProfileId: 'assignment-profile-1',
      })
    ).toBe(true);
    expect(
      isAdmissionOfferingConfigurationIncomplete({
        entryMode: 0,
        workflowDefinitionId: 'workflow-1',
        inquiryFormDefinitionId: 'inquiry-1',
        applicationFormDefinitionId: 'application-1',
        inquiryIntakeProfileId: 'inquiry-profile-1',
        counsellorAssignmentProfileId: 'assignment-profile-1',
      })
    ).toBe(false);
    expect(
      isAdmissionOfferingConfigurationIncomplete({
        entryMode: 0,
        workflowDefinitionId: 'workflow-1',
        inquiryFormDefinitionId: 'inquiry-1',
        applicationFormDefinitionId: 'application-1',
        inquiryIntakeProfileId: null,
        counsellorAssignmentProfileId: null,
      })
    ).toBe(false);
    expect(
      isAdmissionOfferingConfigurationIncomplete({
        entryMode: 1,
        workflowDefinitionId: 'workflow-1',
        inquiryFormDefinitionId: null,
        applicationFormDefinitionId: 'application-1',
        inquiryIntakeProfileId: null,
        counsellorAssignmentProfileId: 'assignment-profile-1',
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

  it('ignores stale override dates and always serializes cycle-date inheritance', () => {
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

    expect(input.useCycleDates).toBe(true);
    expect(input.openDate).toBeNull();
    expect(input.closeDate).toBeNull();
  });

  it('does not block saving on obsolete hidden custom-date validation', async () => {
    await expect(
      admissionOfferingSchema.validate({
        ...getOfferingInitialValues(),
        name: 'Grade 5 admission',
        boardId: 'board',
        mediumId: 'medium',
        stageId: 'stage',
        standardId: 'standard',
        code: 'GRADE-5',
        useCycleDates: false,
        openDate: dayjs('2026-10-02'),
        closeDate: dayjs('2026-10-01'),
      })
    ).resolves.toMatchObject({ code: 'GRADE-5' });
  });

  it('initializes edits and clones with cycle dates without mutating the stored offering', () => {
    const stored = {
      boardId: 'board',
      mediumId: 'medium',
      stageId: 'stage',
      standardId: 'standard',
      code: 'LEGACY',
      useCycleDates: false,
      openDate: '2026-10-05',
      closeDate: '2026-10-20',
      isActive: false,
    };
    expect(getOfferingInitialValues(stored)).toMatchObject({
      useCycleDates: true,
      openDate: null,
      closeDate: null,
    });
    expect(stored).toMatchObject({
      useCycleDates: false,
      openDate: '2026-10-05',
      closeDate: '2026-10-20',
    });
  });

  it('validates the edit class step without requiring later configuration fields', async () => {
    await expect(
      admissionOfferingIdentitySchema.validate({
        campusId: null,
        boardId: 'board',
        mediumId: 'medium',
        stageId: 'stage',
        standardId: 'standard',
      })
    ).resolves.toMatchObject({ standardId: 'standard' });
    await expect(
      admissionOfferingIdentitySchema.validate({
        campusId: null,
        boardId: 'board',
        mediumId: 'medium',
        stageId: 'stage',
        standardId: '',
      })
    ).rejects.toThrow('Standard is required');
  });

  it('requires registration entry for RTE but leaves other tracks configurable', async () => {
    const draft = {
      ...getOfferingInitialValues(),
      name: 'Grade 5 RTE admission',
      boardId: 'board',
      mediumId: 'medium',
      stageId: 'stage',
      standardId: 'standard',
      code: 'GRADE-5-RTE',
    };
    await expect(
      admissionOfferingSchema.validate({ ...draft, track: 1, entryMode: 0 })
    ).rejects.toThrow('RTE admission must start with registration');
    await expect(
      admissionOfferingSchema.validate({ ...draft, track: 1, entryMode: 1 })
    ).resolves.toMatchObject({
      track: 1,
      entryMode: 1,
    });
    await expect(
      admissionOfferingSchema.validate({ ...draft, track: 2, entryMode: 0 })
    ).resolves.toMatchObject({
      track: 2,
      entryMode: 0,
    });
  });

  it('allows incomplete bulk configuration only when saving inactive', async () => {
    const admissionCycle: AdmissionCycle = {
      id: 'cycle',
      name: 'General Admission',
      code: 'GENERAL',
      academicYearId: 'year',
      academicYearName: '2026-2027',
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      status: 1,
      windowStatus: 1,
      isAcceptingApplications: true,
      linkedOfferingCount: 0,
      activeOfferingCount: 0,
      applicationCount: 0,
      concurrencyStamp: 'stamp',
    };
    const draft = {
      ...bulkOfferingInitialValues,
      admissionCycle,
      boardId: 'board',
      mediumId: 'medium',
      standardIds: ['standard'],
      isActive: false,
    };

    await expect(bulkOfferingSchema.validate(draft)).resolves.toMatchObject({ isActive: false });
    await expect(bulkOfferingSchema.validate({ ...draft, isActive: true })).rejects.toThrow(
      /required for activation/
    );
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

  it('turns a stale write conflict into an actionable refresh message', () => {
    expect(
      getAdmissionApiError(
        {
          data: {
            error: {
              code: 'Admissions.Offering.ConcurrencyConflict',
              message: 'Technical concurrency detail',
            },
          },
        },
        'Unable to save the offering.'
      )
    ).toBe('This offering was changed by another user. Refresh and try again.');
  });

  it('explains an invalid counsellor assignment from the offering API response', () => {
    expect(
      getAdmissionApiError(
        {
          data: {
            errorCode: 'Admissions.Offering.ConfigurationIncomplete',
            detail: 'One or more business rules were violated.',
            data: {
              ValidationErrors: [
                'CounsellorAssignmentProfileInvalid',
                'CounsellorAssignmentProfileInvalid',
              ],
            },
          },
        },
        'Unable to save the offering.'
      )
    ).toContain('active counsellor with access to this class');

    expect(
      getAdmissionApiError(
        {
          data: {
            errorCode: 'Admissions.Offering.ConfigurationIncomplete',
            data: {
              ValidationMessages: [
                'Select an active counsellor who has access to this class in the assignment profile.',
                'The fallback manager in the assignment profile must be active and have access to this class.',
              ],
            },
          },
        },
        'Unable to activate the offering.'
      )
    ).toContain('fallback manager');
  });
});
