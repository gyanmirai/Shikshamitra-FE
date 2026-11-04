'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { RouterLink } from 'src/routes/components';
import { HrNotice } from 'src/screens/hr/components/hr-notice';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { hasNavigationPermission } from 'src/utils/permissions';
import { FormSectionCard } from 'src/components/form-section-card';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Stack, Button, Skeleton, Typography } from '@mui/material';

const { settings } = hrPaths.payroll;
const permissions = hrPermissions.payroll.settings;
const tasks = [
  {
    title: 'Salary Templates',
    icon: 'solar:documents-bold',
    description:
      'Reusable salary rules. Choose a school default, then assign an agreed amount to each staff member.',
    links: [
      {
        label: 'Open salary templates',
        path: settings.salaryTemplates,
        permission: permissions.salaryTemplateActions.view,
      },
    ],
  },
  {
    title: 'Statutory Settings',
    icon: 'solar:shield-check-bold',
    description:
      'School contribution rules and registration details. Staff applicability is confirmed during salary setup.',
    links: [
      { label: 'PF rules', path: settings.pfRule, permission: permissions.pfRule },
      {
        label: 'ESIC settings and policies',
        path: settings.statutorySchemes,
        permission: permissions.statutorySchemes,
      },
      {
        label: 'Professional tax',
        path: settings.professionalTax,
        permission: permissions.professionalTax,
      },
    ],
  },
  {
    title: 'Component Library',
    icon: 'solar:layers-bold',
    description:
      'Advanced setup for earning and deduction definitions. Templates decide how to use these components.',
    links: [
      {
        label: 'Earning components',
        path: settings.earningComponents,
        permission: permissions.earningComponents,
      },
      {
        label: 'Deduction components',
        path: settings.deductionComponents,
        permission: permissions.deductionComponents,
      },
    ],
  },
  {
    title: 'Payslip & Statement Settings',
    icon: 'solar:document-text-bold',
    description:
      'Configure document presentation after salary calculation and monthly payroll are set up.',
    links: [
      {
        label: 'Open document settings',
        path: settings.payrollDocuments,
        permission: permissions.payrollDocuments,
      },
    ],
  },
];

export default function PayrollSettings() {
  const auth = useSelector((state: RootState) => state.auth);
  const available = tasks
    .map((task) => ({
      ...task,
      links: task.links.filter((link) =>
        hasNavigationPermission(auth.permissions, link.permission)
      ),
    }))
    .filter((task) => task.links.length > 0);
  return (
    <Box sx={{ minWidth: 0, overflowY: 'auto', pb: 2 }}>
      <CustomBreadcrumbs
        heading="Payroll Settings"
        layout="inline"
        description="Manage salary templates, statutory rules, components, and payroll documents."
        links={[{ name: 'Payroll Management', href: hrPaths.payroll.root }, { name: 'Settings' }]}
      />
      <HrNotice severity="info" sx={{ mb: 2 }}>
        Start with a salary template. Use Staff Salaries to assign an amount and effective month.
        Component definitions and statutory rules are school-level setup.
      </HrNotice>
      {auth.loading || !auth.permissionsInitialized ? (
        <Skeleton variant="rounded" height={240} aria-label="Loading payroll settings" />
      ) : available.length ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          {available.map((task) => (
            <FormSectionCard
              key={task.title}
              title={task.title}
              icon={task.icon}
              descriptionTooltip={task.description}
            >
              <Typography variant="body2" color="text.secondary">
                {task.description}
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {task.links.map((link) => (
                  <Button
                    key={link.path}
                    component={RouterLink}
                    href={link.path}
                    size="small"
                    variant="outlined"
                    color="inherit"
                  >
                    {link.label}
                  </Button>
                ))}
              </Stack>
            </FormSectionCard>
          ))}
        </Box>
      ) : (
        <HrNotice severity="info">
          No payroll settings are available with your current permissions. Ask an authorized
          administrator to complete school setup.
        </HrNotice>
      )}
    </Box>
  );
}
