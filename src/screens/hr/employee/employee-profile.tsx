import type { RootState } from 'src/redux/store';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useDispatch, useSelector } from 'react-redux';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useLazyGetEmployeeByIdQuery } from 'src/redux/hr/employeeApi';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import EmployeeViewSkeleton from './employee-view-skeleton';

const EmployeeView = dynamic(() => import('./employee-view'), {
  loading: () => <EmployeeViewSkeleton />,
});

export default function EmployeeProfile({
  searchParams,
  setSearchParams,
}: {
  searchParams: Record<string, string>;
  setSearchParams: (key: string, value: string) => void;
}) {
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  const [getEmployeeById, { data: employee, isLoading, isError }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetEmployeeByIdQuery,
  });

  useEffect(() => {
    if (searchParams.employee) getEmployeeById(searchParams.employee.trim());
  }, [getEmployeeById, searchParams.employee]);

  const heading = employee?.fullName ? `${employee.fullName} Profile` : 'Staff Profile';
  const goBack = () => {
    if (!isChanges || window.confirm('Are you sure you want to leave this page?')) {
      setSearchParams('employee', '');
      dispatch(setIsChanges(false));
    }
  };

  return (
    <>
      <CustomBreadcrumbs
        heading={heading}
        links={[
          { name: 'Staff Directory', onClick: goBack },
          { name: heading },
        ]}
        description={
          employee?.fullName
            ? `View and manage ${employee.fullName} information including personal details, documents, payroll, transportation, academic records and communications`
            : 'View and manage staff information, documents and employment records.'
        }
        isBack
        onBack={goBack}
      />
      <EmployeeView
        employee={employee}
        isLoading={isLoading || (!employee && !isError)}
        isError={isError}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      />
    </>
  );
}
