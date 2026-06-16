import fs from 'fs';
import path from 'path';
import { it, expect, describe } from 'vitest';

const repoRoot = process.cwd();

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

describe('Student management tabs', () => {
  it('exposes the bulk student add screen through the management tab UI', () => {
    const managementSource = readSource('src/screens/student/management/index.tsx');
    const bulkScreenSource = readSource(
      'src/screens/student/management/bulk-student-add/index.tsx'
    );
    const bulkApiSource = readSource('src/redux/student/buik-student/bulk-student-api.ts');

    expect(managementSource).toContain("import BulkStudentAddScreen from './bulk-student-add'");
    expect(managementSource).toContain("value: 'bulkStudentAdd'");
    expect(managementSource).toContain("label: 'Bulk Student Add'");
    expect(managementSource).toContain('component: BulkStudentAddTab');
    expect(bulkScreenSource).toContain('useAddBulkStudentMutation');
    expect(bulkScreenSource).toContain("type: 'mutation'");
    expect(bulkScreenSource).toContain('.unwrap()');
    expect(bulkScreenSource).toContain('<UploadButton');
    expect(bulkScreenSource).toContain("'Import'");
    expect(bulkScreenSource).toContain('accept=".csv"');
    expect(bulkScreenSource).toContain("input.value = ''");
    expect(bulkScreenSource).toContain(
      'Students imported, but the preview could not be generated.'
    );
    expect(bulkApiSource).toContain("url: '/students/bulk-upload'");
  });
});
