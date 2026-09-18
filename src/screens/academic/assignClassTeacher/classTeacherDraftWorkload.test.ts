import type { ClassTeacherEligibleTeacher } from 'src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi';

import { it, expect, describe } from 'vitest';

import {
  getDraftTeacherWorkload,
  applyDraftTeacherWorkloads,
} from './classTeacherDraftWorkload';

const buildTeacher = (
  overrides: Partial<ClassTeacherEligibleTeacher> = {}
): ClassTeacherEligibleTeacher => ({
  teacherId: 'teacher-1',
  teacherName: 'Jayesh Bhagat',
  currentWorkload: 10,
  maximumWorkload: 30,
  currentClassTeacherCount: 2,
  maximumClassTeacherCount: 2,
  isActive: true,
  isEligible: false,
  hasTimetableConflict: false,
  isOnLeave: false,
  availabilityStatus: 'Available',
  workloadStatus: 'Exceeded',
  conflictStatus: 'None',
  recommendationScore: 50,
  ineligibilityReasons: ['Teacher already has 2 class teacher responsibilities.'],
  ...overrides,
});

describe('applyDraftTeacherWorkloads', () => {
  it('releases capacity immediately when an existing assignment is cleared', () => {
    const [teacher] = applyDraftTeacherWorkloads(
      [buildTeacher()],
      [{ classTeacher: 'teacher-1' }, { classTeacher: null }, { classTeacher: null }],
      [
        { classTeacher: 'teacher-1' },
        { classTeacher: 'teacher-1' },
        { classTeacher: null },
      ]
    );

    expect(teacher).toMatchObject({
      currentClassTeacherCount: 1,
      workloadStatus: 'Near Capacity',
      isEligible: true,
      ineligibilityReasons: [],
    });
  });

  it('blocks another assignment after the released capacity is reused', () => {
    const [teacher] = applyDraftTeacherWorkloads(
      [buildTeacher()],
      [
        { classTeacher: 'teacher-1' },
        { classTeacher: null },
        { classTeacher: 'teacher-1' },
      ],
      [
        { classTeacher: 'teacher-1' },
        { classTeacher: 'teacher-1' },
        { classTeacher: null },
      ]
    );

    expect(teacher).toMatchObject({
      currentClassTeacherCount: 2,
      workloadStatus: 'Exceeded',
      isEligible: false,
      ineligibilityReasons: ['Teacher already has 2 class teacher responsibilities.'],
    });
  });

  it('blocks a teacher who reaches capacity through a new draft assignment', () => {
    const [teacher] = applyDraftTeacherWorkloads(
      [
        buildTeacher({
          currentClassTeacherCount: 1,
          isEligible: true,
          workloadStatus: 'Near Capacity',
          ineligibilityReasons: [],
        }),
      ],
      [{ classTeacher: null }, { classTeacher: 'teacher-1' }],
      [{ classTeacher: null }, { classTeacher: null }]
    );

    expect(teacher).toMatchObject({
      currentClassTeacherCount: 2,
      workloadStatus: 'Exceeded',
      isEligible: false,
      ineligibilityReasons: ['Teacher already has 2 class teacher responsibilities.'],
    });
  });

  it('includes each new assignment in the workload displayed for every matching row', () => {
    const teacher = buildTeacher({
      currentClassTeacherCount: 0,
      isEligible: true,
      workloadStatus: 'Normal',
      ineligibilityReasons: [],
    });
    const originalRows = [{ classTeacher: null }, { classTeacher: null }];
    const afterFirstAssignment = applyDraftTeacherWorkloads(
      [teacher],
      [{ classTeacher: 'teacher-1' }, { classTeacher: null }],
      originalRows
    );
    const afterSecondAssignment = applyDraftTeacherWorkloads(
      [teacher],
      [{ classTeacher: 'teacher-1' }, { classTeacher: 'teacher-1' }],
      originalRows
    );

    expect(
      getDraftTeacherWorkload(afterFirstAssignment, 'teacher-1', teacher)
        ?.currentClassTeacherCount
    ).toBe(1);
    expect(
      getDraftTeacherWorkload(afterSecondAssignment, 'teacher-1', teacher)
        ?.currentClassTeacherCount
    ).toBe(2);
  });

  it('preserves non-capacity eligibility blocks after capacity is released', () => {
    const [teacher] = applyDraftTeacherWorkloads(
      [
        buildTeacher({
          isOnLeave: true,
          ineligibilityReasons: [
            'Teacher is on leave.',
            'Teacher already has 2 class teacher responsibilities.',
          ],
        }),
      ],
      [{ classTeacher: 'teacher-1' }],
      [{ classTeacher: 'teacher-1' }, { classTeacher: 'teacher-1' }]
    );

    expect(teacher).toMatchObject({
      currentClassTeacherCount: 1,
      isEligible: false,
      ineligibilityReasons: ['Teacher is on leave.'],
    });
  });
});
