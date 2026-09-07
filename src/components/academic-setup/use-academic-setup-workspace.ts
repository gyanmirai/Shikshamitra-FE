'use client';

import type { Board } from 'src/types/school';

import { useState, useEffect } from 'react';
import { useGetYearQuery } from 'src/redux/year/yearApi';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { expandAcademicSetupAncestors } from './academic-setup-tree-utils';
import { findHierarchyNode, buildHierarchyTree } from './academic-setup-model';

import type {
  AcademicSetupNode,
  AcademicYearRecord,
  AcademicSetupNodeType,
} from './academic-setup-model';

type Selection = { id: string; type: AcademicSetupNodeType };

export const useAcademicSetupWorkspace = () => {
  const yearQuery = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
    options: { refetchOnMountOrArgChange: true },
    popupConfig: { error: false },
  });
  const boardQuery = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
    popupConfig: { error: false },
  });
  const years = (yearQuery.data?.items ?? []) as AcademicYearRecord[];
  const allBoards = (boardQuery.data?.items ?? []) as Board[];
  const [selectedYearId, setSelectedYearId] = useState('');
  const [selection, setSelection] = useState<Selection | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const firstYearId = years[0]?.id;
  const validSelectedYear = years.some((year) => year.id === selectedYearId);
  const currentYear = years.find((year) => year.id === selectedYearId) ?? years[0];
  const boards = currentYear
    ? allBoards.filter((board) => board.academicYearId === currentYear.id)
    : [];
  const tree = currentYear ? buildHierarchyTree(boards, currentYear) : [];
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

  useEffect(() => {
    if (firstYearId && !validSelectedYear) {
      setSelectedYearId(firstYearId);
      setSelection({ id: firstYearId, type: 'Academic Year' });
    }
  }, [firstYearId, validSelectedYear]);

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
    boardQuery.refetch();
  };

  return {
    years,
    boards,
    tree,
    currentYear,
    selectedYearId,
    selectedNode,
    expandedNodes,
    isLoading: yearQuery.isLoading || boardQuery.isLoading,
    isError: yearQuery.isError || boardQuery.isError,
    selectYear,
    selectNode,
    selectCrumb,
    toggleExpanded,
    collapseAll,
    retry,
  };
};
