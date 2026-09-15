import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const source = fs.readFileSync(path.join(__dirname, 'ExaminationAiReportButton.tsx'), 'utf8');
const screenSource = fs.readFileSync(path.join(__dirname, 'ExaminationReportList.tsx'), 'utf8');

describe('ExaminationAiReportButton', () => {
  it('mounts the shared workspace in Examination mode', () => {
    expect(source).toContain('module="Examination"');
    expect(source).toContain('open={workspace.value}');
    expect(source).toContain('onClick={workspace.onTrue}');
    expect(screenSource).toContain('<ExaminationAiReportButton />');
    expect(screenSource).toContain("job.module === 'Examination'");
  });
});
