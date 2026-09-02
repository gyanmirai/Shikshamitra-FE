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

import { PublishedPlanRoomView } from './published-plan-room-view';

export function PublishedSeatingView({ workspace }: { workspace: SeatingPlanWorkspaceDto }) {
  const initialPlanId =
    workspace.plans.find((plan) => plan.seatingPlanId === workspace.selectedSeatingPlanId)
      ?.seatingPlanId ??
    workspace.plans[0]?.seatingPlanId ??
    '';
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId);
  const selectedPlan =
    workspace.plans.find((plan) => plan.seatingPlanId === selectedPlanId) ?? workspace.plans[0];

  if (!selectedPlan) {
    return (
      <Alert severity="error">
        No published seating plans are available for this examination. Contact the school
        administrator.
      </Alert>
    );
  }

  const planOptions = workspace.plans.map((plan) => ({
    value: plan.seatingPlanId,
    label: plan.name,
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
            {selectedPlan.subjects.map((subject) => subject.subjectName).join(', ')} ·{' '}
            {selectedPlan.allocatedStudents} of {selectedPlan.totalStudents} students seated
          </Typography>
        </Box>
        {workspace.plans.length > 1 && (
          <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0 }}>
            <CustomSelect
              label="Seating plan"
              options={planOptions}
              value={selectedPlan.seatingPlanId}
              onChange={(value) => setSelectedPlanId(String(value))}
            />
          </Box>
        )}
      </Stack>
      <PublishedPlanRoomView
        key={selectedPlan.seatingPlanId}
        examId={workspace.examId}
        standardId={workspace.standardId}
        plan={selectedPlan}
      />
    </Paper>
  );
}
