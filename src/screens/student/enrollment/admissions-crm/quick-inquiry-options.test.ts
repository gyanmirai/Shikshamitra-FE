import { it, expect, describe } from 'vitest';
import {
  AdmissionCrmRouteType,
  AdmissionInquiryChannel,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import {
  mapQuickInquiryOptions,
  isValidQuickInquiryEmail,
  getDefaultQuickInquiryOption,
} from './quick-inquiry-options';

describe('Quick Inquiry options', () => {
  it('maps operational channel and route definitions without falling back to static enums', () => {
    const options = mapQuickInquiryOptions({
      academicYearId: 'year-1',
      cycleName: '2026-27 admissions',
      isAdmissionCycleActive: true,
      registrationFormRequiredBeforeExam: false,
      entranceExamRequired: true,
      journeyLocked: true,
      sources: [
        {
          inquirySourceId: 'source-walk-in',
          name: 'Walk-in',
          allowedChannels: [AdmissionInquiryChannel.WalkInReception],
          isDefault: true,
        },
      ],
      inquiryTypes: [
        {
          inquiryTypeId: 'type-admission',
          name: 'New admission',
          isDefault: true,
        },
      ],
      channels: [
        {
          channel: AdmissionInquiryChannel.WalkInReception,
          label: 'Reception walk-in',
          displayOrder: 20,
          isDefault: false,
        },
        {
          channel: AdmissionInquiryChannel.QuickCallEntry,
          label: 'Phone call',
          displayOrder: 10,
          isDefault: true,
        },
      ],
      routes: [
        {
          routeDefinitionId: 'route-sibling-v3',
          name: 'Sibling priority',
          routeType: AdmissionCrmRouteType.SiblingPriority,
          version: 3,
          isDefault: true,
        },
      ],
    });

    expect(options.channels).toEqual([
      {
        value: AdmissionInquiryChannel.QuickCallEntry,
        label: 'Phone call',
        isDefault: true,
      },
      {
        value: AdmissionInquiryChannel.WalkInReception,
        label: 'Reception walk-in',
        isDefault: false,
      },
    ]);
    expect(options.routes).toEqual([
      {
        id: 'route-sibling-v3',
        definitionId: 'route-sibling-v3',
        label: 'Sibling priority',
        routeType: AdmissionCrmRouteType.SiblingPriority,
        version: 3,
        isDefault: true,
      },
    ]);
    expect(options.sources[0]).toEqual({
      id: 'source-walk-in',
      label: 'Walk-in',
      allowedChannels: [AdmissionInquiryChannel.WalkInReception],
      isDefault: true,
    });
    expect(options.inquiryTypes[0]).toEqual({
      id: 'type-admission',
      label: 'New admission',
      isDefault: true,
    });
  });

  it('keeps setup route types usable without legacy route definitions', () => {
    const options = mapQuickInquiryOptions({
      academicYearId: 'year-1',
      cycleName: '2026-27 admissions',
      isAdmissionCycleActive: true,
      registrationFormRequiredBeforeExam: false,
      entranceExamRequired: false,
      journeyLocked: true,
      channels: [],
      sources: [],
      inquiryTypes: [],
      routes: [
        {
          routeDefinitionId: null,
          name: 'Fresh admission',
          routeType: AdmissionCrmRouteType.Fresh,
          version: null,
          isDefault: true,
        },
      ],
    });

    expect(options.routes[0]).toMatchObject({
      id: `route-type:${AdmissionCrmRouteType.Fresh}`,
      definitionId: undefined,
      routeType: AdmissionCrmRouteType.Fresh,
    });
  });

  it('prefers an explicit default and otherwise uses the first operational option', () => {
    const options = [
      { id: 'first', isDefault: false },
      { id: 'default', isDefault: true },
    ];

    expect(getDefaultQuickInquiryOption(options)?.id).toBe('default');
    expect(getDefaultQuickInquiryOption(options.slice(0, 1))?.id).toBe('first');
    expect(getDefaultQuickInquiryOption([])).toBeUndefined();
  });

  it.each([
    ['', true],
    ['parent@example.com', true],
    [' family+admissions@school.org ', true],
    ['parent.example.com', false],
    ['parent@', false],
    ['parent @example.com', false],
  ])('validates inquiry email %j', (email, expected) => {
    expect(isValidQuickInquiryEmail(email)).toBe(expected);
  });
});
