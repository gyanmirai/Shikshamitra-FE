import { it, expect, describe } from 'vitest';
import { transformToBoardTimetable } from './TimetableSnapshot';

describe('transformToBoardTimetable', () => {
  const sampleUserPayload = {
    days: {
      MONDAY: [
        {
          sequence: 1,
          startTime: '07:00',
          endTime: '07:30',
          type: 0,
          breakType: 0,
          subjectType: 0,
          electiveGroupId: null,
          electiveGroupName: null,
          electiveGroupColor: null,
          subjects: [
            {
              subjectAssignmentId: '3a230176-ddc0-a777-f5aa-ceaa0cb96b2c',
              subjectId: '3a22fecb-5ede-6e88-e6be-9df609910481',
              name: 'Social Science',
              color: '#D97706',
              teacherId: '3a22fecb-79bf-300f-74bf-5411c4b0cc8e',
              teacherName: 'Akshay Patel',
              roomId: '3a22fecb-5dbf-43cc-5626-5f2dd4467437',
              roomName: 'B106',
              totalSlots: 6,
              occupiedSlots: 6,
              unoccupiedSlots: 0,
            },
          ],
        },
        {
          sequence: 2,
          startTime: '07:30',
          endTime: '08:00',
          type: 0,
          breakType: 0,
          subjectType: 0,
          electiveGroupId: null,
          electiveGroupName: null,
          electiveGroupColor: null,
          subjects: [
            {
              subjectAssignmentId: '3a230176-ddce-b32b-3bf1-e6b57ea3e097',
              subjectId: '3a22fecb-5ede-763d-28cf-bbbe993c4757',
              name: 'Science',
              color: '#DC2626',
              teacherId: '3a22fecb-7b5b-240c-ed32-07b2e76edf07',
              teacherName: 'Dharmik Jinjala',
              roomId: '3a22fecb-5dbf-43cc-5626-5f2dd4467437',
              roomName: 'B106',
              totalSlots: 6,
              occupiedSlots: 6,
              unoccupiedSlots: 0,
            },
          ],
        },
        {
          sequence: 4,
          startTime: '08:30',
          endTime: '09:00',
          type: 1,
          breakType: 0,
          subjectType: 0,
          electiveGroupId: null,
          electiveGroupName: null,
          electiveGroupColor: null,
          subjects: [],
        },
        {
          sequence: 7,
          startTime: '11:00',
          endTime: '12:30',
          type: 0,
          breakType: 0,
          subjectType: 1,
          electiveGroupId: '3a230174-0d72-209e-ae2a-6adc594ffa96',
          electiveGroupName: 'Pt',
          electiveGroupColor: '#0D47A1',
          subjects: [
            {
              subjectAssignmentId: '3a230176-ddcf-7146-4c38-f446d4f1c249',
              subjectId: '3a230173-3708-d14a-fa6b-f1518bd7ac38',
              name: 'Pt',
              color: '#FFEB3B',
              teacherId: '3a22fecb-7bc7-1342-0aa2-0da8ad5680cc',
              teacherName: 'Jay Dalia',
              roomId: '3a22fecb-5dbf-43cc-5626-5f2dd4467437',
              roomName: 'B106',
              totalSlots: 6,
              occupiedSlots: 6,
              unoccupiedSlots: 0,
            },
          ],
        },
      ],
      TUESDAY: [
        {
          sequence: 1,
          startTime: '07:00',
          endTime: '07:30',
          type: 0,
          breakType: 0,
          subjectType: 0,
          electiveGroupId: null,
          electiveGroupName: null,
          electiveGroupColor: null,
          subjects: [
            {
              subjectAssignmentId: '3a230176-ddc0-a777-f5aa-ceaa0cb96b2c',
              subjectId: '3a22fecb-5ede-6e88-e6be-9df609910481',
              name: 'Social Science',
              color: '#D97706',
              teacherId: '3a22fecb-79bf-300f-74bf-5411c4b0cc8e',
              teacherName: 'Akshay Patel',
              roomId: '3a22fecb-5dbf-43cc-5626-5f2dd4467437',
              roomName: 'B106',
              totalSlots: 6,
              occupiedSlots: 6,
              unoccupiedSlots: 0,
            },
          ],
        },
        {
          sequence: 4,
          startTime: '08:30',
          endTime: '09:00',
          type: 1,
          breakType: 0,
          subjectType: 0,
          electiveGroupId: null,
          electiveGroupName: null,
          electiveGroupColor: null,
          subjects: [],
        },
      ],
    },
    subjectSummary: [
      {
        id: '3a23019f-86b1-0497-e0eb-1ca5f6e8370b',
        subjectAssignmentId: '3a230176-ddc0-a777-f5aa-ceaa0cb96b2c',
        subjectType: 0,
        electiveGroupId: null,
        electiveGroupName: null,
        color: '#D97706',
        totalSlots: 6,
        occupiedSlots: 6,
        unoccupiedSlots: 0,
        subjects: [
          {
            subjectAssignmentId: '3a230176-ddc0-a777-f5aa-ceaa0cb96b2c',
            subjectType: 0,
            subjectId: '3a22fecb-5ede-6e88-e6be-9df609910481',
            subjectName: 'Social Science',
            subjectCode: 'SSCI01',
            color: '#D97706',
          },
        ],
      },
      {
        id: '3a23019f-86b1-674b-d584-8328ca676e1f',
        subjectAssignmentId: '3a230176-ddcf-4d28-f5bf-d27b64b65bdd',
        subjectType: 1,
        electiveGroupId: '3a230174-0d72-209e-ae2a-6adc594ffa96',
        electiveGroupName: 'Pt',
        color: '#0D47A1',
        totalSlots: 6,
        occupiedSlots: 6,
        unoccupiedSlots: 0,
        subjects: [
          {
            subjectAssignmentId: '3a230176-ddcf-7146-4c38-f446d4f1c249',
            subjectType: 1,
            subjectId: '3a230173-3708-d14a-fa6b-f1518bd7ac38',
            subjectName: 'Pt',
            subjectCode: 'PT05',
            color: '#FFEB3B',
          },
        ],
      },
    ],
    totalSlots: 42,
    occupiedSlots: 36,
    unoccupiedSlots: 6,
  };

  it('transforms user payload with days object into TimetableBoard slots', () => {
    const result = transformToBoardTimetable(sampleUserPayload);

    expect(result.hasSlots).toBe(true);
    expect(result.totalSlots).toBe(42);
    expect(result.occupiedSlots).toBe(36);
    expect(result.unoccupiedSlots).toBe(6);

    // Monday slots
    const mondaySlots = result.boardSlots.MONDAY;
    expect(mondaySlots.length).toBe(4);

    // Slot 1: 07:00 - 07:30
    expect(mondaySlots[0].startTime).toBe('07:00');
    expect(mondaySlots[0].endTime).toBe('07:30');
    expect(mondaySlots[0].type).toBe('LECTURE');
    expect(mondaySlots[0].subjects?.[0].name).toBe('Social Science');
    expect(mondaySlots[0].subjects?.[0].teacherName).toBe('Akshay Patel');
    expect(mondaySlots[0].subjects?.[0].roomName).toBe('B106');

    // Slot 3 (Sequence 4): Break slot
    expect(mondaySlots[2].startTime).toBe('08:30');
    expect(mondaySlots[2].endTime).toBe('09:00');
    expect(mondaySlots[2].type).toBe('BREAK');
    expect(mondaySlots[2].breakType).toBe('SHORT');

    // Subject summary and subjects
    expect(result.summary.length).toBe(2);
    expect(result.summary[0].name).toBe('Social Science');
    expect(result.summary[0].code).toBe('SSCI01');
    expect(result.summary[0].color).toBe('#D97706');
    expect(result.summary[1].name).toBe('Pt');
    expect(result.summary[1].isElective).toBe(true);

    expect(result.subjects.length).toBe(2);
    expect(result.subjects[0].name).toBe('Social Science');
  });

  it('handles null / undefined / empty payload gracefully', () => {
    expect(transformToBoardTimetable(null).hasSlots).toBe(false);
    expect(transformToBoardTimetable({}).hasSlots).toBe(false);
  });

  it('handles nested timetable.days payload', () => {
    const nestedPayload = {
      timetable: {
        days: sampleUserPayload.days,
        totalSlots: 10,
        occupiedSlots: 8,
        unoccupiedSlots: 2,
      },
    };

    const result = transformToBoardTimetable(nestedPayload);
    expect(result.hasSlots).toBe(true);
    expect(result.totalSlots).toBe(10);
    expect(result.boardSlots.MONDAY.length).toBe(4);
  });
});
