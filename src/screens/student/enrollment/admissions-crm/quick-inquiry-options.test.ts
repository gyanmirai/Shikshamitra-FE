import { it, expect, describe } from 'vitest';
import { AdmissionCrmRouteType } from 'src/redux/student/admissions-crm/final-admission-contracts';

import { AdmissionInquiryChannel } from 'src/redux/student/admissions-crm/core-leads-contracts';

import {
  mapQuickInquiryOptions,
  isValidQuickInquiryEmail,
  isValidQuickInquiryPhone,
  getDefaultQuickInquiryOption,
} from './quick-inquiry-options';

describe('Add Inquiry options', () => {
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

  it.each([
    ['', true],
    ['9999900807', true],
    [' +91 99999 00807 ', true],
    ['+1 (604) 555-0123', true],
    ['020-7946-0958', true],
    ['abc1', false],
    ['123456', false],
    ['1234567890123456', false],
    ['+91 99999 CALLME', false],
    ['+1 (604 555-0123', false],
    ['++91 9999900807', false],
  ])('validates inquiry phone %j', (phone, expected) => {
    expect(isValidQuickInquiryPhone(phone)).toBe(expected);
  });
});
