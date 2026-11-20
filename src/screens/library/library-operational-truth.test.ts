import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const read = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), 'src/screens/library', relativePath), 'utf8');

describe('Library operational truth regressions', () => {
  it('never opens sample borrower records from a live dashboard book', () => {
    expect(read('dashboard/admin/admin-charts.tsx')).not.toContain('mockMemberBorrowingData');
  });

  it('renders fetched member details without invented identities or counts', () => {
    const source = read('MemberManagement/Components/MemberDetailedViewComponent.tsx');
    expect(source).not.toContain('Dharmik Jinjala');
    expect(source).not.toContain("member?.overdueReturn || '01'");
    expect(source).toContain('currentData');
  });

  it('waits for a successful borrowing-rules response before resetting the draft baseline', () => {
    const source = read('settings/BorrowingAndReturnRules/index.tsx');
    expect(source).not.toContain("['Student', 'Teacher']");
    expect(source).toContain('.unwrap()');
  });

  it('uses only the requested catalog page rather than appending refreshed cached rows', () => {
    const source = read('BookList/Components/LIbraryMainScreen/index.tsx');
    expect(source).not.toContain('[...prev, ...bookData.items]');
    expect(source).toContain('currentData');
  });
});
