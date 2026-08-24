import { describe, expect, it } from 'vitest';
import { pruneRoomDetails } from './components/initialValues';
import type { IExamSubject, IRoomDetails } from './type';

describe('pruneRoomDetails', () => {
  const mathSubjectId = 'sub-math-123';
  const scienceSubjectId = 'sub-science-456';
  const electiveGroupId = 'elective-group-789';
  const electiveSub1Id = 'elective-sub-cs-01';
  const electiveSub2Id = 'elective-sub-pe-02';

  const sampleSubjects: IExamSubject[] = [
    {
      subjectId: mathSubjectId,
      subjectName: 'Mathematics',
      subjectColor: '#FF0000',
      examDate: null,
      startTime: null,
      endTime: null,
      totalMarks: 100,
      passingMarks: 35,
      notes: '',
    },
    {
      subjectId: scienceSubjectId,
      subjectName: 'Science',
      subjectColor: '#00FF00',
      examDate: null,
      startTime: null,
      endTime: null,
      totalMarks: 100,
      passingMarks: 35,
      notes: '',
    },
    {
      subjectId: electiveGroupId,
      subjectName: '12th Elective Sp',
      subjectColor: '#0000FF',
      electiveGroupId,
      schedulingMode: 'separate',
      examDate: null,
      startTime: null,
      endTime: null,
      totalMarks: 100,
      passingMarks: 35,
      notes: '',
      subjects: [
        {
          subjectId: electiveSub1Id,
          subjectName: 'Computer Science',
          subjectColor: '#0000FF',
          isExamSelectionDisabled: false,
        },
        {
          subjectId: electiveSub2Id,
          subjectName: 'Physical Education',
          subjectColor: '#FFFF00',
          isExamSelectionDisabled: false,
        },
      ],
    },
  ];

  const sampleDivisions = ['all', 'div-a', 'div-b', 'div-c'];

  const sampleRoomDetails: IRoomDetails = {
    [mathSubjectId]: {
      'div-a': { roomIds: ['room-101'], capacity: 40 },
      'div-b': { roomIds: ['room-102'], capacity: 40 },
      'div-c': { roomIds: ['room-103'], capacity: 40 },
    },
    [scienceSubjectId]: {
      'div-a': { roomIds: ['room-201'], capacity: 35 },
      'div-b': { roomIds: ['room-202'], capacity: 35 },
    },
    [electiveSub1Id]: {
      'div-a': { roomIds: ['room-301'], capacity: 30 },
    },
    [electiveSub2Id]: {
      'div-a': { roomIds: ['room-302'], capacity: 30 },
    },
    'obsolete-ghost-subject-guid': {
      'div-a': { roomIds: ['room-999'], capacity: 50 },
    },
  };

  it('purges obsolete ghost subject records that are not in the active subjects list', () => {
    const result = pruneRoomDetails(sampleRoomDetails, sampleSubjects, sampleDivisions);

    expect(result['obsolete-ghost-subject-guid']).toBeUndefined();
    expect(result[mathSubjectId]).toBeDefined();
    expect(result[scienceSubjectId]).toBeDefined();
    expect(result[electiveSub1Id]).toBeDefined();
    expect(result[electiveSub2Id]).toBeDefined();
  });

  it('purges room assignments for core subjects when they are removed from subjects list', () => {
    // Leave only Science and Electives (Mathematics removed)
    const remainingSubjects = sampleSubjects.filter((s) => s.subjectId !== mathSubjectId);

    const result = pruneRoomDetails(sampleRoomDetails, remainingSubjects, sampleDivisions);

    expect(result[mathSubjectId]).toBeUndefined();
    expect(result[scienceSubjectId]).toBeDefined();
    expect(result[scienceSubjectId]['div-a']?.roomIds).toEqual(['room-201']);
    expect(result[electiveSub1Id]).toBeDefined();
    expect(result[electiveSub2Id]).toBeDefined();
  });

  it('purges room assignments for elective subjects when the entire elective group is removed', () => {
    // Leave only Mathematics and Science (Elective group removed)
    const remainingSubjects = sampleSubjects.filter((s) => !s.electiveGroupId);

    const result = pruneRoomDetails(sampleRoomDetails, remainingSubjects, sampleDivisions);

    expect(result[electiveSub1Id]).toBeUndefined();
    expect(result[electiveSub2Id]).toBeUndefined();
    expect(result[mathSubjectId]).toBeDefined();
    expect(result[scienceSubjectId]).toBeDefined();
  });

  it('purges room assignments for individual elective subjects when they are excluded', () => {
    const remainingSubjects = [
      sampleSubjects[0],
      sampleSubjects[1],
      {
        ...sampleSubjects[2],
        subjects: [
          sampleSubjects[2].subjects![0], // only Computer Science kept
        ],
      },
    ];

    const result = pruneRoomDetails(sampleRoomDetails, remainingSubjects, sampleDivisions);

    expect(result[electiveSub1Id]).toBeDefined();
    expect(result[electiveSub2Id]).toBeUndefined();
  });

  it('purges room assignments for deselected divisions across all subjects', () => {
    // Deselect div-b and div-c (keep only div-a)
    const filteredDivisions = ['div-a'];

    const result = pruneRoomDetails(sampleRoomDetails, sampleSubjects, filteredDivisions);

    expect(result[mathSubjectId]).toBeDefined();
    expect(result[mathSubjectId]['div-a']).toBeDefined();
    expect(result[mathSubjectId]['div-b']).toBeUndefined();
    expect(result[mathSubjectId]['div-c']).toBeUndefined();
    expect(result[scienceSubjectId]['div-a']).toBeDefined();
    expect(result[scienceSubjectId]['div-b']).toBeUndefined();
  });

  it('handles empty or null inputs gracefully without errors', () => {
    expect(pruneRoomDetails({}, [], [])).toEqual({});
    expect(pruneRoomDetails(undefined as any, undefined as any, undefined as any)).toEqual({});
    expect(pruneRoomDetails(sampleRoomDetails, [], ['div-a'])).toEqual({});
    expect(pruneRoomDetails(sampleRoomDetails, sampleSubjects, [])).toEqual({});
  });
});
