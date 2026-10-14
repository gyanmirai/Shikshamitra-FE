import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { datePickerToDateTimeOffset } from 'src/utils/dateConvertor';
import { Box, Alert, Drawer, Button, LinearProgress } from '@mui/material';
import { useGetTeacherAvailabilityQuery } from 'src/redux/academicAPI/timetableApi/substitutionManagementApi';
import { QuickSubstitutionDrawer } from 'src/screens/academic/timetable-schedule-management/substitutionManagement/quick-substitution/QuickSubstitutionDrawer';
import { canArrangeSubstitution } from 'src/screens/academic/timetable-schedule-management/substitutionManagement/quick-substitution/quick-substitution-context';

import type { HrSubstitutionEmployee } from './use-hr-substitution';

type Props = { employee: HrSubstitutionEmployee; date: string; onClose: () => void };

export function HrSubstitutionDrawer({ employee, date, onClose }: Props) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const allowed = canArrangeSubstitution(useSelector((state: RootState) => state.auth.permissions));
  const availability = useGetTeacherAvailabilityQuery(
    {
      teacherId: employee.id,
      date: datePickerToDateTimeOffset(dayjs(date)) || date,
      academicYearId: currentYear?.id || undefined,
      sourceType: 2,
      maxResultCount: 50,
    },
    { skip: !allowed, refetchOnMountOrArgChange: true }
  );
  const row = availability.currentData?.items[0];
  if (!availability.isError && row && allowed) {
    return (
      <QuickSubstitutionDrawer
        context={{
          teacherId: employee.id,
          teacherName: row.teacherName,
          departmentName: row.departmentName,
          date: datePickerToDateTimeOffset(dayjs(date)) || date,
          startTime: row.startTime,
          endTime: row.endTime,
          isFullDay: row.isFullDay,
          reason: row.reason,
          remarks: row.remarks || '',
          source: 5,
          academicYearId: currentYear?.id || undefined,
        }}
        onClose={onClose}
      />
    );
  }
  return (
    <Drawer
      anchor="right"
      open
      onClose={availability.isFetching ? undefined : onClose}
      PaperProps={{ sx: { width: { xs: '100%', md: 880 }, maxWidth: '100vw' } }}
    >
      <Box sx={{ p: 2 }}>
        {availability.isFetching ? (
          <LinearProgress aria-label="Loading teacher absence" />
        ) : !allowed ? (
          <Alert severity="warning">Timetable View and Add permissions are required.</Alert>
        ) : availability.isError ? (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => availability.refetch()}>
                Retry
              </Button>
            }
          >
            Teacher absence could not be loaded.
          </Alert>
        ) : (
          <Alert severity="info">
            No saved attendance absence was found. Save the teacher’s absence in manual attendance,
            then try again.
          </Alert>
        )}
        <Button size="small" sx={{ mt: 2 }} onClick={onClose} disabled={availability.isFetching}>
          Close
        </Button>
      </Box>
    </Drawer>
  );
}
