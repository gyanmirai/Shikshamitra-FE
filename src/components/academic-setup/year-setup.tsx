'use client';

import type { Board, Medium, Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { isNaN } from 'lodash';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useDispatch } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useMemo, useState, useEffect } from 'react';
import { useDeleteClassMutation } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { useDeleteMediumMutation } from 'src/redux/medium/mediumApi';
import { useDeleteDivisionMutation } from 'src/redux/division/divisionApi';
import { useDeleteOrganizationMutation } from 'src/redux/oraganization/oraganization';
import { boardApi, useGetBoardsQuery, useDeleteBoardMutation } from 'src/redux/board/boardApi';
import {
  useGetYearQuery,
  useAddYearMutation,
  useDeleteYearMutation,
  useUpdateYearMutation,
} from 'src/redux/year/yearApi';
import {
  Box,
  Grid,
  Card,
  List,
  Chip,
  Stack,
  Button,
  Select,
  MenuItem,
  Collapse,
  Typography,
  IconButton,
  FormControl,
  Breadcrumbs,
  ListItemText,
  DialogActions,
  ListItemButton,
} from '@mui/material';

import { Iconify } from '../iconify';
import { Scrollbar } from '../scrollbar';
import { BoardForm } from './board-setup';
import { ClassForm } from './class-setup';
import { MediumForm } from './medium-setup';
import CustomTooltip from '../custom-tooltip';
import { DivisionForm } from './division-setup';
import { ConfirmDialog } from '../confirm-dialog';
import { OrganizationForm } from './organization-setup';
import CustomDialog, { DialogScrollContent } from '../customDialog';

// ----------------------------------------------------------------------

interface AcademicYear {
  id: string;
  creationTime?: string;
  creatorId?: string;
  lastModificationTime?: string;
  lastModifierId?: string;
  name: string;
  startDate?: string;
  endDate?: string;
}

type NodeType =
  | 'Academic Year'
  | 'Education Board'
  | 'Medium'
  | 'Organization'
  | 'Standard'
  | 'Division';

interface NodeData {
  id: string;
  name: string;
  type: NodeType;
  data: any;
  parentId?: string;
  parentType?: NodeType;
  children?: NodeData[];
  parentsData?: any;
}

// ----------------------------------------------------------------------

// Helper to recursively find a node in the tree data
const findNodeInTree = (nodes: NodeData[], id: string, type: NodeType): NodeData | null => {
  // eslint-disable-next-line no-restricted-syntax
  for (const node of nodes) {
    if (node.id === id && node.type === type) {
      return node;
    }
    if (node.children) {
      const found = findNodeInTree(node.children, id, type);
      if (found) return found;
    }
  }
  return null;
};

const YearSetup = () => {
  const theme = useTheme();
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');

  // -- API Hooks --
  const { data: years, isLoading: isYearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
    options: {
      refetchOnMountOrArgChange: true,
    },
  });

  const [deleteYear, { isLoading: isDeleteYearLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteYearMutation,
    popupConfig: {
      success: true,
      successMessage: 'Academic Year deleted Successfully',
    },
  });

  const { data: boardsData, isLoading: isBoardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });

  // -- State --
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const modal = useBoolean();
  const confirm = useBoolean();
  const boardDialog = useBoolean();
  const [editData, setEditData] = useState<null | AcademicYear>(null);

  // -- Effects --
  useEffect(() => {
    if (years?.items?.length) {
      // If no year selected, select the first one
      if (!selectedAcademicYear) {
        setSelectedAcademicYear(years.items[0].id);
      }
    }
  }, [years?.items, selectedAcademicYear]);

  // Update selected node when data changes (simple way to keep it fresh) or check if it was deleted
  useEffect(() => {
    // Logic to refresh selectedNode details if needed could go here
    // For now relying on the view re-rendering with new props
  }, [boardsData]);

  // -- Derived Data --
  const currentAcademicYear = useMemo(
    () =>
      selectedAcademicYear
        ? years?.items?.find((item: any) => item.id === selectedAcademicYear)
        : years?.items?.[0],
    [selectedAcademicYear, years?.items]
  );

  const boards = useMemo(
    () =>
      boardsData?.items?.filter(
        (item: Board) => item?.academicYearId === currentAcademicYear?.id
      ) || [],
    [boardsData?.items, currentAcademicYear?.id]
  );

  // Initialize selected node to Year if nothing selected
  useEffect(() => {
    if (currentAcademicYear && !selectedNode) {
      setSelectedNode({
        id: currentAcademicYear.id,
        name: currentAcademicYear.name,
        type: 'Academic Year',
        data: currentAcademicYear,
        children: [], // will be populated by board data in logic below
        parentsData: {},
      });
    }
  }, [currentAcademicYear, selectedNode]);

  // Construct Tree Data for Sidebar
  const treeData = useMemo(() => {
    if (!currentAcademicYear) return [];

    return boards.map((board: Board) => ({
      id: board.id,
      name: board.name,
      type: 'Education Board' as NodeType,
      data: board,
      parentsData: { year: currentAcademicYear },
      children: (board.educationMediums || []).map((medium: Medium) => ({
        id: medium.id,
        name: medium.name,
        type: 'Medium' as NodeType,
        data: medium,
        parentsData: { year: currentAcademicYear, board },
        children: (medium.educationMediumStages || []).map((org: Organization) => ({
          id: org.id,
          name: org.name,
          type: 'Organization' as NodeType,
          data: org,
          parentsData: { year: currentAcademicYear, board, medium },
          children: (org.standards || []).map((std: Standards) => ({
            id: std.id,
            name: std.name,
            type: 'Standard' as NodeType,
            data: std,
            parentsData: { year: currentAcademicYear, board, medium, organization: org },
            children: (std.divisions || []).map((div: Division) => ({
              id: div.id,
              name: div.name,
              type: 'Division' as NodeType,
              data: div,
              parentsData: {
                year: currentAcademicYear,
                board,
                medium,
                organization: org,
                standard: std,
              },
            })),
          })),
        })),
      })),
    }));
  }, [boards, currentAcademicYear]);

  // Find the active up-to-date selected node from latest treeData or currentAcademicYear
  const activeSelectedNode = useMemo(() => {
    if (!selectedNode) return null;
    if (selectedNode.type === 'Academic Year') {
      if (!currentAcademicYear) return null;
      return {
        id: currentAcademicYear.id,
        name: currentAcademicYear.name,
        type: 'Academic Year' as NodeType,
        data: currentAcademicYear,
        children: [],
        parentsData: {},
      };
    }
    return findNodeInTree(treeData, selectedNode.id, selectedNode.type);
  }, [selectedNode, treeData, currentAcademicYear]);

  useEffect(() => {
    if (selectedNode && !activeSelectedNode) {
      setSelectedNode(null);
    }
  }, [selectedNode, activeSelectedNode]);

  // -- Handlers --
  const handleToggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleSelectNode = (node: NodeData) => {
    setSelectedNode(node);
  };

  const handleCreateYear = () => {
    setEditData(null);
    modal.onTrue();
  };

  const handleEditYear = () => {
    setEditData(currentAcademicYear);
    modal.onTrue();
  };

  const handleDeleteYear = () => {
    setEditData(currentAcademicYear);
    confirm.onTrue();
  };

  const handleCloseDialog = () => {
    modal.onFalse();
    setEditData(null);
  };

  return (
    <Box sx={{ height: '100%', p: 0 }}>
      {/* Global Dialogs */}
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          setEditData(null);
          confirm.onFalse();
        }}
        title="Delete Academic Year"
        content="Are you sure you want to delete this Academic Year? This action cannot be undone."
        action={
          <LoadingButton
            variant="contained"
            loading={isDeleteYearLoading}
            color="error"
            size="small"
            onClick={async () => {
              await deleteYear(editData?.id || '');
              confirm.onFalse();
              setEditData(null);
              setSelectedAcademicYear(''); // Reset selection
              setSelectedNode(null);
            }}
          >
            Delete
          </LoadingButton>
        }
      />
      <CustomDialog
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {editData ? 'Update Academic Year' : 'Create Academic Year'}{' '}
            <CustomTooltip
              title="Manage student enrollment, classes, exams, fees, and promotions."
              placement="right"
              arrow
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={handleCloseDialog}
        open={modal.value}
      >
        <YearForm handleClose={handleCloseDialog} editData={editData} />
      </CustomDialog>

      <CustomDialog
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Create Education Board
            <CustomTooltip
              title="Governing authority for curriculum and exams."
              placement="right"
              arrow
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={boardDialog.onFalse}
        open={boardDialog.value}
      >
        <BoardForm
          handleClose={boardDialog.onFalse}
          academicYearId={selectedAcademicYear}
          editData={null}
          boards={boards}
        />
      </CustomDialog>

      {/* Main Layout */}
      <Stack spacing={3} sx={{ height: '100%' }}>
        {/* Header Section */}
        <Card
          sx={{
            p: 2.5,
            borderRadius: 2,
            boxShadow: theme.customShadows.z1,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography
                variant="subtitle2"
                sx={{ color: 'text.secondary', whiteSpace: 'nowrap', fontWeight: 600 }}
              >
                ACADEMIC YEAR
              </Typography>
              <FormControl size="small" variant="standard" sx={{ minWidth: 240 }}>
                <Select
                  value={selectedAcademicYear}
                  onChange={(e) => {
                    setSelectedAcademicYear(e.target.value);
                    setSelectedNode(null);
                  }}
                  displayEmpty
                  disableUnderline
                  sx={{
                    typography: 'h6',
                    fontWeight: 700,
                    '& .MuiSelect-select': {
                      py: 0.5,
                      px: 1.5,
                      bgcolor: 'background.neutral',
                      borderRadius: 1,
                    },
                  }}
                >
                  {years?.items?.map((y: AcademicYear) => (
                    <MenuItem key={y.id} value={y.id}>
                      {y.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction="row" spacing={0.5}>
                <CustomTooltip title="Edit Year">
                  <IconButton
                    size="small"
                    onClick={handleEditYear}
                    disabled={!selectedAcademicYear}
                    sx={{
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Iconify icon="solar:pen-bold" width={16} />
                  </IconButton>
                </CustomTooltip>
                <CustomTooltip title="New Year">
                  <IconButton
                    size="small"
                    onClick={handleCreateYear}
                    sx={{
                      bgcolor: 'primary.lighter',
                      color: 'primary.main',
                      '&:hover': { bgcolor: 'primary.light', color: 'primary.contrastText' },
                    }}
                  >
                    <Iconify icon="mingcute:add-line" width={18} />
                  </IconButton>
                </CustomTooltip>
              </Stack>
            </Stack>

            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={boardDialog.onTrue}
              disabled={!selectedAcademicYear || isYearLoading}
              size="small"
              sx={{ px: 2, boxShadow: theme.customShadows.primary }}
            >
              Add Board
            </Button>
          </Stack>
        </Card>

        {/* Master-Detail Body */}
        <Grid container spacing={3} sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {/* Left Sidebar */}
          <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{ height: '100%' }}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: theme.customShadows.z1,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.neutral',
                }}
              >
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ fontWeight: 700, letterSpacing: 1 }}
                >
                  HIERARCHY
                </Typography>
              </Box>

              <Scrollbar sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
                {(isYearLoading || isBoardLoading) && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <Box className="loader" />
                  </Box>
                )}

                {!isYearLoading && !isBoardLoading && treeData.length === 0 && (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No boards found for this year.
                    </Typography>
                    <Button size="small" variant="text" onClick={boardDialog.onTrue} sx={{ mt: 1 }}>
                      Get Started
                    </Button>
                  </Box>
                )}

                <List component="div" disablePadding>
                  {treeData.map((node: any) => (
                    <SidebarItem
                      key={node.id}
                      node={node}
                      depth={0}
                      selectedNodeId={selectedNode?.id}
                      expandedNodes={expandedNodes}
                      onSelect={handleSelectNode}
                      onToggleExpand={handleToggleExpand}
                    />
                  ))}
                </List>
              </Scrollbar>
            </Card>
          </Grid>

          {/* Right Details Panel */}
          <Grid size={{ xs: 12, md: 8, lg: 9 }} sx={{ height: '100%' }}>
            {activeSelectedNode ? (
              <DetailsPanel
                selectedNode={activeSelectedNode}
                currentAcademicYear={currentAcademicYear}
              />
            ) : (
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  boxShadow: theme.customShadows.z1,
                  border: `1px dashed ${theme.palette.divider}`,
                  bgcolor: 'background.neutral',
                }}
              >
                <Stack alignItems="center" spacing={2}>
                  <Iconify
                    icon="solar:folder-open-bold-duotone"
                    width={64}
                    sx={{ color: 'text.disabled', opacity: 0.5 }}
                  />
                  <Typography color="text.secondary" variant="subtitle1">
                    Select an item to view details
                  </Typography>
                </Stack>
              </Card>
            )}
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};

export default YearSetup;

// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------

interface SidebarItemProps {
  node: NodeData;
  depth: number;
  selectedNodeId: string | undefined;
  expandedNodes: Record<string, boolean>;
  onSelect: (node: NodeData) => void;
  onToggleExpand: (nodeId: string) => void;
}

const SidebarItem = ({
  node,
  depth,
  selectedNodeId,
  expandedNodes,
  onSelect,
  onToggleExpand,
}: SidebarItemProps) => {
  const isExpanded = !!expandedNodes[node.id];
  const isSelected = selectedNodeId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  const handleItemClick = () => {
    onSelect(node);
    if (hasChildren) {
      onToggleExpand(node.id);
    }
  };

  return (
    <Box>
      <ListItemButton
        selected={isSelected}
        onClick={handleItemClick}
        sx={{
          pl: 2 + depth * 2,
          py: 1.2,
          minHeight: 48,
          borderRadius: 1.5,
          mb: 0.5,
          mx: 1,
          width: 'auto',
          transition: 'all 0.2s',
          border: '1px solid transparent',
          ...(isSelected && {
            bgcolor: (t) => t.palette.primary.lighter,
            color: 'primary.dark',
            borderColor: (t) => t.palette.primary.light,
            fontWeight: 'fontWeightBold',
            '&:hover': {
              bgcolor: (t) => t.palette.primary.lighter,
            },
          }),
          ...(!isSelected && {
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover',
              color: 'text.primary',
            },
          }),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          {hasChildren ? (
            <Iconify
              icon={isExpanded ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
              width={18}
              sx={{
                mr: 1,
                color: isSelected ? 'primary.main' : 'text.disabled',
                flexShrink: 0,
                transition: 'transform 0.2s',
              }}
            />
          ) : (
            <Box sx={{ width: 18, mr: 1, flexShrink: 0 }} />
          )}

          <ListItemText
            primary={node.name}
            primaryTypographyProps={{
              variant: 'body2',
              fontWeight: isSelected ? 600 : 500,
              noWrap: true,
              sx: { transition: 'color 0.2s' },
            }}
          />

          {/* Count Indicator */}
          {hasChildren && (
            <Chip
              label={node.children!.length}
              size="small"
              variant={isSelected ? 'filled' : 'soft'}
              color={isSelected ? 'primary' : 'default'}
              sx={{
                height: 20,
                fontSize: '0.7rem',
                ml: 1,
                fontWeight: 600,
                borderRadius: 1,
                minWidth: 24,
              }}
            />
          )}
        </Box>
      </ListItemButton>

      {hasChildren && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ pl: 0 }}>
            <List
              component="div"
              disablePadding
              sx={{
                mt: 0.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                maxHeight: 'unset',
              }}
            >
              {node.children!.map((child) => (
                <SidebarItem
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  selectedNodeId={selectedNodeId}
                  expandedNodes={expandedNodes}
                  onSelect={onSelect}
                  onToggleExpand={onToggleExpand}
                />
              ))}
            </List>
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

interface DetailsPanelProps {
  selectedNode: NodeData;
  currentAcademicYear: AcademicYear;
}

const DetailsPanel = ({ selectedNode, currentAcademicYear }: DetailsPanelProps) => {
  // Generate Breadcrumbs
  const { parentsData } = selectedNode;

  // Determine Breadcrumbs List
  const crumbs = [];
  if (parentsData?.year) crumbs.push(parentsData.year.name);
  else crumbs.push(currentAcademicYear?.name || 'Academic Year');

  if (parentsData?.board) crumbs.push(parentsData.board.name);
  if (parentsData?.medium) crumbs.push(parentsData.medium.name);
  if (parentsData?.organization) crumbs.push(parentsData.organization.name);
  if (parentsData?.standard) crumbs.push(parentsData.standard.name);
  if (selectedNode.type !== 'Academic Year') crumbs.push(selectedNode.name); // Current node

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: (t) => t.customShadows.z1,
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px dashed', borderColor: 'divider' }}>
        <Breadcrumbs
          separator={<Iconify icon="eva:arrow-ios-forward-fill" width={16} />}
          sx={{ mb: 2 }}
        >
          {crumbs.map((crumb, index) => (
            <Typography
              key={index}
              variant="caption"
              sx={{
                color: index === crumbs.length - 1 ? 'text.primary' : 'text.secondary',
                fontWeight: index === crumbs.length - 1 ? 'fontWeightBold' : 'fontWeightMedium',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {crumb}
            </Typography>
          ))}
        </Breadcrumbs>

        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
                {selectedNode.name}
              </Typography>
              <Chip
                label={selectedNode.type}
                color="primary"
                variant="soft"
                size="small"
                sx={{ borderRadius: 1, fontWeight: 600, px: 0.5 }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 600 }}>
              {selectedNode.data.description ||
                `Manage settings and configurations for this ${selectedNode.type}.`}
            </Typography>
          </Box>

          {/* Context Actions */}
          <Stack direction="row" spacing={1}>
            <NodeActions node={selectedNode} />
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
};

// ----------------------------------------------------------------------
// ACTION CONTROLLERS
// ----------------------------------------------------------------------

const NodeActions = ({ node }: { node: NodeData }) => {
  switch (node.type) {
    case 'Education Board':
      return <BoardActionController data={node.data} parentsData={node.parentsData} />;
    case 'Medium':
      return <MediumActionController data={node.data} parentsData={node.parentsData} />;
    case 'Organization':
      return <OrganizationActionController data={node.data} parentsData={node.parentsData} />;
    case 'Standard':
      return <StandardActionController data={node.data} parentsData={node.parentsData} />;
    case 'Division':
      return <DivisionActionController data={node.data} parentsData={node.parentsData} />;
    case 'Academic Year':
      // Year actions are in the header, handled separately
      return null;
    default:
      return null;
  }
};

// Reuse logic from original file but render buttons
const BoardActionController = ({ data, parentsData }: { data: Board; parentsData: any }) => {
  const modal = useBoolean();
  const confirm = useBoolean();
  const [deleteBoard, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteBoardMutation,
    popupConfig: { success: true, successMessage: 'Board deleted Successfully' },
  });
  const dispatch = useDispatch();

  return (
    <>
      <CustomDialog
        title={`Create Medium (${data.name})`}
        handleClose={modal.onFalse}
        open={modal.value}
      >
        <MediumForm handleClose={modal.onFalse} editData={null} boardId={data?.id} />
      </CustomDialog>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete Board"
        content={
          <>
            Are you sure you want to delete board <b>{data?.name}</b>?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isLoading}
            color="error"
            size="small"
            onClick={async () => {
              await deleteBoard(data?.id || '');
              dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
              confirm.onFalse();
            }}
          >
            Delete
          </LoadingButton>
        }
      />

      <Button
        variant="soft"
        color="error"
        startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        onClick={confirm.onTrue}
        size="small"
      >
        Delete
      </Button>
      <Button
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={modal.onTrue}
        size="small"
        sx={{ boxShadow: (theme) => theme.customShadows.primary }}
      >
        Add Medium
      </Button>
    </>
  );
};

const MediumActionController = ({ data, parentsData }: { data: Medium; parentsData: any }) => {
  const modal = useBoolean();
  const edit = useBoolean();
  const confirm = useBoolean();
  const boardId = parentsData?.board?.id || '';

  const [deleteMedium, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteMediumMutation,
    popupConfig: { success: true, successMessage: 'Medium deleted Successfully' },
  });
  const dispatch = useDispatch();

  return (
    <>
      {/* Create Child Dialog */}
      <CustomDialog
        title={`Create Organization (${data.name})`}
        handleClose={modal.onFalse}
        open={modal.value}
      >
        <OrganizationForm handleClose={modal.onFalse} editData={null} mediumId={data?.id} />
      </CustomDialog>

      {/* Edit Self Dialog */}
      <CustomDialog
        title={`Update Medium (${data.name})`}
        handleClose={edit.onFalse}
        open={edit.value}
      >
        <MediumForm handleClose={edit.onFalse} editData={data} boardId={boardId} />
      </CustomDialog>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete Medium"
        content={
          <>
            Are you sure you want to delete medium <b>{data?.name}</b>?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isLoading}
            color="error"
            size="small"
            onClick={async () => {
              await deleteMedium(data?.id || '');
              dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
              confirm.onFalse();
            }}
          >
            Delete
          </LoadingButton>
        }
      />

      <Button
        size="small"
        variant="soft"
        color="error"
        onClick={confirm.onTrue}
        startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
      >
        Delete
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={edit.onTrue}
        startIcon={<Iconify icon="solar:pen-bold" />}
      >
        Edit
      </Button>
      <Button
        variant="contained"
        size="small"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={modal.onTrue}
        sx={{ boxShadow: (theme) => theme.customShadows.primary }}
      >
        Add Organization
      </Button>
    </>
  );
};

const OrganizationActionController = ({
  data,
  parentsData,
}: {
  data: Organization;
  parentsData: any;
}) => {
  const modal = useBoolean();
  const edit = useBoolean();
  const confirm = useBoolean();
  const mediumId = parentsData?.medium?.id || '';

  const [deleteOrg, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteOrganizationMutation,
    popupConfig: { success: true, successMessage: 'Organization deleted Successfully' },
  });
  const dispatch = useDispatch();

  return (
    <>
      <CustomDialog
        title={`Create Standard (${data.name})`}
        handleClose={modal.onFalse}
        open={modal.value}
      >
        <ClassForm handleClose={modal.onFalse} editData={null} organizationId={data?.id} />
      </CustomDialog>

      <CustomDialog
        title={`Update Organization (${data.name})`}
        handleClose={edit.onFalse}
        open={edit.value}
      >
        <OrganizationForm handleClose={edit.onFalse} editData={data} mediumId={mediumId} />
      </CustomDialog>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete Organization"
        content={
          <>
            Are you sure you want to delete <b>{data?.name}</b>?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isLoading}
            color="error"
            size="small"
            onClick={async () => {
              await deleteOrg(data?.id || '');
              dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
              confirm.onFalse();
            }}
          >
            Delete
          </LoadingButton>
        }
      />

      <Button
        size="small"
        variant="soft"
        color="error"
        onClick={confirm.onTrue}
        startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
      >
        Delete
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={edit.onTrue}
        startIcon={<Iconify icon="solar:pen-bold" />}
      >
        Edit
      </Button>
      <Button
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={modal.onTrue}
        size="small"
        sx={{ boxShadow: (theme) => theme.customShadows.primary }}
      >
        Add Standard
      </Button>
    </>
  );
};

const StandardActionController = ({ data, parentsData }: { data: Standards; parentsData: any }) => {
  const modal = useBoolean();
  const edit = useBoolean();
  const confirm = useBoolean();
  const orgId = parentsData?.organization?.id || '';

  const [deleteClass, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteClassMutation,
    popupConfig: { success: true, successMessage: 'Class deleted Successfully' },
  });
  const dispatch = useDispatch();

  return (
    <>
      <CustomDialog
        title={`Create Division (${data.name})`}
        handleClose={modal.onFalse}
        open={modal.value}
      >
        <DivisionForm handleClose={modal.onFalse} editData={null} classId={data?.id} />
      </CustomDialog>

      <CustomDialog
        title={`Update Standard (${data.name})`}
        handleClose={edit.onFalse}
        open={edit.value}
      >
        <ClassForm handleClose={edit.onFalse} editData={data} organizationId={orgId} />
      </CustomDialog>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete Standard"
        content={
          <>
            Are you sure you want to delete <b>{data?.name}</b>?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isLoading}
            color="error"
            size="small"
            onClick={async () => {
              await deleteClass(data?.id || '');
              dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
              confirm.onFalse();
            }}
          >
            Delete
          </LoadingButton>
        }
      />

      <Button
        size="small"
        variant="soft"
        color="error"
        onClick={confirm.onTrue}
        startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
      >
        Delete
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={edit.onTrue}
        startIcon={<Iconify icon="solar:pen-bold" />}
      >
        Edit
      </Button>
      <Button
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={modal.onTrue}
        size="small"
        sx={{ boxShadow: (theme) => theme.customShadows.primary }}
      >
        Add Division
      </Button>
    </>
  );
};

const DivisionActionController = ({ data, parentsData }: { data: Division; parentsData: any }) => {
  const edit = useBoolean();
  const confirm = useBoolean();
  const stdId = parentsData?.standard?.id || '';

  const [deleteDiv, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteDivisionMutation,
    popupConfig: { success: true, successMessage: 'Division deleted Successfully' },
  });
  const dispatch = useDispatch();

  return (
    <>
      <CustomDialog
        title={`Update Division (${data.name})`}
        handleClose={edit.onFalse}
        open={edit.value}
      >
        <DivisionForm handleClose={edit.onFalse} editData={data} classId={stdId} />
      </CustomDialog>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete Division"
        content={
          <>
            Are you sure you want to delete <b>{data?.name}</b>?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isLoading}
            color="error"
            size="small"
            onClick={async () => {
              await deleteDiv(data?.id || '');
              dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
              confirm.onFalse();
            }}
          >
            Delete
          </LoadingButton>
        }
      />
      <Button
        size="small"
        variant="soft"
        color="error"
        onClick={confirm.onTrue}
        startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
      >
        Delete
      </Button>
      <Button
        size="small"
        variant="contained"
        onClick={edit.onTrue}
        startIcon={<Iconify icon="solar:pen-bold" />}
      >
        Edit
      </Button>
    </>
  );
};

// ----------------------------------------------------------------------
// YEAR FORM (Preserved)
// ----------------------------------------------------------------------

interface IYearForm {
  handleClose: () => void;
  // handleSetTeb?: (value: Record<string, any>) => void; // Removed unwanted prop
  editData: null | Record<string, any>;
}

const YearForm = ({ handleClose, editData }: IYearForm) => {
  const confirm = useBoolean();
  const [addYear, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddYearMutation,
    popupConfig: {
      success: true,
      successMessage: 'Academic Year added Successfully',
    },
  });
  const [updateYear, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateYearMutation,
    popupConfig: {
      success: true,
      successMessage: 'Academic Year updated Successfully',
    },
  });

  // Derives the year name string e.g. "2025-2026"
  const buildYearName = (start: dayjs.Dayjs, end: dayjs.Dayjs) =>
    `${start.format('YYYY')}-${end.format('YYYY')}`;

  const onSubmit = async () => {
    try {
      const start = formik.values.startYear;
      const end = formik.values.endYear;
      const name = buildYearName(start, end);

      if (editData) {
        await updateYear({
          id: editData.id,
          body: {
            name,
            startYear: dateConvertor(start?.format(dateFormat) || '') || '',
            endYear: dateConvertor(end?.format(dateFormat) || '') || '',
          },
        }).unwrap();
      } else {
        await addYear({
          name,
          startYear: dateConvertor(start?.format(dateFormat) || '') || '',
          endYear: dateConvertor(end?.format(dateFormat) || '') || '',
        }).unwrap();
      }
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  // Parse existing name like "2025-2026" back into dayjs year objects
  const parseStartYear = () => {
    if (!editData?.name) return dayjs().year(dayjs().year());
    const parts = String(editData.name).split('-');
    const yr = parseInt(parts[0], 10);
    return dayjs().year(isNaN(yr) ? dayjs().year() : yr);
  };
  const parseEndYear = () => {
    if (!editData?.name) return dayjs().year(dayjs().year() + 1);
    const parts = String(editData.name).split('-');
    // Support both "2025-2026" (full) and legacy "2025-26" (short) formats
    const startYr = parseInt(parts[0], 10);
    const endPart = parseInt(parts[1], 10);
    if (isNaN(startYr) || isNaN(endPart)) return dayjs().year(dayjs().year() + 1);
    const endYr = endPart > 100 ? endPart : Math.floor(startYr / 100) * 100 + endPart;
    return dayjs().year(endYr);
  };

  const formik = useFormik({
    initialValues: {
      startYear: parseStartYear(),
      endYear: parseEndYear(),
    },
    validationSchema: Yup.object().shape({
      startYear: Yup.date()
        .nullable()
        .required('Start Year is required.')
        .typeError('Start Year is required.'),
      endYear: Yup.date()
        .nullable()
        .required('End Year is required.')
        .typeError('End Year is required.')
        .test(
          'end-exactly-one-after-start',
          'End Year must be exactly 1 year after Start Year.',
          (endYear, context) => {
            const { startYear } = context.parent;
            if (!startYear || !endYear) return true;
            return dayjs(endYear).year() - dayjs(startYear).year() === 1;
          }
        ),
    }),
    onSubmit: async () => {
      confirm.onTrue();
    },
  });

  return (
    <>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={`${editData ? 'Update Academic Year' : 'Create Academic Year'}`}
        content={`Are you sure want to ${editData ? 'Update Academic Year' : 'Create Academic Year'}?`}
        action={
          <LoadingButton
            variant="contained"
            loading={isLoading || isUpdateLoading}
            onClick={onSubmit}
            size="small"
          >
            Confirm
          </LoadingButton>
        }
      />
      <DialogScrollContent>
        <Stack spacing={2} direction="column">
          <DatePicker
            label="Start Year"
            value={formik.values.startYear}
            views={['year']}
            format="YYYY"
            onChange={(newValue) => {
              formik.setFieldValue('startYear', newValue);
              // Auto-set End Year to exactly Start Year + 1
              if (newValue) {
                formik.setFieldValue('endYear', dayjs(newValue).add(1, 'year'));
              }
            }}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                helperText: formik.touched.startYear && (formik.errors.startYear as string),
                error: formik.touched.startYear && Boolean(formik.errors.startYear),
              },
            }}
          />

          <DatePicker
            label="End Year"
            value={formik.values.endYear}
            views={['year']}
            format="YYYY"
            minDate={
              formik.values.startYear
                ? dayjs(formik.values.startYear).add(1, 'year').startOf('year')
                : undefined
            }
            maxDate={
              formik.values.startYear
                ? dayjs(formik.values.startYear).add(1, 'year').endOf('year')
                : undefined
            }
            onChange={(newValue) => formik.setFieldValue('endYear', newValue)}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                helperText: formik.touched.endYear && (formik.errors.endYear as string),
                error: formik.touched.endYear && Boolean(formik.errors.endYear),
              },
            }}
          />
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          variant="outlined"
          size="small"
          onClick={handleClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <LoadingButton
          loading={isLoading || isUpdateLoading}
          type="submit"
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </>
  );
};
