import { it, expect, describe } from 'vitest';

import studentModule from './student-menu';

type NestedMenuItem = {
  title: string;
  path: string;
  children?: NestedMenuItem[];
};

describe('student Admissions navigation', () => {
  it('exposes the configured Admissions hierarchy without broken child paths', () => {
    const sections = Object.values(studentModule(true));
    const items = sections.flatMap((section) => section.flatMap((group) => group.items));
    const admissions = items.find((item) => item.title === 'Admissions') as
      NestedMenuItem | undefined;

    expect(admissions).toBeDefined();
    expect(admissions?.path).toBe('/student/admissions');
    expect(admissions?.children?.map((item) => item.title)).toEqual([
      'Dashboard',
      'CRM',
      'Applications',
      'Settings',
    ]);

    const crm = admissions?.children?.find((item) => item.title === 'CRM');
    expect(crm?.children?.map((item) => item.title)).toEqual(['Inquiries', 'Pipeline']);
    expect(crm?.children?.find((item) => item.title === 'Pipeline')?.path).toBe(
      '/student/admissions/pipeline'
    );
    expect(crm?.children?.every((item) => item.path.startsWith('/student/admissions/'))).toBe(true);

    const applications = admissions?.children?.find((item) => item.title === 'Applications');
    expect(applications?.children?.map((item) => item.title)).toEqual(['All Applications']);

    const settings = admissions?.children?.find((item) => item.title === 'Settings');
    expect(settings?.children?.map((item) => item.title)).toEqual([
      'Admission Cycles',
      'Admission Offerings',
      'Workflow Builder',
      'Form Builder',
    ]);
  });
});
