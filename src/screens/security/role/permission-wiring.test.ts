import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { it, expect, describe } from 'vitest';

const source = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');
// Use ESLint's installed YAML parser without adding a production dependency.
const { load } = createRequire(import.meta.url)('js-yaml') as { load: (text: string) => unknown };
type Workflow = {
  on: Record<string, unknown>;
  jobs: Record<string, { if: string; steps?: { name?: string; run?: string }[] }>;
};
const workflow = (name: string) => load(source(`.github/workflows/${name}.yml`)) as Workflow;

describe('permission security wiring', () => {
  it('keeps deployment main-only and security regression executable as a reusable workflow', () => {
    const deploy = workflow('deploy');
    const security = workflow('security-regression');
    expect(deploy.on).toEqual({ push: { branches: ['main'] } });
    expect(deploy.jobs.build).toBeDefined();
    expect(security.on).toEqual({ workflow_call: null });
    // Deployment coupling was explicitly reverted; retain the reusable suite's execution contract.
    const securityRun = security.jobs['frontend-security'].steps?.find(
      (step) => step.name === 'Run Security Regression'
    )?.run;
    expect(securityRun).toContain('npx vitest run');
    expect(securityRun).toContain('src/screens/security/role');
    expect(securityRun).toContain('src/utils/permissions.test.ts');
    [...Object.values(deploy.jobs), ...Object.values(security.jobs)].forEach((job) => {
      expect(job.if).toBe("github.ref == 'refs/heads/main'");
    });
  });

  it.each(['role', 'user'])(
    'retains the separate legacy %s dialogs and exact management guard',
    (provider) => {
      const screen = source(`src/screens/security/${provider}/index.tsx`);
      expect(screen).not.toMatch(/<PermissionDialog|<PermissionEditor|Permissions and visibility/);
      if (provider === 'role') {
        expect(screen).toContain('<RolePermissionDialogs');
        const dialogs = source('src/screens/security/role/role-permission-dialogs.tsx');
        expect(dialogs).toContain('providerName="R"');
        expect(dialogs).toContain("mode={visibility ? 'visibility' : 'actions'}");
        const actions = source('src/screens/security/role/role-row-actions.tsx');
        expect(actions).toContain(
          "hasGrantedPermission(permissions, 'AbpIdentity.Roles.ManagePermissions')"
        );
        expect(actions).toContain("onAction('visibility', role)");
        expect(actions).toContain("onAction('permissions', role)");
      } else {
        expect(screen).toContain('<PermissionAccessForm');
        expect(screen).toContain('providerName="U"');
        expect(screen).toContain('<VisibilityForm');
        expect(screen).toContain('providerName="U" mode="visibility"');
        expect(screen).toContain('<UserTable onAction={onAction}');
        expect(source('src/screens/security/user/user-table.tsx')).toContain('<UserRowActions');
        const actions = source('src/screens/security/user/user-row-actions.tsx');
        expect(actions).toContain(
          "hasGrantedPermission(permissions, 'AbpIdentity.Users.ManagePermissions')"
        );
        expect(actions).toContain("onAction('visibility', user)");
        expect(actions).toContain("onAction('permissions', user)");
      }
    }
  );

  it('keeps exact-action authorization free of aliases or development bypasses', () => {
    expect(source('src/utils/permissions.ts')).not.toMatch(
      /NODE_ENV|normalizeStudentPermission|LEGACY_PREFIX/
    );
  });
});
