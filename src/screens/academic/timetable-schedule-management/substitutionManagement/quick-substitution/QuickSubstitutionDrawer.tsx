'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Alert, Stack, Button, Typography, LinearProgress } from '@mui/material';
import { useGetAffectedLecturesQuery } from 'src/redux/academicAPI/timetableApi/substitutionManagementApi';

import { QuickSubstitutionShell } from './QuickSubstitutionShell';
import { canArrangeSubstitution } from './quick-substitution-context';
import { QuickSubstitutionLectures } from './QuickSubstitutionLectures';
import { QuickSubstitutionAssignment } from './QuickSubstitutionAssignment';

import type { QuickSubstitutionContext, QuickSubstitutionLecture } from './types';

type Props = { context: QuickSubstitutionContext; onClose: () => void };

export function QuickSubstitutionDrawer({ context, onClose }: Props) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const allowed = canArrangeSubstitution(permissions);
  const [selected, setSelected] = useState<QuickSubstitutionLecture | null>(null);
  const affected = useGetAffectedLecturesQuery(
    {
      teacherId: context.teacherId,
      teacherName: context.teacherName,
      availabilityDate: context.date,
      startTime: context.startTime,
      endTime: context.endTime,
      isFullDay: context.isFullDay,
      academicYearId: context.academicYearId,
      academicMediumId: context.academicMediumId,
    },
    { skip: !allowed, refetchOnMountOrArgChange: true }
  );
  const lectures = (affected.currentData?.items || []).map((lecture) => ({
    ...lecture,
    key: `${lecture.timetableSlotId}:${lecture.slotSubjectId}`,
  }));
  const remaining = lectures.filter((lecture) => lecture.canCreateSubstitution).length;
  const close = () => {
    if (!selected && !affected.isFetching) onClose();
  };
  if (selected && allowed) {
    return (
      <QuickSubstitutionAssignment
        key={selected.key}
        context={context}
        lecture={selected}
        onSaved={() => setSelected(null)}
        onBack={() => setSelected(null)}
        onClose={onClose}
      />
    );
  }
  return (
    <QuickSubstitutionShell context={context} onClose={close} busy={affected.isFetching}>
      {!allowed ? (
        <Alert severity="warning" sx={{ m: 2 }}>
          Timetable View and Add permissions are required to arrange substitutions.
        </Alert>
      ) : (
        <>
          <Box sx={{ p: 2, overflow: 'auto', minHeight: 0, flex: 1 }}>
            {affected.isFetching ? (
              <LinearProgress aria-label="Loading affected periods" />
            ) : affected.isError ? (
              <Alert
                severity="error"
                action={<Button onClick={() => affected.refetch()}>Retry</Button>}
              >
                Affected periods could not be loaded.
              </Alert>
            ) : lectures.length === 0 ? (
              <Alert severity="info">
                No substitution needed. No published timetable periods are affected.
              </Alert>
            ) : (
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">
                  {remaining} {remaining === 1 ? 'period needs' : 'periods need'} cover
                </Typography>
                <QuickSubstitutionLectures
                  lectures={lectures}
                  selectedKey=""
                  disabled={affected.isFetching}
                  onSelect={setSelected}
                />
              </Stack>
            )}
          </Box>
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button onClick={close} disabled={affected.isFetching}>
              Close
            </Button>
          </Box>
        </>
      )}
    </QuickSubstitutionShell>
  );
}
