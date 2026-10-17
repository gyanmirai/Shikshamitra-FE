import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const source = fs.readFileSync(path.join(__dirname, 'StudentRecordsAiReportButton.tsx'), 'utf8');
const screenSource = fs.readFileSync(path.resolve(__dirname, '../index.tsx'), 'utf8');

describe('StudentRecordsAiReportButton', () => {
  it('mounts the shared workspace in Student Records mode', () => {
    expect(source).toContain('module="Student Records"');
    expect(source).toContain('open={workspace.value && canGenerate}');
    expect(source).toContain('onClick={workspace.onTrue}');
    expect(screenSource).toContain('<StudentRecordsAiReportButton />');
  });
});
