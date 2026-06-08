'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';

export const electiveGroups = [
  {
    id: 'elective1',
    name: 'Elective Group 1',
    subjects: [
      { id: 'computer', name: 'Computer' },
      { id: 'pt', name: 'Physical Training' },
    ],
  },
  {
    id: 'elective2',
    name: 'Elective Group 2',
    subjects: [
      { id: 'hindi', name: 'Hindi' },
      { id: 'sanskrit', name: 'Sanskrit' },
    ],
  },
];

export const useAssignElectiveSubject = () => {
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');
  const [studentSelections, setStudentSelections] = useState<Record<string, string>>({});
  const [students, setStudents] = useState<any[]>([]);
  const [electiveSubject, setElectiveSubject] = useState<string>('');
  const [selectedElectiveSubject, setSelectedElectiveSubject] = useState<string>('');

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');

    const dummyStudents = [
      { srNo: 1, rollNo: 'R001', name: 'Atre Prerna Bhanudas', grNo: 'GR001' },
      { srNo: 2, rollNo: 'R002', name: 'Mehta Divya Hitesh', grNo: 'GR002' },
      { srNo: 3, rollNo: 'R003', name: 'Patel Jiya Ganesh', grNo: 'GR003' },
      { srNo: 4, rollNo: 'R004', name: 'Shah Rohan Nirav', grNo: 'GR004' },
      { srNo: 5, rollNo: 'R005', name: 'Desai Krisha Manoj', grNo: 'GR005' },
      { srNo: 6, rollNo: 'R006', name: 'Joshi Aarav Mihir', grNo: 'GR006' },
      { srNo: 7, rollNo: 'R007', name: 'Kapadia Reeva Suresh', grNo: 'GR007' },
      { srNo: 8, rollNo: 'R008', name: 'Trivedi Anaya Harsh', grNo: 'GR008' },
      { srNo: 9, rollNo: 'R009', name: 'Modi Parth Bhargav', grNo: 'GR009' },
      { srNo: 10, rollNo: 'R010', name: 'Rathod Yashika Sanjay', grNo: 'GR010' },
    ];

    setElectiveSubject(electiveGroups[0].id);
    setStudents(dummyStudents);
    setStudentSelections({});
  }, [allClass, classes]);

  const handleSelectElectiveForStudent = useCallback((grNo: string, subjectId: string) => {
    setStudentSelections((prev) => ({ ...prev, [grNo]: subjectId }));
  }, []);

  const handleApplyElectiveToAll = useCallback(
    (subjId: string) => {
      const isSame = selectedElectiveSubject === subjId;
      const newValue = isSame ? '' : subjId;
      setSelectedElectiveSubject(newValue);

      if (!isSame) {
        const newSelections = students.reduce(
          (acc, student) => {
            acc[student.grNo] = subjId;
            return acc;
          },
          {} as Record<string, string>
        );
        setStudentSelections(newSelections);
      }
    },
    [selectedElectiveSubject, students]
  );

  return {
    allClass,
    classes,
    setClasses,
    allDivision,
    division,
    setDivision,
    studentSelections,
    students,
    electiveSubject,
    setElectiveSubject,
    selectedElectiveSubject,
    setSelectedElectiveSubject,
    handleSelectElectiveForStudent,
    handleApplyElectiveToAll,
  };
};
