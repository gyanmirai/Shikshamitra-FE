import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const read = (...segments: string[]) =>
  fs.readFileSync(path.join(process.cwd(), ...segments), 'utf8');

describe('Student Enrollment workspace route contracts', () => {
  it.each([
    ['pipeline', 'AdmissionsPipelineWorkspace'],
    ['exams', 'AdmissionsExamsWorkspace'],
    ['registrations', 'AdmissionsRegistrationsWorkspace'],
    ['offers-seats', 'AdmissionsOffersWorkspace'],
    ['activation', 'AdmissionsActivationWorkspace'],
    ['operations', 'AdmissionsOperationsWorkspace'],
    ['analytics', 'AdmissionsAnalyticsWorkspace'],
  ])('binds %s to its route-specific workspace', (route, workspaceComponent) => {
    const source = read('src', 'app', '(auth-route)', 'student', 'enrollment', route, 'page.tsx');
    expect(source).toContain(workspaceComponent);
  });

  it('keeps explicit workspace and permission boundaries in the shared route entry file', () => {
    const source = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'workspace-pages.tsx'
    );

    [
      'pipeline',
      'exams',
      'registrations',
      'offers',
      'activation',
      'operations',
      'analytics',
    ].forEach((workspace) => expect(source).toContain(`workspace="${workspace}"`));
    expect(source).toContain('StudentPermissionGuard');
  });

  it('keeps Enrollment settings on a client boundary', () => {
    const source = read(
      'src',
      'app',
      '(auth-route)',
      'student',
      'enrollment',
      'settings',
      'page.tsx'
    );
    expect(source.trimStart().startsWith("'use client';")).toBe(true);
  });

  it('does not expose raw staff IDs or provider JSON in ordinary Enrollment UI', () => {
    const workspace = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'index.tsx'
    );
    const settings = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'admissions-crm-configuration.tsx'
    );

    expect(workspace).not.toContain('Owner user ID');
    expect(workspace).not.toContain('Assigned to user ID');
    expect(settings).not.toContain('label="Settings JSON"');
  });

  it('uses bounded server pagination and debounced staff search', () => {
    const workspace = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'index.tsx'
    );
    const boardColumn = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'pipeline-stage-column.tsx'
    );

    expect(workspace).toContain('maxResultCount: 50');
    expect(workspace).toContain('setDebouncedStaffSearch');
    expect(workspace).toContain('maxResultCount: 25');
    expect(boardColumn).toContain('const PAGE_SIZE = 25');
    expect(boardColumn).toContain('Load more');
    expect(workspace).not.toContain('maxResultCount: 200');
  });

  it('keeps removed legacy Enrollment routes and clients absent', () => {
    const removedPaths = [
      ['src', 'app', '(auth-route)', 'student', 'enrollment', 'follow-up', 'page.tsx'],
      ['src', 'app', '(auth-route)', 'student', 'enrollment', 'enroll', 'page.tsx'],
      [
        'src',
        'app',
        '(auth-route)',
        'student',
        'enrollment',
        'enrollment-status-tracking',
        'page.tsx',
      ],
      ['src', 'redux', 'student', 'follow-up', 'follow-up-api.ts'],
      ['src', 'redux', 'student', 'registration-form', 'registration-form-api.ts'],
      ['src', 'redux', 'student', 'inquiry', 'inquiry-api.ts'],
    ];

    removedPaths.forEach((segments) => {
      expect(fs.existsSync(path.join(process.cwd(), ...segments)), segments.join('/')).toBe(false);
    });
  });
});
