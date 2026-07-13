import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Enrollment settings workspace contract', () => {
  it('defines every release settings section and loads only the selected surface', () => {
    const source = read('src/screens/student/enrollment/setting/admissions-settings-workspace.tsx');

    [
      'Journey',
      'Inquiry Capture',
      'Routing & Scoring',
      'Entrance Exams',
      'Registration & Documents',
      'Offers & Seats',
      'Activation',
      'Governance',
      'Communications',
      'Automation',
    ].forEach((label) => expect(source).toContain(`label: '${label}'`));
    expect(source).toContain('dynamic(');
    expect(source).toContain('focusSection={');
  });

  it('protects dirty cycle settings from accidental navigation', () => {
    const workspace = read(
      'src/screens/student/enrollment/setting/admissions-settings-workspace.tsx'
    );
    const core = read('src/screens/student/enrollment/setting/admissions-crm-configuration.tsx');

    expect(workspace).toContain("addEventListener('beforeunload'");
    expect(workspace).toContain('Discard unsaved enrollment setting changes?');
    expect(core).toContain("new CustomEvent('admissions-settings-dirty'");
  });
});
