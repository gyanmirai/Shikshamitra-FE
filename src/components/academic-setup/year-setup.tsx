'use client';

import type { Board, Medium, Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useDispatch } from 'react-redux';
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
      <Stack spacing={2} sx={{ height: '100%' }}>
        {/* Header Section */}
        <Card sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography
                variant="subtitle1"
                sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
              >
                Academic Year:
              </Typography>
              <FormControl size="small" variant="standard" sx={{ minWidth: 200 }}>
                <Select
                  value={selectedAcademicYear}
                  onChange={(e) => setSelectedAcademicYear(e.target.value)}
                  displayEmpty
                  sx={{
                    typography: 'h6',
                    '& .MuiSelect-select': { py: 0.5 },
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
                  >
                    <Iconify icon="solar:pen-bold" width={18} />
                  </IconButton>
                </CustomTooltip>
                <CustomTooltip title=" New Year">
                  <IconButton size="small" onClick={handleCreateYear}>
                    <Iconify icon="mingcute:add-line" width={20} />
                  </IconButton>
                </CustomTooltip>
              </Stack>
            </Stack>

            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={boardDialog.onTrue}
              disabled={!selectedAcademicYear || isYearLoading}
              size="small"
            >
              Board
            </Button>
          </Stack>
        </Card>

        {/* Master-Detail Body */}
        <Grid container spacing={2} sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {/* Left Sidebar */}
          <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{ height: '100%' }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle2" color="text.secondary">
                  HIERARCHY
                </Typography>
              </Box>

              <Scrollbar sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
                {(isYearLoading || isBoardLoading) && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <Box className="loader" />
                  </Box>
                )}

                {!isYearLoading && !isBoardLoading && treeData.length === 0 && (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No boards found
                    </Typography>
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
            {selectedNode ? (
              <DetailsPanel
                selectedNode={selectedNode}
                currentAcademicYear={currentAcademicYear}
                // onRefresh={() => {}} // React Query handles this automatically normally
              />
            ) : (
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography color="text.secondary">Select an item to view details</Typography>
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
          py: 1,
          minHeight: 44,
          borderRadius: '0 20px 20px 0',
          mb: 0.5,
          borderLeft: isSelected ? '4px solid' : '4px solid transparent',
          borderColor: isSelected ? 'primary.main' : 'transparent',
          bgcolor: isSelected ? 'primary.lighter' : 'transparent',
          color: isSelected ? 'primary.dark' : 'text.primary',
          '&:hover': {
            bgcolor: 'action.hover',
            color: isSelected ? 'primary.dark' : 'text.primary',
          },
          '&.Mui-selected': {
            bgcolor: 'primary.lighter',
            color: 'primary.dark',
            '&:hover': { bgcolor: 'primary.lighter' },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          {hasChildren ? (
            <Iconify
              icon={isExpanded ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
              width={16}
              sx={{ mr: 1, color: isSelected ? 'inherit' : 'text.secondary', flexShrink: 0 }}
            />
          ) : (
            <Box sx={{ width: 16, mr: 1, flexShrink: 0 }} />
          )}

          <ListItemText
            primary={node.name}
            primaryTypographyProps={{
              variant: 'body2',
              fontWeight: isSelected ? 700 : 500,
              noWrap: true,
            }}
          />

          {/* Count Indicator */}
          {hasChildren && (
            <Chip
              label={node.children!.length}
              size="small"
              variant={isSelected ? 'filled' : 'outlined'}
              color={isSelected ? 'primary' : 'default'}
              sx={{
                height: 20,
                fontSize: '0.7rem',
                ml: 1,
                borderColor: isSelected ? 'transparent' : 'divider',
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
        boxShadow: (theme) => theme.customShadows.z4,
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px dashed', borderColor: 'divider' }}>
        <Breadcrumbs separator={<Iconify icon="eva:arrow-ios-forward-fill" width={16} />}>
          {crumbs.map((crumb, index) => (
            <Typography
              key={index}
              variant="caption"
              color={index === crumbs.length - 1 ? 'text.primary' : 'text.secondary'}
              fontWeight={index === crumbs.length - 1 ? 'bold' : 'normal'}
            >
              {crumb}
            </Typography>
          ))}
        </Breadcrumbs>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 3 }}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="h4">{selectedNode.name}</Typography>
              <Chip
                label={selectedNode.type}
                color="primary"
                variant="soft"
                size="small"
                sx={{ borderRadius: 1 }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {selectedNode.data.description || `Manage settings for this ${selectedNode.type}`}
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
        variant="outlined"
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
      >
        Medium
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

      <Button size="small" variant="outlined" color="error" onClick={confirm.onTrue}>
        Delete
      </Button>
      <Button size="small" variant="outlined" onClick={edit.onTrue}>
        Edit
      </Button>
      <Button
        variant="contained"
        size="small"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={modal.onTrue}
      >
        Organization
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

      <Button size="small" variant="outlined" color="error" onClick={confirm.onTrue}>
        Delete
      </Button>
      <Button size="small" variant="outlined" onClick={edit.onTrue}>
        Edit
      </Button>
      <Button
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={modal.onTrue}
        size="small"
      >
        Standard
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

      <Button size="small" variant="outlined" color="error" onClick={confirm.onTrue}>
        Delete
      </Button>
      <Button size="small" variant="outlined" onClick={edit.onTrue}>
        Edit
      </Button>
      <Button
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={modal.onTrue}
        size="small"
      >
        Division
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
      <Button size="small" variant="outlined" color="error" onClick={confirm.onTrue}>
        Delete
      </Button>
      <Button size="small" variant="contained" onClick={edit.onTrue}>
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

  const onSubmit = async () => {
    try {
      if (editData) {
        await updateYear({
          id: editData.id,
          body: {
            name: `${formik.values.startDate.format('YYYY')}-${formik.values.endDate.format('YYYY')}`,
            startDate: dateConvertor(formik.values.startDate.format(dateFormat)),
            endDate: dateConvertor(formik.values.endDate.format(dateFormat)),
          },
        }).unwrap();
      } else {
        await addYear({
          name: `${formik.values.startDate.format('YYYY')}-${formik.values.endDate.format('YYYY')}`,
          startDate: dateConvertor(formik.values.startDate.format(dateFormat)),
          endDate: dateConvertor(formik.values.endDate.format(dateFormat)),
        }).unwrap();
      }
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  const formik = useFormik({
    initialValues: {
      startDate: editData
        ? dayjs(editData.startDate)
        : dayjs().year(dayjs().year()).month(2).date(1),
      endDate: editData
        ? dayjs(editData.endDate)
        : dayjs()
            .year(dayjs().year() + 1)
            .month(1)
            .endOf('month'),
    },
    validationSchema: Yup.object().shape({
      startDate: Yup.date().required('Start Date is required'),
      endDate: Yup.date().required('End Date is required'),
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
            label="Start Date"
            value={formik.values.startDate}
            format="DD-MMM-YYYY"
            onChange={(newValue) => formik.setFieldValue('startDate', newValue)}
            slotProps={{
              textField: {
                size: 'small',
                helperText: formik.touched.startDate && (formik.errors.startDate as string),
                error: formik.touched.startDate && Boolean(formik.errors.startDate),
              },
            }}
          />

          <DatePicker
            label="End Date"
            value={formik.values.endDate}
            format="DD-MMM-YYYY"
            onChange={(newValue) => formik.setFieldValue('endDate', newValue)}
            slotProps={{
              textField: {
                size: 'small',
                helperText: formik.touched.endDate && (formik.errors.endDate as string),
                error: formik.touched.endDate && Boolean(formik.errors.endDate),
              },
            }}
          />
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button variant="outlined" size="small" onClick={handleClose}>
          Cancel
        </Button>
        <LoadingButton
          loading={isLoading || isUpdateLoading}
          type="submit"
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </>
  );
};
