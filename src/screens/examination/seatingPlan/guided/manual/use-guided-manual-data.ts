import type { Dispatch, SetStateAction } from 'react';
import type {
  SeatingPlanGroupDto,
  GuidedAllocationPreviewDto,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { useRef, useState, useEffect } from 'react';
import {
  useLazyGetSeatLayoutQuery,
  useLazyGetSeatAllocationStudentsQuery,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocationApi';

import { buildEmptyDraft } from '../../utils/mappers';
import { mapGuidedManualEditorData } from './manual-data-mappers';
import { restoreManualPreviewAssignments } from './manual-preview';

import type { SeatingPlanDraft, SeatingAllocationRules } from '../../types';
import type { ManualLayoutResponseDto, ManualStudentResponseDto } from './manual-editor-types';

interface Args {
  examId: string;
  standardId: string;
  plan: SeatingPlanGroupDto;
  selectedRoomIds: string[];
  rules: SeatingAllocationRules;
  setDraft: Dispatch<SetStateAction<SeatingPlanDraft>>;
  inProgressPreview?: GuidedAllocationPreviewDto;
}

export function useGuidedManualData({
  examId,
  standardId,
  plan,
  selectedRoomIds,
  rules,
  setDraft,
  inProgressPreview,
}: Args) {
  const [loadStudents] = useLazyGetSeatAllocationStudentsQuery();
  const [loadLayout] = useLazyGetSeatLayoutQuery();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const rulesRef = useRef(rules);
  rulesRef.current = rules;
  const previewRef = useRef(inProgressPreview);
  previewRef.current = inProgressPreview;
  const selectedRoomKey = [...selectedRoomIds].sort().join('|');
  const previousRoomKey = [...plan.selectedRoomIds].sort().join('|');
  const divisionKey = plan.divisions
    .map((division) => division.id)
    .sort()
    .join('|');

  useEffect(() => {
    let isCurrent = true;
    const roomIds = [...new Set([...plan.selectedRoomIds, ...selectedRoomIds])];
    const loadEditor = async () => {
      setIsLoading(true);
      setIsLoaded(false);
      setLoadError('');
      try {
        const [studentResponses, layoutResponses] = await Promise.all([
          Promise.all(
            plan.divisions.map((division) =>
              loadStudents(
                {
                  examId,
                  divisionId: division.id,
                  standardId,
                  seatingPlanId: plan.seatingPlanId,
                  pageSize: 1000,
                },
                true
              ).unwrap()
            )
          ) as Promise<ManualStudentResponseDto[]>,
          Promise.all(
            roomIds.map((roomId) =>
              loadLayout(
                {
                  examId,
                  divisionId: plan.divisions[0]?.id ?? '',
                  roomId,
                  seatingPlanId: plan.seatingPlanId,
                  pageSize: 1000,
                },
                true
              ).unwrap()
            )
          ) as Promise<ManualLayoutResponseDto[]>,
        ]);
        if (!isCurrent) return;
        const data = mapGuidedManualEditorData(
          plan,
          studentResponses,
          layoutResponses.map((layout, index) => ({
            ...layout,
            roomId: layout.roomId ?? roomIds[index],
          }))
        );
        setDraft({
          ...buildEmptyDraft(examId),
          roomIds: selectedRoomIds,
          students: data.students,
          rooms: data.rooms,
          assignments: restoreManualPreviewAssignments(
            data.assignments,
            previewRef.current,
            selectedRoomIds
          ),
          allocationRules: rulesRef.current,
          isLocked: plan.isLocked,
        });
        setIsLoaded(true);
      } catch {
        if (isCurrent) setLoadError('Unable to load the students or classroom layout. Try again.');
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };
    loadEditor();
    return () => {
      isCurrent = false;
    };
  }, [
    divisionKey,
    examId,
    loadLayout,
    loadStudents,
    plan,
    previousRoomKey,
    selectedRoomIds,
    selectedRoomKey,
    setDraft,
    standardId,
  ]);

  return { isLoading, loadError, isLoaded };
}
