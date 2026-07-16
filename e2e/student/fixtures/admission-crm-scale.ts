export const admissionCrmScaleTotal = 25_000;

const deterministicId = (prefix: string, index: number) =>
  `${prefix}-${String(index + 1).padStart(5, '0')}`;

export const buildAdmissionCrmScaleLeadPage = ({
  academicYearId,
  skipCount,
  maxResultCount,
  stage = 0,
}: {
  academicYearId: string;
  skipCount: number;
  maxResultCount: number;
  stage?: number;
}) => ({
  totalCount: admissionCrmScaleTotal,
  items: Array.from({ length: maxResultCount }, (_, offset) => {
    const index = skipCount + offset;
    return {
      id: deterministicId('scale-lead', index),
      academicYearId,
      firstName: `Applicant ${index + 1}`,
      middleName: null,
      lastName: 'Scale',
      parentGuardianName: `Guardian ${index + 1}`,
      primaryContactNo: `9${String(index).padStart(9, '0').slice(-9)}`,
      email: `applicant-${index + 1}@scale.example`,
      admissionIntent: 'Admission inquiry',
      desiredClassName: `Grade ${(index % 12) + 1}`,
      channel: index % 8,
      stage,
      priority: index % 5,
      leadScore: 40 + (index % 61),
      ownerUserId: null,
      campaignName: null,
      registrationFormNumber: null,
      lastActivityTime: new Date(Date.UTC(2026, 6, 1, 8, index % 60)).toISOString(),
      createdAt: new Date(Date.UTC(2026, 5, 1, 8, index % 60)).toISOString(),
      likelyDuplicateCount: 0,
      likelyDuplicates: [],
      isStale: false,
      archivedAt: null,
    };
  }),
});

export const buildAdmissionCrmScaleStaff = (maximum = 25) =>
  Array.from({ length: Math.min(maximum, 25) }, (_, index) => ({
    id: deterministicId('scale-staff', index),
    displayName: `Admissions Staff ${index + 1}`,
    userName: `admissions.staff.${index + 1}`,
    email: `staff-${index + 1}@scale.example`,
  }));
