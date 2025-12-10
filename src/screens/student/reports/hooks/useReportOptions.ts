import type { RootState } from 'src/redux/store';

import { useMemo } from 'react';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { EmployeeCastType, EmployeeCastTypeArray } from 'src/enums/employee-cast';

export const useReportOptions = () => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const organizations = useMemo(
    () => cloneDeep(currentMedium?.educationMediumStages || []),
    [currentMedium]
  );

  const monthOptions = useMemo(
    () => [
      { id: '1', name: 'January' },
      { id: '2', name: 'February' },
      { id: '3', name: 'March' },
      { id: '4', name: 'April' },
      { id: '5', name: 'May' },
      { id: '6', name: 'June' },
      { id: '7', name: 'July' },
      { id: '8', name: 'August' },
      { id: '9', name: 'September' },
      { id: '10', name: 'October' },
      { id: '11', name: 'November' },
      { id: '12', name: 'December' },
    ],
    []
  );

  const genderOptions = useMemo(
    () => [
      { id: 'male', name: 'Male' },
      { id: 'female', name: 'Female' },
      { id: 'other', name: 'Other' },
    ],
    []
  );

  const religionOptions = useMemo(
    () => [
      { id: 'Hinduism', name: 'Hinduism' },
      { id: 'Islam', name: 'Islam' },
      { id: 'Christianity', name: 'Christianity' },
      { id: 'Sikhism', name: 'Sikhism' },
      { id: 'Buddhism', name: 'Buddhism' },
      { id: 'Jainism', name: 'Jainism' },
      { id: 'Judaism', name: 'Judaism' },
      { id: 'Zoroastrianism', name: 'Zoroastrianism' },
    ],
    []
  );

  const categoryOptions = useMemo(
    () =>
      EmployeeCastTypeArray.map((i, index) => ({
        id: index.toString(),
        name: EmployeeCastType[index],
      })),
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
    monthOptions,
    genderOptions,
    religionOptions,
    categoryOptions,
    currentMedium,
  };
};
