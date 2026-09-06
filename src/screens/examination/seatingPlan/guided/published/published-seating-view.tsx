'use client';

import type { SeatingPlanWorkspaceDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CustomSelect from 'src/components/custom-select';

import { buildPublishedRoomGroups } from './published-room-groups';
import { PublishedPlanRoomView } from './published-plan-room-view';

export function PublishedSeatingView({ workspace }: { workspace: SeatingPlanWorkspaceDto }) {
  const roomGroups = buildPublishedRoomGroups(workspace.plans);
  const initialGroupId =
    roomGroups.find((group) =>
      group.plans.some((plan) => plan.seatingPlanId === workspace.selectedSeatingPlanId)
    )?.id ??
    roomGroups[0]?.id ??
    '';
  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId);
  const selectedGroup = roomGroups.find((group) => group.id === selectedGroupId) ?? roomGroups[0];

  if (!selectedGroup) {
    return (
      <Alert severity="error">
        No published seating plans are available for this examination. Contact the school
        administrator.
      </Alert>
    );
  }

  const roomOptions = roomGroups.map((group) => ({
    value: group.id,
    label: `${group.roomName} · ${group.subjectNames.join(', ')} · ${group.scheduleLabel}`,
  }));

  return (
    <Paper variant="outlined" sx={{ flex: 1, minHeight: 0, overflow: 'auto', borderRadius: 2 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        gap={2}
        sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap">
            <Typography component="h2" variant="h5">
              Final room seating
            </Typography>
            <Chip label="Published" color="success" size="small" variant="soft" />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {selectedGroup.roomName} · {selectedGroup.scheduleLabel} · {selectedGroup.plans.length}{' '}
            simultaneous plan
            {selectedGroup.plans.length === 1 ? '' : 's'} combined
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            {selectedGroup.subjectNames.join(', ')} ·{' '}
            {selectedGroup.plans.map((plan) => plan.name).join(' / ')}
          </Typography>
        </Box>
        {roomGroups.length > 1 && (
          <Box sx={{ width: { xs: '100%', md: 440 }, flexShrink: 0 }}>
            <CustomSelect
              label="Room and examination time"
              options={roomOptions}
              value={selectedGroup.id}
              onChange={(value) => setSelectedGroupId(String(value))}
            />
          </Box>
        )}
      </Stack>
      <PublishedPlanRoomView
        key={selectedGroup.id}
        examId={workspace.examId}
        standardId={workspace.standardId}
        group={selectedGroup}
      />
    </Paper>
  );
}
