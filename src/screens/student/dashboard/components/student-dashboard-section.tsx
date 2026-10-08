import type { GrantedPermission } from 'src/utils/permissions';
import type { StudentDashboardSectionInput } from 'src/redux/student/dashboard/student-module-dashboard-types';

import dayjs from 'dayjs';
import { useState } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Box, Alert, Button, Skeleton, Typography, LinearProgress } from '@mui/material';
import { DashboardSectionCard } from 'src/screens/academic/AcademicDashboard/Components/DashboardSectionCard';

import { sectionTitles } from '../dashboard-access';
import StudentDashboardMetrics from './student-dashboard-metrics';
import StudentDashboardStrength from './student-dashboard-strength';

import type { StudentSectionQuery } from '../hooks/use-student-dashboard-sections';

export default function StudentDashboardSection({
  input,
  permissions,
  query,
}: {
  input: StudentDashboardSectionInput;
  permissions: GrantedPermission[];
  query: StudentSectionQuery;
}) {
  const { currentData, isFetching, isError, refetch } = query;
  const [showStrength, setShowStrength] = useState(false);
  const data = !isError ? currentData : undefined;
  return (
    <DashboardSectionCard
      title={sectionTitles[input.section]}
      height="100%"
      subheader={data?.description}
      action={
        <Button size="small" disabled={isFetching} onClick={() => refetch()} sx={{ minHeight: 44 }}>
          Refresh
        </Button>
      }
    >
      {isFetching && (
        <LinearProgress aria-label={`Refreshing ${sectionTitles[input.section]}`} sx={{ mb: 1 }} />
      )}
      {isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Unable to load {sectionTitles[input.section].toLowerCase()}. Other sections remain
          available.
        </Alert>
      ) : data ? (
        <>
          <StudentDashboardMetrics metrics={data.metrics} permissions={permissions} />
          {input.section === 'records' &&
            hasGrantedPermission(permissions, 'Students.Records.StudentList.View') && (
              <Box sx={{ mt: 1 }}>
                <Button
                  size="small"
                  onClick={() => setShowStrength(!showStrength)}
                  aria-expanded={showStrength}
                  aria-controls="student-class-strength"
                  sx={{ minHeight: 44 }}
                >
                  {showStrength ? 'Hide class strength' : 'View class strength'}
                </Button>
                {showStrength && (
                  <Box id="student-class-strength">
                    <StudentDashboardStrength rows={data.classStrength} />
                  </Box>
                )}
              </Box>
            )}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
            Updated {dayjs(data.generatedAt).format('DD MMM YYYY, hh:mm A')}
          </Typography>
        </>
      ) : (
        <Skeleton
          variant="rounded"
          height={180}
          aria-label={`Loading ${sectionTitles[input.section]}`}
        />
      )}
    </DashboardSectionCard>
  );
}
