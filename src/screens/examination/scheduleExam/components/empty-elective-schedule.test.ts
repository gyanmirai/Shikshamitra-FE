import { it, expect, describe } from 'vitest';

import { validationSchema } from '../validationSchema';
import { buildExamPlanningIssues } from './scheduleExamPlanningUtils';
import { makeEmptyElectiveForm } from './empty-elective-schedule.fixture';
import { buildReviewSubjectRoomEntries } from './room-allocation-review-utils';
import {
  pruneRoomDetails,
  serializeSchedulePayload,
  serializeBasicDetailsPayload,
  serializeRoomAssignmentPayload,
} from './initialValues';

describe('Schedule Exam with an unassigned elective', () => {
  it('retains Computer Science identity and zero count without scheduling it', () => {
    const values = makeEmptyElectiveForm();
    expect(values.subjects[0].subjects?.[0]).toMatchObject({
      subjectId: 'computer',
      subjectName: 'Computer Science',
      subjectCode: 'COM06',
      assignedStudentCount: 0,
      isExamSelectionDisabled: true,
    });
    expect(values.subjects[1].subjects?.[0]).toMatchObject({
      subjectId: 'pt',
      assignedStudentCount: 3,
      isExamSelectionDisabled: false,
    });
  });

  it('allows Pt through basic, schedule, and room validation without Computer Science', async () => {
    const values = { ...makeEmptyElectiveForm(), isRoomAssign: true };
    await Promise.all(
      validationSchema
        .slice(0, 3)
        .map((schema) =>
          expect(schema.validate(values, { abortEarly: false })).resolves.toBeDefined()
        )
    );
    expect(buildExamPlanningIssues(values)).toEqual([]);
    expect(serializeBasicDetailsPayload(values).subjectIds).toEqual(['pt']);
    expect(serializeSchedulePayload(values).subjects.map((subject) => subject.subjectId)).toEqual([
      'pt',
    ]);
    expect(
      serializeRoomAssignmentPayload(values).subjects.map((subject) => subject.subjectId)
    ).toEqual(['pt']);
  });

  it('does not turn an already empty nested array into a payload or room entry', async () => {
    const values = makeEmptyElectiveForm();
    values.subjects[0].subjects = [];
    await expect(validationSchema[1].validate(values)).resolves.toBeDefined();
    expect(serializeBasicDetailsPayload(values).subjectIds).toEqual(['pt']);
    expect(serializeSchedulePayload(values).subjects.map((subject) => subject.subjectId)).toEqual([
      'pt',
    ]);
    expect(
      serializeRoomAssignmentPayload(values).subjects.map((subject) => subject.subjectId)
    ).toEqual(['pt']);
  });

  it('keeps required validation on assigned electives and prevents an exam with only excluded subjects', async () => {
    const values = makeEmptyElectiveForm();
    values.subjects[1].subjects![0].examDate = null;
    await expect(validationSchema[1].validate(values)).rejects.toThrow();
    values.subjects = [values.subjects[0]];
    await Promise.all(
      validationSchema
        .slice(0, 2)
        .map((schema) =>
          expect(schema.validate(values)).rejects.toThrow(
            'Select at least one core subject or elective with assigned students'
          )
        )
    );
  });

  it('enables Computer Science when one student is assigned and serializes both subjects', async () => {
    const values = makeEmptyElectiveForm(1);
    expect(values.subjects[0].subjects?.[0]).toMatchObject({
      assignedStudentCount: 1,
      isExamSelectionDisabled: false,
    });
    await expect(validationSchema[1].validate(values)).resolves.toBeDefined();
    expect(serializeBasicDetailsPayload(values).subjectIds).toEqual(['computer', 'pt']);
    expect(serializeSchedulePayload(values).subjects.map((subject) => subject.subjectId)).toEqual([
      'computer',
      'pt',
    ]);
  });

  it('removes stale rooms for the excluded elective from form state and room review', () => {
    const values = makeEmptyElectiveForm();
    const rooms = { ...values.roomDetails, computer: values.roomDetails.pt };
    expect(pruneRoomDetails(rooms, values.subjects, values.divisions)).toEqual(values.roomDetails);
    expect(
      buildReviewSubjectRoomEntries(values.subjects, values.divisions, rooms).map(
        (subject) => subject.subjectId
      )
    ).toEqual(['pt']);
  });
});
