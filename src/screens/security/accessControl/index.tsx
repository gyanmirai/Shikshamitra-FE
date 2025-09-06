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
import CustomDialog from 'src/components/customDialog';
import React, { useMemo, useState, useEffect } from 'react';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Chip, Button, Checkbox, Typography } from '@mui/material';
import {
  useGetAccessControlQuery,
  useAddAccessControlMutation,
} from 'src/redux/employee/employeeApi';

// Main screen component for access control functionality
const AccessControlScreen = () => {
  // Dialog state for showing/hiding access control form
  const dialog = useBoolean();

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Access Control"
        links={[{ name: 'Security' }, { name: 'Role And Permission' }, { name: 'Access Control' }]}
        sx={{ px: 1, mb: 2 }}
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
          { id: 'board', label: 'Employee Name' },
        ]}
        data={[]}
      />
      <CustomDialog
        maxWidth="md"
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
    params: user?.id,
    options: { skip: !user?.id },
  });

  // Effect to populate form with existing access control data
  useEffect(() => {
    if (accessControl) {
      const data = {
        boards: accessControl.educationBoards?.map((board: Board) => board.id),
        mediums: accessControl.educationMediums?.map((medium: Medium) => medium.id),
        organizations: accessControl.educationMediumStages?.map((org: Organization) => org.id),
        standards: accessControl.standards?.map((std: Standards) => std.id),
        divisions: accessControl.divisions?.map((div: Division) => div.id),
      };
      setCheckedItem(data);
    }
  }, [accessControl]);

  // Handler for form submission
  const handleSubmit = async () => {
    try {
      await addAccessControl({
        academicYearIds: [currentYear.id],
        userId: user.id,
        educationBoardIds: checkedItem.boards,
        educationMediumIds: checkedItem.mediums,
        educationMediumStageIds: checkedItem.organizations,
        standardIds: checkedItem.standards,
      });
      handleClose?.();
    } catch (error) {
      console.log('Error adding access control:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {isLoading ? (
          <Box className="loader" />
        ) : (
          <BoardScreenStep checkedItem={checkedItem} setCheckedItem={setCheckedItem} />
        )}
      </Box>

      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
          p: 2,
          bgcolor: 'background.paper',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
        }}
      >
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
      </Box>
    </Box>
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
        ml: `${28}px`,
        position: 'relative',
        ...(hasChildren && isExpanded.value
          ? {
              '&::before': {
                borderLeft: (theme) => `1px dashed ${theme.vars.palette.primary.main}`,
                content: '""',
                height: '80%',
                width: '100%',
                position: 'absolute',
                top: '24px',
                left: `8px`,
              },
            }
          : {}),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          '&:hover': { bgcolor: 'action.hover', borderRadius: 1 },
        }}
      >
        <Box
          onClick={() => isExpanded.onToggle()}
          sx={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            p: 0.2,
            backgroundColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.2),
            visibility: hasChildren ? 'initial' : 'hidden',
          }}
        >
          <Iconify
            icon={isExpanded.value ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
            width={16}
            height={16}
          />
        </Box>

        <Checkbox checked={isSelected} onChange={() => handleNodeSelect(node)} size="small" />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">{node.name}</Typography>
          <Chip
            label={node.type}
            size="small"
            variant="outlined"
            color={color[node.type as keyof typeof color] as LabelColor}
            sx={{ height: 20, fontSize: '0.75rem' }}
          />
        </Box>
      </Box>
      {hasChildren &&
        isExpanded.value &&
        node.children?.map((child: any) => (
          <RenderNode
            node={child}
            checkedItem={checkedItem}
            toggleNode={toggleNode}
            handleNodeSelect={handleNodeSelect}
            level={level + 1}
          />
        ))}
    </Box>
  );
};

// Component for managing board selection step
const BoardScreenStep = ({
  checkedItem,
  setCheckedItem,
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
}) => {
  // Get current academic year from global state
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Query hook for fetching boards data
  const { data: boards, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });

  // State for tracking expanded nodes
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set());

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

  // Handler for node selection/deselection
  const handleNodeSelect = (node: any) => {
    const { id, type } = node;
    const updatedValues = { ...checkedItem };
    const childIds = findAllChildren(node);
    const parentIds = findParents(nodeData, id);
    const isCurrentlyChecked = updatedValues[type as keyof typeof checkedItem]?.includes(id);

    if (!isCurrentlyChecked) {
      updatedValues[type as keyof typeof checkedItem]?.push(id);
      parentIds?.forEach((parent) => {
        const parentType = `${parent.type}` as keyof typeof checkedItem;
        if (updatedValues[parentType]) {
          updatedValues[parentType].push(parent.id);
        }
      });
      childIds.forEach((ids) => {
        if (updatedValues[ids.type as keyof typeof checkedItem]) {
          console.log(updatedValues, 'updatedValues');
          updatedValues[ids.type as keyof typeof checkedItem]?.push(ids?.id);
        }
      });
      setCheckedItem(updatedValues);
    } else {
      updatedValues[type as keyof typeof checkedItem] = updatedValues[
        type as keyof typeof checkedItem
      ].filter((ids) => ids !== id);

      childIds.forEach((ids) => {
        if (updatedValues[ids.type as keyof typeof checkedItem]) {
          updatedValues[ids.type as keyof typeof checkedItem] = updatedValues[
            ids.type as keyof typeof checkedItem
          ].filter((item) => item !== ids.id);
        }
      });

      setCheckedItem(updatedValues);
    }
  };

  // Handler for expanding/collapsing nodes
  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prevExpanded) => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      return newExpanded;
    });
  };

  // Function to render individual nodes
  const renderNode = (node: any, level: number = 0) => {
    const isSelected = checkedItem[`${node.type}` as keyof typeof checkedItem]?.includes(node.id);
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <Box
        key={node.id}
        sx={{
          ml: `${28}px`,
          position: 'relative',
          ...(hasChildren && isExpanded
            ? {
                '&::before': {
                  borderLeft: (theme) => `1px dashed ${theme.vars.palette.primary.main}`,
                  content: '""',
                  height: '80%',
                  width: '100%',
                  position: 'absolute',
                  top: '24px',
                  left: `8px`,
                },
              }
            : {}),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            '&:hover': { bgcolor: 'action.hover', borderRadius: 1 },
          }}
        >
          <Box
            onClick={() => toggleNode(node.id)}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              p: 0.2,
              backgroundColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.2),
              visibility: hasChildren ? 'initial' : 'hidden',
            }}
          >
            <Iconify
              icon={isExpanded ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
              width={16}
              height={16}
            />
          </Box>

          <Checkbox checked={isSelected} onChange={() => handleNodeSelect(node)} size="small" />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">{node.name}</Typography>
            <Chip
              label={node.type}
              size="small"
              variant="outlined"
              color={color[node.type as keyof typeof color] as LabelColor}
              sx={{ height: 20, fontSize: '0.75rem' }}
            />
          </Box>
        </Box>
        {hasChildren &&
          isExpanded &&
          node.children?.map((child: any) => renderNode(child, level + 1))}
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', maxHeight: '70vh', overflow: 'auto' }}>
      <Typography variant="body2" fontWeight={600} color="text.secondary" mb={2}>
        Academic Year: {currentYear?.name}
      </Typography>

      {isLoading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Box sx={{ mt: 2, position: 'relative', display: 'flex', gap: 2 }}>
          {nodeData.map((node: any) => (
            <RenderNode
              node={node}
              checkedItem={checkedItem}
              toggleNode={toggleNode}
              handleNodeSelect={handleNodeSelect}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};
