import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { it, expect, describe } from 'vitest';

const source = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('permission security wiring', () => {
  it('gates deployment on the executable security workflow', () => {
    expect(source('.github/workflows/deploy.yml')).toMatch(
      /security:\s*if: github\.ref == 'refs\/heads\/main'\s*uses: \.\/\.github\/workflows\/security-regression\.yml/
    );
    expect(source('.github/workflows/deploy.yml')).toMatch(
      /build:\s*if: github\.ref == 'refs\/heads\/main'\s*needs: security/
    );
    expect(source('.github/workflows/security-regression.yml')).toContain('workflow_call:');
  });

  it.each(['role', 'user'])(
    'retains the separate legacy %s dialogs and exact management guard',
    (provider) => {
      const screen = source(`src/screens/security/${provider}/index.tsx`);
      expect(screen).toContain('<PermissionForm');
      expect(screen).toContain('<VisibilityForm');
      expect(screen).not.toMatch(/<PermissionDialog|<PermissionEditor|Permissions and visibility/);
      expect(screen).toContain(
        `AbpIdentity.${provider === 'role' ? 'Roles' : 'Users'}.ManagePermissions`
      );
      expect(screen).toContain('showThreeDots={canManagePermissions');
    }
  );

  it('keeps exact-action authorization free of aliases or development bypasses', () => {
    expect(source('src/utils/permissions.ts')).not.toMatch(
      /NODE_ENV|normalizeStudentPermission|LEGACY_PREFIX/
    );
  });
});
