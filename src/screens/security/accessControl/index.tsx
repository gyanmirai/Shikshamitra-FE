'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { Board, Medium, Division, Standards, Organization } from 'src/types/school';

import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import React, { useMemo, useState, useEffect } from 'react';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  useGetAccessControlQuery,
  useAddAccessControlMutation,
} from 'src/redux/employee/employeeApi';
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

// Form component for managing access control settings
export const AccessControlForm = ({
  user,
  handleClose,
}: {
  user?: any;
  handleClose?: () => void;
}) => {
  // State for tracking selected items across different categories
  const [checkedItem, setCheckedItem] = useState<{
    boards: string[];
    mediums: string[];
    organizations: string[];
    standards: string[];
    divisions: string[];
  }>({ boards: [], mediums: [], organizations: [], standards: [], divisions: [] });

  const [selectedData, setSelectedData] = useState<{
    boards: string[];
    mediums: string[];
    organizations: string[];
    standards: string[];
    divisions: string[];
  }>({
    boards: [],
    mediums: [],
    organizations: [],
    standards: [],
    divisions: [],
  });

  // Get current academic year from global state
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Mutation hook for adding access control
  const [addAccessControl, { isLoading: isAddAccessControlLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddAccessControlMutation,
    popupConfig: { success: true, successMessage: 'Access Control added successfully' },
  });

  // Query hook for fetching existing access control data
  const { data: accessControl, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAccessControlQuery,
    params: { userId: user?.id, academicYearId: currentYear?.id },
    options: { skip: !(user?.id && currentYear?.id) },
  });

  // Effect to populate form with existing access control data
  useEffect(() => {
    if (accessControl?.accessibleHierarchy) {
      const keyMapping: any = {
        0: 'hasFullMediumAccess',
        1: 'hasFullMediumStageAccess',
        2: 'hasFullStandardAccess',
        3: 'hasFullDivisionAccess',
      };
      const idMapping: any = {
        0: 'boardId',
        1: 'mediumId',
        2: 'mediumStageId',
        3: 'standardId',
        4: 'divisionId',
      };
      const levelMapping: any = {
        0: 'boards',
        1: 'mediums',
        2: 'mediumStages',
        3: 'standards',
        4: 'divisions',
      };
      const data: {
        boards: string[];
        mediums: string[];
        organizations: string[];
        standards: string[];
        divisions: string[];
      } = {
        boards: [],
        mediums: [],
        organizations: [],
        standards: [],
        divisions: [],
      };
      const recursionFn = (academicData: any[], level = 0) => {
        academicData?.forEach((element) => {
          if (element.hasAccess || element?.[(keyMapping as any)[level]]) {
            if (level === 0) {
              data.boards.push(element?.[idMapping[level]]);
            }
            if (level === 1) {
              data.mediums.push(element?.[idMapping[level]]);
            }
            if (level === 2) {
              data.organizations.push(element?.[idMapping[level]]);
            }
            if (level === 3) {
              data.standards.push(element?.[idMapping[level]]);
            }
            if (level === 4) {
              data.divisions.push(element?.[idMapping[level]]);
            }
          }

          if (element?.[levelMapping[level]]?.length) {
            recursionFn(element?.[levelMapping[level]], level + 1);
          }
        });
      };
      recursionFn(accessControl?.accessibleHierarchy?.[0]?.boards);
      console.log(data, 'data');
      setCheckedItem(data);
    }
  }, [accessControl?.accessibleHierarchy]);

  // Handler for form submission
  const handleSubmit = async () => {
    try {
      await addAccessControl({
        academicYearIds: [currentYear.id],
        userIds: [user.id],
        educationBoardIds: selectedData.boards,
        educationMediumIds: selectedData.mediums,
        educationMediumStageIds: selectedData.organizations,
        standardIds: selectedData.standards,
        divisionIds: selectedData.divisions,
      });
      handleClose?.();
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
          {isLoading ? (
            <Box className="loader" />
          ) : (
            <BoardScreenStep
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

// Component for rendering individual tree nodes
const RenderNode = ({ node, checkedItem, toggleNode, handleNodeSelect, level = 0 }: any) => {
  // Check if node is selected in checkedItem state
  const isSelected = checkedItem[`${node.type}` as keyof typeof checkedItem]?.includes(node.id);

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
          onChange={() => handleNodeSelect(node)}
          size="small"
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
              checkedItem={checkedItem}
              toggleNode={toggleNode}
              handleNodeSelect={handleNodeSelect}
              level={level + 1}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

// Component for managing board selection step
export const BoardScreenStep = ({
  checkedItem,
  setCheckedItem,
  selectedData,
  setSelectedData,
}: {
  checkedItem: {
    boards: string[];
    mediums: string[];
    organizations: string[];
    standards: string[];
    divisions: string[];
  };
  setCheckedItem: (checkedItem: {
    boards: string[];
    mediums: string[];
    organizations: string[];
    standards: string[];
    divisions: string[];
  }) => void;
  selectedData: {
    boards: string[];
    mediums: string[];
    organizations: string[];
    standards: string[];
    divisions: string[];
  };
  setSelectedData: (selectedData: {
    boards: string[];
    mediums: string[];
    organizations: string[];
    standards: string[];
    divisions: string[];
  }) => void;
}) => {
  // Get current academic year from global state
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Query hook for fetching boards data
  const { data: boards } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });

  // Filter boards for current academic year
  const allBoards = boards?.items?.filter(
    (board: Board) => board.academicYearId === currentYear?.id
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

  // Helper function to find all child nodes
  const findAllChildren = (node: any, step = 0): any[] => {
    let childIds: string[] = step > 0 ? [node] : [];
    if (node.children) {
      node.children.forEach((child: any) => {
        childIds = [...childIds, ...findAllChildren(child, step + 1)];
      });
    }
    return childIds;
  };

  // Helper function to find parent nodes
  function findParents(tree: any[], targetId: string, path: any[] = []): null | any[] {
    for (let i = 0; i < tree.length; i += 1) {
      const node = tree[i];
      const newPath = [...path, node];

      if (node.id === targetId) {
        return newPath.slice(0, -1);
      }

      if (node.children) {
        const result = findParents(node.children, targetId, newPath);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  const generateFinalSelection = (uiState: any) => {
    const output: any = {
      boards: [],
      mediums: [],
      organizations: [],
      standards: [],
      divisions: [],
    };

    const processNode = (node: any) => {
      const childNodes = node.children || [];

      if (childNodes.length === 0) {
        // leaf node
        if (uiState[node.type].includes(node.id)) {
          output[node.type].push(node.id);
        }
        return;
      }

      // check if all children are selected
      const allChildrenSelected = childNodes.every((c: any) => uiState[c.type].includes(c.id));

      if (allChildrenSelected) {
        // store parent only
        output[node.type].push(node.id);
      } else {
        // store parent + individually selected children
        if (uiState[node.type].includes(node.id)) {
          output[node.type].push(node.id);
        }

        childNodes.forEach((child: any) => processNode(child));
      }
    };

    nodeData.forEach((root: any) => processNode(root));
    setSelectedData(output);
  };

  // Handler for node selection/deselection
  const handleNodeSelect = (node: any) => {
    const { id, type } = node;
    const updated: any = { ...checkedItem };

    const isChecked = updated[type].includes(id);

    if (!isChecked) {
      // check parent + children
      updated[type] = [...updated[type], id];

      const childNodes = findAllChildren(node);
      childNodes.forEach((c) => {
        updated[c.type] = [...new Set([...updated[c.type], c.id])];
      });

      // parents
      const parentNodes = findParents(nodeData, id);
      parentNodes?.forEach((p) => {
        updated[p.type] = [...new Set([...updated[p.type], p.id])];
      });
    } else {
      // uncheck
      updated[type] = updated[type].filter((x: any) => x !== id);

      const childNodes = findAllChildren(node);
      childNodes.forEach((c: any) => {
        updated[c.type] = updated[c.type].filter((x: any) => x !== c.id);
      });
    }

    setCheckedItem(updated);
    generateFinalSelection(updated);
  };

  // Handler for expanding/collapsing nodes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleNode = (nodeId: string) => {};

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
                        checked={checkedItem.boards.includes(boardNode.id)}
                        onChange={() => handleNodeSelect(boardNode)}
                      />
                    }
                    sx={{
                      py: 2,
                      px: 2.5,
                      bgcolor: (theme) => varAlpha(theme.vars.palette.primary.lighterChannel, 0.4),
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
                          checkedItem={checkedItem}
                          toggleNode={toggleNode}
                          handleNodeSelect={handleNodeSelect}
                          level={1}
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
