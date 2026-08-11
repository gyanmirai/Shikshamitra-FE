'use client';

import type { RootState, AppDispatch } from 'src/redux/store';

import { varAlpha } from 'src/theme/styles';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CancelButton from 'src/components/cancel-button';
import SubmitButton from 'src/components/submit-button';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { TimetableSettingsSummaryCards } from 'src/components/timetable-settings-summary-cards/TimetableSettingsSummaryCards';
import {
  Box,
  Stack,
  Paper,
  Skeleton,
  Typography,
  LinearProgress,
  DialogActions,
} from '@mui/material';
import {
  seatAllocationApi,
  useGetExamRoomsQuery,
  useGetExamDivisionsQuery,
  useGetSeatingPlanScopesQuery,
  useGetSeatingPlanDraftQuery,
  useFinalizeSeatingPlanMutation,
  usePublishSeatingPlanMutation,
  useGetSeatAllocationStudentsQuery,
  useLazyDownloadSeatingPrintPdfQuery,
  useLazyDownloadSeatingPrintExcelQuery,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocationApi';

import StudentExceptionList from './StudentExceptionList';
import { validateSeatingDraft } from '../../utils/validate';
import { toSeatingStudents, toSeatingRoomLayout, toSeatingAssignments } from '../../utils/mappers';

import type { SeatingRoomLayout, SeatingAssignment } from '../../types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const SEATING_PLAN_STATUS_PUBLISHED = 5;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// SectionPaper — local pattern (skill § 2.18)
// ---------------------------------------------------------------------------
function SectionPaper({
  title,
  caption,
  icon,
  iconColor = 'primary',
  children,
  action,
}: {
  title: string;
  caption?: string;
  icon: string;
  iconColor?: 'primary' | 'success' | 'warning' | 'info' | 'error';
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, md: 2 },
        borderRadius: 1.5,
        bgcolor: (theme) => varAlpha(theme.vars.palette.background.neutralChannel, 0.4),
        borderColor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.16),
        boxShadow: (theme) =>
          `0 8px 24px -18px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
      }}
    >
      <Stack spacing={1.75}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={1}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: `${iconColor}.main`,
                bgcolor: (theme) => alpha(theme.palette[iconColor].main, 0.1),
              }}
            >
              <Iconify icon={icon} width={20} height={20} />
            </Box>
            <Stack spacing={0.2}>
              <Typography variant="subtitle2" fontWeight={700}>
                {title}
              </Typography>
              {caption && (
                <Typography variant="caption" color="text.secondary">
                  {caption}
                </Typography>
              )}
            </Stack>
          </Stack>
          {action}
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}

// ---------------------------------------------------------------------------
// Public Seating Plan status card
// ---------------------------------------------------------------------------
function PublicSeatingStatusCard({ status }: { status?: number }) {
  const isPublished = status === SEATING_PLAN_STATUS_PUBLISHED;
  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.75,
        borderRadius: 1.25,
        borderColor: (theme) =>
          isPublished
            ? varAlpha(theme.vars.palette.success.mainChannel, 0.4)
            : theme.vars.palette.divider,
        bgcolor: (theme) =>
          isPublished
            ? varAlpha(theme.vars.palette.success.mainChannel, 0.08)
            : varAlpha(theme.vars.palette.grey['500Channel'], 0.06),
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isPublished ? 'success.main' : 'text.secondary',
          bgcolor: (theme) =>
            isPublished
              ? varAlpha(theme.vars.palette.success.mainChannel, 0.16)
              : varAlpha(theme.vars.palette.grey['500Channel'], 0.16),
          flexShrink: 0,
        }}
      >
        <Iconify
          icon={isPublished ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
          width={22}
          height={22}
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography
            variant="subtitle2"
            fontWeight={700}
            color={isPublished ? 'success.main' : 'text.primary'}
          >
            {isPublished ? 'Publicly Published' : 'Draft / Private'}
          </Typography>
          <Label color={isPublished ? 'success' : 'default'} sx={{ flexShrink: 0 }}>
            {isPublished ? 'Live' : 'Draft'}
          </Label>
        </Stack>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
          {isPublished
            ? 'This seating plan is published and visible downstream to students and parents.'
            : 'Finalize the plan first, then publish to make room allocations visible downstream.'}
        </Typography>
      </Box>
    </Paper>
  );
}

// ---------------------------------------------------------------------------
// Skeleton helpers
// ---------------------------------------------------------------------------
function SkeletonList() {
  return (
    <Stack spacing={1}>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} variant="rectangular" height={52} sx={{ borderRadius: 1 }} />
      ))}
    </Stack>
  );
}

function SkeletonCard() {
  return <Skeleton variant="rounded" height={68} sx={{ borderRadius: 1.25 }} />;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface Props {
  open: boolean;
  onClose: () => void;
  examId: string;
  standardId?: string;
  divisionId?: string;
  roomIds?: string[];
  seatingPlanId?: string;
  onBackToAllocation?: () => void;
}

// ---------------------------------------------------------------------------
// AllocationReviewDialog
// ---------------------------------------------------------------------------
export default function AllocationReviewDialog({
  open,
  onClose,
  examId,
  standardId,
  divisionId: drawerDivisionId,
  roomIds: drawerRoomIds,
  seatingPlanId: drawerSeatingPlanId,
  onBackToAllocation,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { permissions } = useSelector((state: RootState) => state.auth);
  const seatAllocationBase = academicPermissions.examination.seatAllocation;
  const canFinalize = hasGrantedPermission(permissions, `${seatAllocationBase}.Finalize`);
  const canPrint = hasGrantedPermission(permissions, `${seatAllocationBase}.Print`);

  const [rooms, setRooms] = useState<SeatingRoomLayout[]>([]);
  const [assignments, setAssignments] = useState<SeatingAssignment[]>([]);
  const [loaded, setLoaded] = useState(false);

  // ── Mutations via useQueryAndMutation (skill § 4.2) ───────────────────
  const [finalizeSeatingPlan, { isLoading: isFinalizing }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useFinalizeSeatingPlanMutation,
  });

  const [publishSeatingPlan, { isLoading: isPublishing }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePublishSeatingPlanMutation,
  });

  const [downloadPdf, { isFetching: isDownloadingPdf }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyDownloadSeatingPrintPdfQuery,
  });

  const [downloadExcel, { isFetching: isDownloadingExcel }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyDownloadSeatingPrintExcelQuery,
  });

  const { data: scopesData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSeatingPlanScopesQuery,
    params: { examId },
    options: { skip: !examId || !open || !!drawerSeatingPlanId },
  });

  const seatingPlanId = drawerSeatingPlanId || scopesData?.items?.[0]?.seatingPlanId || '';

  // ── Queries via useQueryAndMutation (skill § 4.1) ─────────────────────
  const {
    data: planDraftData,
    isLoading: isPlanLoading,
    isFetching: isPlanFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSeatingPlanDraftQuery,
    params: { examId, seatingPlanId },
    options: { skip: !examId || !open },
  });

  const {
    data: divisionsData,
    isLoading: isDivisionsLoading,
    isFetching: isDivisionsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamDivisionsQuery,
    params: { examId, standardId },
    options: {
      skip: !examId || !open || !standardId || !!drawerDivisionId,
    },
  });

  const divisionId = drawerDivisionId || divisionsData?.items?.[0]?.id || '';

  // Combined loading flags for queries (only show skeletons when data is missing)
  const isPlanDataLoading = (isPlanLoading || isPlanFetching) && !planDraftData;
  const isDivisionsDataLoading = (isDivisionsLoading || isDivisionsFetching) && !divisionsData;

  const {
    data: roomsData,
    isLoading: isRoomsLoading,
    isFetching: isRoomsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamRoomsQuery,
    params: { examId, divisionId, seatingPlanId },
    options: { skip: !examId || !divisionId || !open },
  });

  const {
    data: studentsData,
    isLoading: isStudentsLoading,
    isFetching: isStudentsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSeatAllocationStudentsQuery,
    params: { examId, divisionId, seatingPlanId },
    options: { skip: !examId || !divisionId || !open },
  });

  const isRoomsDataLoading = (isRoomsLoading || isRoomsFetching) && !roomsData;
  const isStudentsDataLoading = (isStudentsLoading || isStudentsFetching) && !studentsData;
  const isLayoutLoading = (!loaded && !rooms.length) || (isRoomsDataLoading && !rooms.length);

  // ── Stable roomIds array ─────────────────────────────────────────────
  const roomIds = useMemo(
    () =>
      drawerRoomIds?.length
        ? drawerRoomIds
        : planDraftData?.roomIds?.length
          ? planDraftData.roomIds
          : (roomsData?.items || []).map((room: any) => room.id).filter(Boolean),
    [drawerRoomIds, planDraftData?.roomIds, roomsData]
  );

  // ── Seat layout loader (parallel dispatch) ───────────────────────────
  useEffect(() => {
    if (!open) return undefined;
    if (!loaded) setLoaded(false);
    if (!examId || !divisionId || roomIds.length === 0 || !roomsData?.items) return undefined;
    let cancelled = false;

    (async () => {
      const results = await Promise.all(
        roomIds.map((roomId: string) =>
          dispatch(
            seatAllocationApi.endpoints.getSeatLayout.initiate({
              examId,
              divisionId,
              roomId,
              seatingPlanId,
            })
          ).unwrap()
        )
      );
      if (cancelled) return;
      const loadedRooms: SeatingRoomLayout[] = [];
      const loadedAssignments: SeatingAssignment[] = [];
      results.forEach((seatLayoutData: any, idx: number) => {
        const roomId = roomIds[idx];
        const roomMeta = (roomsData.items || []).find((r: any) => r.id === roomId);
        loadedRooms.push(toSeatingRoomLayout(seatLayoutData, roomId, roomMeta?.roomName ?? roomId));
        loadedAssignments.push(...toSeatingAssignments(seatLayoutData.items, roomId));
      });
      setRooms(loadedRooms);
      setAssignments(loadedAssignments);
      setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, examId, divisionId, roomsData, dispatch, seatingPlanId, roomIds.join(',')]);

  // ── Derived data ─────────────────────────────────────────────────────
  const students = useMemo(() => toSeatingStudents(studentsData?.items), [studentsData]);

  const draft = useMemo(
    () => ({
      examId,
      divisionIds: [divisionId],
      roomIds,
      students,
      rooms,
      assignments,
      allocationRules: {
        strategy: 'roll-number' as const,
        fillDirection: 'front-to-back' as const,
        leaveGap: false,
        mixDivisions: false,
        specialRequirementPriority: true,
      },
      excludedStudentIds: [],
      validation: { blockers: [], warnings: [] },
      status: 'in-progress' as const,
    }),
    [examId, divisionId, roomIds, students, rooms, assignments]
  );

  const validation = useMemo(() => validateSeatingDraft(draft), [draft]);

  const roomSummaries = useMemo(
    () =>
      rooms.map((room) => {
        const occupied = assignments.filter((a) => a.roomId === room.roomId).length;
        const usable = room.seats.filter((s) => !s.isDisabled).length || room.capacity;
        const utilization = usable === 0 ? 0 : Math.round((occupied / usable) * 100);
        return {
          roomId: room.roomId,
          roomName: room.roomName,
          occupied,
          usable,
          empty: Math.max(0, usable - occupied),
          utilization,
          statusLabel: occupied > usable ? 'Over capacity' : utilization < 40 ? 'Underused' : 'OK',
        };
      }),
    [rooms, assignments]
  );

  const assignedIds = useMemo(() => new Set(assignments.map((a) => a.studentId)), [assignments]);
  const unallocatedStudents = students.filter((s) => !assignedIds.has(s.studentId));
  const totalStudents = students.length;
  const allocationProgress =
    totalStudents === 0 ? 0 : Math.round((assignedIds.size / totalStudents) * 100);

  const summaryCards = useMemo(
    () => [
      {
        label: 'Total Enrolled',
        value: totalStudents,
        icon: 'solar:users-group-rounded-bold',
        color: 'primary' as const,
      },
      {
        label: 'Allocated Students',
        value: `${assignedIds.size} (${allocationProgress}%)`,
        icon: 'solar:user-check-bold',
        color: allocationProgress === 100 ? ('success' as const) : ('warning' as const),
      },
      {
        label: 'Exceptions',
        value: unallocatedStudents.length,
        icon: 'solar:user-block-bold',
        color: unallocatedStudents.length === 0 ? ('success' as const) : ('warning' as const),
      },
      {
        label: 'Rooms Used',
        value: rooms.length,
        icon: 'solar:armchair-2-bold',
        color: 'info' as const,
      },
    ],
    [totalStudents, assignedIds.size, allocationProgress, unallocatedStudents.length, rooms.length]
  );

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleFinalize = async () => {
    try {
      await finalizeSeatingPlan({ examId, seatingPlanId }).unwrap();
      shikshaMitraToast.success({ message: 'Seating plan finalized and locked.' });
    } catch (err: unknown) {
      const e = err as {
        data?: { error?: { message?: string }; message?: string; detail?: string };
      };
      shikshaMitraToast.error({
        message:
          e?.data?.error?.message ||
          e?.data?.detail ||
          e?.data?.message ||
          'Could not finalize the seating plan.',
      });
    }
  };

  const handlePublish = async () => {
    try {
      await publishSeatingPlan({
        examId,
        seatingPlanId,
        body: { notifyStudents: true, notifyParents: true },
      }).unwrap();
      shikshaMitraToast.success({ message: 'Seating plan published successfully.' });
    } catch (err: unknown) {
      const e = err as {
        data?: { error?: { message?: string }; message?: string; detail?: string };
      };
      shikshaMitraToast.error({
        message:
          e?.data?.error?.message ||
          e?.data?.detail ||
          e?.data?.message ||
          'Could not publish the seating plan.',
      });
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await downloadPdf({ examId, seatingPlanId }).unwrap();
      triggerBlobDownload(blob as Blob, `seating-plan-${examId}.pdf`);
    } catch {
      shikshaMitraToast.error({ message: 'Failed to download PDF.' });
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const blob = await downloadExcel({ examId, seatingPlanId }).unwrap();
      triggerBlobDownload(blob as Blob, `seating-plan-${examId}.xlsx`);
    } catch {
      shikshaMitraToast.error({ message: 'Failed to download Excel.' });
    }
  };

  // ── Room summary table columns (CustomizableTable — skill § 2.9) ─────
  const roomColumns = useMemo(
    () => [
      { id: 'roomName', label: 'Room', sticky: true, minWidth: 130 },
      { id: 'occupied', label: 'Students', filterType: 'number' as const },
      { id: 'usable', label: 'Usable Capacity', filterType: 'number' as const },
      { id: 'empty', label: 'Empty Seats', filterType: 'number' as const },
      {
        id: 'utilization',
        label: 'Utilization',
        isFilter: false,
        isSort: false,
        minWidth: 140,
        render: (v: number) => (
          <Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(v, 100)}
              color={v > 100 ? 'error' : v < 40 ? 'warning' : 'success'}
              sx={{ height: 5, borderRadius: 3, mb: 0.25 }}
            />
            <Typography variant="caption">{v}%</Typography>
          </Box>
        ),
      },
      {
        id: 'statusLabel',
        label: 'Status',
        isFilter: false,
        isSort: false,
        sticky: true,
        stickyPosition: 'right' as const,
        minWidth: 110,
        render: (v: string) => (
          <Label
            color={v === 'Over capacity' ? 'error' : v === 'Underused' ? 'warning' : 'success'}
          >
            {v}
          </Label>
        ),
      },
    ],
    []
  );

  // ── Title with Tooltip & Badge (Skill § 2.3) ──────────────────────────
  const dialogTitle = useMemo(
    () => (
      <Box display="flex" flexDirection="row" gap={1.25} alignItems="center" component="span">
        <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
          Allocation Review
        </Typography>
        <CustomTooltip
          arrow
          placement="right"
          title="Review room occupancy, student exceptions, readiness validation rules, and finalize the seating arrangement plan."
        >
          <Box component="span" sx={{ display: 'inline-flex', cursor: 'pointer' }}>
            <Iconify icon={GlobalIcons.info} color="info.main" width={18} height={18} />
          </Box>
        </CustomTooltip>
        {planDraftData?.isLocked ? (
          <Label color="success" sx={{ ml: 0.5 }}>
            Finalized
          </Label>
        ) : (
          <Label color="warning" sx={{ ml: 0.5 }}>
            In Review
          </Label>
        )}
      </Box>
    ),
    [planDraftData?.isLocked]
  );

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title={dialogTitle}
      maxWidth="md"
      hasForm={false}
    >
      <DialogScrollContent>
        <Stack spacing={2.5} sx={{ pb: 1 }}>
          {/* ── Summary Metric Strip (Shared TimetableSettingsSummaryCards) ── */}
          {isStudentsDataLoading || isLayoutLoading ? (
            <Skeleton variant="rounded" height={76} sx={{ mb: 1, borderRadius: 1.5 }} />
          ) : (
            <TimetableSettingsSummaryCards cards={summaryCards} cardsPerRow={4} />
          )}

          {/* ── 1. Seating Plan ─────────────────────────────────── */}
          <SectionPaper
            title="Seating Plan"
            caption="Room occupancy, utilization rate, and unallocated student exceptions"
            icon="solar:chair-bold"
            iconColor="primary"
            action={
              <Label color="primary">
                {rooms.length} Room{rooms.length === 1 ? '' : 's'}
              </Label>
            }
          >
            <Stack spacing={2}>
              <CustomizableTable
                tableId="allocation-review-rooms"
                isLoading={isLayoutLoading}
                noDataText="No rooms assigned to this seating plan."
                columns={roomColumns}
                data={roomSummaries}
              />

              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color="text.primary"
                  sx={{ mb: 1, display: 'block' }}
                >
                  Student Exceptions ({unallocatedStudents.length})
                </Typography>
                {isStudentsDataLoading || isLayoutLoading ? (
                  <SkeletonList />
                ) : (
                  <StudentExceptionList
                    unallocatedStudents={unallocatedStudents}
                    excludedStudents={[]}
                    onFix={() => {
                      if (onBackToAllocation) onBackToAllocation();
                    }}
                  />
                )}
              </Box>
            </Stack>
          </SectionPaper>
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1}>
          {canPrint && (
            <>
              <SubmitButton
                buttonText={isDownloadingExcel ? 'Preparing Excel…' : 'Export Excel'}
                loading={isDownloadingExcel}
                onClick={handleDownloadExcel}
                type="button"
                variant="outlined"
                startIcon={<Iconify icon="mdi:microsoft-excel" />}
              />
              <SubmitButton
                buttonText={isDownloadingPdf ? 'Preparing PDF…' : 'Export PDF'}
                loading={isDownloadingPdf}
                onClick={handleDownloadPdf}
                type="button"
                variant="outlined"
                startIcon={<Iconify icon="mdi:file-pdf-box" />}
              />
            </>
          )}
        </Stack>
        <Stack direction="row" spacing={1}>
          <CancelButton onClick={onClose} buttonText="Close" />
          {!planDraftData?.isLocked ? (
            <SubmitButton
              buttonText={isFinalizing ? 'Finalizing…' : 'Finalize Plan'}
              loading={isFinalizing}
              disabled={validation.blockers.length > 0 || allocationProgress < 100 || isFinalizing}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              onClick={handleFinalize}
              type="button"
            />
          ) : (
            <SubmitButton
              buttonText={
                isPublishing
                  ? 'Publishing…'
                  : planDraftData?.status === SEATING_PLAN_STATUS_PUBLISHED
                    ? 'Published'
                    : 'Publish Plan'
              }
              loading={isPublishing}
              disabled={isPublishing || planDraftData?.status === SEATING_PLAN_STATUS_PUBLISHED}
              startIcon={<Iconify icon="solar:eye-bold" />}
              onClick={handlePublish}
              type="button"
            />
          )}
        </Stack>
      </DialogActions>
    </CustomDialog>
  );
}
