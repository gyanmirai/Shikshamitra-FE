import { it, expect, describe } from 'vitest';
import { studentPaths } from 'src/constants/student-menu';

import { isNavigationPathActive } from './path-utils';

describe('isNavigationPathActive', () => {
  const seatingPlanPath = '/academic/seatallocation';

  it('matches the navigation item route exactly', () => {
    expect(isNavigationPathActive(seatingPlanPath, seatingPlanPath, true)).toBe(true);
  });

  it('keeps Pipeline active and other working menus inactive in Applicant 360', () => {
    const page = `${studentPaths.enrollment.applicantWorkspace('app-id')}?returnTo=encoded-list`;
    expect(isNavigationPathActive(page, studentPaths.enrollment.pipeline, true)).toBe(true);
    expect(isNavigationPathActive(page, studentPaths.enrollment.applications, true)).toBe(false);
    expect(isNavigationPathActive(page, studentPaths.enrollment.inquiries, true)).toBe(false);
    expect(isNavigationPathActive(page, studentPaths.enrollment.assessments, true)).toBe(false);
  });

  it('keeps Applications active after the decision phase handoff', () => {
    const page = `${studentPaths.enrollment.decisionWorkspace('app-id')}?returnTo=encoded-list`;
    expect(isNavigationPathActive(page, studentPaths.enrollment.applications, true)).toBe(true);
    expect(isNavigationPathActive(page, studentPaths.enrollment.pipeline, true)).toBe(false);
    expect(isNavigationPathActive(page, studentPaths.enrollment.inquiries, true)).toBe(false);
  });

  it('matches a nested guided setup route when descendant matching is enabled', () => {
    expect(
      isNavigationPathActive(
        '/academic/seatallocation/exam-id/setup?planId=plan-id',
        seatingPlanPath,
        true
      )
    ).toBe(true);
  });

  it('normalizes trailing slashes', () => {
    expect(isNavigationPathActive(`${seatingPlanPath}/`, seatingPlanPath, true)).toBe(true);
  });

  it('does not treat a similarly prefixed route as a descendant', () => {
    expect(isNavigationPathActive('/academic/seatallocation-archive', seatingPlanPath, true)).toBe(
      false
    );
  });

  it('does not match descendants when descendant matching is disabled', () => {
    expect(isNavigationPathActive('/academic/seatallocation/exam-id/setup', seatingPlanPath)).toBe(
      false
    );
  });
});

it('keeps HR reporting destinations mutually exclusive for nested routes', () => {
  const root = '/hr/reports';
  const templates = `${root}/templates`;
  [templates, `${templates}/new`, `${templates}/school/edit`].forEach((current) => {
    expect(isNavigationPathActive(current, root, true, [templates])).toBe(false);
    expect(isNavigationPathActive(current, templates, true)).toBe(true);
  });
  [
    root,
    `${root}/generate`,
    `${root}/generate/builtin%3Aattendance`,
    `${root}/runs/run-id`,
  ].forEach((current) => {
    expect(isNavigationPathActive(current, root, true, [templates])).toBe(true);
    expect(isNavigationPathActive(current, templates, true)).toBe(false);
  });
});
