import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const source = fs.readFileSync(path.join(__dirname, 'AttendanceAiReportButton.tsx'), 'utf8');
const screenSource = fs.readFileSync(path.resolve(__dirname, '../index.tsx'), 'utf8');

describe('AttendanceAiReportButton', () => {
  it('mounts the shared workspace in Student Attendance mode', () => {
    expect(source).toContain('module="Student Attendance"');
    expect(source).toContain('open={workspace.value}');
    expect(source).toContain('onClick={workspace.onTrue}');
    expect(screenSource).toContain('<AttendanceAiReportButton />');
  });
});
