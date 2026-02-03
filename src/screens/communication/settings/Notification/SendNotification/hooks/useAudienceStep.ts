'use client';

import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import type { INotificationSendSchema } from '../Components/type';

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

  const [getStudents] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  const { data: rolesData, isLoading: isRolesLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });

  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  // Update class list when medium/organization changes
  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    // Add "All" option if not present
    if (!allClasses.some((std: Standards) => std.id === 'all')) {
      allClasses.unshift({
        id: 'all',
        name: 'All',
        creationTime: '',
        creatorId: '',
        lastModificationTime: '',
        lastModifierId: '',
        educationMediumStageId: '',
        divisions: [],
      } as unknown as Standards);
    }
    setAllClass(allClasses);
  }, [medium]);

  // Update division list based on class selection
  useEffect(() => {
    const selectedClasses = formik.values.audience.classes || [];
    if (selectedClasses.length === 0) {
      setAllDivision([]);
      formik.setFieldValue('audience.divisions', []);
      return;
    }

    if (selectedClasses.length === 1 && selectedClasses[0] !== 'all') {
      const selectedClass = allClass.find((cls: any) => cls?.id === selectedClasses[0]);
      const divisions = selectedClass?.divisions || [];
      setAllDivision(divisions);
      formik.setFieldValue(
        'audience.divisions',
        divisions.map((d: any) => d.id)
      );
    } else {
      setAllDivision([
        {
          id: 'all',
          name: 'All',
        } as unknown as Division,
      ]);
      formik.setFieldValue('audience.divisions', ['all']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass, formik.values.audience?.classes]);

  // Fetch students when filters change
  useEffect(() => {
    const classes = formik.values.audience?.classes || [];
    const divisions = formik.values.audience?.divisions || [];

    if (classes.length === 0 || divisions.length === 0) return;

    const payload = {
      educationMediumStageId: medium?.id,
      standardIds: classes.filter((id) => id !== 'all'),
      divisionIds: divisions.filter((id) => id !== 'all'),
    };

    if (payload.standardIds.length > 0 && payload.divisionIds.length > 0) {
      getStudents(payload);
    }
  }, [formik.values.audience?.classes, formik.values.audience?.divisions, getStudents, medium]);

  /**
   * Memoization Justification:
   * Mocking table data based on the selected role.
   * Prevents re-calculation on every render.
   */
  const tableData = useMemo(() => {
    // STUDENT ROLE ID (TODO: Replace with dynamic constant if available)
    if (formik.values.audience?.role === '3a1c1c6b-79ab-63ab-ea1f-e7f639d54dad') {
      return [
        {
          id: '0',
          name: 'Prerna Bhanudas Atre',
          division: 'A',
          grNo: 'GR001',
          rollNo: '1',
          contactNo: '1234567890',
        },
        {
          id: '1',
          name: 'Dharmik Harishbhai Ahir',
          division: 'A',
          grNo: 'GR002',
          rollNo: '2',
          contactNo: '0987654321',
        },
      ];
    }
    return [
      {
        id: '0',
        name: 'Prerna Bhanudas Atre',
        division: '',
        grNo: '',
        rollNo: '',
        email: 'prerna@gmail.com',
        employeeCode: 'EMP001',
        contactNo: '1234567890',
      },
      {
        id: '1',
        name: 'Dharmik Harishbhai Ahir',
        division: '',
        grNo: '',
        rollNo: '',
        email: 'dharmik@gmail.com',
        employeeCode: 'EMP002',
        contactNo: '0987654321',
      },
    ];
  }, [formik.values.audience?.role]);

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

  /**
   * Memoization Justification:
   * Handles the complex "Select All" logic for classes.
   * Passed to CustomSelect, memoizing prevents unnecessary re-renders.
   */
  const handleClassChange = useCallback(
    (val: unknown) => {
      const value = val as string[];
      const allClassIds = allClass?.filter((cls) => cls.id !== 'all').map((cls) => cls.id) || [];
      const isAllClicked = value.includes('all');
      const wasAllPreviouslySelected = (formik.values.audience?.classes as string[]).includes(
        'all'
      );

      if (isAllClicked && !wasAllPreviouslySelected) {
        formik.setFieldValue('audience.classes', ['all', ...allClassIds]);
      } else if (!isAllClicked && wasAllPreviouslySelected) {
        formik.setFieldValue('audience.classes', []);
      } else {
        const selectedWithoutAll = value.filter((id) => id !== 'all');
        if (selectedWithoutAll.length === allClassIds.length) {
          formik.setFieldValue('audience.classes', ['all', ...allClassIds]);
        } else {
          formik.setFieldValue('audience.classes', selectedWithoutAll);
        }
      }
    },
    [allClass, formik]
  );

  return {
    rolesData,
    isRolesLoading,
    allClass,
    allDivision,
    handleClassChange,
  };
};
