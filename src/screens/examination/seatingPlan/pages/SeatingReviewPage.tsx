'use client';

import type { RootState, AppDispatch } from 'src/redux/store';

import { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { shikshaMitraToast } from 'src/components/toast';
import CancelButton from 'src/components/cancel-button';
import SubmitButton from 'src/components/submit-button';
import { Iconify } from 'src/components/iconify';
import { GlobalIcons } from 'src/utils/icons';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Skeleton, Stack, Typography } from '@mui/material';
import {
  seatAllocationApi,
  useGetExamRoomsQuery,
  useGetExamDivisionsQuery,
  useGetSeatingPlanDraftQuery,
  useFinalizeSeatingPlanMutation,
  usePublishSeatingPlanMutation,
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

function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

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
   */
  const searchRoomIds = useMemo(
    () => searchRoomIdsParam.split(',').filter(Boolean),
    [searchRoomIdsParam]
  );

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

  // ── Queries via useQueryAndMutation (skill § 4.1) ─────────────────────
  const {
    data: planDraftData,
    isLoading: isPlanLoading,
    isFetching: isPlanFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSeatingPlanDraftQuery,
    params: { examId, seatingPlanId },
    options: { skip: !examId },
  });

  const {
    data: divisionsData,
    isLoading: isDivisionsLoading,
    isFetching: isDivisionsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamDivisionsQuery,
    params: { examId, standardId },
    options: { skip: !examId || !standardId || !!drawerDivisionId || !!searchDivisionId },
  });

  const divisionId = drawerDivisionId || searchDivisionId || divisionsData?.items?.[0]?.id || '';

  // Combined loading flags (skill § 4.4) — isLoading || isFetching always
  const isPlanDataLoading = isPlanLoading || isPlanFetching;
  const isDivisionsDataLoading = isDivisionsLoading || isDivisionsFetching;

  /**
   * Memoization Justification:
   * - Keeps the effective room id array stable for review data loading hooks.
   */
  const {
    data: roomsData,
    isLoading: isRoomsLoading,
    isFetching: isRoomsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamRoomsQuery,
    params: { examId, divisionId, seatingPlanId },
    options: { skip: !examId || !divisionId },
  });

  const {
    data: studentsData,
    isLoading: isStudentsLoading,
    isFetching: isStudentsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSeatAllocationStudentsQuery,
    params: { examId, divisionId, seatingPlanId },
    options: { skip: !examId || !divisionId },
  });

  const isRoomsDataLoading = isRoomsLoading || isRoomsFetching;
  const isStudentsDataLoading = isStudentsLoading || isStudentsFetching;
  const isLayoutLoading = !loaded || isRoomsDataLoading || isDivisionsDataLoading;

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

  useEffect(() => {
    setLoaded(false);
    if (!examId || !divisionId || roomIds.length === 0 || !roomsData?.items) return;
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
  const allocationProgress =
    totalStudents === 0 ? 0 : Math.round((assignedIds.size / totalStudents) * 100);

  const handleBack = () => {
    if (onBackToAllocation) {
      onBackToAllocation();
      return;
    }
    router.push(`/academic/seatallocation/${examId}/allocate`);
  };

  const handleFinalize = async () => {
    try {
      await finalizeSeatingPlan({ examId, seatingPlanId }).unwrap();
      shikshaMitraToast.success({ message: 'Seating plan finalized and locked.' });
      handleBack();
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Allocation Review"
        isBack
        onBack={handleBack}
        links={[
          { name: 'Academic', href: '/academic/dashboard' },
          { name: 'Examination' },
          { name: 'Seating Plan', href: '/academic/seatallocation' },
          { name: 'Review' },
        ]}
      />

      {isPlanDataLoading ? (
        <Skeleton variant="rounded" height={56} sx={{ mb: 2, borderRadius: 1 }} />
      ) : (
        <SeatingReadinessBanner
          blockers={validation.blockers.length}
          warnings={validation.warnings.length}
          allocationProgress={allocationProgress}
        />
      )}

      {canPrint && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <SubmitButton
            buttonText={isDownloadingPdf ? 'Preparing PDF…' : 'Download Master List (PDF)'}
            loading={isDownloadingPdf}
            variant="outlined"
            type="button"
            startIcon={<Iconify icon="mdi:file-pdf-box" />}
            onClick={async () => {
              try {
                const blob = await downloadPdf({ examId, seatingPlanId }).unwrap();
                triggerBlobDownload(blob as Blob, `seating-plan-${examId}.pdf`);
              } catch {
                shikshaMitraToast.error({ message: 'Failed to download PDF.' });
              }
            }}
          />
          <SubmitButton
            buttonText={isDownloadingExcel ? 'Preparing Excel…' : 'Download Master List (Excel)'}
            loading={isDownloadingExcel}
            variant="outlined"
            type="button"
            startIcon={<Iconify icon="mdi:microsoft-excel" />}
            onClick={async () => {
              try {
                const blob = await downloadExcel({ examId, seatingPlanId }).unwrap();
                triggerBlobDownload(blob as Blob, `seating-plan-${examId}.xlsx`);
              } catch {
                shikshaMitraToast.error({ message: 'Failed to download Excel.' });
              }
            }}
          />
        </Stack>
      )}

      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        Room Summary
      </Typography>
      <RoomAllocationSummary rooms={roomSummaries} isLoading={isLayoutLoading} />

      <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 3 }} gutterBottom>
        Student Exceptions
      </Typography>
      {isStudentsDataLoading || isLayoutLoading ? (
        <Stack spacing={1}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
          ))}
        </Stack>
      ) : (
        <StudentExceptionList
          unallocatedStudents={unallocatedStudents}
          excludedStudents={[]}
          onFix={handleBack}
        />
      )}

      <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
        <CancelButton buttonText="Back to Allocation" onClick={handleBack} />
        {!planDraftData?.isLocked ? (
          <SubmitButton
            buttonText={isFinalizing ? 'Finalizing…' : 'Finalize Seating Plan'}
            loading={isFinalizing}
            disabled={
              !canFinalize ||
              validation.blockers.length > 0 ||
              allocationProgress < 100 ||
              isFinalizing
            }
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            onClick={handleFinalize}
            type="button"
          />
        ) : (
          <SubmitButton
            buttonText={
              isPublishing
                ? 'Publishing…'
                : planDraftData?.status === 5
                  ? 'Published'
                  : 'Publish Seating Plan'
            }
            loading={isPublishing}
            disabled={isPublishing || planDraftData?.status === 5}
            startIcon={<Iconify icon="solar:eye-bold" />}
            onClick={handlePublish}
            type="button"
          />
        )}
      </Stack>
    </Box>
  );
}
