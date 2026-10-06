import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import { createUpdateChargeValidationSchema } from './UpdateChargeValidation';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const currentYear = {
  startDate: '2026-06-01T00:00:00Z',
  endDate: '2027-05-31T00:00:00Z',
};

const validValues = {
  chargeId: '',
  chargeName: 'Validated charge',
  chargeCategoryId: 'category-id',
  chargeCategoryName: 'Academic charge',
  purposeDescription: 'Charge validation regression test',
  amount: '1.05',
  dueDate: dayjs('2026-09-23'),
  boardId: 'board-id',
  educationMediumId: 'medium-id',
  standardId: ['class-id'],
  divisionIds: ['division-id'],
  studentIds: ['student-id'],
  selectedStudents: [{ id: 'student-id', label: 'Test student' }],
  selectionMode: 'selected' as const,
};

describe('charge amount validation', () => {
  const schema = createUpdateChargeValidationSchema(currentYear, false);

  it.each(['1', '1.5', '1.05', '9999999'])(
    'accepts supported amount %s without changing its meaning',
    async (amount) => {
      await expect(schema.validateAt('amount', { ...validValues, amount })).resolves.toBe(amount);
    }
  );

  it.each(['1.005', '0', '-1', '9999999.01', '1,005'])(
    'rejects unsafe amount %s',
    async (amount) => {
      await expect(schema.validateAt('amount', { ...validValues, amount })).rejects.toThrow();
    }
  );

  it('explains the supported maximum', async () => {
    await expect(
      schema.validateAt('amount', { ...validValues, amount: '9999999.01' })
    ).rejects.toThrow('Amount cannot exceed 9,999,999.00');
  });
});

describe('charge form validation', () => {
  it.each([false, true])(
    'does not require income or bank selections (edit: %s)',
    async (isEdit) => {
      const schema = createUpdateChargeValidationSchema(currentYear, isEdit);
      await expect(
        schema.validate({ ...validValues, chargeId: isEdit ? 'charge-id' : '' })
      ).resolves.toMatchObject({ chargeCategoryId: 'category-id' });
    }
  );
});
