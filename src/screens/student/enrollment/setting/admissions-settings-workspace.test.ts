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

  it('protects dirty settings across domain-sidebar navigation and browser exit', () => {
    const shell = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'enrollment-settings-shell.tsx'
    );
    expect(shell).toContain("addEventListener('beforeunload'");
    expect(shell).toContain("document.addEventListener('click'");
    expect(shell).toContain('Discard Unsaved Changes?');
    expect(shell).not.toContain('window.confirm');
  });

  it('uses the domain sidebar as the only settings category navigation', () => {
    const shell = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'enrollment-settings-shell.tsx'
    );
    const menu = read('src', 'constants', 'student-menu.ts');

    expect(shell).not.toContain('Enrollment settings categories');
    expect(shell).not.toContain('<Drawer');
    expect(menu).toContain("title: 'Journey & Cycles'");
    expect(menu).toContain('studentPaths.enrollment.settingsSections.automation');
    expect(menu.match(/preserveQueryParams: \['cycle'\]/g)).toHaveLength(10);
  });

  it('uses URL-backed panels to progressively disclose dense settings', () => {
    const state = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'enrollment-workspace-state.ts'
    );
    const settingsPage = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'enrollment-settings-page.tsx'
    );

    expect(state).toContain("searchParams.get('panel')");
    expect(state).toContain("set('panel', state.settingsPanel)");
    expect(settingsPage).toContain('EnrollmentSettingsPanelTabs');
    expect(settingsPage).toContain('component={RouterLink}');
    expect(settingsPage).toContain('href={getPanelHref(option.value)}');
  });

  it('keeps skipped settings queries referentially stable', () => {
    const configuration = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'setting',
      'admissions-crm-configuration.tsx'
    );

    expect(configuration).toContain(
      'const emptyPipelineStages: AdmissionCrmPipelineStageDto[] = []'
    );
    expect(configuration).toContain('const stages = stageData ?? emptyPipelineStages');
    expect(configuration).not.toContain('data: stages = []');
  });
});
