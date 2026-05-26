import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import { buildWorkExperiencePayload } from './work-experience-payload';

const formatDate = (value: dayjs.Dayjs) => value.format('YYYY-MM-DD');

describe('work experience payload mapping', () => {
  it('does not serialize empty country or state objects', () => {
    const payload = buildWorkExperiencePayload(
      {
        id: 'row-1',
        mediumStageName: 'Shiksha School',
        designation: 'Teacher',
        department: 'Science',
        country: { name: '', isoCode: '' },
        state: { name: 'Gujarat', isoCode: '' },
        city: { name: 'Surat' },
        startDate: dayjs('2023-06-01'),
        endDate: null,
      },
      formatDate
    );

    expect(payload.country).toBeNull();
    expect(payload.state).toBeNull();
    expect(payload.mediumStageName).toBe('Shiksha School');
    expect(payload.startDate).toBe('2023-06-01');
    expect(payload.endDate).toBeNull();
  });

  it('keeps country and state when both name and iso code are present', () => {
    const payload = buildWorkExperiencePayload(
      {
        mediumStageName: 'Shiksha School',
        country: { name: ' India ', isoCode: ' IN ' },
        state: { name: 'Gujarat', isoCode: 'GJ' },
        city: { name: 'Surat' },
      },
      formatDate
    );

    expect(payload.country).toEqual({ name: 'India', isoCode: 'IN' });
    expect(payload.state).toEqual({ name: 'Gujarat', isoCode: 'GJ' });
  });
});
