import { it, expect, describe } from 'vitest';

import {
  validateAdmissionPlaybook,
  validateAdmissionPlaybookStep,
  createDefaultAdmissionPlaybook,
  prepareAdmissionPlaybookPayload,
  findAdmissionPlaybookValidationIssue,
} from './admissions-playbook-configuration-utils';

describe('admissions playbook configuration utilities', () => {
  it('creates an ordered, reachable starter playbook', () => {
    const playbook = createDefaultAdmissionPlaybook();

    expect(playbook.stages.map((stage) => stage.code)).toEqual([
      'EXAM_READY',
      'EXAM_SCHEDULED',
      'EXAM_COMPLETED',
      'ADMISSION_READY',
    ]);
    expect(playbook.stages[0].allowedNextStageCodes).toEqual(['EXAM_SCHEDULED']);
  });

  it('keeps the guided editor on the first invalid step', () => {
    const playbook = createDefaultAdmissionPlaybook();
    expect(validateAdmissionPlaybookStep(playbook, 0)).toContain('Playbook name is required.');
    expect(findAdmissionPlaybookValidationIssue(playbook)).toEqual({
      step: 0,
      message: 'Playbook name is required.',
    });

    playbook.name = 'Primary intake';
    playbook.isFallback = true;
    playbook.stages[1].code = playbook.stages[0].code;
    expect(findAdmissionPlaybookValidationIssue(playbook)?.step).toBe(1);
  });

  it('normalizes applicability, codes, notes, and API time values', () => {
    const playbook = createDefaultAdmissionPlaybook();
    playbook.name = '  Grade 1 intake  ';
    playbook.applicability.campus = ' Main Campus ';
    playbook.notes = '  Review annually  ';
    playbook.slotTemplates = [
      {
        code: ' MORNING ',
        name: ' Morning ',
        examDefinitionCode: ' EXAM-1 ',
        roomNo: 1,
        capacity: 30,
        reportingTime: '08:30',
        startTime: '09:00',
        endTime: '10:00',
        daysOfWeek: [],
        blackoutDates: [],
        isActive: true,
      },
    ];

    const payload = prepareAdmissionPlaybookPayload(playbook);

    expect(payload).toMatchObject({
      name: 'Grade 1 intake',
      applicability: { campus: 'Main Campus' },
      notes: 'Review annually',
      slotTemplates: [
        {
          code: 'MORNING',
          reportingTime: '08:30:00',
          startTime: '09:00:00',
          endTime: '10:00:00',
        },
      ],
    });
  });

  it('reports fallback scope, missing scope, duplicate stage, weight, and time errors', () => {
    const playbook = createDefaultAdmissionPlaybook();
    playbook.name = 'Invalid policy';
    playbook.isFallback = true;
    playbook.applicability.campus = 'Main Campus';
    playbook.stages[1].code = playbook.stages[0].code;
    playbook.examDefinitions = [
      {
        code: 'EXAM',
        name: 'Assessment',
        durationMinutes: 60,
        hallTicketEnabled: false,
        components: [
          {
            code: 'MATH',
            name: 'Math',
            componentType: 0,
            maximumMarks: 100,
            weightPercentage: 80,
            isMandatory: true,
            scorePrecision: 0,
          },
        ],
        resultRule: {
          aggregatePassingPercentage: 40,
          requireMandatoryComponentPass: true,
          tieBreakerCodes: [],
        },
      },
    ];
    playbook.slotTemplates = [
      {
        code: 'SLOT',
        name: 'Invalid slot',
        examDefinitionCode: 'EXAM',
        roomNo: 1,
        capacity: 10,
        reportingTime: '10:00',
        startTime: '09:00',
        endTime: '08:00',
        daysOfWeek: [],
        blackoutDates: [],
        isActive: true,
      },
    ];

    expect(validateAdmissionPlaybook(playbook)).toEqual(
      expect.arrayContaining([
        'A fallback playbook cannot have applicability filters.',
        'Stage codes must be unique.',
        'Assessment component weights must total 100%.',
        'Invalid slot has an invalid time sequence.',
      ])
    );
  });
});
