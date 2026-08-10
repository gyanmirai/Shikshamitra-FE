import { describe, expect, it } from 'vitest';

import { parseAcademicAuditContext } from './academicAuditContext';

describe('parseAcademicAuditContext', () => {
  it('turns audit JSON into readable key-value entries', () => {
    expect(
      parseAcademicAuditContext(
        '{"name":"Mathematics","status":0,"isActive":true,"educationMediumId":"3a22dd9c-d5f4-4d8f-9c91-41fc177de254"}'
      )
    ).toEqual([
      { key: 'name', label: 'Name', value: 'Mathematics' },
      { key: 'status', label: 'Status', value: '0' },
      { key: 'isActive', label: 'Is Active', value: 'Yes' },
      { key: 'educationMediumId', label: 'Education Medium', value: 'ID: 3a22dd9c…e254' },
    ]);
  });

  it('flattens nested values and never returns raw malformed JSON', () => {
    expect(parseAcademicAuditContext('{"category":{"name":"General"}}')).toEqual([
      { key: 'category.name', label: 'Name', value: 'General' },
    ]);
    expect(parseAcademicAuditContext('{bad json')).toEqual([]);
  });

  it('decodes JSON strings nested inside the audit payload', () => {
    expect(
      parseAcademicAuditContext(
        '{"oldValueJson":"","newValueJson":"{\\"TenantId\\":\\"11111111-1111-1111-1111-111111111111\\",\\"DayType\\":3,\\"Title\\":\\"Summer vacation\\"}"}'
      )
    ).toEqual([
      { key: 'oldValueJson', label: 'Old Value', value: '-' },
      { key: 'newValueJson.TenantId', label: 'Tenant', value: 'ID: 11111111…1111' },
      { key: 'newValueJson.DayType', label: 'Day Type', value: '3' },
      { key: 'newValueJson.Title', label: 'Title', value: 'Summer vacation' },
    ]);
  });

  it('prefers a readable education-medium name over its technical ID', () => {
    expect(
      parseAcademicAuditContext(
        '{"educationMediumId":"3a22dd9c-d5f4-4d8f-9c91-41fc177de254","educationMediumName":"English"}'
      )
    ).toEqual([{ key: 'educationMediumName', label: 'Education Medium', value: 'English' }]);
  });
});
