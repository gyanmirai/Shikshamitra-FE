import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';
import type {
  Academic360Response,
  Academic360StudentRow,
} from 'src/screens/academic/student-academic-360/types';

import { useMemo, useState, useEffect } from 'react';
import { useGetClassQuery } from 'src/redux/class/classApi';
import { useGetStudentsByDivisionQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetStudentAcademic360Query } from 'src/redux/academicAPI/StudentAcademic360Api/studentAcademic360Api';

import { readStudentRows, toStudentOptions } from '../utils';

type ClassListPayload = {
  items?: Standards[];
};

type UseIndividualStudent360AnalyticsInput = Partial<TabComponentType>;

type UseIndividualStudent360AnalyticsResult = {
  classItems: Standards[];
  selectedClassId: string;
  divisionOptions: Division[];
  selectedDivisionId: string;
  selectedStudentId: string;
  studentOptions: ReturnType<typeof toStudentOptions>;
  selectedStudent?: Academic360StudentRow;
  academic360?: Academic360Response;
  isStudentsLoading: boolean;
  isStudentsError: boolean;
  isAcademic360Loading: boolean;
  isAcademic360Error: boolean;
  handleClassChange: (value: string) => void;
  handleDivisionChange: (value: string) => void;
  handleStudentChange: (value: string) => void;
};

const getFirstDivisionId = (standard?: Standards): string => standard?.divisions?.[0]?.id || '';

export function useIndividualStudent360Analytics({
  searchParams,
  setSearchParams,
}: UseIndividualStudent360AnalyticsInput): UseIndividualStudent360AnalyticsResult {
  const selectedClassId = searchParams?.classId ? String(searchParams.classId) : '';
  const [selectedDivisionId, setSelectedDivisionId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  const { data: classData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  /**
   * Memoization Justification:
   * - Keeps the class list reference stable for the setup effect dependency.
   * - Prevents the effect from re-running on every render when the query payload is unchanged.
   * - The value comes from an RTK query wrapper and is reused by multiple selects.
   */
  const classItems = useMemo(
    () => (classData as ClassListPayload | undefined)?.items || [],
    [classData]
  );

  const {
    data: studentsData,
    isFetching: isStudentsLoading,
    isError: isStudentsError,
  } = useGetStudentsByDivisionQuery(
    {
      divisionId: selectedDivisionId,
      skipCount: 0,
      maxResultCount: 100,
      searchTerm: '',
    },
    { skip: !selectedDivisionId }
  );

  const students = readStudentRows(studentsData);
  const studentOptions = toStudentOptions(students);
  const selectedStudent = students.find(
    (student) => (student.studentId || student.id) === selectedStudentId
  );

  const {
    data: academic360Data,
    isFetching: isAcademic360Loading,
    isError: isAcademic360Error,
  } = useGetStudentAcademic360Query(
    { studentId: selectedStudentId, recentTaskCount: 10, recentExamCount: 0 },
    { skip: !selectedStudentId }
  );

  useEffect(() => {
    if (!classItems.length) return;

    if (!selectedClassId) {
      const firstClassId = classItems[0]?.id;
      if (firstClassId) setSearchParams?.({ classId: firstClassId });
      return;
    }

    const selectedClass = classItems.find((item) => item.id === selectedClassId);
    const divisions = selectedClass?.divisions || [];
    setDivisionOptions(divisions);
    setSelectedDivisionId((current) =>
      divisions.some((division) => division.id === current)
        ? current
        : getFirstDivisionId(selectedClass)
    );
  }, [classItems, selectedClassId, setSearchParams]);

  useEffect(() => {
    setSelectedStudentId((current) =>
      studentOptions.some((option) => option.value === current)
        ? current
        : studentOptions[0]?.value || ''
    );
  }, [studentOptions]);

  return {
    classItems,
    selectedClassId,
    divisionOptions,
    selectedDivisionId,
    selectedStudentId,
    studentOptions,
    selectedStudent,
    academic360: academic360Data as Academic360Response | undefined,
    isStudentsLoading,
    isStudentsError,
    isAcademic360Loading,
    isAcademic360Error,
    handleClassChange: (value) => {
      setSearchParams?.({ classId: value });
      setSelectedStudentId('');
    },
    handleDivisionChange: (value) => {
      setSelectedDivisionId(value);
      setSelectedStudentId('');
    },
    handleStudentChange: setSelectedStudentId,
  };
}
