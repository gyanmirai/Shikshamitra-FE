import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const source = fs.readFileSync(
  path.join(
    process.cwd(),
    'src',
    'screens',
    'student',
    'enrollment',
    'admissions-crm',
    'pipeline-workspace.tsx'
  ),
  'utf8'
);

describe('Pipeline Board data revision', () => {
  it('includes the data revision in the Board and selection scope keys', () => {
    expect(source).toContain('const [boardDataRevision, setBoardDataRevision] = useState(0)');
    expect(source).toMatch(
      /const selectionScopeKey = createEnrollmentQueryScopeKey\([\s\S]*?boardDataRevision,\s*}\);/
    );
    expect(source).toMatch(
      /const boardScopeKey = createEnrollmentQueryScopeKey\([\s\S]*?boardDataRevision,\s*}\);/
    );
  });

  it('advances the revision only after successful membership-changing mutations', () => {
    expect(source).toMatch(/await scheduleExam\([\s\S]*?\.unwrap\(\);\s*refreshBoardData\(\);/);
    expect(source).toMatch(
      /const result = await bulkChangeStages\([\s\S]*?\.unwrap\(\);\s*if \(result\.succeededCount > 0\) refreshBoardData\(\);/
    );
    expect(source).toMatch(
      /const result = await bulkArchiveLeads\([\s\S]*?\.unwrap\(\);\s*if \(result\.succeededCount > 0\) refreshBoardData\(\);/
    );
  });
});
