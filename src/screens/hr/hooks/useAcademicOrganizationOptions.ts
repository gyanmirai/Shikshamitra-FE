import { useMemo } from 'react';
import {
  type AcademicOrganizationOption,
  useGetAcademicOrganizationOptionsQuery,
} from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';

export type AcademicOrganizationSelectOption = AcademicOrganizationOption & {
  name: string;
};

export const useAcademicOrganizationOptions = (academicYearId?: string, enabled = true) => {
  const {
    currentData: data,
    isLoading,
    isFetching,
  } = useGetAcademicOrganizationOptionsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId || !enabled }
  );

  const options = useMemo<AcademicOrganizationSelectOption[]>(
    () => (data?.items || []).map((item) => ({ ...item, name: item.label })),
    [data?.items]
  );

  const byId = useMemo(() => new Map(options.map((item) => [item.id, item])), [options]);

  return {
    options,
    byId,
    isLoading: isLoading || isFetching,
  };
};
