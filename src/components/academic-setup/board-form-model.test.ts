import type { Board } from 'src/types/school';

import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import { getBoardValidationSchema } from './board-form-model';

const boards = [{ id: 'cbse', academicYearId: '2026', name: 'CBSE', type: 0 }] as Board[];
const props = { handleClose: () => {}, academicYearId: '2026', editData: null, boards };
const yearStart = dayjs('2026-04-01');
const yearEnd = dayjs('2027-03-31');
const values = { board: '1', customName: '', startDate: yearStart, endDate: yearEnd };

describe('board form validation', () => {
  it('rejects already configured board submissions and allows the unchanged board on edit', async () => {
    await expect(
      getBoardValidationSchema(props, yearStart, yearEnd).validate({ ...values, board: '0' })
    ).rejects.toThrow('already added');
    await expect(
      getBoardValidationSchema({ ...props, editData: boards[0] }, yearStart, yearEnd).validate({
        ...values,
        board: '0',
      })
    ).resolves.toBeDefined();
  });
  it('validates custom names and accepts a regional board inside the year dates', async () => {
    const schema = getBoardValidationSchema(props, yearStart, yearEnd);
    await expect(schema.validate({ ...values, board: '6', customName: '' })).rejects.toThrow(
      'required'
    );
    await expect(schema.validate({ ...values, board: '6', customName: ' gseb ' })).rejects.toThrow(
      'existing standard'
    );
    await expect(
      schema.validate({ ...values, board: '6', customName: 'Regional Board' })
    ).resolves.toBeDefined();
  });
  it('preserves academic year boundary checks', async () => {
    await expect(
      getBoardValidationSchema(props, yearStart, yearEnd).validate({
        ...values,
        startDate: dayjs('2026-03-31'),
      })
    ).rejects.toThrow('within the academic year');
  });
});
