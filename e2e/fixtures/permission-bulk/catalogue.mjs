export const subjectRoot = 'Academics.CurriculumManagement.SubjectAssignment';
export const payrollRoot = 'HR.PayrollManagement';
const standard = (root) => ['View', 'Add', 'Delete'].map((action) => `${root}.${action}`);
export const academicNames = [
  ...standard(subjectRoot),
  ...standard('Academics.CurriculumManagement.Settings.SubjectCreation'),
];
export const settingsNames = [
  ...standard(`${payrollRoot}.Settings.EarningComponents`),
  ...standard(`${payrollRoot}.Settings.DeductionComponents`),
  ...['View', 'Add', 'Edit', 'Publish', 'SetDefault', 'Archive'].map(
    (action) => `${payrollRoot}.Settings.SalaryTemplates.${action}`
  ),
];
export const runPayrollNames = [
  ...standard(`${payrollRoot}.RunPayroll`),
  ...['Lock', 'ViewAudit', 'Adjustments'].map((action) => `${payrollRoot}.RunPayroll.${action}`),
];
export const payrollNames = [
  ...standard(`${payrollRoot}.Overview`),
  ...runPayrollNames,
  ...standard(`${payrollRoot}.GenerateSalarySlip`),
  ...settingsNames,
];
export const attendanceNames = standard('HR.AttendanceAndLeave.BiometricAttendance');
export const hrNames = [...payrollNames, ...attendanceNames];
export const mappedNames = [...academicNames, ...hrNames];
export const visibilityNames = [
  'ShikshaMitra.Module.Academics',
  'ShikshaMitra.Module.Academics.Curriculum',
  'ShikshaMitra.Module.Academics.Curriculum.Settings',
  'ShikshaMitra.Module.HR',
  'ShikshaMitra.Module.HR.Payroll',
  'ShikshaMitra.Module.HR.Payroll.Settings',
  'ShikshaMitra.Module.HR.AttendanceManagement',
];
export const unmappedName = 'Synthetic.Unmapped.View';
export const roleOnlyName = `${payrollRoot}.GenerateSalarySlip.Add`;
export const userOnlyName = `${payrollRoot}.GenerateSalarySlip.Delete`;
export const names = [...mappedNames, ...visibilityNames, unmappedName];
const allowedProviders = (name) =>
  name === roleOnlyName ? ['R'] : name === userOnlyName ? ['U'] : [];
export const eligibleNames = (scope, provider) =>
  scope.filter(
    (name) => !allowedProviders(name).length || allowedProviders(name).includes(provider)
  );

export function createFixture() {
  const role = new Set(names);
  const overrides = new Map(
    ['synthetic-user', 'synthetic-override', 'synthetic-additional'].map((key) => [key, new Map()])
  );
  const writes = [];
  return {
    writes,
    read(provider, key) {
      const rules = overrides.get(key) ?? new Map();
      return {
        ...(provider === 'U' ? { overrides: Object.fromEntries(rules) } : {}),
        groups: [
          {
            name: 'Synthetic',
            displayName: 'Synthetic catalogue',
            permissions: names.map((name) => {
              const rule = provider === 'U' ? rules.get(name) : undefined;
              const sources = [
                ...(role.has(name) ? [{ providerName: 'R', providerKey: 'HOD' }] : []),
                ...(rule === 'allow' ? [{ providerName: 'U', providerKey: key }] : []),
              ];
              return {
                name,
                displayName: name,
                allowedProviders: allowedProviders(name),
                isGranted: rule === 'deny' ? false : sources.length > 0,
                grantedProviders: sources,
              };
            }),
          },
        ],
      };
    },
    update(provider, key, permissions) {
      const valid = new Set(eligibleNames(names, provider));
      if (permissions.some(({ name }) => !valid.has(name)))
        throw new Error('Ineligible fixture permission');
      if (new Set(permissions.map(({ name }) => name)).size !== permissions.length)
        throw new Error('Duplicate fixture permission');
      writes.push({ provider, key, permissions });
      for (const permission of permissions) {
        if (provider === 'R') {
          if (permission.isGranted) role.add(permission.name);
          else role.delete(permission.name);
        } else if (permission.state === 'inherit') {
          overrides.get(key).delete(permission.name);
        } else {
          overrides.get(key).set(permission.name, permission.state);
        }
      }
    },
  };
}
