'use client';

import type { RootState } from 'src/redux/store';
import type { DayOfWeek, TimeSlot } from 'src/components/timetable/types';
import type { EmployeeTimetableResponse } from './utils/mapEmployeeTimetable';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Alert,
  Paper,
  Button,
  Skeleton,
  AlertTitle,
} from '@mui/material';
import { EmptyContent } from 'src/components/empty-content';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import TimetableBoard from 'src/components/timetable/TimetableBoard';
import { useGetTimetableByEmployeeQuery } from 'src/redux/academicAPI/timetableApi/timetableManagementApi';

import {
  isTimetableEmpty,
  emptyTimetableSlots,
  mapEmployeeTimetableToSlots,
} from './utils/mapEmployeeTimetable';
import { DashboardWidgetWrapper } from '../component/dashboard-widget-wrapper';

// ---------------------------------------------------------------------------
// Skeleton that mirrors TimetableBoard's sticky-time + day-column layout
// ---------------------------------------------------------------------------

const SKEL_DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const SKEL_SLOTS = Array.from({ length: 8 });

function TimetableSkeleton() {
  return (
    <Box
      sx={{
        display: 'flex',
        height: 420,
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {/* Sticky time column */}
      <Paper
        elevation={0}
        sx={{
          width: 72,
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
          position: 'sticky',
          left: 0,
          zIndex: 5,
          pt: '40px',
          borderRadius: 0,
        }}
      >
        {SKEL_SLOTS.map((_, i) => (
          <Box
            key={i}
            sx={{
              height: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              pr: 1.5,
            }}
          >
            <Skeleton variant="text" width={38} height={12} />
          </Box>
        ))}
      </Paper>

      {/* Day columns */}
      <Box sx={{ display: 'flex', flex: 1, gap: 0.5 }}>
        {SKEL_DAYS.map((day) => (
          <Box
            key={day}
            sx={{
              flex: 1,
              minWidth: 100,
              borderRight: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Day header */}
            <Box
              sx={{
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider',
                gap: 1,
              }}
            >
              <Skeleton variant="text" width={40} height={20} />
              <Skeleton variant="rounded" width={28} height={18} sx={{ borderRadius: '10px' }} />
            </Box>

            {/* Slot skeletons */}
            <Box sx={{ p: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {SKEL_SLOTS.map((__, i) => (
                <Skeleton key={i} variant="rounded" height={44} sx={{ borderRadius: 1 }} />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type Props = {
  employeeId?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TeacherSchedule({ employeeId }: Props = {}) {
  const { employee } = useSelector((state: any) => state.auth);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const targetEmployeeId: string | undefined = employeeId || employee?.id || employee?._id;
  const academicYearId: string | undefined = (currentYear as any)?.id;

  // ── API call via the project's common hook ───────────────────────────────
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQueryAndMutation<typeof useGetTimetableByEmployeeQuery>({
    type: 'query',
    currentQueryAndMutation: useGetTimetableByEmployeeQuery,
    params: { employeeId: targetEmployeeId!, academicYearId },
    options: { skip: !targetEmployeeId },
    // Suppress the default toast — we show an inline error instead
    popupConfig: { error: false },
  });

  // ── Transform API response → TimetableBoard slots (memoised) ─────────────
  const mappedSlots = useMemo<Record<DayOfWeek, TimeSlot[]>>(() => {
    if (!data) return emptyTimetableSlots();
    return mapEmployeeTimetableToSlots(data as EmployeeTimetableResponse);
  }, [data]);

  const loading = isLoading || isFetching;
  const isEmpty = !loading && !isError && isTimetableEmpty(mappedSlots);

  // ── Render ─────────────────────────────────────────────────────────────────
  const renderContent = () => {
    if (loading) {
      return <TimetableSkeleton />;
    }

    if (isError) {
      const message =
        (error as any)?.data?.detail ||
        (error as any)?.data?.message ||
        (error as any)?.error ||
        'Failed to load timetable. Please try again.';
      return (
        <Alert
          severity="error"
          sx={{ m: 1 }}
          action={
            <Button color="inherit" size="small" onClick={refetch}>
              Retry
            </Button>
          }
        >
          <AlertTitle>Could not load timetable</AlertTitle>
          {message}
        </Alert>
      );
    }

    if (isEmpty) {
      return (
        <EmptyContent
          title="No timetable available"
          description="No timetable has been assigned for this teacher yet."
          filled
          sx={{ py: 6 }}
        />
      );
    }

    return (
      <TimetableBoard
        slots={mappedSlots}
        onChange={() => { }}
        subjects={[]}
        readOnly
        selectedClass=""
        selectedDivision=""
      />
    );
  };

  return (
    <DashboardWidgetWrapper
      title="Weekly Timetable"
      subheader="Week-wise schedule — Subject · Class / Division · Room"
    >
      {renderContent()}
    </DashboardWidgetWrapper>
  );
}
