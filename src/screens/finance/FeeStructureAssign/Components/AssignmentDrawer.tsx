'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Button, Drawer, Divider } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { DrawerHeader } from 'src/screens/hr/policies/components/HRPolicySharedUI';
import FinancePolicyDrawerHeader from 'src/screens/finance/policies/components/FinancePolicyDrawerHeader';

import AssignmentWorkflow from './AssignmentWorkflow';

import type { IFeeStructureData } from './type';

export default function AssignmentDrawer({
  students,
  academicYearId,
  academicYearName,
  editAssignedPolicies = false,
  onClose,
}: {
  students: IFeeStructureData[];
  academicYearId: string;
  academicYearName?: string;
  editAssignedPolicies?: boolean;
  onClose: () => void;
}) {
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [busy, setBusy] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const viewing = students.length === 1 && students[0].isFeeStructureAssigned;
  const taskTitle = viewing
    ? editAssignedPolicies
      ? 'Edit Fee Assignment'
      : 'View Fee Assignment'
    : students.length > 1
      ? 'Bulk Assign Fee Structure'
      : 'Assign Fee Structure';
  const title =
    students.length === 1 && students[0].studentName
      ? `${taskTitle} for ${students[0].studentName}`
      : taskTitle;
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
            sx: {
              width: viewing
                ? { xs: '100%', sm: 'min(760px, 92vw)' }
                : { xs: '100%', md: students.length > 1 ? 1200 : 960 },
              maxWidth: '100%',
              overflow: 'hidden',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
          {viewing ? (
            <FinancePolicyDrawerHeader
              title={title}
              titleId="fee-assignment-view-title"
              helpText="Review this student's saved fee structure, fee heads, policy versions and installment balances for the selected academic year."
              badges={<Label color="success">Assigned</Label>}
              onClose={requestClose}
              disabled={busy}
            />
          ) : (
            <>
              <DrawerHeader title={title} onClose={requestClose} closeDisabled={busy} />
              <Divider />
            </>
          )}
          {students.length > 0 && academicYearId && (
            <AssignmentWorkflow
              key={`${academicYearId}-${students.map((s) => s.studentId).join(',')}-${editAssignedPolicies}`}
              students={students}
              academicYearId={academicYearId}
              academicYearName={academicYearName}
              editAssignedPolicies={editAssignedPolicies}
              onClose={requestClose}
              onBusyChange={setBusy}
            />
          )}
        </Box>
      </Drawer>
      <ConfirmDialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        title={editAssignedPolicies ? 'Discard policy changes?' : 'Discard unassigned changes?'}
        icon="warning"
        content={
          editAssignedPolicies
            ? 'Your unsaved policy selections and reason will be discarded.'
            : 'Your unassigned changes will be discarded. Committed assignments will be preserved.'
        }
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
