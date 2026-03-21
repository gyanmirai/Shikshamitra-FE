'use client';

import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { debounce, cloneDeep } from 'lodash';
import { useMemo, useState, useEffect } from 'react';

import type { INotificationSendSchema } from '../components/type';

/**
 * Hook: useAudienceStep
 * Responsibilities:
 * - Managing roles data fetching
 * - Orchestrating class and division list updates
 * - Handling automatic selection logic for "All" options
 * - Syncing fetched student data with Formik state
 */
export const useAudienceStep = (formik: FormikProps<INotificationSendSchema>) => {
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => setDebouncedSearch(value), 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  useEffect(() => {
    if (!medium?.educationMediumStages) {
      setAllOrganization([]);
      return;
    }
    const orgList = cloneDeep(medium.educationMediumStages);
    const updatedOrganizations = [
      {
        id: 'all',
        name: 'All',
        creationTime: '',
        creatorId: '',
        lastModificationTime: '',
        lastModifierId: '',
        educationMediumStageId: '',
        divisions: [],
      },
      ...orgList,
    ];
    setAllOrganization(updatedOrganizations);
  }, [medium?.educationMediumStages]);

  const tableData = useMemo(
    () => [
      {
        id: '0',
        role: 'Student',
        name: 'Prerna Bhanudas Atre',
        division: 'A',
        grNo: 'GR001',
        rollNo: '101',
        email: 'prerna@gmail.com',
        employeeCode: '',
        contactNo: '1234567890',
      },
      {
        id: '1',
        role: 'Student',
        name: 'Dharmik Harishbhai Ahir',
        division: 'B',
        grNo: 'GR002',
        rollNo: '102',
        email: 'dharmik@gmail.com',
        employeeCode: '',
        contactNo: '0987654321',
      },
      {
        id: '2',
        role: 'Teacher',
        name: 'Rahul Sharma',
        division: '',
        grNo: '',
        rollNo: '',
        email: 'rahul.sharma@school.com',
        employeeCode: 'EMP003',
        contactNo: '9876543210',
      },
      {
        id: '3',
        role: 'Parent',
        name: 'Suresh Patel',
        division: '',
        grNo: '',
        rollNo: '',
        email: 'suresh.patel@gmail.com',
        employeeCode: '',
        contactNo: '8765432109',
      },
    ],
    []
  );

  // Sync tableData with Formik members
  useEffect(() => {
    if (!tableData.length) {
      formik.setFieldValue('members', []);
      return;
    }

    formik.setFieldValue(
      'members',
      tableData.map((item: any) => {
        const existing = formik.values.members?.find((member: any) => member.id === item.id);
        return {
          ...item,
          isSelect: existing?.isSelect ?? false,
        };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData]);

  const displayData = useMemo(() => {
    if (!debouncedSearch) return formik.values.members || [];
    const lowerTerm = debouncedSearch.toLowerCase();
    return (formik.values.members || []).filter(
      (member: any) =>
        member.name?.toLowerCase().includes(lowerTerm) ||
        member.email?.toLowerCase().includes(lowerTerm) ||
        member.role?.toLowerCase().includes(lowerTerm) ||
        member.contactNo?.toLowerCase().includes(lowerTerm) ||
        member.grNo?.toLowerCase().includes(lowerTerm) ||
        member.employeeCode?.toLowerCase().includes(lowerTerm)
    );
  }, [debouncedSearch, formik.values.members]);

  const onClearSearch = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    debouncedSetSearch.cancel();
  };

  return {
    allOrganization,
    searchTerm,
    debouncedSearch,
    handleSearchChange,
    onClearSearch,
    displayData,
  };
};
