import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const source = fs.readFileSync(path.join(__dirname, 'TimetableAiReportButton.tsx'), 'utf8');
const screenSource = fs.readFileSync(path.join(__dirname, 'TimetableReportList.tsx'), 'utf8');

describe('TimetableAiReportButton', () => {
  it('mounts the shared workspace in Timetable mode', () => {
    expect(source).toContain('module="Timetable"');
    expect(source).toContain('open={workspace.value}');
    expect(source).toContain('onClick={workspace.onTrue}');
    expect(screenSource).toContain('<TimetableAiReportButton />');
    expect(screenSource).toContain("job.module === 'Timetable'");
  });
});
