'use client';

import { useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { EventAvailable } from '@mui/icons-material';
import { Alert, Box, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material';

import { shikshaMitraToast } from 'src/components/toast';

import { readPublicAdmissionStatusProblem } from './public-status-utils';

export type PublicExamSnapshot = {
  scheduled: boolean;
  slotName?: string | null;
  examStartTime?: string | null;
  examEndTime?: string | null;
  roomNo?: number | null;
  attendanceStatus?: number | null;
  examStatus?: number | null;
  totalMarks?: number | null;
  passingMarks?: number | null;
  obtainedMarks?: number | null;
  percentage?: number | null;
  meritRank?: number | null;
  eligibilityDecision?: number | null;
  eligibilityDecisionReason?: string | null;
};

type PublicExamSlot = {
  entranceExamSlotId: string;
  slotName: string;
  startTime: string;
  endTime: string;
  roomNo: number;
  availableSeats: number;
};

type Props = {
  tenantId: string;
  token: string;
  accessSessionToken: string;
  currentExam?: PublicExamSnapshot | null;
  onScheduled: (exam: PublicExamSnapshot) => void;
};

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export default function PublicExamScheduling({
  tenantId,
  token,
  accessSessionToken,
  currentExam,
  onScheduled,
}: Props) {
  const [slots, setSlots] = useState<PublicExamSlot[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/public/student-enrollment/admissions-crm/${tenantId}/status/${token}/exam/available-slots`,
          { headers: { 'X-Admission-Access-Session': accessSessionToken } }
        );
        if (!response.ok) return;
        const payload = (await response.json()) as {
          selfSchedulingEnabled: boolean;
          slots: PublicExamSlot[];
        };
        if (!active) return;
        setEnabled(payload.selfSchedulingEnabled);
        setSlots(payload.slots || []);
      } catch {
        if (active) setEnabled(false);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load().catch(() => undefined);
    return () => {
      active = false;
    };
  }, [accessSessionToken, tenantId, token]);

  const schedule = async () => {
    if (!selectedSlotId) return;
    setIsScheduling(true);
    try {
      const response = await fetch(
        `${API_BASE}/public/student-enrollment/admissions-crm/${tenantId}/status/${token}/exam/schedule`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessSessionToken, entranceExamSlotId: selectedSlotId }),
        }
      );
      if (!response.ok) {
        const problem = await readPublicAdmissionStatusProblem(
          response,
          'Unable to schedule the entrance exam.'
        );
        throw new Error(problem.message);
      }
      const exam = (await response.json()) as {
        slotNameSnapshot?: string | null;
        examStartTime: string;
        examEndTime: string;
        examRoomNo: number;
        attendanceStatus: number;
        examStatus: number;
        totalMarks?: number | null;
        passingMarks?: number | null;
        obtainedMarks?: number | null;
        percentage?: number | null;
        meritRank?: number | null;
        eligibilityDecision?: number | null;
        eligibilityDecisionReason?: string | null;
      };
      onScheduled({
        scheduled: true,
        slotName: exam.slotNameSnapshot,
        examStartTime: exam.examStartTime,
        examEndTime: exam.examEndTime,
        roomNo: exam.examRoomNo,
        attendanceStatus: exam.attendanceStatus,
        examStatus: exam.examStatus,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        obtainedMarks: exam.obtainedMarks,
        percentage: exam.percentage,
        meritRank: exam.meritRank,
        eligibilityDecision: exam.eligibilityDecision,
        eligibilityDecisionReason: exam.eligibilityDecisionReason,
      });
      shikshaMitraToast.success({
        message: currentExam?.scheduled ? 'Entrance exam rescheduled.' : 'Entrance exam scheduled.',
      });
    } catch (error) {
      shikshaMitraToast.error({
        message: error instanceof Error ? error.message : 'Unable to schedule the entrance exam.',
      });
    } finally {
      setIsScheduling(false);
    }
  };

  if (isLoading || !enabled) return null;

  return (
    <Stack spacing={1.25}>
      <Divider />
      <Box>
        <Typography variant="subtitle1">Choose Entrance Exam Slot</Typography>
        <Typography variant="caption" color="text.secondary">
          {currentExam?.scheduled
            ? 'Select another available slot to reschedule.'
            : 'Select an available slot for the entrance exam.'}
        </Typography>
      </Box>
      {slots.length ? (
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ sm: 'center' }}>
          <TextField
            select
            size="small"
            label="Available slot"
            value={selectedSlotId}
            onChange={(event) => setSelectedSlotId(event.target.value)}
            sx={{ flex: 1, minWidth: 0 }}
          >
            {slots.map((slot) => (
              <MenuItem key={slot.entranceExamSlotId} value={slot.entranceExamSlotId}>
                {slot.slotName} - {new Date(slot.startTime).toLocaleString()} -{' '}
                {slot.availableSeats} seat(s)
              </MenuItem>
            ))}
          </TextField>
          <LoadingButton
            variant="contained"
            loading={isScheduling}
            disabled={!selectedSlotId}
            startIcon={<EventAvailable />}
            onClick={schedule}
          >
            {currentExam?.scheduled ? 'Reschedule' : 'Schedule'}
          </LoadingButton>
        </Stack>
      ) : (
        <Alert severity="info">No self-service exam slots are currently available.</Alert>
      )}
    </Stack>
  );
}
