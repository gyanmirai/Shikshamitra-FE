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
    ],
    []
  );

  const inquiryStatusOptions = useMemo(
    () => [
      { id: 'interest', name: 'Interest' },
      { id: 'pending', name: 'Pending' },
      { id: 'notinterest', name: 'Not Interest' },
    ],
    []
  );

  const allClasses = useMemo(() => {
    const classes =
      currentMedium?.educationMediumStages?.flatMap((stage: any) => stage.standards || []) || [];

    if (classes.length > 0 && !classes.some((std: any) => std.id === 'all')) {
      return [
        {
          id: 'all',
          name: 'All',
          divisions: [],
        },
        ...classes,
      ];
    }
    return classes;
  }, [currentMedium]);

  return {
    organizations,
    allClasses,
    genderOptions,
    inquiryStatusOptions,
    currentMedium,
  };
};
