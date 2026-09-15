'use client';

import { Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import ShikshaMitraAiReportDrawer from 'src/screens/academic/curriculum-management/reports/ShikshaMitraAiReportDrawer';

export function AttendanceAiReportButton() {
  const workspace = useBoolean();

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={workspace.onTrue}
        startIcon={<Iconify icon="solar:magic-stick-3-bold" />}
      >
        Generate with AI
      </Button>
      <ShikshaMitraAiReportDrawer
        open={workspace.value}
        onClose={workspace.onFalse}
        module="Student Attendance"
      />
    </>
  );
}
