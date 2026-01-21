import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { GenderType } from 'src/enums/gender';
import calculateAge from 'src/utils/calculate-age';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetStudentInquiryQuery } from 'src/redux/student/inquiry/inquiry-api';

import type { IInquiryResponse } from '../type';

// Define a minimal interface for the Redux state used here to avoid 'any'
interface GlobalState {
  currentMedium: {
    id: string;
  } | null;
}

interface RootState {
  globalState: GlobalState;
}

/**
 * Purpose:
 * Encapsulates the data fetching and transformation logic for the Inquiry Table.
 *
 * Performance Notes:
 * - Uses `useMemo` to cache transformed table data, preventing expensive re-calculations on every render.
 * - Dependent on `inquiryData` and `currentMedium`.
 *
 * Architectural Notes:
 * - Separates data concerns from UI presentation (Table component).
 */
export const useInquiryTableData = () => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const { data: inquiryData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentInquiryQuery,
    params: {
      academicMediumId: currentMedium?.id,
    },
    options: {
      skip: currentMedium?.id === undefined,
    },
  });

  const tableData = useMemo(() => {
    if (!inquiryData?.data?.items) return [];

    return inquiryData.data.items.map((item: IInquiryResponse) => ({
      ...item,
      dobValue: dayjs(item.dateOfBirth).format('DD-MM-YYYY'),
      ageValue: calculateAge(dayjs(item.dateOfBirth).format()),
      doiValue: dayjs(item.dateOfInquiry).format('DD-MM-YYYY'),
      secondaryContactNumber: item.secondaryContactNo ? item.secondaryContactNo : undefined,
      genderValue: GenderType[item?.gender as unknown as keyof typeof GenderType] || item.gender,
    }));
  }, [inquiryData?.data?.items]);

  return {
    tableData,
    isLoading,
  };
};
