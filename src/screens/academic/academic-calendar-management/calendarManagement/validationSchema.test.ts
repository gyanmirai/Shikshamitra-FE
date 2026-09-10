import { it, expect, describe } from 'vitest';

import { calendarDayValidationSchema } from './validationSchema';
import {
  CALENDAR_DAY_TITLE_MAX_LENGTH,
  CALENDAR_DAY_DESCRIPTION_MAX_LENGTH,
  CALENDAR_DAY_TITLE_MAX_LENGTH_MESSAGE,
  CALENDAR_DAY_DESCRIPTION_MAX_LENGTH_MESSAGE,
} from './calendarDay.constants';

describe('calendarDayValidationSchema', () => {
  const schema = calendarDayValidationSchema(false);

  it('accepts text at the persistence limits', async () => {
    await expect(
      schema.validateAt('title', { title: 'T'.repeat(CALENDAR_DAY_TITLE_MAX_LENGTH) })
    ).resolves.toHaveLength(CALENDAR_DAY_TITLE_MAX_LENGTH);
    await expect(
      schema.validateAt('description', {
        description: 'D'.repeat(CALENDAR_DAY_DESCRIPTION_MAX_LENGTH),
      })
    ).resolves.toHaveLength(CALENDAR_DAY_DESCRIPTION_MAX_LENGTH);
  });

  it('rejects title and description values beyond the persistence limits', async () => {
    await expect(
      schema.validateAt('title', { title: 'T'.repeat(CALENDAR_DAY_TITLE_MAX_LENGTH + 1) })
    ).rejects.toThrow(CALENDAR_DAY_TITLE_MAX_LENGTH_MESSAGE);
    await expect(
      schema.validateAt('description', {
        description: 'D'.repeat(CALENDAR_DAY_DESCRIPTION_MAX_LENGTH + 1),
      })
    ).rejects.toThrow(CALENDAR_DAY_DESCRIPTION_MAX_LENGTH_MESSAGE);
  });

  it('trims titles before validating and rejects whitespace-only titles as required', async () => {
    await expect(schema.validateAt('title', { title: '  Sports Day  ' })).resolves.toBe(
      'Sports Day'
    );
    await expect(schema.validateAt('title', { title: '   ' })).rejects.toThrow('Title is required');
  });
});
