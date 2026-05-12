import { it, expect, describe } from 'vitest';

import { buildWorkExperienceUrl } from './employeeApi';

describe('employeeApi contracts', () => {
  it('builds work experience URL from an object argument', () => {
    expect(buildWorkExperienceUrl({ id: 'employee-1' })).toBe(
      '/employees/employee-1/work-experience'
    );
  });

  it('builds work experience URL from a plain employee id', () => {
    expect(buildWorkExperienceUrl('employee-2')).toBe('/employees/employee-2/work-experience');
  });

  it('does not place literal undefined in the work experience URL', () => {
    expect(() => buildWorkExperienceUrl(undefined)).toThrow('Employee id is required');
  });
});
