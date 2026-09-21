import { it, expect, describe } from 'vitest';

import { getRoomAuditActionConfig } from './RoomAuditLogPanel';

describe('room audit action styling', () => {
  it.each([
    ['Approved', 'Reservation Approved', 'success'],
    ['Rejected', 'Reservation Rejected', 'error'],
    ['Cancelled', 'Reservation Cancelled', 'warning'],
    ['Updated', 'Reservation Updated', 'info'],
  ])(
    'maps the API action %s and legacy label %s to the same semantic colors',
    (apiAction, legacyAction, tone) => {
      expect(getRoomAuditActionConfig(apiAction)).toMatchObject({ tone });
      expect(getRoomAuditActionConfig(legacyAction)).toEqual(getRoomAuditActionConfig(apiAction));
    }
  );

  it('normalizes casing and whitespace from API action labels', () => {
    expect(getRoomAuditActionConfig('  approved ')).toEqual(
      getRoomAuditActionConfig('Reservation Approved')
    );
  });
});
