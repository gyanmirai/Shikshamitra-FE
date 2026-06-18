import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const root = process.cwd();

const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('library release surface', () => {
  it('keeps active Library pages discoverable for E2E smoke checks', () => {
    const activeSurfaces = [
      ['src/screens/library/dashboard/library-dashboard.-screen.tsx', 'library-dashboard-page'],
      ['src/screens/library/BookList/index.tsx', 'library-books-page'],
      ['src/screens/library/IssuedBook/index.tsx', 'library-issue-return-page'],
      ['src/screens/library/MemberManagement/index.tsx', 'library-members-page'],
      ['src/screens/library/ChargesManagement/index.tsx', 'library-charges-page'],
      ['src/screens/library/reports/index.tsx', 'library-reports-page'],
      ['src/screens/library/Notification/index.tsx', 'library-notification-page'],
      [
        'src/screens/library/settings/BookCategory/index.tsx',
        'library-settings-book-categories-page',
      ],
      [
        'src/screens/library/settings/ChargeType/index.tsx',
        'library-settings-charge-categories-page',
      ],
      [
        'src/screens/library/settings/LibraryTiming/index.tsx',
        'library-settings-library-hours-page',
      ],
      [
        'src/screens/library/settings/BorrowingAndReturnRules/index.tsx',
        'library-settings-borrowing-rules-page',
      ],
      [
        'src/screens/library/settings/SectionManagement/index.tsx',
        'library-settings-sections-page',
      ],
    ];

    activeSurfaces.forEach(([filePath, testId]) => {
      expect(read(filePath), `${filePath} should expose ${testId}`).toContain(testId);
    });
  });

  it('keeps prototype Library routes redirected away from the release surface', () => {
    const redirectedRoutes = [
      'src/app/(auth-route)/library/circulation/fine-management/page.tsx',
      'src/app/(auth-route)/library/circulation/reservation-management/page.tsx',
      'src/app/(auth-route)/library/reservation-management/page.tsx',
      'src/app/(auth-route)/library/settings/general-setting/page.tsx',
      'src/app/(auth-route)/library/settings/notification-setting/page.tsx',
    ];

    redirectedRoutes.forEach((filePath) => {
      expect(read(filePath), `${filePath} should redirect`).toContain('redirect(');
    });
  });

  it('uses the backend report panel for active reports instead of legacy mock option hooks', () => {
    const reportsEntry = read('src/screens/library/reports/index.tsx');

    expect(reportsEntry).toContain('BackendReportPanel');
    expect(reportsEntry).not.toContain('useLibraryReportOptions');
  });
});
