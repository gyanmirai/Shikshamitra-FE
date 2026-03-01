/* eslint-disable react/no-unstable-nested-components */
import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import React, { useMemo, useState, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetGroupByIdQuery,
  useGetStudentRuleFieldsQuery,
  useGetEmployeeRuleFieldsQuery,
} from 'src/redux/calendar/GroupManagement/groupManagementApi';
import {
  Box,
  Tab,
  Card,
  Grid,
  Tabs,
  Stack,
  Avatar,
  Divider,
  Skeleton,
  Checkbox,
  Typography,
  FormControlLabel,
} from '@mui/material';

import HierarchyTextView from './HorizonatalTreeView';
import { transformApiToTree } from './TransformApiToTree';
import { pruneTreeBySelectedIds } from './academicTreeUtils';

import type { IGroup, IFilter, IStudent, IEmployee } from './type';

// --- Types for Field Definitions ---
interface ApiEnumValueOption {
  value: string;
  label: string;
  intValue: number;
}

interface ApiOperator {
  name: string;
  value: number;
}

interface ApiFilterField {
  field: string;
  fieldValue: number;
  name: string;
  type: 'Enum' | 'String' | 'Number' | 'Date' | 'Boolean';
  operators: ApiOperator[];
  options: ApiEnumValueOption[] | null;
}

interface GroupViewDialogProps {
  open: boolean;
  group: IGroup | null;
  onClose: () => void;
}

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      p: 2,
      borderBottom: '1px solid',
      borderColor: 'divider',
      '&:last-child': { borderBottom: 'none' },
      transition: 'background-color 0.2s',
      '&:hover': { bgcolor: 'background.neutral' },
    }}
  >
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ fontWeight: 600, mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}
    >
      {label}
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
      {value || '—'}
    </Typography>
  </Box>
);

const GroupViewDialog: React.FC<GroupViewDialogProps> = ({ open, group, onClose }) => {
  const theme = useTheme();
  const [tab, setTab] = useState(0); // 0 = Rule Based, 1 = Name Based

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { data: rolesData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });
  // --- Fetch Required Data for Mapping ---
  const { data: boardsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });

  const { data: studentFieldsData, isLoading: isStudentFieldsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentRuleFieldsQuery,
  });

  const { data: employeeFieldsData, isLoading: isEmployeeFieldsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeRuleFieldsQuery,
  });

  const { data: groupData, isLoading: isGroupLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetGroupByIdQuery,
    params: {
      id: group?.id,
    },
    options: {
      skip: !group?.id,
    },
  });

  // --- Transform Fields Data into Options ---
  const studentFieldOptions = useMemo(() => {
    if (!studentFieldsData) return [];
    return (studentFieldsData as ApiFilterField[]).map((field) => ({
      value: field.fieldValue,
      label: field.name,
      operators: field.operators,
      options: field.options,
      type: field.type,
    }));
  }, [studentFieldsData]);

  const employeeFieldOptions = useMemo(() => {
    if (!employeeFieldsData) return [];
    return (employeeFieldsData as ApiFilterField[]).map((field) => ({
      value: field.fieldValue,
      label: field.name,
      operators: field.operators,
      options: field.options,
      type: field.type,
    }));
  }, [employeeFieldsData]);

  // --- Helpers to Resolve Names ---

  const getFieldLabel = useCallback(
    (fieldValue: number, isStudent: boolean) => {
      const options = isStudent ? studentFieldOptions : employeeFieldOptions;
      const field = options.find((f) => Number(f.value) === Number(fieldValue));
      return field ? field.label : `Field ${fieldValue}`;
    },
    [studentFieldOptions, employeeFieldOptions]
  );

  const getOperatorLabel = useCallback(
    (fieldValue: number, operatorValue: number, isStudent: boolean) => {
      const options = isStudent ? studentFieldOptions : employeeFieldOptions;
      const field = options.find((f) => Number(f.value) === Number(fieldValue));
      if (!field?.operators) return operatorValue;
      const op = field.operators.find((o) => Number(o.value) === Number(operatorValue));
      return op ? op.name.replace(/([A-Z])/g, ' $1').trim() : operatorValue;
    },
    [studentFieldOptions, employeeFieldOptions]
  );

  const getOperatorIcon = (operatorName: string | number) => {
    const name = String(operatorName).toLowerCase();
    if (name.includes('equal') && !name.includes('not')) return 'solar:check-circle-bold-duotone';
    if (name.includes('not')) return 'solar:forbidden-circle-bold-duotone';
    if (name.includes('contains')) return 'solar:magnifer-bold-duotone';
    if (name.includes('start')) return 'solar:forward-2-bold-duotone';
    if (name.includes('end')) return 'solar:back-2-bold-duotone';
    if (name.includes('great')) return 'solar:arrow-up-bold-duotone';
    if (name.includes('less')) return 'solar:arrow-down-bold-duotone';
    return 'solar:list-bold-duotone';
  };

  // --- Build Academic Tree ---
  const fullAcademicTree = useMemo(() => {
    if (!boardsData?.items) return [];
    return transformApiToTree(
      boardsData.items.filter((board: any) => board.academicYearId === currentYear?.id)
    );
  }, [boardsData, currentYear]);

  const getPrunedTree = useCallback(
    (academicSelection: any) => {
      if (!academicSelection || !fullAcademicTree.length) return [];
      const allSelectedIds = new Set([
        ...(academicSelection.boards || []),
        ...(academicSelection.mediums || []),
        ...(academicSelection.stages || []),
        ...(academicSelection.classes || []),
        ...(academicSelection.divisions || []),
      ]);
      if (allSelectedIds.size === 0) return [];
      return pruneTreeBySelectedIds(fullAcademicTree, allSelectedIds);
    },
    [fullAcademicTree]
  );

  // --- Render Functions ---

  const getFieldValueLabel = useCallback(
    (fieldValue: number, value: string, isStudent: boolean) => {
      const optionsList = isStudent ? studentFieldOptions : employeeFieldOptions;
      const field = optionsList.find((f) => Number(f.value) === Number(fieldValue));
      if (!field || !field.options) return value;
      const option = field?.options?.find(
        (o) => o.value === value || Number(o.intValue) === Number(value)
      );
      return option ? option.label : value;
    },
    [studentFieldOptions, employeeFieldOptions]
  );

  const renderFilterRows = (filters: IFilter[], isStudent: boolean) => {
    const isLoading = isStudent ? isStudentFieldsLoading : isEmployeeFieldsLoading;

    if (isLoading) {
      return (
        <Stack spacing={1} mt={1.5}>
          {[1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={50} width="100%" />
          ))}
        </Stack>
      );
    }
    return (
      <Stack spacing={1} mt={1.5}>
        {filters.length === 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No specific rules applied.
          </Typography>
        )}
        {filters.map((f, index) => {
          const fieldName = getFieldLabel(f.field, isStudent);
          const operatorName = getOperatorLabel(f.field, f.operator, isStudent);
          const valueLabel = getFieldValueLabel(f.field, f.value, isStudent);
          const icon = getOperatorIcon(operatorName);

          return (
            <Box
              key={`${f.field}-${index}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0px 2px 4px rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: isStudent ? 'primary.light' : 'secondary.light',
                  bgcolor: isStudent ? 'primary.lighter' : 'secondary.lighter',
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    bgcolor: isStudent ? 'primary.main' : 'secondary.main',
                    color: '#fff',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 0.75,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    minWidth: 80,
                    textAlign: 'center',
                  }}
                >
                  {fieldName}
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'text.secondary',
                    bgcolor: 'background.neutral',
                    px: 1,
                    py: 0.25,
                    borderRadius: 0.5,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Iconify icon={icon} width={14} />
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, textTransform: 'lowercase' }}
                  >
                    {String(operatorName)}
                  </Typography>
                </Box>
              </Stack>

              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: 'text.primary', textAlign: 'right' }}
              >
                {String(valueLabel)}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    );
  };

  if (isGroupLoading)
    return (
      <Grid container spacing={1}>
        {/* Skeleton Left Side */}
        <Grid size={{ xs: 12, md: 4, lg: 3.5 }}>
          <Stack spacing={1}>
            <Card sx={{ p: 1 }}>
              <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <Box>
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="80%" />
                </Box>
                <Box>
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="90%" />
                </Box>
              </Stack>
            </Card>
            <Card sx={{ p: 1 }}>
              <Skeleton variant="text" width="50%" sx={{ mb: 1 }} />
              <Skeleton variant="circular" width={60} height={60} />
            </Card>
            <Grid container spacing={1}>
              <Grid size={6}>
                <Card sx={{ p: 1, height: 100 }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="60%" />
                </Card>
              </Grid>
              <Grid size={6}>
                <Card sx={{ p: 1, height: 100 }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="60%" />
                </Card>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                  Included Roles
                </Typography>
                <Card variant="outlined">
                  <Stack spacing={0} sx={{ p: 1 }}>
                    {groupData?.ruleBased.roleIds?.map((role: string) => (
                      <FormControlLabel
                        key={role}
                        control={<Checkbox size="small" disabled />}
                        label={
                          <Typography variant="body2">
                            {rolesData?.items?.find((r: any) => r.id === role)?.name}
                          </Typography>
                        }
                        sx={{
                          m: 0,
                          py: 0.5,
                          '&:hover': { bgcolor: 'action.hover' },
                          borderRadius: 1,
                        }}
                      />
                    ))}
                  </Stack>
                </Card>
              </Grid>

              {/* Add more filter summaries here if needed */}
            </Grid>
          </Stack>
        </Grid>

        {/* Skeleton Right Side */}
        <Grid size={{ xs: 12, md: 8, lg: 8.5 }}>
          <Card sx={{ height: '100%', p: 0 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, py: 2 }}>
              <Stack direction="row" spacing={1}>
                <Skeleton variant="text" width={100} height={40} />
                <Skeleton variant="text" width={100} height={40} />
              </Stack>
            </Box>
            <Box sx={{ p: 1 }}>
              <Grid container spacing={1}>
                <Grid size={{ xs: 12, md: 7 }}>
                  <Skeleton variant="text" width="50%" height={40} sx={{ mb: 2 }} />
                  <Skeleton variant="rounded" height={200} />
                  <Box sx={{ mt: 3 }}>
                    <Skeleton variant="text" width="40%" />
                    <Stack direction="row" spacing={1} mt={1}>
                      <Skeleton variant="rounded" width={80} height={32} />
                      <Skeleton variant="rounded" width={80} height={32} />
                      <Skeleton variant="rounded" width={80} height={32} />
                    </Stack>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                  <Skeleton variant="text" width="50%" height={40} sx={{ mb: 2 }} />
                  <Stack spacing={1}>
                    <Skeleton variant="rounded" height={60} />
                    <Skeleton variant="rounded" height={60} />
                    <Skeleton variant="rounded" height={60} />
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Grid>
      </Grid>
    );

  const ruleBasedTree = getPrunedTree(groupData.ruleBased.academicSelection);

  const selectedStudents = groupData.nameBased.students || [];
  const selectedEmployees = groupData.nameBased.employees || [];

  return (
    // <CustomDialog
    //   title={groupData.name}
    //   open={open}
    //   handleClose={onClose}
    //   fullWidth
    //   maxWidth="xl"
    //   scroll="paper"
    // >
    //   <DialogScrollContent dividers sx={{ bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
    <Grid container spacing={1}>
      {/* Left Side: Details & Stats */}
      <Grid size={{ xs: 12, md: 4, lg: 3.5 }}>
        <Stack spacing={1}>
          {/* Basic Details Card */}
          <Card
            sx={{
              overflow: 'hidden',
              boxShadow: theme.customShadows?.z1 || '0px 2px 8px rgba(0,0,0,0.08)',
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                bgcolor: 'primary.lighter',
                px: 3,
                py: 2,
                borderBottom: '1px solid',
                borderColor: 'primary.light',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Iconify
                icon="solar:users-group-rounded-bold-duotone"
                width={24}
                sx={{ color: 'primary.main' }}
              />
              <Typography variant="subtitle1" color="primary.darker" sx={{ fontWeight: 700 }}>
                Group Profile
              </Typography>
            </Box>
            <Box>
              <InfoRow label="Group Name" value={groupData.name} />
              <InfoRow
                label="Description"
                value={groupData.description || 'No description provided'}
              />
            </Box>
          </Card>

          {/* Stats Cards */}
          <Stack spacing={1}>
            <Card
              sx={{
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: theme.customShadows?.z1 || '0px 2px 8px rgba(0,0,0,0.08)',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  right: -20,
                  top: -20,
                  opacity: 0.1,
                  transform: 'rotate(-15deg)',
                }}
              >
                <Iconify icon="solar:pie-chart-2-bold-duotone" width={120} />
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Total Audience
                </Typography>
                <Typography variant="h3" sx={{ color: 'text.primary', mt: 0.5 }}>
                  {groupData.memberCount ||
                    (groupData.studentCount || 0) + (groupData.employeeCount || 0) ||
                    0}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                <Iconify icon="solar:users-group-two-rounded-bold" width={24} color="#fff" />
              </Avatar>
            </Card>

            <Grid container spacing={1}>
              <Grid size={6}>
                <Card
                  sx={{
                    p: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: theme.customShadows?.z4,
                      borderColor: 'transparent',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Stack spacing={1}>
                    <Avatar
                      variant="rounded"
                      sx={{
                        bgcolor: 'primary.lighter',
                        color: 'primary.main',
                        width: 40,
                        height: 40,
                      }}
                    >
                      <Iconify icon="solar:cap-academic-bold-duotone" width={24} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" color="text.primary">
                        {groupData.studentCount || 0}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600, textTransform: 'uppercase' }}
                      >
                        Students
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
              <Grid size={6}>
                <Card
                  sx={{
                    p: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: theme.customShadows?.z4,
                      borderColor: 'transparent',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Stack spacing={1}>
                    <Avatar
                      variant="rounded"
                      sx={{ bgcolor: 'info.lighter', color: 'info.main', width: 40, height: 40 }}
                    >
                      <Iconify icon="solar:user-id-bold-duotone" width={24} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" color="text.primary">
                        {groupData.employeeCount || 0}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600, textTransform: 'uppercase' }}
                      >
                        Employees
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            </Grid>

            {/* Included Roles Section */}
            {(groupData?.ruleBased?.roles?.length > 0 ||
              groupData?.nameBased?.roles?.length > 0) && (
              <Card
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  height: '100%',
                }}
              >
                {/* Section header */}
                <Box
                  sx={{
                    px: 2.5,
                    py: 1.25,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.neutral',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Iconify
                    icon="solar:shield-user-bold-duotone"
                    width={16}
                    sx={{ color: 'primary.main' }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.8,
                      color: 'text.secondary',
                      fontSize: '0.68rem',
                    }}
                  >
                    Included Roles
                  </Typography>
                </Box>

                <Stack spacing={0} sx={{ px: 1, py: 0.75 }}>
                  {[...(groupData?.ruleBased?.roles || []), ...(groupData?.nameBased?.roles || [])]
                    .filter((value, index, self) => self.indexOf(value) === index)
                    .map((role: any) => (
                      <Box
                        key={role.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 1.5,
                          transition: 'background-color 0.15s',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <Box
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {role.name}
                        </Typography>
                      </Box>
                    ))}
                </Stack>
              </Card>
            )}
          </Stack>
        </Stack>
      </Grid>

      {/* Right Side: Tabbed Static Data */}
      <Grid size={{ xs: 12, md: 8, lg: 8.5 }}>
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: theme.customShadows?.z1 || '0px 2px 8px rgba(0,0,0,0.08)',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1,
              pt: 1,
              pb: 1,
            }}
          >
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTabs-indicator': { height: 3, borderRadius: 1.5 },
                '& .MuiTab-root': {
                  minHeight: 30,
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: 'none',
                  mr: 2,
                  px: 0,
                  '&.Mui-selected': { color: 'primary.main' },
                },
              }}
            >
              <Tab
                label="Rule Based Criteria"
                icon={<Iconify icon="solar:sort-by-time-bold-duotone" width={20} />}
                iconPosition="start"
              />
              <Tab
                label="Direct Selection"
                icon={<Iconify icon="solar:user-hand-up-bold-duotone" width={20} />}
                iconPosition="start"
              />
            </Tabs>
          </Box>
          <Divider />

          <Box sx={{ flexGrow: 1, p: 1, overflowY: 'auto' }}>
            {tab === 0 && (
              <Grid container spacing={1}>
                {/* Academic Selections */}
                <Grid
                  size={{ xs: 12, md: 7 }}
                  sx={{
                    borderRight: { md: '1px dashed' },
                    borderColor: { md: 'divider' },
                    pr: { md: 2 },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      variant="rounded"
                      sx={{ bgcolor: 'primary.lighter', color: 'primary.main', mr: 2 }}
                    >
                      <Iconify icon="solar:structure-bold-duotone" width={24} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Academic Structure
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Classes & Divisions Included
                      </Typography>
                    </Box>
                  </Box>

                  <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Box
                      sx={{
                        bgcolor: 'background.neutral',
                        px: 2,
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: 'text.secondary',
                        }}
                      >
                        Selected Hierarchy
                      </Typography>
                    </Box>
                    <Box sx={{ p: 0 }}>
                      <Scrollbar sx={{ maxHeight: 350, p: 1 }}>
                        {ruleBasedTree.length > 0 ? (
                          <HierarchyTextView data={ruleBasedTree} isShowDelete={false} />
                        ) : (
                          <Stack
                            alignItems="center"
                            justifyContent="center"
                            sx={{ py: 1, opacity: 0.5 }}
                          >
                            <Iconify
                              icon="solar:clipboard-remove-bold-duotone"
                              width={40}
                              sx={{ mb: 1 }}
                            />
                            <Typography variant="body2">No academic selections applied.</Typography>
                          </Stack>
                        )}
                      </Scrollbar>
                    </Box>
                  </Card>
                </Grid>

                {/* Additional Filters */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      variant="rounded"
                      sx={{ bgcolor: 'secondary.lighter', color: 'secondary.main', mr: 2 }}
                    >
                      <Iconify icon="solar:filter-bold-duotone" width={24} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Specific Rules
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Attribute Based Filters
                      </Typography>
                    </Box>
                  </Box>

                  <Stack spacing={3}>
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                        <Iconify
                          icon="solar:cap-academic-bold-duotone"
                          width={18}
                          sx={{ color: 'primary.main' }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            color: 'text.secondary',
                            textTransform: 'uppercase',
                          }}
                        >
                          Student Rules
                        </Typography>
                      </Stack>
                      {renderFilterRows(groupData.ruleBased.studentFilters || [], true)}
                    </Box>

                    <Divider sx={{ borderStyle: 'dashed' }} />

                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                        <Iconify
                          icon="solar:user-id-bold-duotone"
                          width={18}
                          sx={{ color: 'info.main' }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            color: 'text.secondary',
                            textTransform: 'uppercase',
                          }}
                        >
                          Employee Rules
                        </Typography>
                      </Stack>
                      {renderFilterRows(groupData.ruleBased.employeeFilters || [], false)}
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            )}

            {tab === 1 && (
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      variant="rounded"
                      sx={{ bgcolor: 'warning.lighter', color: 'warning.main', mr: 2 }}
                    >
                      <Iconify icon="solar:users-group-rounded-bold-duotone" width={24} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Direct Selections
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Individually Added Users
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      px: 2,
                      py: 0.75,
                      bgcolor: 'primary.main',
                      color: '#fff',
                      borderRadius: 1,
                      boxShadow: theme.customShadows?.z8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Iconify icon="solar:check-circle-bold" width={16} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {selectedStudents.length + selectedEmployees.length} Selected
                    </Typography>
                  </Box>
                </Stack>

                {/* Display Filters for Name Selection if exist */}
                <Card variant="outlined" sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      bgcolor: 'background.neutral',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon="solar:filter-bold-duotone" width={16} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Selection Filters
                      </Typography>
                    </Stack>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Grid container spacing={3}>
                      {groupData.nameBased.studentFilters?.length > 0 && (
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 800,
                              color: 'text.secondary',
                              textTransform: 'uppercase',
                              mb: 1,
                              display: 'block',
                            }}
                          >
                            Student Criteria
                          </Typography>
                          {renderFilterRows(groupData.nameBased.studentFilters, true)}
                        </Grid>
                      )}
                      {groupData.nameBased.employeeFilters?.length > 0 && (
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 800,
                              color: 'text.secondary',
                              textTransform: 'uppercase',
                              mb: 1,
                              display: 'block',
                            }}
                          >
                            Employee Criteria
                          </Typography>
                          {renderFilterRows(groupData.nameBased.employeeFilters, false)}
                        </Grid>
                      )}
                      {!groupData.nameBased.studentFilters?.length &&
                        !groupData.nameBased.employeeFilters?.length && (
                          <Grid size={12}>
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                              No pre-filters applied. Users were selected from the full list.
                            </Typography>
                          </Grid>
                        )}
                    </Grid>
                  </Box>
                </Card>

                {selectedStudents.length === 0 && selectedEmployees.length === 0 ? (
                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                      py: 8,
                      bgcolor: 'background.neutral',
                      borderRadius: 2,
                      border: '1px dashed',
                      borderColor: 'divider',
                    }}
                  >
                    <Iconify
                      icon="solar:user-block-rounded-bold-duotone"
                      width={64}
                      sx={{ color: 'text.disabled', mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      No users manually selected
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Add users from the edit screen
                    </Typography>
                  </Stack>
                ) : (
                  <Stack spacing={1.5}>
                    {selectedStudents.map((student: IStudent) => (
                      <Card
                        key={student.id}
                        sx={{
                          p: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: 'transparent',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'primary.light',
                            boxShadow: theme.customShadows?.z4,
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <Avatar
                          src={student.profilePicture} // Assuming this exists or falls back
                          alt={student.studentName}
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: 'primary.lighter',
                            color: 'primary.dark',
                            fontWeight: 800,
                            border: '2px solid',
                            borderColor: 'background.paper',
                          }}
                        >
                          {student.firstName?.[0]}
                        </Avatar>

                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {student.studentName || `${student.firstName} ${student.lastName}`}
                          </Typography>

                          <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                            <Box
                              sx={{
                                px: 0.75,
                                py: 0.25,
                                bgcolor: 'primary.lighter',
                                borderRadius: 0.5,
                                color: 'primary.dark',
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            >
                              STUDENT
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              • Class {student.standardName}-{student.divisionName}
                            </Typography>
                          </Stack>
                        </Box>

                        <Box sx={{ textAlign: 'right' }}>
                          <Box
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 20,
                              bgcolor: student.status === 1 ? 'success.lighter' : 'error.lighter',
                              color: student.status === 1 ? 'success.dark' : 'error.dark',
                              fontSize: 11,
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: 'currentColor',
                              }}
                            />
                            {student.status === 1 ? 'Active' : 'Inactive'}
                          </Box>
                        </Box>
                      </Card>
                    ))}

                    {selectedEmployees.map((emp: IEmployee) => (
                      <Card
                        key={emp.id}
                        sx={{
                          p: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: 'transparent',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'info.light',
                            boxShadow: theme.customShadows?.z4,
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <Avatar
                          src={emp.profilePicture}
                          alt={emp.employeeName}
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: 'info.lighter',
                            color: 'info.dark',
                            fontWeight: 800,
                            border: '2px solid',
                            borderColor: 'background.paper',
                          }}
                        >
                          {emp.firstName?.[0]}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {emp.employeeName || `${emp.firstName} ${emp.lastName}`}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                            <Box
                              sx={{
                                px: 0.75,
                                py: 0.25,
                                bgcolor: 'info.lighter',
                                borderRadius: 0.5,
                                color: 'info.dark',
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            >
                              EMPLOYEE
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              • {emp.designation}
                            </Typography>
                          </Stack>
                        </Box>

                        <Box sx={{ textAlign: 'right' }}>
                          <Box
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 20,
                              bgcolor:
                                emp.employeeStatusType === 1 ? 'success.lighter' : 'error.lighter',
                              color: emp.employeeStatusType === 1 ? 'success.dark' : 'error.dark',
                              fontSize: 11,
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: 'currentColor',
                              }}
                            />
                            {emp.employeeStatusType === 1 ? 'Active' : 'Inactive'}
                          </Box>
                        </Box>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>
            )}
          </Box>
        </Card>
      </Grid>
    </Grid>
    //   </DialogScrollContent>
    // </CustomDialog>
  );
};

export default GroupViewDialog;
