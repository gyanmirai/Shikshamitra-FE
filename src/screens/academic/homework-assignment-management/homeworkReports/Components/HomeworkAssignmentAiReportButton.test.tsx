import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const source = fs.readFileSync(
  path.join(__dirname, 'HomeworkAssignmentAiReportButton.tsx'),
  'utf8'
);
const screenSource = fs.readFileSync(path.join(__dirname, 'HomeworkReportsList.tsx'), 'utf8');

describe('HomeworkAssignmentAiReportButton', () => {
  it('mounts the shared workspace in Homework & Assignment mode', () => {
    expect(source).toContain('module="Homework & Assignment"');
    expect(source).toContain('open={workspace.value}');
    expect(source).toContain('onClick={workspace.onTrue}');
    expect(screenSource).toContain('<HomeworkAssignmentAiReportButton />');
    expect(screenSource).toContain("job.module === 'Homework & Assignment'");
  });
});
