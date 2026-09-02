import type { SeatingPlanGroupDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { useState, useEffect } from 'react';
import {
  useLazyGetSeatLayoutQuery,
  useLazyGetSeatAllocationStudentsQuery,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocationApi';

import { mapGuidedManualEditorData } from '../manual/manual-data-mappers';

import type {
  GuidedManualEditorData,
  ManualLayoutResponseDto,
  ManualStudentResponseDto,
} from '../manual/manual-editor-types';

interface Args {
  examId: string;
  standardId: string;
  plan: SeatingPlanGroupDto;
}

interface PublishedSeatingData extends GuidedManualEditorData {
  isLoading: boolean;
  error: string;
  canRetry: boolean;
  retry: () => void;
}

const EMPTY_DATA: GuidedManualEditorData = { students: [], rooms: [], assignments: [] };

export function usePublishedSeatingData({ examId, standardId, plan }: Args): PublishedSeatingData {
  const [loadStudents] = useLazyGetSeatAllocationStudentsQuery();
  const [loadLayout] = useLazyGetSeatLayoutQuery();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({
    ...EMPTY_DATA,
    isLoading: true,
    error: '',
    canRetry: false,
  });

  useEffect(() => {
    let isCurrent = true;
    const roomIds = [...new Set(plan.selectedRoomIds)];

    const loadPublishedSeating = async () => {
      setState({ ...EMPTY_DATA, isLoading: true, error: '', canRetry: false });
      if (plan.divisions.length === 0) {
        setState({
          ...EMPTY_DATA,
          isLoading: false,
          error:
            'This published plan has no divisions to display. Contact the school administrator.',
          canRetry: false,
        });
        return;
      }
      if (roomIds.length === 0) {
        setState({
          ...EMPTY_DATA,
          isLoading: false,
          error: 'This published plan has no rooms to display. Contact the school administrator.',
          canRetry: false,
        });
        return;
      }

      try {
        const [studentResponses, layoutResponses] = await Promise.all([
          Promise.all(
            plan.divisions.map((division) =>
              loadStudents({
                examId,
                divisionId: division.id,
                standardId,
                seatingPlanId: plan.seatingPlanId,
                pageSize: 1000,
              }).unwrap()
            )
          ) as Promise<ManualStudentResponseDto[]>,
          Promise.all(
            roomIds.map((roomId) =>
              loadLayout({
                examId,
                divisionId: plan.divisions[0].id,
                roomId,
                seatingPlanId: plan.seatingPlanId,
                pageSize: 1000,
              }).unwrap()
            )
          ) as Promise<ManualLayoutResponseDto[]>,
        ]);
        if (!isCurrent) return;
        const data = mapGuidedManualEditorData(
          plan,
          studentResponses,
          layoutResponses.map((layout, index) => ({ ...layout, roomId: roomIds[index] }))
        );
        setState({ ...data, isLoading: false, error: '', canRetry: false });
      } catch {
        if (!isCurrent) return;
        setState({
          ...EMPTY_DATA,
          isLoading: false,
          error: 'The published room seating could not be loaded. Try again.',
          canRetry: true,
        });
      }
    };

    loadPublishedSeating();
    return () => {
      isCurrent = false;
    };
  }, [attempt, examId, loadLayout, loadStudents, plan, standardId]);

  return { ...state, retry: () => setAttempt((current) => current + 1) };
}
