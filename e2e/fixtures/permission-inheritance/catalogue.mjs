export const subject = 'Academics.CurriculumManagement.SubjectAssignment';
const roots = [subject,
  'Academics.CurriculumManagement.ElectiveAssignment',
  'Academics.CurriculumManagement.ChapterManagement',
  'Academics.CurriculumManagement.LessonPlan',
  'Academics.CurriculumManagement.Reports',
  'Academics.CurriculumManagement.Settings.SubjectCreation',
  'Academics.CurriculumManagement.Settings.ElectiveGroupCreation'];
const module = 'ShikshaMitra.Module.Academics';
export const names = [...roots.flatMap((root) => ['View', 'Add', 'Delete'].map((action) => `${root}.${action}`)),
  module, `${module}.Curriculum`, `${module}.Curriculum.Settings`,
  'ShikshaMitra.Module.InstituteSetup',
  'ShikshaMitra.Module.InstituteSetup.SchoolIdentity',
  'ShikshaMitra.Module.InstituteSetup.RoomManagement',
  ...['BuildingManagement', 'RoomTypeManagement', 'RoomManagement.Room'].flatMap((feature) => [
    `ShikshaMitra.Module.InstituteSetup.${feature}`,
    ...['View', 'Add', 'Delete'].map((action) => `ShikshaMitra.Module.InstituteSetup.${feature}.${action}`),
  ]),
  ...['View', 'ManageDefaults', 'ManageOverrides', 'AccessSignature'].map(
    (action) => `InstituteSetup.SchoolIdentity.${action}`
  ),
  ...['ShiftManagement', 'AcademicSetup'].flatMap((feature) => [
    `ShikshaMitra.Module.InstituteSetup.${feature}`,
    ...['View', 'Add', 'Edit', 'Delete'].map((action) => `InstituteSetup.${feature}.${action}`),
  ]),
];

export function createFixture() {
  const direct = new Map([
    ['synthetic-user', new Set()],
    ['synthetic-override', new Set([`${subject}.Add`, `${module}.Curriculum`])],
    ['synthetic-additional', new Set([`${subject}.Add`])],
  ]);
  const role = new Set(names);
  const denied = new Map([...direct.keys()].map((key) => [key, new Set()]));
  const writes = [];
  return {
    writes,
    read(provider, key) {
      return { overrides: provider === 'U' ? Object.fromEntries(names.flatMap((name) =>
        denied.get(key)?.has(name) ? [[name, 'deny']] : direct.get(key)?.has(name) ? [[name, 'allow']] : [])) : undefined,
        groups: [{ name: 'Academics', displayName: 'Academics', permissions: names.map((name) => {
        const inherited = role.has(name) && !(key === 'synthetic-additional' && name === `${subject}.Add`);
        const providers = [
          ...(inherited ? [{ providerName: 'R', providerKey: 'HOD' }] : []),
          ...(provider === 'U' && direct.get(key)?.has(name) ? [{ providerName: 'U', providerKey: key }] : []),
        ];
        return { name, displayName: name, allowedProviders: [], isGranted: providers.length > 0 && !denied.get(key)?.has(name), grantedProviders: providers };
      }) }] };
    },
    update(provider, key, permissions) {
      writes.push({ provider, key, permissions });
      const grants = provider === 'R' ? role : direct.get(key);
      for (const permission of permissions) {
        if (!names.includes(permission.name)) throw new Error('Unknown synthetic permission');
        if (permission.isGranted || permission.state === 'allow') grants.add(permission.name); else grants.delete(permission.name);
        if (provider === 'U') {
          if (permission.state === 'deny') denied.get(key).add(permission.name);
          else denied.get(key).delete(permission.name);
        }
      }
    },
  };
}
