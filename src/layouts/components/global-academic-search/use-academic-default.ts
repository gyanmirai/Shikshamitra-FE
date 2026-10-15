import type { AcademicYear } from 'src/types/school';

import { useRef, useEffect } from 'react';
import { setDriverNextEnabled } from 'src/utils/driverBtnConfig';
import { findCurrentAcademicYear } from 'src/utils/academic-year';

import type { GlobalAcademicSearchOption } from './types';
import type { useAcademicOptions } from './use-academic-options';

type Props = ReturnType<typeof useAcademicOptions> & {
  currentYearId?: string;
  currentRouteSelectionIsScoped: boolean;
  applyAcademicOption: (option: GlobalAcademicSearchOption | null) => void;
};

export function useAcademicDefault({
  accessToken,
  years,
  isLoading,
  isStudentModule,
  options,
  yearOptions,
  currentYearId,
  currentRouteSelectionIsScoped,
  applyAcademicOption,
}: Props) {
  const autoSelectedAccessTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      !accessToken ||
      autoSelectedAccessTokenRef.current === accessToken ||
      isLoading ||
      !years?.items.length
    ) {
      return;
    }
    if (currentYearId && currentRouteSelectionIsScoped) {
      autoSelectedAccessTokenRef.current = accessToken;
      return;
    }

    const academicYear = findCurrentAcademicYear<AcademicYear>(years.items);
    const defaultOption =
      options.find((option) => option.academicYear.id === academicYear?.id) ??
      yearOptions.find((option) => option.academicYear.id === academicYear?.id) ??
      (isStudentModule ? (options[0] ?? yearOptions[0]) : null);
    if (!defaultOption) return;

    applyAcademicOption(defaultOption);
    setDriverNextEnabled(true);
    autoSelectedAccessTokenRef.current = accessToken;
  }, [
    accessToken,
    applyAcademicOption,
    currentRouteSelectionIsScoped,
    currentYearId,
    isLoading,
    isStudentModule,
    options,
    yearOptions,
    years?.items,
  ]);
}
