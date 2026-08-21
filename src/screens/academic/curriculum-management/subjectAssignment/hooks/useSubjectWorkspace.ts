'use client';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetSubjectAssignmentsQuery,
  useGetSubjectAssignmentByIdQuery,
} from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import type {
  ISubjectDetail,
  ISubjectFormValues,
  INavigatorSubjectItem,
  INavigatorElectiveGroup,
} from '../component/type';

interface UseSubjectWorkspaceParams {
  classId: string;
  initialSubject?: ISubjectFormValues | null;
  initialSubjectId?: string | null;
  initialAssignmentId?: string | null;
}

export function useSubjectWorkspace({
  classId,
  initialSubject,
  initialSubjectId,
  initialAssignmentId,
}: UseSubjectWorkspaceParams) {
  // 1. Fetch all subject assignments for the class (pageSize: 100 to get all class subjects)
  const {
    data: allAssignmentsData,
    isLoading: isListLoading,
    isFetching: isListFetching,
    error: listError,
    refetch: refetchList,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: {
      standardId: classId,
      page: 0,
      pageSize: 100,
      status: 'all',
    },
    options: { skip: !classId },
  });

  const assignmentItems: ISubjectFormValues[] = useMemo(
    () => allAssignmentsData?.data?.items || [],
    [allAssignmentsData]
  );

  // 2. Derive Core Subjects and Elective Groups
  const { coreSubjects, electiveGroups, allSubjectsFlat } = useMemo(() => {
    const cores: INavigatorSubjectItem[] = [];
    const electiveGroupsMap = new Map<string, INavigatorElectiveGroup>();
    const flat: INavigatorSubjectItem[] = [];

    assignmentItems.forEach((assignment) => {
      const isElective = assignment.subjectType === 1;
      const subjectsList = assignment.subjects || [];

      if (!isElective) {
        // Core Assignment
        if (subjectsList.length > 0) {
          subjectsList.forEach((sub) => {
            const item: INavigatorSubjectItem = {
              assignmentId: String(assignment.id),
              assignedSubjectId: sub.id || sub.assignedId,
              subjectId: sub.subjectId,
              subjectCode: sub.subjectCode || '',
              subjectName: sub.subjectName || (sub as any).subject?.name || assignment.subjectName || 'Core Subject',
              color: sub.subject?.color || (sub as any).color || '#3b82f6',
              status: assignment.status,
              subjectType: 0,
              primaryTeacher: sub.primaryTeacher,
              weeklyPeriods: assignment.weeklyPeriods,
            };
            cores.push(item);
            flat.push(item);
          });
        } else {
          // Fallback if subjects array is empty
          const item: INavigatorSubjectItem = {
            assignmentId: String(assignment.id),
            subjectId: String(assignment.id),
            subjectCode: '',
            subjectName: assignment.subjectName || 'Core Subject',
            color: '#3b82f6',
            status: assignment.status,
            subjectType: 0,
            weeklyPeriods: assignment.weeklyPeriods,
          };
          cores.push(item);
          flat.push(item);
        }
      } else {
        // Elective Assignment
        const groupId = assignment.electiveGroupId || String(assignment.id);
        const groupName = assignment.electiveGroupName || 'Elective Group';

        if (!electiveGroupsMap.has(groupId)) {
          electiveGroupsMap.set(groupId, {
            electiveGroupId: groupId,
            electiveGroupName: groupName,
            subjects: [],
          });
        }

        const group = electiveGroupsMap.get(groupId)!;

        subjectsList.forEach((sub) => {
          const item: INavigatorSubjectItem = {
            assignmentId: String(assignment.id),
            assignedSubjectId: sub.id || sub.assignedId,
            subjectId: sub.subjectId,
            subjectCode: sub.subjectCode || '',
            subjectName: sub.subjectName || (sub as any).subject?.name || 'Elective Subject',
            color: sub.subject?.color || (sub as any).color || '#8b5cf6',
            status: assignment.status,
            subjectType: 1,
            electiveGroupId: groupId,
            electiveGroupName: groupName,
            primaryTeacher: sub.primaryTeacher,
            weeklyPeriods: assignment.weeklyPeriods,
          };
          group.subjects.push(item);
          flat.push(item);
        });
      }
    });

    return {
      coreSubjects: cores,
      electiveGroups: Array.from(electiveGroupsMap.values()),
      allSubjectsFlat: flat,
    };
  }, [assignmentItems]);

  // 3. Selection State
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(() => {
    if (initialAssignmentId) return initialAssignmentId;
    if (initialSubject?.id) return String(initialSubject.id);
    return null;
  });

  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string | null>(() => {
    if (initialSubject?.subjects?.[0]?.subjectCode) {
      return initialSubject.subjects[0].subjectCode;
    }
    return null;
  });

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(() => {
    if (initialSubjectId) return initialSubjectId;
    if (initialSubject?.subjects?.[0]?.subjectId) {
      return initialSubject.subjects[0].subjectId;
    }
    return null;
  });

  // Track if initial selection has been performed once
  const hasInitializedRef = useRef(false);

  // Auto-select initial subject ONLY ONCE when allSubjectsFlat first becomes available
  useEffect(() => {
    if (allSubjectsFlat.length === 0 || hasInitializedRef.current) return;

    // 1. Check initialSubject match
    if (initialSubject) {
      const match = allSubjectsFlat.find(
        (s) =>
          s.assignmentId === String(initialSubject.id) ||
          (initialSubject.subjects &&
            initialSubject.subjects.some(
              (sub) =>
                (sub.subjectCode && sub.subjectCode === s.subjectCode) ||
                (sub.subjectId && sub.subjectId === s.subjectId)
            ))
      );
      if (match) {
        setSelectedAssignmentId(match.assignmentId);
        setSelectedSubjectCode(match.subjectCode);
        setSelectedSubjectId(match.subjectId);
        hasInitializedRef.current = true;
        return;
      }
    }

    // 2. Check initialSubjectId from URL
    if (initialSubjectId) {
      const match = allSubjectsFlat.find((s) => s.subjectId === initialSubjectId);
      if (match) {
        setSelectedAssignmentId(match.assignmentId);
        setSelectedSubjectCode(match.subjectCode);
        setSelectedSubjectId(match.subjectId);
        hasInitializedRef.current = true;
        return;
      }
    }

    // 3. Check initialAssignmentId from URL
    if (initialAssignmentId) {
      const match = allSubjectsFlat.find((s) => s.assignmentId === initialAssignmentId);
      if (match) {
        setSelectedAssignmentId(match.assignmentId);
        setSelectedSubjectCode(match.subjectCode);
        setSelectedSubjectId(match.subjectId);
        hasInitializedRef.current = true;
        return;
      }
    }

    // 4. Default to first available subject
    if (allSubjectsFlat.length > 0) {
      const first = allSubjectsFlat[0];
      setSelectedAssignmentId(first.assignmentId);
      setSelectedSubjectCode(first.subjectCode);
      setSelectedSubjectId(first.subjectId);
      hasInitializedRef.current = true;
    }
  }, [allSubjectsFlat, initialSubject, initialSubjectId, initialAssignmentId]);

  // 4. Fetch Active Assignment Details
  const {
    data: activeAssignmentData,
    isLoading: isDetailLoading,
    isFetching: isDetailFetching,
    error: detailError,
    refetch: refetchDetail,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentByIdQuery,
    params: { assignmentId: selectedAssignmentId },
    options: { skip: !selectedAssignmentId },
  });

  // Active Navigator Item
  const activeNavigatorItem: INavigatorSubjectItem | null = useMemo(() => {
    return (
      allSubjectsFlat.find(
        (s) =>
          s.assignmentId === selectedAssignmentId &&
          (s.subjectCode === selectedSubjectCode || s.subjectId === selectedSubjectId)
      ) ||
      allSubjectsFlat.find((s) => s.assignmentId === selectedAssignmentId) ||
      null
    );
  }, [allSubjectsFlat, selectedAssignmentId, selectedSubjectCode, selectedSubjectId]);

  // 5. Active Subject Enriched Object
  const activeSubjectDetail: ISubjectDetail | null = useMemo(() => {
    const fallback = activeNavigatorItem;

    if (!activeAssignmentData?.data) {
      if (!fallback) return null;
      return {
        id: fallback.assignedSubjectId || fallback.subjectId,
        subjectId: fallback.subjectId,
        subjectCode: fallback.subjectCode,
        subjectName: fallback.subjectName,
        classId,
        primaryTeacher: fallback.primaryTeacher || { id: '', name: '' },
        primaryTeacherId: fallback.primaryTeacher?.id || '',
        secondaryTeachers: [],
        prerequisites: '',
        learningGoals: '',
        description: '',
        documents: [],
      };
    }

    const assignment = activeAssignmentData.data;
    const subjects: ISubjectDetail[] = assignment.subjects || [];

    // Find the specific subject in this assignment
    let found = subjects.find(
      (s) =>
        (selectedSubjectCode && s.subjectCode === selectedSubjectCode) ||
        (selectedSubjectId && (s.subjectId === selectedSubjectId || s.id === selectedSubjectId))
    );

    if (!found && subjects.length > 0) {
      found = subjects[0];
    }

    if (!found && fallback) {
      return {
        id: fallback.assignedSubjectId || fallback.subjectId,
        subjectId: fallback.subjectId,
        subjectCode: fallback.subjectCode,
        subjectName: fallback.subjectName,
        classId,
        primaryTeacher: fallback.primaryTeacher || { id: '', name: '' },
        primaryTeacherId: fallback.primaryTeacher?.id || '',
        secondaryTeachers: [],
        prerequisites: '',
        learningGoals: '',
        description: '',
        documents: [],
      };
    }

    if (!found) return null;

    return {
      ...found,
      classId: found.classId || classId,
      subjectName: found.subjectName || found.subject?.name || fallback?.subjectName || 'Subject',
      subjectCode: found.subjectCode || fallback?.subjectCode || '',
      subjectId: found.subjectId || fallback?.subjectId || '',
      primaryTeacher: found.primaryTeacher || fallback?.primaryTeacher || { id: '', name: '' },
    };
  }, [
    activeAssignmentData,
    activeNavigatorItem,
    selectedSubjectCode,
    selectedSubjectId,
    classId,
  ]);

  // 6. Navigation (Previous / Next) calculations
  const navigationInfo = useMemo(() => {
    if (!activeNavigatorItem) {
      return {
        positionText: '',
        hasPrevious: false,
        hasNext: false,
        goToPrevious: () => {},
        goToNext: () => {},
      };
    }

    if (activeNavigatorItem.subjectType === 0) {
      // Core Subject navigation
      const currentIndex = coreSubjects.findIndex(
        (s) =>
          s.assignmentId === activeNavigatorItem.assignmentId &&
          (s.subjectCode === activeNavigatorItem.subjectCode ||
            s.subjectId === activeNavigatorItem.subjectId)
      );

      const total = coreSubjects.length;
      const positionText = total > 0 && currentIndex >= 0 ? `${currentIndex + 1} of ${total}` : '';
      const hasPrevious = currentIndex > 0;
      const hasNext = currentIndex >= 0 && currentIndex < total - 1;

      return {
        positionText,
        hasPrevious,
        hasNext,
        goToPrevious: () => {
          if (hasPrevious) {
            const prev = coreSubjects[currentIndex - 1];
            setSelectedAssignmentId(prev.assignmentId);
            setSelectedSubjectCode(prev.subjectCode);
            setSelectedSubjectId(prev.subjectId);
          }
        },
        goToNext: () => {
          if (hasNext) {
            const next = coreSubjects[currentIndex + 1];
            setSelectedAssignmentId(next.assignmentId);
            setSelectedSubjectCode(next.subjectCode);
            setSelectedSubjectId(next.subjectId);
          }
        },
      };
    } else {
      // Elective Group Subject navigation
      const parentGroup = electiveGroups.find(
        (g) =>
          g.electiveGroupId === activeNavigatorItem.electiveGroupId ||
          g.subjects.some(
            (s) =>
              s.assignmentId === activeNavigatorItem.assignmentId &&
              (s.subjectCode === activeNavigatorItem.subjectCode ||
                s.subjectId === activeNavigatorItem.subjectId)
          )
      );

      if (!parentGroup || parentGroup.subjects.length === 0) {
        return {
          positionText: '',
          hasPrevious: false,
          hasNext: false,
          goToPrevious: () => {},
          goToNext: () => {},
        };
      }

      const groupSubjects = parentGroup.subjects;
      const currentIndex = groupSubjects.findIndex(
        (s) =>
          s.assignmentId === activeNavigatorItem.assignmentId &&
          (s.subjectCode === activeNavigatorItem.subjectCode ||
            s.subjectId === activeNavigatorItem.subjectId)
      );

      const total = groupSubjects.length;
      const positionText = total > 0 && currentIndex >= 0 ? `${currentIndex + 1} of ${total}` : '';
      const hasPrevious = currentIndex > 0;
      const hasNext = currentIndex >= 0 && currentIndex < total - 1;

      return {
        positionText,
        hasPrevious,
        hasNext,
        goToPrevious: () => {
          if (hasPrevious) {
            const prev = groupSubjects[currentIndex - 1];
            setSelectedAssignmentId(prev.assignmentId);
            setSelectedSubjectCode(prev.subjectCode);
            setSelectedSubjectId(prev.subjectId);
          }
        },
        goToNext: () => {
          if (hasNext) {
            const next = groupSubjects[currentIndex + 1];
            setSelectedAssignmentId(next.assignmentId);
            setSelectedSubjectCode(next.subjectCode);
            setSelectedSubjectId(next.subjectId);
          }
        },
      };
    }
  }, [activeNavigatorItem, coreSubjects, electiveGroups]);

  // 7. Select Subject Action
  const selectSubject = useCallback((item: INavigatorSubjectItem) => {
    setSelectedAssignmentId(item.assignmentId);
    setSelectedSubjectCode(item.subjectCode);
    setSelectedSubjectId(item.subjectId);

    // Keep URL in sync smoothly without full page reload
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('assignmentId', item.assignmentId);
      if (item.subjectId) {
        url.searchParams.set('subjectId', item.subjectId);
      }
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  // 8. Search & Auto-expansion state
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Expand all groups by default or when search is active
  useEffect(() => {
    if (electiveGroups.length > 0) {
      setExpandedGroups((prev) => {
        const next = { ...prev };
        electiveGroups.forEach((g) => {
          if (next[g.electiveGroupId] === undefined) {
            next[g.electiveGroupId] = true;
          }
        });
        return next;
      });
    }
  }, [electiveGroups]);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  }, []);

  // Filtered Core & Electives based on Search
  const { filteredCoreSubjects, filteredElectiveGroups, totalFilteredCount } = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return {
        filteredCoreSubjects: coreSubjects,
        filteredElectiveGroups: electiveGroups,
        totalFilteredCount: coreSubjects.length + electiveGroups.reduce((acc, g) => acc + g.subjects.length, 0),
      };
    }

    const filteredCores = coreSubjects.filter(
      (s) =>
        s.subjectName.toLowerCase().includes(query) ||
        s.subjectCode.toLowerCase().includes(query)
    );

    const filteredGroups: INavigatorElectiveGroup[] = [];

    electiveGroups.forEach((group) => {
      const groupNameMatch = group.electiveGroupName.toLowerCase().includes(query);
      const matchedSubjects = group.subjects.filter(
        (s) =>
          s.subjectName.toLowerCase().includes(query) ||
          s.subjectCode.toLowerCase().includes(query)
      );

      if (groupNameMatch || matchedSubjects.length > 0) {
        filteredGroups.push({
          ...group,
          subjects: groupNameMatch ? group.subjects : matchedSubjects,
        });
      }
    });

    const totalCount =
      filteredCores.length +
      filteredGroups.reduce((acc, g) => acc + g.subjects.length, 0);

    return {
      filteredCoreSubjects: filteredCores,
      filteredElectiveGroups: filteredGroups,
      totalFilteredCount: totalCount,
    };
  }, [coreSubjects, electiveGroups, searchQuery]);

  // Auto expand groups when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const autoExpanded: Record<string, boolean> = {};
      filteredElectiveGroups.forEach((g) => {
        autoExpanded[g.electiveGroupId] = true;
      });
      setExpandedGroups((prev) => ({ ...prev, ...autoExpanded }));
    }
  }, [searchQuery, filteredElectiveGroups]);

  return {
    isListLoading,
    isListFetching,
    listError,
    refetchList,

    isDetailLoading,
    isDetailFetching,
    detailError,
    refetchDetail,

    coreSubjects,
    electiveGroups,
    allSubjectsFlat,
    totalSubjectsCount: allSubjectsFlat.length,

    selectedAssignmentId,
    selectedSubjectCode,
    selectedSubjectId,
    activeSubjectDetail,
    activeNavigatorItem,
    activeAssignmentData: activeAssignmentData?.data,

    navigationInfo,
    selectSubject,

    searchQuery,
    setSearchQuery,
    expandedGroups,
    toggleGroup,
    filteredCoreSubjects,
    filteredElectiveGroups,
    totalFilteredCount,
  };
}
