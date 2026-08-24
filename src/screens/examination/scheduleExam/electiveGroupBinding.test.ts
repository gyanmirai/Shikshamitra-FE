import { describe, it, expect } from 'vitest';
import { mapBackendToFormik } from './components/initialValues';
import type { IExamFormValues, IExamSubject } from './type';

describe('Elective group badge data binding in Schedule Exam wizard', () => {
  const electiveGroupId = 'elective-group-12th-sp';
  const electiveGroupName = '12th Elective Sp';
  const csSubjectId = 'sub-cs-101';
  const csSubjectName = 'Computer Science';
  const engSubjectId = 'sub-eng-102';
  const engSubjectName = 'English';
  const gujaratiSubjectId = 'sub-guj-201';
  const gujaratiSubjectName = 'Gujarati';

  describe('mapBackendToFormik', () => {
    it('sets electiveGroupName on both the group and nested subjects when mapping backend data', () => {
      const basicData = {
        id: 'exam-123',
        examName: '7th ALL SUB PRAC EXAM',
        standardId: 'class-7',
        divisionIds: ['div-a'],
        subjectIds: [gujaratiSubjectId, csSubjectId, engSubjectId],
      };

      const scheduleData = {
        subjects: [
          {
            subjectId: gujaratiSubjectId,
            subjectName: gujaratiSubjectName,
            examDate: '2026-08-24',
            startTime: '15:10:00',
            endTime: '15:50:00',
          },
          {
            subjectId: electiveGroupId,
            electiveGroupId,
            electiveGroupName,
            electiveGroupSubjects: [
              {
                subjectId: csSubjectId,
                subjectName: csSubjectName,
                examDate: '2026-08-24',
                startTime: '15:55:00',
                endTime: '16:40:00',
              },
              {
                subjectId: engSubjectId,
                subjectName: engSubjectName,
                examDate: '2026-08-24',
                startTime: '15:55:00',
                endTime: '16:40:00',
              },
            ],
          },
        ],
      };

      const roomData = {
        isRoomAssigned: true,
        subjects: [
          {
            subjectId: csSubjectId,
            divisions: [{ divisionId: 'div-a', roomIds: ['room-1'], capacity: 40 }],
          },
          {
            subjectId: engSubjectId,
            divisions: [{ divisionId: 'div-a', roomIds: ['room-1'], capacity: 40 }],
          },
          {
            subjectId: gujaratiSubjectId,
            divisions: [{ divisionId: 'div-a', roomIds: ['room-1'], capacity: 40 }],
          },
        ],
      };

      const result: IExamFormValues = mapBackendToFormik(basicData, scheduleData, roomData);

      const coreSubject = result.subjects.find((s) => s.subjectId === gujaratiSubjectId);
      expect(coreSubject).toBeDefined();
      expect(coreSubject?.electiveGroupId).toBeUndefined();
      expect(coreSubject?.electiveGroupName).toBeUndefined();

      const electiveGroup = result.subjects.find((s) => s.electiveGroupId === electiveGroupId);
      expect(electiveGroup).toBeDefined();
      expect(electiveGroup?.electiveGroupName).toBe(electiveGroupName);
      expect(electiveGroup?.subjects?.length).toBe(2);

      const nestedCs = electiveGroup?.subjects?.find((s: any) => s.subjectId === csSubjectId);
      expect(nestedCs?.subjectName).toBe(csSubjectName);
      expect(nestedCs?.electiveGroupName).toBe(electiveGroupName);

      const nestedEng = electiveGroup?.subjects?.find((s: any) => s.subjectId === engSubjectId);
      expect(nestedEng?.subjectName).toBe(engSubjectName);
      expect(nestedEng?.electiveGroupName).toBe(electiveGroupName);
    });
  });

  describe('Step 3: Room Details card mapping', () => {
    it('resolves electiveGroupName to parent group name for elective subjects and leaves core subjects undefined', () => {
      // Simulating CREATE mode subjects structure
      const createModeSubjects: IExamSubject[] = [
        {
          subjectId: gujaratiSubjectId,
          subjectName: gujaratiSubjectName,
          subjectColor: '#4CAF50',
          examDate: null,
          startTime: null,
          endTime: null,
          totalMarks: 100,
          passingMarks: 35,
          notes: '',
        },
        {
          subjectId: csSubjectId,
          subjectName: csSubjectName,
          subjectColor: '#FF9800',
          electiveGroupId,
          electiveGroupName,
          schedulingMode: 'separate',
          examDate: null,
          startTime: null,
          endTime: null,
          totalMarks: 100,
          passingMarks: 35,
          notes: '',
          subjects: [
            {
              subjectId: csSubjectId,
              subjectName: csSubjectName,
              subjectColor: '#FF9800',
              electiveGroupName,
            },
          ],
        },
        {
          subjectId: engSubjectId,
          subjectName: engSubjectName,
          subjectColor: '#2196F3',
          electiveGroupId,
          electiveGroupName,
          schedulingMode: 'separate',
          examDate: null,
          startTime: null,
          endTime: null,
          totalMarks: 100,
          passingMarks: 35,
          notes: '',
          subjects: [
            {
              subjectId: engSubjectId,
              subjectName: engSubjectName,
              subjectColor: '#2196F3',
              electiveGroupName,
            },
          ],
        },
      ];

      // Logic from roomManageStep3.tsx
      const mappedCards = createModeSubjects.flatMap((subject: any) => {
        if (subject.electiveGroupId && subject.subjects?.length) {
          return subject.subjects.map((s: any) => {
            const resolvedElectiveGroupName =
              subject.electiveGroupName ||
              s.electiveGroupName ||
              (subject.subjectName !== (s.subjectName || s.name)
                ? subject.subjectName
                : undefined);
            return {
              subjectId: s.subjectId,
              subjectName: s.subjectName || s.name || '',
              electiveGroupName: resolvedElectiveGroupName,
              electiveGroupId: subject.electiveGroupId,
            };
          });
        }
        return [
          {
            subjectId: subject.subjectId,
            subjectName: subject.subjectName,
            electiveGroupName: subject.electiveGroupId ? subject.electiveGroupName : undefined,
            electiveGroupId: subject.electiveGroupId,
          },
        ];
      });

      expect(mappedCards).toHaveLength(3);

      const gujCard = mappedCards.find((c) => c.subjectId === gujaratiSubjectId);
      expect(gujCard?.subjectName).toBe(gujaratiSubjectName);
      expect(gujCard?.electiveGroupName).toBeUndefined();

      const csCard = mappedCards.find((c) => c.subjectId === csSubjectId);
      expect(csCard?.subjectName).toBe(csSubjectName);
      expect(csCard?.electiveGroupName).toBe(electiveGroupName);
      expect(csCard?.electiveGroupName).not.toBe(csSubjectName); // Must not duplicate own name!

      const engCard = mappedCards.find((c) => c.subjectId === engSubjectId);
      expect(engCard?.subjectName).toBe(engSubjectName);
      expect(engCard?.electiveGroupName).toBe(electiveGroupName);
      expect(engCard?.electiveGroupName).not.toBe(engSubjectName); // Must not duplicate own name!
    });
  });

  describe('Step 4: Room Allocation Review mapping', () => {
    it('binds parent elective group name to chip and leaves core subjects with undefined chip in room allocation review', () => {
      const roomDetails = {
        [gujaratiSubjectId]: { 'div-a': { roomIds: ['room-1'], capacity: 40 } },
        [csSubjectId]: { 'div-a': { roomIds: ['room-1'], capacity: 40 } },
        [engSubjectId]: { 'div-a': { roomIds: ['room-1'], capacity: 40 } },
      };

      const subjects: IExamSubject[] = [
        {
          subjectId: gujaratiSubjectId,
          subjectName: gujaratiSubjectName,
          subjectColor: '#4CAF50',
          examDate: null,
          startTime: null,
          endTime: null,
          totalMarks: 100,
          passingMarks: 35,
          notes: '',
        },
        {
          subjectId: csSubjectId,
          subjectName: csSubjectName,
          subjectColor: '#FF9800',
          electiveGroupId,
          electiveGroupName,
          schedulingMode: 'separate',
          examDate: null,
          startTime: null,
          endTime: null,
          totalMarks: 100,
          passingMarks: 35,
          notes: '',
          subjects: [
            {
              subjectId: csSubjectId,
              subjectName: csSubjectName,
              subjectColor: '#FF9800',
              electiveGroupName,
            },
          ],
        },
      ];

      const selectedDivIds = new Set(['div-a']);
      const entries: Array<{
        subjectId: string;
        subjectName: string;
        electiveGroupName?: string;
        divisionMap: any;
      }> = [];

      // Logic from RoomAllocationReview.tsx
      subjects.forEach((sub: any) => {
        if (sub?.electiveGroupId && Array.isArray(sub?.subjects) && sub.subjects.length > 0) {
          sub.subjects.forEach((nested: any) => {
            if (nested?.isExamSelectionDisabled) return;
            const subId = nested.subjectId || nested.id;
            if (!subId) return;

            const rawDivMap = (roomDetails as any)?.[subId] ?? {};
            const divisionMap: Record<string, any> = {};
            selectedDivIds.forEach((divId) => {
              if (rawDivMap[divId]?.roomIds?.length > 0) {
                divisionMap[divId] = rawDivMap[divId];
              }
            });

            if (Object.keys(divisionMap).length > 0) {
              const nestedName = nested.subjectName || nested.name || '';
              const parentGroupName =
                sub.electiveGroupName ||
                nested.electiveGroupName ||
                (sub.subjectName !== nestedName ? sub.subjectName : undefined);

              entries.push({
                subjectId: subId,
                subjectName: nestedName || sub.subjectName,
                electiveGroupName: parentGroupName,
                divisionMap,
              });
            }
          });
        } else {
          const subId = sub?.subjectId || sub?.id;
          if (!subId) return;

          const rawDivMap = (roomDetails as any)?.[subId] ?? {};
          const divisionMap: Record<string, any> = {};
          selectedDivIds.forEach((divId) => {
            if (rawDivMap[divId]?.roomIds?.length > 0) {
              divisionMap[divId] = rawDivMap[divId];
            }
          });

          if (Object.keys(divisionMap).length > 0) {
            entries.push({
              subjectId: subId,
              subjectName: sub.subjectName || sub.name || '',
              electiveGroupName: sub.electiveGroupId ? sub.electiveGroupName : undefined,
              divisionMap,
            });
          }
        }
      });

      const gujEntry = entries.find((e) => e.subjectId === gujaratiSubjectId);
      expect(gujEntry?.subjectName).toBe(gujaratiSubjectName);
      expect(gujEntry?.electiveGroupName).toBeUndefined();

      const csEntry = entries.find((e) => e.subjectId === csSubjectId);
      expect(csEntry?.subjectName).toBe(csSubjectName);
      expect(csEntry?.electiveGroupName).toBe(electiveGroupName);
      expect(csEntry?.electiveGroupName).not.toBe(csSubjectName);
    });
  });
});
