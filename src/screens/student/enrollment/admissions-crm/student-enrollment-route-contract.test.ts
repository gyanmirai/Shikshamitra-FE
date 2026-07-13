import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const read = (...segments: string[]) =>
  fs.readFileSync(path.join(process.cwd(), ...segments), 'utf8');

describe('Student Enrollment workspace route contracts', () => {
  it.each([
    ['pipeline', 'pipeline'],
    ['exams', 'exams'],
    ['registrations', 'registrations'],
    ['offers-seats', 'offers'],
    ['activation', 'activation'],
    ['operations', 'operations'],
    ['analytics', 'analytics'],
  ])('binds %s to its explicit workspace', (route, workspace) => {
    const source = read('src', 'app', '(auth-route)', 'student', 'enrollment', route, 'page.tsx');
    expect(source).toContain(`workspace="${workspace}"`);
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
});
