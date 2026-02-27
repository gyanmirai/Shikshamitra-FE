/* eslint-disable react/no-unstable-nested-components */
import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import React, { useMemo, useState, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  Box,
  Tab,
  Card,
  Grid,
  Tabs,
  Chip,
  Stack,
  Avatar,
  Divider,
  Skeleton,
  Typography,
} from '@mui/material';
import {
  useGetGroupByIdQuery,
  useGetStudentRuleFieldsQuery,
  useGetEmployeeRuleFieldsQuery,
} from 'src/redux/calendar/GroupManagement/groupManagementApi';

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

// --- Modernized InfoRow: left accent border, subtle background, premium typography ---
const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      p: 1,
      borderBottom: '1px solid',
      borderColor: 'divider',
      '&:last-child': { borderBottom: 'none' },
      transition: 'background-color 0.18s ease',
      '&:hover': { bgcolor: 'action.hover' },
    }}
  >
    <Typography
      variant="caption"
      sx={{
        fontWeight: 700,
        mb: 0.4,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        color: 'text.disabled',
        fontSize: '0.68rem',
      }}
    >
      {label}
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500, lineHeight: 1.5 }}>
      {value || '—'}
    </Typography>
  </Box>
);

const GroupViewDialog: React.FC<GroupViewDialogProps> = ({ open, group, onClose }) => {
  const theme = useTheme();
  const [tab, setTab] = useState(0); // 0 = Rule Based, 1 = Name Based

  const { currentYear } = useSelector((state: RootState) => state.globalState);

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

  // --- Modernized filter rows: pill-style field badge, operator chip, value badge ---
  const renderFilterRows = (filters: IFilter[], isStudent: boolean) => {
    const isLoading = isStudent ? isStudentFieldsLoading : isEmployeeFieldsLoading;

    if (isLoading) {
      return (
        <Stack spacing={1.5} mt={1.5}>
          {[1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={52} width="100%" sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      );
    }
    return (
      <Stack spacing={1} mt={1.5}>
        {filters.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 1.5,
              px: 2,
              borderRadius: 2,
              bgcolor: 'background.neutral',
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Iconify
              icon="solar:info-circle-bold-duotone"
              width={16}
              sx={{ color: 'text.disabled' }}
            />
            <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
              No specific rules applied.
            </Typography>
          </Box>
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
                flexWrap: 'wrap',
                gap: 1,
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: isStudent ? 'primary.light' : 'secondary.light',
                  bgcolor: isStudent ? 'primary.lighter' : 'secondary.lighter',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                {/* Field name badge */}
                <Chip
                  label={fieldName}
                  size="small"
                  sx={{
                    bgcolor: isStudent ? 'primary.main' : 'secondary.main',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    letterSpacing: 0.4,
                    height: 24,
                    borderRadius: 1,
                    textTransform: 'uppercase',
                  }}
                />

                {/* Operator chip */}
                <Chip
                  icon={<Iconify icon={icon} width={13} />}
                  label={String(operatorName)}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 24,
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    textTransform: 'lowercase',
                    color: 'text.secondary',
                    borderColor: 'divider',
                    bgcolor: 'background.neutral',
                    borderRadius: 1,
                    '& .MuiChip-icon': { ml: 0.5 },
                  }}
                />
              </Stack>

              {/* Value */}
              <Chip
                label={String(valueLabel)}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: isStudent ? 'primary.dark' : 'secondary.dark',
                  bgcolor: isStudent ? 'primary.lighter' : 'secondary.lighter',
                  borderRadius: 1,
                }}
              />
            </Box>
          );
        })}
      </Stack>
    );
  };

  // -- Skeleton Loader --
  if (isGroupLoading)
    return (
      <Grid container spacing={1}>
        {/* Skeleton Left Side */}
        <Grid size={{ xs: 12, md: 4, lg: 3.5 }}>
          <Stack spacing={1}>
            <Card sx={{ p: 0, overflow: 'hidden', borderRadius: 3 }}>
              <Skeleton variant="rectangular" height={58} sx={{ mb: 0 }} />
              <Stack spacing={0} sx={{ px: 0 }}>
                <Box sx={{ px: 2.5, py: 1.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Skeleton variant="text" width="40%" height={14} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="70%" height={18} />
                </Box>
                <Box sx={{ px: 2.5, py: 1.75 }}>
                  <Skeleton variant="text" width="40%" height={14} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="90%" height={18} />
                </Box>
              </Stack>
            </Card>

            <Card sx={{ p: 2, borderRadius: 3 }}>
              <Skeleton variant="text" width="50%" height={14} sx={{ mb: 1.5 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Skeleton variant="text" width={40} height={44} sx={{ mb: 0.5 }} />
                </Box>
                <Skeleton variant="circular" width={48} height={48} />
              </Stack>
            </Card>

            <Grid container spacing={1.5}>
              <Grid size={6}>
                <Card sx={{ p: 2, borderRadius: 3, height: 110 }}>
                  <Skeleton
                    variant="rounded"
                    width={40}
                    height={40}
                    sx={{ mb: 1.5, borderRadius: 1.5 }}
                  />
                  <Skeleton variant="text" width="50%" height={28} />
                  <Skeleton variant="text" width="70%" height={14} />
                </Card>
              </Grid>
              <Grid size={6}>
                <Card sx={{ p: 2, borderRadius: 3, height: 110 }}>
                  <Skeleton
                    variant="rounded"
                    width={40}
                    height={40}
                    sx={{ mb: 1.5, borderRadius: 1.5 }}
                  />
                  <Skeleton variant="text" width="50%" height={28} />
                  <Skeleton variant="text" width="70%" height={14} />
                </Card>
              </Grid>
            </Grid>
          </Stack>
        </Grid>

        {/* Skeleton Right Side */}
        <Grid size={{ xs: 12, md: 8, lg: 8.5 }}>
          <Card sx={{ height: '100%', p: 0, borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                px: 2.5,
                py: 1.5,
                display: 'flex',
                gap: 2,
              }}
            >
              <Skeleton variant="rounded" width={130} height={36} sx={{ borderRadius: 10 }} />
              <Skeleton variant="rounded" width={130} height={36} sx={{ borderRadius: 10 }} />
            </Box>
            <Box sx={{ p: 2.5 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 7 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                    <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 1.5 }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="50%" height={20} />
                      <Skeleton variant="text" width="70%" height={14} />
                    </Box>
                  </Stack>
                  <Skeleton variant="rounded" height={220} sx={{ borderRadius: 2 }} />
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                    <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 1.5 }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="50%" height={20} />
                      <Skeleton variant="text" width="70%" height={14} />
                    </Box>
                  </Stack>
                  <Stack spacing={1}>
                    <Skeleton variant="rounded" height={52} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rounded" height={52} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rounded" height={52} sx={{ borderRadius: 2 }} />
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
    <Box sx={{ height: '100%' }}>
      <Grid container spacing={1} sx={{ height: '100%' }}>
        {/* ─────────── LEFT SIDE: Details & Stats ─────────── */}
        <Grid size={{ xs: 12, md: 4, lg: 3.5 }} sx={{ height: '100%' }}>
          <Stack spacing={1} sx={{ height: '100%' }}>
            {/* Group Profile Card */}
            <Card
              sx={{
                position: 'relative',
                zIndex: 1,
                overflow: 'visible',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              {/* Gradient header strip */}
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.18)',
                    borderRadius: 1.5,
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Iconify
                    icon="solar:users-group-rounded-bold-duotone"
                    width={20}
                    sx={{ color: '#fff' }}
                  />
                </Box>
                <Typography
                  variant="subtitle2"
                  sx={{ color: '#fff', fontWeight: 700, letterSpacing: 0.3 }}
                >
                  Group Profile
                </Typography>
              </Box>

              {/* Info rows */}
              <Box>
                <InfoRow label="Group Name" value={groupData.name} />
                <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.8,
                      color: 'text.disabled',
                      fontSize: '0.68rem',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Description
                  </Typography>

                  {groupData?.description ? (
                    <Box
                      sx={{
                        '& p': { margin: 0 },
                        fontSize: 14,
                        fontWeight: 500,
                        color: 'text.primary',
                      }}
                      dangerouslySetInnerHTML={{
                        __html: groupData.description,
                      }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.disabled" fontStyle="italic">
                      No description provided
                    </Typography>
                  )}
                </Box>
              </Box>
            </Card>

            {/* Total Audience Stat Card */}
            <Card
              sx={{
                p: 1,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                position: 'relative',
                overflow: 'visible',
                // UI-only: fade background watermark icon for visual depth
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  right: -16,
                  top: -16,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: 'primary.lighter',
                  opacity: 0.6,
                  zIndex: -1,
                },
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 700,
                  color: 'text.secondary',
                  fontSize: '0.68rem',
                  letterSpacing: 1,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Total Audience
              </Typography>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mt={0.75}
                sx={{ position: 'relative', zIndex: 1 }}
              >
                <Typography
                  variant="h3"
                  sx={{ color: 'text.primary', fontWeight: 800, lineHeight: 1 }}
                >
                  {groupData.memberCount ||
                    (groupData.studentCount || 0) + (groupData.employeeCount || 0) ||
                    0}
                </Typography>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 44,
                    height: 44,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  <Iconify icon="solar:users-group-two-rounded-bold" width={22} color="#fff" />
                </Avatar>
              </Stack>
            </Card>

            {/* Students & Employees Mini Cards */}
            <Grid container spacing={1.5}>
              <Grid size={6}>
                <Card
                  sx={{
                    p: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    transition: 'all 0.22s ease',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      borderColor: 'transparent',
                      transform: 'translateY(-3px)',
                    },
                  }}
                >
                  <Stack spacing={1}>
                    <Avatar
                      variant="rounded"
                      sx={{
                        bgcolor: 'primary.lighter',
                        color: 'primary.main',
                        width: 38,
                        height: 38,
                        borderRadius: 1.5,
                      }}
                    >
                      <Iconify icon="solar:cap-academic-bold-duotone" width={22} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h4"
                        color="text.primary"
                        sx={{ fontWeight: 800, lineHeight: 1.1 }}
                      >
                        {groupData.studentCount || 0}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: 0.6,
                          fontSize: '0.65rem',
                        }}
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
                    transition: 'all 0.22s ease',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      borderColor: 'transparent',
                      transform: 'translateY(-3px)',
                    },
                    height: '100%',
                  }}
                >
                  <Stack spacing={1}>
                    <Avatar
                      variant="rounded"
                      sx={{
                        bgcolor: 'info.lighter',
                        color: 'info.main',
                        width: 38,
                        height: 38,
                        borderRadius: 1.5,
                      }}
                    >
                      <Iconify icon="solar:user-id-bold-duotone" width={22} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h4"
                        color="text.primary"
                        sx={{ fontWeight: 800, lineHeight: 1.1 }}
                      >
                        {groupData.employeeCount || 0}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: 0.6,
                          fontSize: '0.65rem',
                        }}
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
        </Grid>

        {/* ─────────── RIGHT SIDE: Tabbed Static Data ─────────── */}
        <Grid size={{ xs: 12, md: 8, lg: 8.5 }} sx={{ height: '100%' }}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              overflow: 'hidden',
            }}
          >
            {/* Tab Bar */}
            <Box
              sx={{
                px: 2.5,
                pt: 1.5,
                pb: 0,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 42,
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                    bgcolor: 'primary.main',
                  },
                  '& .MuiTab-root': {
                    minHeight: 42,
                    fontSize: 13.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    letterSpacing: 0.2,
                    mr: 1,
                    px: 0,
                    color: 'text.secondary',
                    transition: 'color 0.2s',
                    '&.Mui-selected': { color: 'primary.main' },
                  },
                }}
              >
                <Tab
                  label="Rule Based Criteria"
                  icon={<Iconify icon="solar:sort-by-time-bold-duotone" width={18} />}
                  iconPosition="start"
                />
                <Tab
                  label="Direct Selection"
                  icon={<Iconify icon="solar:user-hand-up-bold-duotone" width={18} />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ flexGrow: 1, p: 2.5, overflowY: 'auto', minHeight: 0 }}>
              {/* ─── Tab 0: Rule Based Criteria ─── */}
              {tab === 0 && (
                <Grid container spacing={2.5}>
                  {/* Academic Structure Column */}
                  <Grid
                    size={{ xs: 12, md: 7 }}
                    sx={{
                      borderRight: { md: '1px dashed' },
                      borderColor: { md: 'divider' },
                      pr: { md: 2.5 },
                    }}
                  >
                    {/* Section header */}
                    <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                      <Avatar
                        variant="rounded"
                        sx={{
                          bgcolor: 'primary.lighter',
                          color: 'primary.main',
                          width: 38,
                          height: 38,
                          borderRadius: 1.5,
                        }}
                      >
                        <Iconify icon="solar:structure-bold-duotone" width={22} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                          Academic Structure
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                          Classes &amp; Divisions Included
                        </Typography>
                      </Box>
                    </Stack>

                    {/* UNCHANGED: HierarchyTextView wrapped in styled container */}
                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: 2.5,
                        overflow: 'hidden',
                        borderColor: 'divider',
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          bgcolor: 'background.neutral',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <Iconify
                          icon="solar:layers-minimalistic-bold-duotone"
                          width={15}
                          sx={{ color: 'text.disabled' }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: 'text.secondary',
                            letterSpacing: 0.8,
                            fontSize: '0.65rem',
                          }}
                        >
                          Selected Hierarchy
                        </Typography>
                      </Box>
                      <Box sx={{ p: 0 }}>
                        <Scrollbar sx={{ maxHeight: 'calc(100vh - 400px)', minHeight: 300, p: 1 }}>
                          {ruleBasedTree.length > 0 ? (
                            // ─── HierarchyTextView is UNCHANGED as per user instruction ───
                            <HierarchyTextView data={ruleBasedTree} isShowDelete={false} />
                          ) : (
                            <Stack
                              alignItems="center"
                              justifyContent="center"
                              sx={{
                                py: 5,
                                opacity: 0.45,
                              }}
                            >
                              <Iconify
                                icon="solar:clipboard-remove-bold-duotone"
                                width={40}
                                sx={{ mb: 1.5, color: 'text.disabled' }}
                              />
                              <Typography variant="body2" color="text.disabled">
                                No academic selections applied.
                              </Typography>
                            </Stack>
                          )}
                        </Scrollbar>
                      </Box>
                    </Card>
                  </Grid>

                  {/* Specific Rules / Filters Column */}
                  <Grid size={{ xs: 12, md: 5 }}>
                    {/* Section header */}
                    <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                      <Avatar
                        variant="rounded"
                        sx={{
                          bgcolor: 'secondary.lighter',
                          color: 'secondary.main',
                          width: 38,
                          height: 38,
                          borderRadius: 1.5,
                        }}
                      >
                        <Iconify icon="solar:filter-bold-duotone" width={22} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                          Specific Rules
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                          Attribute Based Filters
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack spacing={3}>
                      {/* Student Rules */}
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                          <Iconify
                            icon="solar:cap-academic-bold-duotone"
                            width={16}
                            sx={{ color: 'primary.main' }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 800,
                              color: 'text.secondary',
                              textTransform: 'uppercase',
                              letterSpacing: 0.8,
                              fontSize: '0.65rem',
                            }}
                          >
                            Student Rules
                          </Typography>
                        </Stack>
                        {renderFilterRows(groupData.ruleBased.studentFilters || [], true)}
                      </Box>

                      <Divider sx={{ borderStyle: 'dashed' }} />

                      {/* Employee Rules */}
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                          <Iconify
                            icon="solar:user-id-bold-duotone"
                            width={16}
                            sx={{ color: 'info.main' }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 800,
                              color: 'text.secondary',
                              textTransform: 'uppercase',
                              letterSpacing: 0.8,
                              fontSize: '0.65rem',
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

              {/* ─── Tab 1: Direct Selection ─── */}
              {tab === 1 && (
                <Box>
                  {/* Header row with count badge */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar
                        variant="rounded"
                        sx={{
                          bgcolor: 'warning.lighter',
                          color: 'warning.main',
                          width: 38,
                          height: 38,
                          borderRadius: 1.5,
                        }}
                      >
                        <Iconify icon="solar:users-group-rounded-bold-duotone" width={22} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                          Direct Selections
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                          Individually Added Users
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Selected count badge */}
                    <Chip
                      icon={<Iconify icon="solar:check-circle-bold" width={15} />}
                      label={`${selectedStudents.length + selectedEmployees.length} Selected`}
                      sx={{
                        bgcolor: 'primary.main',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        height: 30,
                        borderRadius: 1.5,
                        '& .MuiChip-icon': { color: '#fff', ml: 0.75 },
                        boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                      }}
                    />
                  </Stack>

                  {/* Selection Filters display */}
                  <Card
                    variant="outlined"
                    sx={{
                      mb: 3,
                      borderRadius: 2.5,
                      overflow: 'hidden',
                      borderColor: 'divider',
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        bgcolor: 'background.neutral',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Iconify
                        icon="solar:filter-bold-duotone"
                        width={15}
                        sx={{ color: 'text.secondary' }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13 }}>
                        Selection Filters
                      </Typography>
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
                                letterSpacing: 0.8,
                                mb: 1,
                                display: 'block',
                                fontSize: '0.65rem',
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
                                letterSpacing: 0.8,
                                mb: 1,
                                display: 'block',
                                fontSize: '0.65rem',
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
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Iconify
                                  icon="solar:info-circle-bold-duotone"
                                  width={16}
                                  sx={{ color: 'text.disabled' }}
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  fontStyle="italic"
                                >
                                  No pre-filters applied. Users were selected from the full list.
                                </Typography>
                              </Stack>
                            </Grid>
                          )}
                      </Grid>
                    </Box>
                  </Card>

                  {/* User list: Empty State */}
                  {selectedStudents.length === 0 && selectedEmployees.length === 0 ? (
                    <Stack
                      alignItems="center"
                      justifyContent="center"
                      sx={{
                        py: 8,
                        bgcolor: 'background.neutral',
                        border: '1px dashed',
                        borderColor: 'divider',
                      }}
                    >
                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: '50%',
                          bgcolor: 'background.default',
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <Iconify
                          icon="solar:user-block-rounded-bold-duotone"
                          width={36}
                          sx={{ color: 'text.disabled' }}
                        />
                      </Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                        No users manually selected
                      </Typography>
                      <Typography variant="body2" color="text.disabled">
                        Add users from the edit screen
                      </Typography>
                    </Stack>
                  ) : (
                    <Stack spacing={1.25}>
                      {/* Student Cards */}
                      {selectedStudents.map((student: IStudent) => (
                        <Card
                          key={student.id}
                          sx={{
                            p: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            borderRadius: 2.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: 'none',
                            transition: 'all 0.22s ease',
                            '&:hover': {
                              borderColor: 'primary.light',
                              boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <Avatar
                            src={student.profilePicture}
                            alt={student.studentName}
                            sx={{
                              width: 44,
                              height: 44,
                              bgcolor: 'primary.lighter',
                              color: 'primary.dark',
                              fontWeight: 800,
                              fontSize: '1rem',
                              border: '2px solid',
                              borderColor: 'background.paper',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                          >
                            {student.firstName?.[0]}
                          </Avatar>

                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700, mb: 0.4, lineHeight: 1.2 }}
                              noWrap
                            >
                              {student.studentName || `${student.firstName} ${student.lastName}`}
                            </Typography>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.75}
                              flexWrap="wrap"
                            >
                              <Chip
                                label="STUDENT"
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.6rem',
                                  fontWeight: 800,
                                  bgcolor: 'primary.lighter',
                                  color: 'primary.dark',
                                  borderRadius: 0.75,
                                  letterSpacing: 0.4,
                                  '& .MuiChip-label': { px: 0.75 },
                                }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ lineHeight: 1 }}
                              >
                                Class {student.standardName}-{student.divisionName}
                              </Typography>
                            </Stack>
                          </Box>

                          {/* Status badge */}
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 10,
                              bgcolor: student.status === 1 ? 'success.lighter' : 'error.lighter',
                              color: student.status === 1 ? 'success.dark' : 'error.dark',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              flexShrink: 0,
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
                        </Card>
                      ))}

                      {/* Employee Cards */}
                      {selectedEmployees.map((emp: IEmployee) => (
                        <Card
                          key={emp.id}
                          sx={{
                            p: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            borderRadius: 2.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: 'none',
                            transition: 'all 0.22s ease',
                            '&:hover': {
                              borderColor: 'info.light',
                              boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <Avatar
                            src={emp.profilePicture}
                            alt={emp.employeeName}
                            sx={{
                              width: 44,
                              height: 44,
                              bgcolor: 'info.lighter',
                              color: 'info.dark',
                              fontWeight: 800,
                              fontSize: '1rem',
                              border: '2px solid',
                              borderColor: 'background.paper',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                          >
                            {emp.firstName?.[0]}
                          </Avatar>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700, mb: 0.4, lineHeight: 1.2 }}
                              noWrap
                            >
                              {emp.employeeName || `${emp.firstName} ${emp.lastName}`}
                            </Typography>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.75}
                              flexWrap="wrap"
                            >
                              <Chip
                                label="EMPLOYEE"
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.6rem',
                                  fontWeight: 800,
                                  bgcolor: 'info.lighter',
                                  color: 'info.dark',
                                  borderRadius: 0.75,
                                  letterSpacing: 0.4,
                                  '& .MuiChip-label': { px: 0.75 },
                                }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ lineHeight: 1 }}
                              >
                                {emp.designation}
                              </Typography>
                            </Stack>
                          </Box>

                          {/* Status badge */}
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 10,
                              bgcolor:
                                emp.employeeStatusType === 1 ? 'success.lighter' : 'error.lighter',
                              color: emp.employeeStatusType === 1 ? 'success.dark' : 'error.dark',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              flexShrink: 0,
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
    </Box>
  );
};

export default GroupViewDialog;
