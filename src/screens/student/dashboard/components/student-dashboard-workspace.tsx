import type { GrantedPermission } from 'src/utils/permissions';
import type {
  StudentModuleDashboardLink,
  StudentModuleDashboardContext,
} from 'src/redux/student/dashboard/student-module-dashboard-types';

import { Iconify } from 'src/components/iconify';
import { Chip, Grid, Alert, Stack, Typography } from '@mui/material';
import { DashboardSectionCard } from 'src/screens/academic/AcademicDashboard/Components/DashboardSectionCard';

import StudentDashboardSection from './student-dashboard-section';
import StudentDashboardInsights from './student-dashboard-insights';
import StudentDashboardShortcuts from './student-dashboard-shortcuts';
import { modeLabels, dashboardSectionOrder } from '../dashboard-access';
import { useStudentDashboardSections } from '../hooks/use-student-dashboard-sections';

type Props = {
  context: StudentModuleDashboardContext;
  links: StudentModuleDashboardLink[];
  permissions: GrantedPermission[];
  identityKey: string;
  year: { id?: string; name?: string };
};

export default function StudentDashboardWorkspace({
  context,
  links,
  permissions,
  identityKey,
  year,
}: Props) {
  const sections = dashboardSectionOrder(context.mode).filter((section) =>
    context.sections.includes(section)
  );
  const queries = useStudentDashboardSections(sections, identityKey, year.id);
  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        alignItems="center"
        sx={{
          px: 1,
          py: 1.5,
          bgcolor: 'background.neutral',
          borderRadius: 1,
          border: 1,
          borderColor: 'info.main',
        }}
      >
        <Typography variant="subtitle2">
          {context.displayName ? `Welcome, ${context.displayName}` : 'Your workspace'}
        </Typography>
        <Chip size="small" label={modeLabels[context.mode]} />
        <Typography variant="caption" color="text.secondary">
          {context.scopeLabel}
          {year.name ? ` · ${year.name}` : ''}
        </Typography>
      </Stack>
      {context.myStudents.length > 0 && (
        <DashboardSectionCard
          title="My students"
          subheader="Student accounts linked to your verified identity"
        >
          <Stack spacing={1}>
            {context.myStudents.map((student) => (
              <Stack key={student.studentId} direction="row" spacing={1} alignItems="center">
                <Iconify icon="mdi:account-school-outline" />
                <Typography variant="body2">{student.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {student.relationship === 'self' ? 'My account' : student.relationship}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </DashboardSectionCard>
      )}
      {sections.length > 0 && !year.id && (
        <Alert severity="info">
          Select an academic year in the Student header to see your summaries.
        </Alert>
      )}
      {year.id && (
        <>
          {sections.length > 0 && (
            <StudentDashboardInsights
              context={context}
              queries={queries}
              permissions={permissions}
            />
          )}
          <Grid container spacing={1} alignItems="stretch">
            {sections.map((section) => (
              <Grid
                key={section}
                size={{ xs: 12, lg: sections.length === 1 ? 12 : sections.length === 2 ? 6 : 4 }}
              >
                <StudentDashboardSection
                  key={`${identityKey}:${year.id}`}
                  input={{ identityKey, academicYearId: year.id!, section }}
                  permissions={permissions}
                  query={queries[section]}
                />
              </Grid>
            ))}
          </Grid>
          {sections.length > 0 && (
            <StudentDashboardInsights
              context={context}
              queries={queries}
              permissions={permissions}
              detail
            />
          )}
        </>
      )}
      {links.length > 0 ? (
        <StudentDashboardShortcuts links={links} />
      ) : (
        !context.myStudents.length && (
          <Alert severity="info">
            No student workspaces are available with your current permissions. Assigned work will
            appear here when access is configured.
          </Alert>
        )
      )}
    </>
  );
}
