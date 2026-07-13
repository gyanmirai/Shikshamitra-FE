import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const read = (...segments: string[]) =>
  fs.readFileSync(path.join(process.cwd(), ...segments), 'utf8');

describe('Enrollment settings route contracts', () => {
  const sections = [
    'journey',
    'inquiry-capture',
    'routing-scoring',
    'entrance-exams',
    'registration-documents',
    'offers-seats',
    'activation',
    'governance',
    'communications',
    'automation',
  ];

  it.each(sections)('provides a dedicated %s settings route', (section) => {
    expect(
      fs.existsSync(
        path.join(
          process.cwd(),
          'src',
          'app',
          '(auth-route)',
          'student',
          'enrollment',
          'settings',
          section,
          'page.tsx'
        )
      )
    ).toBe(true);
  });

  it('keeps the root settings URL and redirects it to Journey', () => {
    const source = read(
      'src',
      'app',
      '(auth-route)',
      'student',
      'enrollment',
      'settings',
      'page.tsx'
    );
    expect(source).toContain('redirect(');
    expect(source).toContain('settingsSections.journey');
  });

  it('protects dirty settings with a consistent dialog and browser exit guard', () => {
    const shell = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'enrollment-settings-shell.tsx'
    );
    expect(shell).toContain("addEventListener('beforeunload'");
    expect(shell).toContain('Discard Unsaved Changes?');
    expect(shell).not.toContain('window.confirm');
  });

  it('preserves the selected admission cycle across settings categories', () => {
    const shell = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'enrollment-settings-shell.tsx'
    );
    expect(shell).toContain("searchParams.get('cycle')");
    expect(shell).toContain('sectionHref(href)');
  });
});
