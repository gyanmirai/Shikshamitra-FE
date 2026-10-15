import type { AssessmentScope } from 'src/redux/student/admissions/admission-assessment-types';

import dayjs from 'dayjs';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import {
  sessionSlotCount,
  sessionSetupSchema,
  assignPreviewSlots,
  selectSessionClasses,
  serializeSessionSetup,
  selectedSessionStages,
  setSessionScheduleDate,
  selectSessionAssessment,
  updateSessionSetupValues,
  sessionSetupInitialValues,
} from './assessment-session-setup-model';

const scopes: AssessmentScope[] = [
  {
    admissionOfferingId: 'class1',
    workflowStageDefinitionId: 'exam1',
    offeringName: 'Class1',
    stageName: 'Exam',
    workflowDefinitionId: 'w1',
    workflowVersion: 2,
    schedulingEnabled: true,
  },
  {
    admissionOfferingId: 'class2',
    workflowStageDefinitionId: 'exam2',
    offeringName: 'Class2',
    stageName: 'Exam',
    workflowDefinitionId: 'w2',
    workflowVersion: 3,
    schedulingEnabled: true,
  },
];
const rooms = [
  {
    id: 'room',
    roomName: 'R1',
    buildingId: 'b',
    buildingName: 'Main',
    floorId: 'f',
    floorName: 'First',
    capacity: 30,
  },
];
const valid = () => ({
  ...sessionSetupInitialValues(),
  name: ' Entrance exam ',
  offeringIds: ['class1', 'class2'],
  stageIds: { class1: 'exam1', class2: 'exam2' },
  roomId: 'room',
  startsAt: dayjs('2026-10-20T09:00:00+05:30'),
  endsAt: dayjs('2026-10-20T10:00:00+05:30'),
  capacity: 30,
});
describe('shared assessment session setup', () => {
  it('changes the common date while preserving exam times and serializes explicit UTC offsets', () => {
    const values = {
      ...valid(),
      startsAt: dayjs('2999-01-01T10:00:00'),
      endsAt: dayjs('2999-01-01T11:30:00'),
    };
    const updated = setSessionScheduleDate(values, dayjs('2999-02-02'));
    expect(updated.startsAt?.format('YYYY-MM-DD HH:mm')).toBe('2999-02-02 10:00');
    expect(updated.endsAt?.format('YYYY-MM-DD HH:mm')).toBe('2999-02-02 11:30');
    expect(serializeSessionSetup(updated, rooms).startsAt).toMatch(/Z$/);
    expect(values.startsAt.format('YYYY-MM-DD')).toBe('2999-01-01');
    expect(setSessionScheduleDate(values, null)).toMatchObject({ startsAt: null, endsAt: null });
  });
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-14T00:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());
  it('starts with no fabricated room or default capacity', () => {
    expect(sessionSetupInitialValues()).toMatchObject({
      roomId: '',
      capacity: '',
      startsAt: null,
      endsAt: null,
    });
  });
  it('keeps each Offering and pinned stage distinct while serializing date instants', async () => {
    await expect(sessionSetupSchema(scopes, rooms).validate(valid())).resolves.toBeTruthy();
    expect(serializeSessionSetup(valid(), rooms)).toMatchObject({
      name: 'Entrance exam',
      scopes: [
        { admissionOfferingId: 'class1', workflowStageDefinitionId: 'exam1' },
        { admissionOfferingId: 'class2', workflowStageDefinitionId: 'exam2' },
      ],
      startsAt: '2026-10-20T03:30:00.000Z',
      endsAt: '2026-10-20T04:30:00.000Z',
      location: 'Main / First / R1',
    });
  });
  it('rejects stages from a different Offering and unavailable rooms', async () => {
    await expect(
      sessionSetupSchema(scopes, rooms).validate({
        ...valid(),
        stageIds: { class1: 'exam2', class2: 'exam2' },
      })
    ).rejects.toThrow('Select a valid assessment stage');
    await expect(
      sessionSetupSchema(scopes, rooms).validate({ ...valid(), roomId: 'removed' })
    ).rejects.toThrow('Select an available Institute room');
  });
  it('does not exceed room capacity or existing bookings', async () => {
    await expect(
      sessionSetupSchema(scopes, rooms).validate({ ...valid(), capacity: 31 })
    ).rejects.toThrow('Capacity cannot exceed the room');
    await expect(
      sessionSetupSchema(scopes, rooms, 20).validate({ ...valid(), capacity: 19 })
    ).rejects.toThrow('existing bookings');
  });
  it('calculates individual slots without requiring a trailing gap', async () => {
    const interview = {
      ...valid(),
      sessionType: 'individualInterview' as const,
      interviewerId: 'staff',
      slotDurationMinutes: 15,
      breakMinutes: 5,
      capacity: 3,
    };
    expect(sessionSlotCount(interview)).toBe(3);
    await expect(sessionSetupSchema(scopes, rooms).validate(interview)).resolves.toBeTruthy();
    await expect(
      sessionSetupSchema(scopes, rooms).validate({ ...interview, capacity: 4 })
    ).rejects.toThrow('available interview slots');
  });
  it.each([
    { slotDurationMinutes: 4 },
    { slotDurationMinutes: 181 },
    { breakMinutes: 61 },
    { interviewerId: '' },
  ])('matches interview bounds and required interviewer %j', async (change) => {
    await expect(
      sessionSetupSchema(scopes, rooms).validate({
        ...valid(),
        sessionType: 'individualInterview',
        interviewerId: 'staff',
        capacity: 1,
        ...change,
      })
    ).rejects.toThrow();
  });
  it('selects stages automatically only when unambiguous and preserves valid prior choice', () => {
    const ambiguous = [...scopes, { ...scopes[0], workflowStageDefinitionId: 'interview' }];
    expect(selectedSessionStages(['class1', 'class2'], {}, ambiguous)).toEqual({
      class1: '',
      class2: 'exam2',
    });
    expect(selectedSessionStages(['class1'], { class1: 'exam1' }, ambiguous)).toEqual({
      class1: 'exam1',
    });
  });
  it('preserves server-compatible suggested slots and leaves new choices for server allocation', () => {
    const candidate = {
      applicationId: 'app-later-page',
      stageInstanceId: 'stage',
      applicationNumber: 'ADM2',
      applicantName: 'B',
      admissionOfferingId: 'class1',
      workflowStageDefinitionId: 'exam1',
      concurrencyStamp: 'stamp',
      slotStartsAt: '2026-10-20T12:00:00Z',
    };
    const preview = {
      totalCount: 42,
      eligibleCount: 42,
      availableCount: 3,
      remainingCount: 39,
      requiresRoomApproval: false,
      roomName: 'R1',
      buildingName: 'Main',
      floorName: 'First',
      previewFingerprint: 'fresh',
      items: [candidate],
      proposedBookings: [candidate],
      warnings: [],
      slots: [{ startsAt: '2026-10-20T03:30:00Z', endsAt: '2026-10-20T03:45:00Z' }],
    };
    expect(assignPreviewSlots([candidate], preview)[0]).toMatchObject({
      slotStartsAt: '2026-10-20T12:00:00Z',
      slotEndsAt: null,
    });
    expect(
      assignPreviewSlots([{ ...candidate, applicationId: 'new-choice' }], preview)[0]
    ).toMatchObject({ slotStartsAt: null, slotEndsAt: null });
  });
  it('allows eight sequential individual slots in a two-seat room while rejecting a ninth', async () => {
    const smallRooms = [{ ...rooms[0], capacity: 2 }];
    const interview = {
      ...valid(),
      sessionType: 'individualInterview' as const,
      interviewerId: 'staff',
      slotDurationMinutes: 5,
      breakMinutes: 0,
      endsAt: valid().startsAt.add(40, 'minute'),
      capacity: 8,
    };
    await expect(sessionSetupSchema(scopes, smallRooms).validate(interview)).resolves.toBeTruthy();
    await expect(
      sessionSetupSchema(scopes, smallRooms).validate({ ...interview, capacity: 9 })
    ).rejects.toThrow('available interview slots');
    expect(
      updateSessionSetupValues(
        { ...interview, roomId: '', capacity: '' },
        'roomId',
        'room',
        scopes,
        smallRooms,
        0
      ).capacity
    ).toBe(8);
  });
  it('updates an automatic name with type, stage and date but preserves a manually entered name', () => {
    const selected = updateSessionSetupValues(
      sessionSetupInitialValues(),
      'offeringIds',
      ['class1'],
      scopes,
      rooms,
      0
    );
    expect(selected.name).toContain('School exam · Exam');
    const dated = updateSessionSetupValues(
      selected,
      'startsAt',
      dayjs('2026-10-20T09:00:00'),
      scopes,
      rooms,
      0
    );
    expect(dated.name).toContain('20 Oct 2026');
    const manual = updateSessionSetupValues(
      dated,
      'name',
      'Principal interview batch A',
      scopes,
      rooms,
      0
    );
    const changed = updateSessionSetupValues(
      manual,
      'sessionType',
      'groupInterview',
      scopes,
      rooms,
      0
    );
    expect(changed.name).toBe('Principal interview batch A');
  });
  it('permits booking future slots in an ongoing individual interview but never creating past sessions', async () => {
    const ongoing = {
      ...valid(),
      sessionType: 'individualInterview' as const,
      interviewerId: 'staff',
      slotDurationMinutes: 5,
      breakMinutes: 0,
      startsAt: dayjs('2026-10-13T23:50:00Z'),
      endsAt: dayjs('2026-10-14T00:30:00Z'),
      capacity: 8,
    };
    await expect(
      sessionSetupSchema(scopes, rooms, 0, false, true).validate(ongoing)
    ).resolves.toBeTruthy();
    await expect(sessionSetupSchema(scopes, rooms).validate(ongoing)).rejects.toThrow(
      'future start time'
    );
    await expect(
      sessionSetupSchema(scopes, rooms, 0, false, true).validate({
        ...ongoing,
        endsAt: dayjs('2026-10-14T00:00:00Z'),
      })
    ).rejects.toThrow();
    await expect(
      sessionSetupSchema(scopes, rooms, 0, false, true).validate({
        ...ongoing,
        sessionType: 'exam',
      })
    ).rejects.toThrow('future start time');
  });
});

describe('class-first session mapping', () => {
  const first = { ...scopes[0], standardId: 'standard-1', className: 'Class 1' };
  const second = { ...scopes[1], standardId: 'standard-2', className: 'Class 2' };
  const alternate = {
    ...first,
    admissionOfferingId: 'alternate',
    workflowStageDefinitionId: 'alternate-stage',
  };
  it('resolves a unique class automatically and serializes the exact authorized pair', () => {
    const result = selectSessionClasses(
      sessionSetupInitialValues(),
      ['standard-1', 'standard-2'],
      [first, second]
    );
    expect(result.offeringIds).toEqual(['class1', 'class2']);
    expect(result.stageIds).toEqual({ class1: 'exam1', class2: 'exam2' });
  });
  it('does not silently choose between multiple Offerings or pinned stages', () => {
    const result = selectSessionClasses(
      sessionSetupInitialValues(),
      ['standard-1'],
      [first, alternate]
    );
    expect(result.offeringIds).toEqual([]);
    expect(result.classIds).toEqual(['standard-1']);
    const chosen = selectSessionAssessment(result, 'standard-1', 'alternate:alternate-stage', [
      first,
      alternate,
    ]);
    expect(chosen.offeringIds).toEqual(['alternate']);
    expect(chosen.stageIds).toEqual({ alternate: 'alternate-stage' });
  });
  it('retains an explicit assessment choice and removes deselected class mappings', () => {
    const initial = selectSessionAssessment(
      { ...sessionSetupInitialValues(), classIds: ['standard-1'] },
      'standard-1',
      'alternate:alternate-stage',
      [first, alternate]
    );
    const result = selectSessionClasses(
      initial,
      ['standard-1', 'standard-2'],
      [first, second, alternate]
    );
    expect(result.offeringIds).toEqual(['alternate', 'class2']);
    expect(
      selectSessionClasses(result, ['standard-2'], [first, second, alternate]).stageIds
    ).toEqual({ class2: 'exam2' });
  });
  it('blocks preview when any chosen class still has an unresolved assessment', async () => {
    const result = {
      ...valid(),
      classIds: ['standard-1', 'standard-2'],
      offeringIds: ['class2'],
      stageIds: { class2: 'exam2' },
    };
    await expect(
      sessionSetupSchema([first, second, alternate], rooms).validateAt('classIds', result)
    ).rejects.toThrow('Select an assessment for every selected class');
  });
});
