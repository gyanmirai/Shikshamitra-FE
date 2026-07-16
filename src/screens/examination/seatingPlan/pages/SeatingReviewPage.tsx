'use client';

import type { RootState , AppDispatch } from 'src/redux/store';

import { toast } from 'sonner';
import { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Button, Tooltip, Checkbox, Typography, FormControlLabel } from '@mui/material';
import {
  seatAllocationApi,
  useGetExamRoomsQuery,
  useGetExamDivisionsQuery,
  useGetSeatingPlanDraftQuery,
  usePublishSeatingPlanMutation,
  useFinalizeSeatingPlanMutation,
  useGetSeatAllocationStudentsQuery,
  useLazyDownloadSeatingPrintPdfQuery,
  useLazyDownloadSeatingPrintExcelQuery,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocationApi';

import { validateSeatingDraft } from '../utils/validate';
import StudentExceptionList from '../components/review/StudentExceptionList';
import RoomAllocationSummary from '../components/review/RoomAllocationSummary';
import SeatingReadinessBanner from '../components/review/SeatingReadinessBanner';
import { toSeatingStudents, toSeatingRoomLayout, toSeatingAssignments } from '../utils/mappers';

import type { SeatingRoomLayout, SeatingAssignment } from '../types';

interface Props {
  examId: string;
  standardId?: string;
  divisionId?: string;
  roomIds?: string[];
  seatingPlanId?: string;
  onBackToAllocation?: () => void;
}

// Mirrors backend SeatingPlanStatus enum order (NotStarted=0 … Published=5); the API does not
// serialize enums as strings, so the numeric value has to be compared directly here.
const SEATING_PLAN_STATUS_PUBLISHED = 5;

export default function SeatingReviewPage({
  examId,
  standardId,
  divisionId: drawerDivisionId,
  roomIds: drawerRoomIds,
  seatingPlanId: drawerSeatingPlanId,
  onBackToAllocation,
}: Props) {
  const router = useRouter();
  const { permissions } = useSelector((state: RootState) => state.auth);
  const seatAllocationBase = academicPermissions.examination.seatAllocation;
  const canFinalize = hasGrantedPermission(permissions, `${seatAllocationBase}.Finalize`);
  const canPublish = hasGrantedPermission(permissions, `${seatAllocationBase}.Publish`);
  const canPrint = hasGrantedPermission(permissions, `${seatAllocationBase}.Print`);
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const searchDivisionId = searchParams.get('divisionId') || '';
  const searchRoomIdsParam = searchParams.get('roomIds') || '';
  const seatingPlanId = drawerSeatingPlanId || searchParams.get('seatingPlanId') || '';
  /**
   * Memoization Justification:
   * - Parses the URL room ids once per query string change.
   * - Prevents a fresh array from invalidating review-loading dependencies on every render.
   * - Needed because the review page can run either as a route or inside the list drawer.
   */
  const searchRoomIds = useMemo(
    () => searchRoomIdsParam.split(',').filter(Boolean),
    [searchRoomIdsParam]
  );

  const [rooms, setRooms] = useState<SeatingRoomLayout[]>([]);
  const [assignments, setAssignments] = useState<SeatingAssignment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [finalizeSeatingPlan, { isLoading: isFinalizing }] = useFinalizeSeatingPlanMutation();
  const [publishSeatingPlan, { isLoading: isPublishing }] = usePublishSeatingPlanMutation();
  const [downloadPdf, { isFetching: isDownloadingPdf }] = useLazyDownloadSeatingPrintPdfQuery();
  const [downloadExcel, { isFetching: isDownloadingExcel }] = useLazyDownloadSeatingPrintExcelQuery();

  const { data: planDraftData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSeatingPlanDraftQuery,
    params: { examId, seatingPlanId },
    options: { skip: !examId },
  });

  const { data: divisionsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamDivisionsQuery,
    params: { examId, standardId },
    options: { skip: !examId || !standardId || !!drawerDivisionId || !!searchDivisionId },
  });

  const divisionId = drawerDivisionId || searchDivisionId || divisionsData?.items?.[0]?.id || '';
  /**
   * Memoization Justification:
   * - Keeps the effective room id array stable for review data loading hooks.
   * - Prevents the downstream review draft memo/effect dependencies from changing on every render.
   * - The value may come from drawer props, URL params, or fetched draft context.
   */
  const triggerBlobDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const { data: roomsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamRoomsQuery,
    params: { examId, divisionId, seatingPlanId },
    options: { skip: !examId || !divisionId },
  });

  /**
   * Memoization Justification:
   * - Keeps the effective room id array stable for review data loading hooks.
   * - Prevents the downstream review draft memo/effect dependencies from changing on every render.
   * - The value may come from drawer props, URL params, fetched draft context, or division room fallback.
   */
  const roomIds = useMemo(
    () =>
      drawerRoomIds?.length
        ? drawerRoomIds
        : searchRoomIds.length
          ? searchRoomIds
          : planDraftData?.roomIds?.length
            ? planDraftData.roomIds
            : (roomsData?.items || []).map((room: any) => room.id).filter(Boolean),
    [drawerRoomIds, searchRoomIds, planDraftData?.roomIds, roomsData]
  );

  const { data: studentsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSeatAllocationStudentsQuery,
    params: { examId, divisionId, seatingPlanId },
    options: { skip: !examId || !divisionId },
  });

  useEffect(() => {
    setLoaded(false);
    if (!examId || !divisionId || roomIds.length === 0 || !roomsData?.items) return;
    let cancelled = false;

    (async () => {
      const results = await Promise.all(
        roomIds.map((roomId: string) =>
          dispatch(seatAllocationApi.endpoints.getSeatLayout.initiate({ examId, divisionId, roomId, seatingPlanId })).unwrap()
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

    // eslint-disable-next-line consistent-return
    return () => {
      cancelled = true;
    };
    // roomIds is derived fresh from searchParams each render; joining avoids infinite effect loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, divisionId, roomsData, dispatch, seatingPlanId, roomIds.join(',')]);

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
        return {
          roomId: room.roomId,
          roomName: room.roomName,
          occupied,
          usable,
          empty: Math.max(0, usable - occupied),
          utilization: usable === 0 ? 0 : Math.round((occupied / usable) * 100),
        };
      }),
    [rooms, assignments]
  );

  const assignedIds = useMemo(() => new Set(assignments.map((a) => a.studentId)), [assignments]);
  const unallocatedStudents = students.filter((s) => !assignedIds.has(s.studentId));
  const totalStudents = students.length;
  const allocationProgress = totalStudents === 0 ? 0 : Math.round((assignedIds.size / totalStudents) * 100);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Allocation Review"
        isBack
        onBack={() => {
          if (onBackToAllocation) {
            onBackToAllocation();
            return;
          }
          router.push(`/academic/seatallocation/${examId}/allocate`);
        }}
        links={[
          { name: 'Academic', href: '/academic/dashboard' },
          { name: 'Examination' },
          { name: 'Seating Plan', href: '/academic/seatallocation' },
          { name: 'Review' },
        ]}
      />

      <SeatingReadinessBanner
        blockers={validation.blockers.length}
        warnings={validation.warnings.length}
        allocationProgress={allocationProgress}
      />

      {canPrint && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            disabled={isDownloadingPdf}
            onClick={async () => {
              const blob = await downloadPdf({ examId, seatingPlanId }).unwrap();
              triggerBlobDownload(blob as Blob, `seating-plan-${examId}.pdf`);
            }}
          >
            {isDownloadingPdf ? 'Preparing PDF…' : 'Download Master List (PDF)'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            disabled={isDownloadingExcel}
            onClick={async () => {
              const blob = await downloadExcel({ examId, seatingPlanId }).unwrap();
              triggerBlobDownload(blob as Blob, `seating-plan-${examId}.xlsx`);
            }}
          >
            {isDownloadingExcel ? 'Preparing Excel…' : 'Download Master List (Excel)'}
          </Button>
        </Box>
      )}

      {!loaded ? (
        <Typography variant="body2" color="text.secondary">
          Loading review data…
        </Typography>
      ) : (
        <>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Room Summary
          </Typography>
          <RoomAllocationSummary rooms={roomSummaries} />

          <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 3 }} gutterBottom>
            Student Exceptions
          </Typography>
          <StudentExceptionList
            unallocatedStudents={unallocatedStudents}
            excludedStudents={[]}
            onFix={() => {
              if (onBackToAllocation) {
                onBackToAllocation();
                return;
              }
              router.push(`/academic/seatallocation/${examId}/allocate`);
            }}
          />
        </>
      )}

      <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => {
            if (onBackToAllocation) {
              onBackToAllocation();
              return;
            }
            router.push(`/academic/seatallocation/${examId}/allocate`);
          }}
        >
          Back to Allocation
        </Button>
        <Button
          variant="contained"
          disabled={!canFinalize || validation.blockers.length > 0 || allocationProgress < 100 || isFinalizing}
          onClick={async () => {
            try {
              await finalizeSeatingPlan({ examId, seatingPlanId }).unwrap();
              toast.success('Seating plan finalized and locked.');
              if (onBackToAllocation) {
                onBackToAllocation();
                return;
              }
              router.push(`/academic/seatallocation/${examId}/allocate`);
            } catch (err: any) {
              toast.error(err?.data?.error?.message || 'Could not finalize the seating plan.');
            }
          }}
        >
          {isFinalizing ? 'Finalizing…' : 'Finalize Seating Plan'}
        </Button>
      </Box>

      {planDraftData?.isLocked && canPublish && (
        <Box sx={{ mt: 3, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Publish
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Publishing marks the plan visible downstream. Notification channels below are not yet
            connected to an email/SMS provider — publishing will not send anything until that is wired up.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            {['Exam Staff', 'Teachers', 'Students', 'Parents', 'Email'].map((label) => (
              <Tooltip key={label} title="Coming soon — no notification provider connected yet">
                <span>
                  <FormControlLabel
                    disabled
                    control={<Checkbox size="small" checked={false} />}
                    label={<Typography variant="caption">{label}</Typography>}
                  />
                </span>
              </Tooltip>
            ))}
          </Box>
          <Button
            variant="contained"
            color="success"
            disabled={isPublishing || planDraftData?.status === SEATING_PLAN_STATUS_PUBLISHED}
            onClick={async () => {
              try {
                await publishSeatingPlan({
                  examId,
                  seatingPlanId,
                  body: {
                    notifyExamStaff: false,
                    notifyTeachers: false,
                    notifyStudents: false,
                    notifyParents: false,
                    sendEmail: false,
                    scheduleAt: null,
                  },
                }).unwrap();
                toast.success('Seating plan published.');
              } catch (err: any) {
                toast.error(err?.data?.error?.message || 'Could not publish the seating plan.');
              }
            }}
          >
            {planDraftData?.status === SEATING_PLAN_STATUS_PUBLISHED ? 'Published' : isPublishing ? 'Publishing…' : 'Publish Seating Plan'}
          </Button>
        </Box>
      )}
    </Box>
  );
}
