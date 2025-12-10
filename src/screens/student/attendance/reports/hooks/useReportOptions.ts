import type { RootState } from 'src/redux/store';

import { useMemo } from 'react';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';

export const useReportOptions = () => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const organizations = useMemo(
    () => cloneDeep(currentMedium?.educationMediumStages || []),
    [currentMedium]
  );

  const genderOptions = useMemo(
    () => [
      { id: 'male', name: 'Male' },
      { id: 'female', name: 'Female' },
      { id: 'other', name: 'Other' },
    ],
    []
  );

  const attendanceTypeOptions = useMemo(
    () => [
      { id: 'Present', name: 'Present' },
      { id: 'Absent', name: 'Absent' },
      { id: 'Leave', name: 'Leave' },
      { id: 'Late', name: 'Late' },
    ],
    []
  );

  return {
    organizations,
    genderOptions,
    attendanceTypeOptions,
    currentMedium,
  };
};
