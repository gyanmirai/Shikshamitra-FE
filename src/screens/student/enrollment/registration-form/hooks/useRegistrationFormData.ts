import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { GenderType } from 'src/enums/gender';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetStudentRegistrationFormQuery } from 'src/redux/student/registration-form/registration-form-api';

type RegistrationApiItem = {
  id: string;
  dateOfBirth?: string | null;
  dateOfInquiry?: string | null;
  gender?: keyof typeof GenderType | number | null;
  [key: string]: unknown;
};

export type RegistrationTableRow = RegistrationApiItem & {
  dobValue?: string;
  doiValue?: string;
  genderValue?: string;
};

export const useRegistrationFormData = () => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState as any);

  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentRegistrationFormQuery,
    params: {
      academicMediumId: currentMedium?.id,
    },
    options: {
      skip: !currentMedium?.id,
    },
  });

  /**
   * Memoization Justification:
   * Prevents re-computation of transformed table data on every render.
   * Data mapping and date formatting are moderately expensive when lists are large.
   * Triggered only when the backing API items array identity changes.
   */
  const tableData: RegistrationTableRow[] = useMemo(() => {
    const items = (data?.data?.items ?? []) as RegistrationApiItem[];
    return items.map((item) => ({
      ...item,
      dobValue: item?.dateOfBirth ? dayjs(item.dateOfBirth).format('DD-MM-YYYY') : '-',
      genderValue:
        item?.gender !== undefined && item?.gender !== null
          ? String(GenderType[item.gender as keyof typeof GenderType] ?? '-')
          : '-',
      doiValue: item?.dateOfInquiry ? dayjs(item.dateOfInquiry).format('DD-MM-YYYY') : '-',
    }));
  }, [data?.data?.items]);

  return { tableData, isLoading };
};
