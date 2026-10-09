import { http, HttpResponse } from 'msw';

import type { PermissionCatalogue, PermissionOverrideState } from './permission-catalogue';

const root = 'Academics.CurriculumManagement.SubjectAssignment';
const moduleName = 'ShikshaMitra.Module.Academics';
export const actionNames = ['View', 'Add', 'Delete'].map((action) => `${root}.${action}`);
export const visibilityNames = [
  moduleName,
  `${moduleName}.Curriculum`,
  `${moduleName}.Curriculum.Settings`,
];
export function permissionTestFixture() {
  const names = [...actionNames, ...visibilityNames];
  const direct = new Set<string>();
  const denies = new Set<string>();
  const role = new Set(names);
  const roleOnly = new Set<string>();
  const secondRole = new Set<string>();
  const writes: { name: string; state: PermissionOverrideState }[][] = [];
  const read = (user = true): PermissionCatalogue => ({
    overrides: user
      ? Object.fromEntries(
          names.flatMap<[string, PermissionOverrideState]>((name) =>
            denies.has(name) ? [[name, 'deny']] : direct.has(name) ? [[name, 'allow']] : []
          )
        )
      : undefined,
    groups: [
      {
        name: 'Academics',
        displayName: 'Academics',
        permissions: names.map((name) => ({
          name,
          displayName: name,
          allowedProviders: roleOnly.has(name) ? ['R'] : [],
          isGranted:
            (!user || !denies.has(name)) &&
            (role.has(name) || secondRole.has(name) || (user && direct.has(name))),
          grantedProviders: [
            ...(role.has(name) ? [{ providerName: 'R', providerKey: 'HOD' }] : []),
            ...(secondRole.has(name)
              ? [{ providerName: 'R', providerKey: 'Curriculum Lead' }]
              : []),
            ...(user && direct.has(name)
              ? [{ providerName: 'U', providerKey: 'synthetic-user' }]
              : []),
          ],
        })),
      },
    ],
  });
  const handlers = [
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/permission-management/permissions', () => HttpResponse.json(read(false))),
    http.get('*/api/shikshamitra-permissions/users/:userId/permissions', () =>
      HttpResponse.json(read())
    ),
    http.put('*/api/shikshamitra-permissions/users/:userId/permissions', async ({ request }) => {
      const { permissions } = (await request.json()) as { permissions: (typeof writes)[number] };
      writes.push(permissions);
      permissions.forEach(({ name, state }) => {
        if (state === 'allow') direct.add(name);
        else direct.delete(name);
        if (state === 'deny') denies.add(name);
        else denies.delete(name);
      });
      return new HttpResponse(null, { status: 204 });
    }),
    http.get(/https:\/\/[^/]*iconify[^/]*\//, ({ request }) => {
      const url = new URL(request.url);
      return HttpResponse.json({
        prefix: url.pathname.slice(1).replace('.json', ''),
        icons: Object.fromEntries(
          (url.searchParams.get('icons') ?? '')
            .split(',')
            .map((icon) => [icon, { body: '<g />', width: 24, height: 24 }])
        ),
      });
    }),
  ];
  return { direct, denies, role, secondRole, roleOnly, writes, handlers };
}
