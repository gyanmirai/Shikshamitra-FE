'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { AccessSelection } from 'src/utils/academicHierarchyUtils';
import type { Board, Medium, Division, Standards, Organization } from 'src/types/school';
import type { BulkUserScopeAssignmentPayload } from 'src/utils/userScopeBulkAssignPayload';

import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { buildUserScopeBulkAssignPayload } from 'src/utils/userScopeBulkAssignPayload';
import { useGetAccessControlQuery, useAddAccessControlMutation } from 'src/redux/hr/employeeApi';
import {
  Box,
  Card,
  Chip,
  Grid,
  Button,
  Checkbox,
  Typography,
  CardHeader,
  DialogActions,
} from '@mui/material';
import {
  emptyAccessSelection,
  expandAccessibleHierarchy,
  compressExplicitAcademicSelection,
} from 'src/utils/academicHierarchyUtils';

// Main screen component for access control functionality
const AccessControlScreen = () => {
  // Dialog state for showing/hiding access control form
  const dialog = useBoolean();

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Access Control"
        links={[{ name: 'Security' }, { name: 'Role And Permission' }, { name: 'Access Control' }]}
        action={
          <Button variant="contained" onClick={dialog.onTrue}>
            Add Access Control
          </Button>
        }
      />
      <CustomizableTable
        tableId="access-control"
        columns={[
          { id: 'employee', label: 'Employee Name' },
          { id: 'board', label: 'Board' },
        ]}
        data={[]}
      />
      <CustomDialog
        maxWidth="lg"
        title="Access Control"
        open={dialog.value}
        handleClose={dialog.onFalse}
      >
        <AccessControlForm />
      </CustomDialog>
    </Box>
  );
};

export const submitAccessControlForm = async ({
  addAccessControl,
  userId,
  currentYearId,
  checkedItem,
  allBoards,
  handleClose,
}: {
  addAccessControl: (body: BulkUserScopeAssignmentPayload) => { unwrap: () => Promise<unknown> };
  userId?: string;
  currentYearId?: string;
  checkedItem: AccessSelection;
  allBoards?: Board[];
  handleClose?: () => void;
}) => {
  if (!userId || !currentYearId || !allBoards?.length) return false;

  await addAccessControl(
    buildUserScopeBulkAssignPayload({
      academicYearId: currentYearId,
      userIds: [userId],
      selection: checkedItem,
      allBoards,
    })
  ).unwrap();
  handleClose?.();
  return true;
};

// Form component for managing access control settings
export const AccessControlForm = ({
  user,
  handleClose,
}: {
  user?: any;
  handleClose?: () => void;
}) => {
  // State for tracking selected items across different categories
  const [checkedItem, setCheckedItem] = useState<AccessSelection>(emptyAccessSelection());

  const [selectedData, setSelectedData] = useState<AccessSelection>(emptyAccessSelection());

  // Get current academic year from global state
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Mutation hook for adding access control
  const [addAccessControl, { isLoading: isAddAccessControlLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddAccessControlMutation,
    popupConfig: { success: true, successMessage: 'Access Control added successfully' },
  });

  // Query hook for fetching existing access control data
  const {
    data: accessControl,
    currentData: currentAccessControl,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAccessControlQuery,
    params: { userId: user?.id, academicYearId: currentYear?.id },
    options: { skip: !(user?.id && currentYear?.id) },
  });
  const activeAccessControl = currentAccessControl ?? (!isFetching ? accessControl : undefined);

  // Full boards tree for the current academic year — needed to expand the
  // BE response when it compresses branches via `hasFull*Access` flags.
  const {
    data: boardsData,
    currentData: currentBoardsData,
    isLoading: boardsLoading,
    isFetching: boardsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });
  const activeBoardsData = currentBoardsData ?? (!boardsFetching ? boardsData : undefined);
  const allBoards = useMemo(
    () => activeBoardsData?.items?.filter((b: Board) => b.academicYearId === currentYear?.id),
    [activeBoardsData?.items, currentYear?.id]
  );
  const isHierarchyLoading = isLoading || isFetching || boardsLoading || boardsFetching;
  const canSubmit = Boolean(
    user?.id && currentYear?.id && allBoards?.length && !isHierarchyLoading
  );

  // Effect to populate form with existing access control data
  useEffect(() => {
    if (!user?.id || !currentYear?.id) {
      setCheckedItem(emptyAccessSelection());
      setSelectedData(emptyAccessSelection());
      return;
    }

    if (!activeAccessControl?.accessibleHierarchy || !allBoards?.length) return;
    const expanded = expandAccessibleHierarchy(activeAccessControl, allBoards);
    setCheckedItem(expanded);
    setSelectedData(compressExplicitAcademicSelection(expanded, allBoards));
  }, [activeAccessControl, allBoards, currentYear?.id, user?.id]);

  // Handler for form submission
  const handleSubmit = async () => {
    try {
      await submitAccessControlForm({
        addAccessControl,
        userId: user?.id,
        currentYearId: currentYear?.id,
        checkedItem,
        allBoards,
        handleClose,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <DialogScrollContent
        sx={{ overflow: 'hidden', height: '100%', p: 1 }}
        scrollBarProps={{
          sx: {
            '.simplebar-content': {
              height: '100%',
            },
          },
        }}
      >
        <Box sx={{ flex: 1, overflow: 'hidden', p: 2, height: '100%' }}>
          {!user?.id ? (
            <Typography variant="body2" color="text.secondary">
              Select an employee before saving access control.
            </Typography>
          ) : !currentYear?.id ? (
            <Typography variant="body2" color="text.secondary">
              Select an academic year before saving access control.
            </Typography>
          ) : isHierarchyLoading ? (
            <Box className="loader" />
          ) : !allBoards?.length ? (
            <Typography variant="body2" color="text.secondary">
              Academic hierarchy is not available for the selected year.
            </Typography>
          ) : (
            <BoardScreenStep
              boards={allBoards}
              checkedItem={checkedItem}
              setCheckedItem={setCheckedItem}
              selectedData={selectedData}
              setSelectedData={setSelectedData}
            />
          )}
        </Box>
      </DialogScrollContent>

      <DialogActions>
        <Button
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <LoadingButton
          size="small"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          loading={isAddAccessControlLoading}
          disabled={!canSubmit}
          variant="contained"
          onClick={handleSubmit}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </>
  );
};

export default AccessControlScreen;

// Color mapping for different node types
const color = {
  boards: 'primary',
  mediums: 'secondary',
  organizations: 'info',
  standards: 'warning',
  divisions: 'default',
};

type CheckedItemMap = {
  boards: string[];
  mediums: string[];
  organizations: string[];
  standards: string[];
  divisions: string[];
};

type CheckedItemSets = {
  boards: Set<string>;
  mediums: Set<string>;
  organizations: Set<string>;
  standards: Set<string>;
  divisions: Set<string>;
};

type SelectionStatus = 'full' | 'partial' | 'none';

// Build a Set-based view of `checkedItem` once per render for O(1) lookups.
const toCheckedItemSets = (ci: CheckedItemMap): CheckedItemSets => ({
  boards: new Set(ci.boards),
  mediums: new Set(ci.mediums),
  organizations: new Set(ci.organizations),
  standards: new Set(ci.standards),
  divisions: new Set(ci.divisions),
});

// Single post-order pass that computes each node's selection status in O(N).
// The resulting Map can be queried in O(1) by RenderNode and by the API
// payload generator, replacing the previous per-node recursive helpers.
const buildSelectionMap = (roots: any[], ciSets: CheckedItemSets): Map<string, SelectionStatus> => {
  const map = new Map<string, SelectionStatus>();

  const visit = (node: any): SelectionStatus => {
    const { children } = node as { children?: any[] };
    if (!children || children.length === 0) {
      const set = ciSets[node.type as keyof CheckedItemSets];
      const status: SelectionStatus = set?.has(node.id) ? 'full' : 'none';
      map.set(node.id, status);
      return status;
    }

    let fullCount = 0;
    let noneCount = 0;
    for (let i = 0; i < children.length; i += 1) {
      const childStatus = visit(children[i]);
      if (childStatus === 'full') fullCount += 1;
      else if (childStatus === 'none') noneCount += 1;
    }

    let status: SelectionStatus;
    if (fullCount === children.length) status = 'full';
    else if (noneCount === children.length) status = 'none';
    else status = 'partial';

    map.set(node.id, status);
    return status;
  };

  roots.forEach(visit);
  return map;
};

// Collect every node id in the subtree (including the node itself), grouped by type.
const collectSubtreeIds = (node: any): CheckedItemMap => {
  const acc: CheckedItemMap = {
    boards: [],
    mediums: [],
    organizations: [],
    standards: [],
    divisions: [],
  };
  const walk = (n: any) => {
    (acc[n.type as keyof CheckedItemMap] as string[]).push(n.id);
    n.children?.forEach(walk);
  };
  walk(node);
  return acc;
};

// Component for rendering individual tree nodes.
//
// IMPORTANT for perf: this component is memoized so that nodes whose own
// `status` did not change skip re-render entirely. To make memo effective:
//   - `node` must be a stable reference (achieved via memoized nodeData).
//   - `status` is a primitive string (cheap to compare).
//   - `getStatus` and `onToggle` are stable across renders (ref-backed).
const RenderNode = React.memo(function RenderNode({
  node,
  status,
  getStatus,
  onToggle,
}: {
  node: any;
  status: SelectionStatus;
  getStatus: (id: string) => SelectionStatus;
  onToggle: (n: any) => void;
}) {
  const isSelected = status === 'full';
  const isIndeterminate = status === 'partial';

  // State for node expansion
  const isExpanded = useBoolean(true);

  // Check if node has children
  const hasChildren = node.children && node.children.length > 0;

  return (
    <Box
      key={node.id}
      sx={{
        position: 'relative',
        pl: 3, // Indentation
      }}
    >
      {/* Connector Line */}
      {hasChildren && isExpanded.value && (
        <Box
          sx={{
            position: 'absolute',
            top: 28, // Start below the icon/checkbox row
            left: 11 + 24, // Align with the center of the arrow/checkbox area (approx)
            bottom: 0,
            width: '1px',
            borderLeft: (theme) => `1px dashed ${theme.palette.divider}`,
            zIndex: 0,
          }}
        />
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: 0.5,
          position: 'relative',
          zIndex: 1,
          borderRadius: 1,
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        {/* Expand/Collapse Toggle */}
        <Box
          onClick={hasChildren ? isExpanded.onToggle : undefined}
          sx={{
            mr: 1,
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: hasChildren ? 'pointer' : 'default',
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' },
          }}
        >
          {hasChildren && (
            <Iconify
              icon={isExpanded.value ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
              width={18}
              height={18}
            />
          )}
        </Box>

        <Checkbox
          checked={isSelected}
          indeterminate={isIndeterminate}
          onChange={() => onToggle(node)}
          size="small"
          disableRipple
          sx={{ p: 0.5, mr: 1 }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: hasChildren ? 600 : 400 }}>
            {node.name}
          </Typography>
          <Chip
            label={node.type}
            size="small"
            variant="soft"
            color={color[node.type as keyof typeof color] as LabelColor}
            sx={{ height: 20, fontSize: '0.7rem', borderRadius: 0.5 }}
          />
        </Box>
      </Box>

      {/* Children */}
      {hasChildren && isExpanded.value && (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {node.children.map((child: any) => (
            <RenderNode
              key={child.id}
              node={child}
              status={getStatus(child.id)}
              getStatus={getStatus}
              onToggle={onToggle}
            />
          ))}
        </Box>
      )}
    </Box>
  );
});

// Component for managing board selection step
export const BoardScreenStep = ({
  boards,
  checkedItem,
  setCheckedItem,
  selectedData,
  setSelectedData,
}: {
  boards?: Board[];
  checkedItem: AccessSelection;
  setCheckedItem: (checkedItem: AccessSelection) => void;
  selectedData: AccessSelection;
  setSelectedData: (selectedData: AccessSelection) => void;
}) => {
  // Get current academic year from global state
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Filter boards for current academic year. Memoized so `nodeData` keeps a
  // stable reference between renders — this is what lets RenderNode's React.memo
  // actually skip re-renders for unchanged nodes.
  const allBoards = useMemo(
    () => boards?.filter((board: Board) => board.academicYearId === currentYear?.id),
    [boards, currentYear?.id]
  );

  // Memoized hierarchical data structure for boards
  const nodeData = useMemo(
    () =>
      (allBoards || []).map((board: Board) => ({
        id: board.id,
        name: board.name,
        type: 'boards',
        parentId: null,
        children: board.educationMediums?.map((medium: Medium) => ({
          id: medium.id,
          name: medium.name,
          type: 'mediums',
          parentId: board.id,
          children: medium.educationMediumStages?.map((org: Organization) => ({
            id: org.id,
            name: org.name,
            type: 'organizations',
            parentId: medium.id,
            children: org.standards?.map((std: Standards) => ({
              id: std.id,
              name: std.name,
              type: 'standards',
              parentId: org.id,
              children: std.divisions?.map((div: Division) => ({
                id: div.id,
                name: div.name,
                type: 'divisions',
                parentId: std.id,
              })),
            })),
          })),
        })),
      })),
    [allBoards]
  );

  // Single O(N) post-order pass that derives every node's selection status.
  // Replaces per-node recursive isNodeFullySelected/isNodePartiallySelected
  // calls (which were O(N^2)) and is consumed by both the UI and the API
  // payload builder.
  const selectionMap = useMemo(
    () => buildSelectionMap(nodeData, toCheckedItemSets(checkedItem)),
    [nodeData, checkedItem]
  );

  // Build the API payload using explicit parent compression: if the user
  // selected a parent node, send that parent id and let the API imply children.
  // Do not escalate to a higher parent just because all children are checked.
  const generateFinalSelection = useCallback(
    (map: Map<string, SelectionStatus>, sourceCheckedItem: CheckedItemMap) => {
      if (!map.size) {
        setSelectedData(emptyAccessSelection());
        return;
      }

      setSelectedData(compressExplicitAcademicSelection(sourceCheckedItem, allBoards));
    },
    [allBoards, setSelectedData]
  );

  // Handler for node selection/deselection.
  // Toggling a node toggles the entire subtree underneath it (range select).
  //
  // The handler itself is kept *stable* across renders (empty useCallback deps)
  // by reading the latest checkedItem / nodeData / selectionMap from refs.
  // This is critical: RenderNode is memoized, and a changing onToggle prop
  // would force every node to re-render on every keystroke/toggle.
  const checkedItemRef = useRef(checkedItem);
  const nodeDataRef = useRef(nodeData);
  const selectionMapRef = useRef(selectionMap);
  checkedItemRef.current = checkedItem;
  nodeDataRef.current = nodeData;
  selectionMapRef.current = selectionMap;

  // Stable lookup used by every checkbox to read its own / a child's status.
  const getStatus = useCallback(
    (id: string): SelectionStatus => selectionMapRef.current.get(id) ?? 'none',
    []
  );

  const handleNodeSelect = useCallback(
    (node: any) => {
      const ci = checkedItemRef.current;
      const nd = nodeDataRef.current;
      const sm = selectionMapRef.current;

      const fully = sm.get(node.id) === 'full';
      const subtree = collectSubtreeIds(node);
      const updated: CheckedItemMap = {
        boards: ci.boards,
        mediums: ci.mediums,
        organizations: ci.organizations,
        standards: ci.standards,
        divisions: ci.divisions,
      };

      (Object.keys(updated) as Array<keyof CheckedItemMap>).forEach((key) => {
        const ids = subtree[key];
        if (!ids.length) return;
        if (fully) {
          // Uncheck the whole subtree (Set lookup → O(M))
          const removeSet = new Set(ids);
          updated[key] = updated[key].filter((x) => !removeSet.has(x));
        } else {
          // Check the whole subtree (Set merge avoids O(N) array spread)
          const merged = new Set(updated[key]);
          for (let i = 0; i < ids.length; i += 1) merged.add(ids[i]);
          updated[key] = Array.from(merged);
        }
      });

      setCheckedItem(updated);
      // Recompute payload using the same fast selection-map logic.
      const nextMap = buildSelectionMap(nd, toCheckedItemSets(updated));
      generateFinalSelectionRef.current(nextMap, updated);
    },
    [setCheckedItem]
  );

  // Hold the latest generateFinalSelection in a ref so handleNodeSelect can
  // remain stable while still invoking the freshest payload builder.
  const generateFinalSelectionRef = useRef(generateFinalSelection);
  generateFinalSelectionRef.current = generateFinalSelection;

  return (
    <>
      {/* <Typography variant="body2" fontWeight={600} color="text.secondary" mb={2}>
        Academic Year: {currentYear?.name}
      </Typography> */}

      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, minHeight: 0, height: '100%' }}>
          <Grid container spacing={3} sx={{ height: '100%' }}>
            {nodeData.map((boardNode: any) => (
              <Grid size={{ xs: 12, md: 6, lg: 6 }} key={boardNode.id} sx={{ height: '100%' }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: (theme) => theme.customShadows.z4,
                  }}
                >
                  <CardHeader
                    title={boardNode.name}
                    subheader="Board"
                    action={
                      <Checkbox
                        checked={selectionMap.get(boardNode.id) === 'full'}
                        indeterminate={selectionMap.get(boardNode.id) === 'partial'}
                        onChange={() => handleNodeSelect(boardNode)}
                        disableRipple
                      />
                    }
                    sx={{
                      py: 1.5,
                      px: 2,
                      bgcolor: (theme) => theme.vars.palette.background.neutral,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                  <Scrollbar>
                    <Box sx={{ p: 2 }}>
                      {/* Render only children of the board here, effectively unrolling the first level */}
                      {boardNode.children?.map((child: any) => (
                        <RenderNode
                          key={child.id}
                          node={child}
                          status={getStatus(child.id)}
                          getStatus={getStatus}
                          onToggle={handleNodeSelect}
                        />
                      ))}
                      {(!boardNode.children || boardNode.children.length === 0) && (
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ fontStyle: 'italic', pl: 1 }}
                        >
                          No details available
                        </Typography>
                      )}
                    </Box>
                  </Scrollbar>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </>
  );
};
