'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { Box, Button, Drawer, Divider } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { DrawerHeader } from 'src/screens/hr/policies/components/HRPolicySharedUI';

import AssignmentWorkflow from './AssignmentWorkflow';

import type { IFeeStructureData } from './type';

export default function AssignmentDrawer({
  students,
  academicYearId,
  academicYearName,
  onClose,
}: {
  students: IFeeStructureData[];
  academicYearId: string;
  academicYearName?: string;
  onClose: () => void;
}) {
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [busy, setBusy] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const viewing = students.length === 1 && students[0].isFeeStructureAssigned;
  const title = viewing ? 'View fee assignment' : 'Assign fee structure';
  const requestClose = () => {
    if (busy) return;
    if (isChanges) setConfirmClose(true);
    else onClose();
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={students.length > 0}
        onClose={requestClose}
        slotProps={{
          paper: {
            role: 'dialog',
            'aria-label': title,
            'aria-modal': true,
            sx: { width: { xs: '100%', md: 960 }, maxWidth: '100%', overflow: 'hidden' },
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
          <DrawerHeader
            title={title}
            subtitle={academicYearName ? `Academic year: ${academicYearName}` : undefined}
            onClose={requestClose}
            closeDisabled={busy}
          />
          <Divider />
          {students.length > 0 && academicYearId && (
            <AssignmentWorkflow
              key={`${academicYearId}-${students.map((s) => s.studentId).join(',')}`}
              students={students}
              academicYearId={academicYearId}
              onClose={requestClose}
              onBusyChange={setBusy}
            />
          )}
        </Box>
      </Drawer>
      <ConfirmDialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        title="Discard unassigned changes?"
        icon="warning"
        content="Your unassigned changes will be discarded. Committed assignments will be preserved."
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mdi:close" />}
            onClick={() => {
              setConfirmClose(false);
              onClose();
            }}
          >
            Discard changes
          </Button>
        }
      />
    </>
  );
}
