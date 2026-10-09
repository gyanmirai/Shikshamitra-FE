'use client';

import type { Board } from 'src/types/school';
import type { RootState } from 'src/redux/store';
import type { StudentOnboardingCampus } from 'src/redux/student/onboarding/student-onboarding-api';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useGetAvailableOnboardingCampusesQuery } from 'src/redux/student/onboarding/student-onboarding-api';

import { useOnboardingSettings } from '../onboarding-settings-context';
import { getOnboardingSchoolLevelName } from './onboarding-academic-applicability';

export { getOnboardingSchoolLevelName } from './onboarding-academic-applicability';

const EMPTY_BOARDS: Board[] = [];

export function filterOnboardingBoardsBySchoolLevels(
  boards: Board[], schoolLevelNames: string[] | null
): Board[] {
  if (schoolLevelNames === null) return boards;
  const allowed = new Set(schoolLevelNames.map((name) => name.trim().toLowerCase()));
  return boards.map((board) => ({
    ...board,
    educationMediums: (board.educationMediums ?? []).map((medium) => ({
      ...medium,
      educationMediumStages: (medium.educationMediumStages ?? []).filter((stage) =>
        allowed.has(getOnboardingSchoolLevelName(board.name, medium.name, stage.name).toLowerCase())
      ),
    })).filter((medium) => medium.educationMediumStages.length > 0),
  })).filter((board) => board.educationMediums.length > 0);
}

/** The selected year's school hierarchy is supplied by the authenticated global context. */
export function useOnboardingAcademicStructure({ includeCampuses = true }: { includeCampuses?: boolean } = {}): {
  boards: Board[];
  allBoards: Board[];
  campuses: StudentOnboardingCampus[];
  campusesLoading: boolean;
  campusesError: boolean;
} {
  const { settings } = useOnboardingSettings();
  const campusQuery = useGetAvailableOnboardingCampusesQuery(undefined, {
    skip: !includeCampuses,
    refetchOnMountOrArgChange: true,
  });
  const boards = useSelector((state: RootState) => state.globalState.currentYear?.boards);
  const allBoards = boards ?? EMPTY_BOARDS;
  const schoolLevelNames = settings.academicAvailability?.schoolLevelNames ?? null;
  const eligibleBoards = useMemo(() =>
    filterOnboardingBoardsBySchoolLevels(allBoards, schoolLevelNames),
    [allBoards, schoolLevelNames]
  );
  return {
    boards: eligibleBoards,
    allBoards,
    campuses: campusQuery.currentData ?? [],
    campusesLoading: campusQuery.isLoading,
    campusesError: campusQuery.isError,
  };
}
