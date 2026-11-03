'use client';

import type { Board } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetYearQuery } from 'src/redux/year/yearApi';
import { useGetAcademicHierarchyQuery } from 'src/redux/board/boardApi';

import { getHierarchyCounts } from './academic-setup-progress-model';
import { expandAcademicSetupAncestors } from './academic-setup-tree-utils';
import { findHierarchyNode, buildHierarchyTree } from './academic-setup-model';

import type {
  AcademicSetupNode,
  AcademicYearRecord,
  AcademicSetupNodeType,
} from './academic-setup-model';

type Selection = { id: string; type: AcademicSetupNodeType };
const EMPTY_BOARDS: Board[] = [];
const EMPTY_YEARS: AcademicYearRecord[] = [];

export const useAcademicSetupWorkspace = (initialYearId = '') => {
  const shellYearId = useSelector((state: RootState) => state.globalState?.currentYear?.id);
  const yearQuery = useGetYearQuery(undefined);
  const years: AcademicYearRecord[] = yearQuery.data?.items ?? EMPTY_YEARS;
  const [selectedYearId, setSelectedYearId] = useState(initialYearId);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const currentYear =
    years.find((year) => year.id === selectedYearId) ??
    years.find((year) => year.id === shellYearId) ??
    years[0];
  const boardQuery = useGetAcademicHierarchyQuery(currentYear?.id ?? '', { skip: !currentYear });
  const boards = boardQuery.currentData?.items ?? EMPTY_BOARDS;
  // Expansion and selection reuse the same year graph until its source data changes.
  const tree = useMemo(
    () => (currentYear ? buildHierarchyTree(boards, currentYear) : []),
    [boards, currentYear]
  );
  // Counts traverse the full graph and should not repeat for sidebar interactions.
  const counts = useMemo(() => getHierarchyCounts(boards), [boards]);
  const yearNode: AcademicSetupNode | undefined = currentYear
    ? {
        id: currentYear.id,
        name: currentYear.name,
        type: 'Academic Year',
        data: currentYear,
        parentsData: { year: currentYear },
        children: tree,
      }
    : undefined;
  const selectedNode =
    selection?.type === 'Academic Year'
      ? yearNode
      : (findHierarchyNode(tree, selection?.id ?? '', selection?.type ?? 'Academic Year') ??
        yearNode);

  const selectYear = (yearId: string) => {
    setSelectedYearId(yearId);
    setSelection({ id: yearId, type: 'Academic Year' });
    setExpandedNodes({});
  };
  const selectNode = (node: AcademicSetupNode) => {
    setSelection({ id: node.id, type: node.type });
    setExpandedNodes((current) => expandAcademicSetupAncestors(current, node));
  };
  const selectCrumb = (id: string, type: AcademicSetupNodeType) => {
    setSelection({ id, type });
  };
  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes((current) => ({ ...current, [nodeId]: !current[nodeId] }));
  };
  const collapseAll = () => setExpandedNodes({});
  const retry = () => {
    yearQuery.refetch();
    if (currentYear) boardQuery.refetch();
  };

  return {
    years,
    boards,
    tree,
    counts,
    currentYear,
    selectedYearId: currentYear?.id ?? '',
    selectedNode,
    expandedNodes,
    isLoading: yearQuery.isLoading || boardQuery.isFetching,
    isError: yearQuery.isError || boardQuery.isError,
    selectYear,
    selectNode,
    selectCrumb,
    toggleExpanded,
    collapseAll,
    retry,
  };
};
