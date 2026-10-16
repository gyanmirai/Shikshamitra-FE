'use client';

import type { RootState } from 'src/redux/store';

import { Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { hasGrantedPermission } from 'src/utils/permissions';
import ShikshaMitraAiReportDrawer from 'src/screens/academic/curriculum-management/reports/ShikshaMitraAiReportDrawer';

export function StudentRecordsAiReportButton() {
  const workspace = useBoolean();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canGenerate = hasGrantedPermission(permissions, 'Students.Records.Reports.Add');

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={workspace.onTrue}
        disabled={!canGenerate}
        startIcon={<Iconify icon="solar:magic-stick-3-bold" />}
      >
        Generate with AI
      </Button>
      <ShikshaMitraAiReportDrawer
        open={workspace.value && canGenerate}
        onClose={workspace.onFalse}
        module="Student Records"
      />
    </>
  );
}
