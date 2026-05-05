import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRef, useState, useEffect } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import CustomTooltip from 'src/components/custom-tooltip';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetEmployeeQuery, useLazyGetEmployeeByIdQuery } from 'src/redux/hr/employeeApi';
import { EmployeeStatusType, EmployeeStatusTypeColor } from 'src/enums/employee-status-type';
import {
  Box,
  Grid,
  Paper,
  Avatar,
  Skeleton,
  TextField,
  Typography,
  Autocomplete,
  CircularProgress,
} from '@mui/material';

import { CardActions } from './InformationFields';

import type { FieldsType } from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns two uppercase initials from a full name */
const getInitials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ─── Right Panel: Empty State ─────────────────────────────────────────────────

const RightEmptyState = () => {
  const theme = useTheme();
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ height: '100%' }}
    >
      <Box
        sx={{
          height: '100%',
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          px: 3,
          textAlign: 'center',
        }}
      >
        {/* Person + gear icon (teal) */}
        <Box sx={{ mb: 0.5, color: '#00897B' }}>
          <Iconify icon="solar:user-id-bold" width={48} />
        </Box>

        <Typography variant="subtitle2" fontWeight={700} color="text.primary">
          No manager selected yet
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280, lineHeight: 1.6 }}>
          Pick a reporting manager from the dropdown on the left to see their full profile,{' '}
          <Box component="span" sx={{ color: '#1565C0', cursor: 'pointer' }}>
            contact details
          </Box>
          , and{' '}
          <Box component="span" sx={{ color: '#1565C0', cursor: 'pointer' }}>
            team here
          </Box>
          .
        </Typography>
      </Box>
    </motion.div>
  );
};

// ─── Right Panel: Loading State ───────────────────────────────────────────────

const RightLoadingState = () => (
  <motion.div
    key="loading"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
  >
    <Box display="flex" alignItems="center" gap={2} mb={2.5}>
      <Skeleton variant="circular" width={52} height={52} />
      <Box flex={1}>
        <Skeleton width="60%" height={20} sx={{ mb: 0.5 }} />
        <Skeleton width="40%" height={16} />
      </Box>
      <Skeleton width={60} height={24} sx={{ borderRadius: 1 }} />
    </Box>
    {[1, 2, 3, 4].map((i) => (
      <Box key={i} display="flex" alignItems="center" gap={1.5} mb={1.5}>
        <Skeleton variant="rounded" width={30} height={30} />
        <Box flex={1}>
          <Skeleton width="30%" height={14} sx={{ mb: 0.25 }} />
          <Skeleton width="60%" height={16} />
        </Box>
      </Box>
    ))}
  </motion.div>
);

// ─── Status Label helper ─────────────────────────────────────────────────────

const getStatusColor = (status?: number): LabelColor => {
  if (status === undefined || status === null) return 'default';
  return (EmployeeStatusTypeColor[status as EmployeeStatusType] ?? 'default') as LabelColor;
};

const getStatusLabel = (status?: number): string => {
  if (status === undefined || status === null) return 'Unknown';
  return EmployeeStatusType[status as EmployeeStatusType] ?? 'Unknown';
};

// ─── Right Panel: Manager Profile Card ───────────────────────────────────────

const RightManagerProfile = ({ employee }: { employee: any }) => {
  const theme = useTheme();

  const detailRows = [
    {
      icon: 'solar:letter-bold',
      label: 'Email',
      value: employee?.email,
    },
    {
      icon: 'solar:phone-bold',
      label: 'Contact',
      value: employee?.mobileNo,
    },
    {
      icon: 'solar:buildings-2-bold',
      label: 'Department',
      value: employee?.department,
    },
    {
      icon: 'solar:user-id-bold',
      label: 'Employee ID',
      value: employee?.employeeIdentifier,
    },
  ];

  return (
    <motion.div
      key={employee?.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25 }}
    >
      {/* Avatar row */}
      <Box display="flex" alignItems="center" gap={2} mb={2.5}>
        <Avatar
          sx={{
            width: 52,
            height: 52,
            fontSize: 18,
            fontWeight: 700,
            bgcolor: '#00897B',
            color: '#fff',
          }}
        >
          {getInitials(employee?.fullName)}
        </Avatar>
        <Box flex={1}>
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            {employee?.fullName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {[employee?.roleName, employee?.employeeIdentifier].filter(Boolean).join(' · ')}
          </Typography>
        </Box>
        <Label color={getStatusColor(employee?.status)} variant="soft">
          {getStatusLabel(employee?.status)}
        </Label>
      </Box>

      {/* Detail rows */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {detailRows.map((row) =>
          row.value ? (
            <Box key={row.label} display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  flexShrink: 0,
                }}
              >
                <Iconify icon={row.icon} width={15} color="primary.main" />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  fontWeight={600}
                  display="block"
                  lineHeight={1}
                >
                  {row.label}
                </Typography>
                <Typography variant="body2" color="text.primary" fontWeight={500}>
                  {row.value}
                </Typography>
              </Box>
            </Box>
          ) : null
        )}
      </Box>
    </motion.div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const RenderAssignReportingManager = ({ formik, isMainForm }: any) => {
  const theme = useTheme();
  const { setFieldValue } = formik;

  const [employeeParams, setEmployeeParams] = useState({ search: '' });

  // ── State 1: basic dropdown selection (lightweight list data) ──────────────
  const [selectedManager, setSelectedManager] = useState<any>(
    formik.values.reportingManager
      ? {
          id: formik.values.reportingManager,
          fullName: formik.values.reportingManagerName,
          status: formik.values.reportingManagerStatus,
        }
      : null
  );

  // ── State 2: full employee details for the preview panel ──────────────────
  const [selectedManagerDetails, setSelectedManagerDetails] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);

  // Track the last fetched ID to avoid duplicate calls
  const lastFetchedIdRef = useRef<string | null>(null);

  const [getEmployeeById] = useLazyGetEmployeeByIdQuery();

  // ── Fetch full manager details ─────────────────────────────────────────────
  const fetchManagerDetails = async (managerId: string) => {
    if (!managerId) return;
    // Skip if we already have details for this exact manager
    if (lastFetchedIdRef.current === managerId && selectedManagerDetails?.id === managerId) return;

    lastFetchedIdRef.current = managerId;
    setIsDetailLoading(true);
    setDetailError(false);
    try {
      const data = await getEmployeeById(managerId).unwrap();
      setSelectedManagerDetails(data);
    } catch {
      setDetailError(true);
      setSelectedManagerDetails(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // ── Sync selectedManager when formik values change externally ─────────────
  useEffect(() => {
    if (formik.values.reportingManager) {
      setSelectedManager((prev: any) => {
        if (prev?.id === formik.values.reportingManager) return prev;
        return {
          id: formik.values.reportingManager,
          fullName: formik.values.reportingManagerName,
          status: formik.values.reportingManagerStatus,
        };
      });
    } else {
      setSelectedManager(null);
      setSelectedManagerDetails(null);
      lastFetchedIdRef.current = null;
    }
  }, [
    formik.values.reportingManager,
    formik.values.reportingManagerName,
    formik.values.reportingManagerStatus,
  ]);

  // ── Fetch details whenever the assigned manager ID changes (including async initial load) ─
  // formik.values.reportingManager is populated asynchronously by the parent after the
  // reporting-manager API resolves, so a mount-only effect would fire too early.
  // We watch the value reactively and fetch only when we don't already have matching details.
  useEffect(() => {
    const managerId = formik.values.reportingManager;
    if (managerId && lastFetchedIdRef.current !== managerId) {
      fetchManagerDetails(managerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.reportingManager]);

  const {
    data: employees,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeQuery,
    params: employeeParams,
  });

  const isEditable = useBoolean(isMainForm);

  const handleSave = async (): Promise<void | false | undefined> => {
    const validation = await formik.validateForm();
    await formik?.submitForm?.();
    if (Object.keys(validation).length > 0) return false;
    formik.resetForm({ values: formik.values });
    return undefined;
  };

  const handleCancel = () => formik.resetForm();

  // Exclude the current employee from the dropdown options
  const currentEmployeeId = formik.values.employeeId;
  const filteredOptions = (employees?.items || []).filter(
    (emp: any) => emp?.id !== currentEmployeeId
  );

  // ── Determine what to show in the right panel ──────────────────────────────
  // Prefer full details; fall back to basic dropdown data for name/status while loading
  const previewEmployee = selectedManagerDetails ?? (selectedManager?.id ? selectedManager : null);

  // ── Page heading ──────────────────────────────────────────────────────────
  return (
    <Box>
      {/* Top heading */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
        <Box>
          <Typography variant="h5" color="text.primary" mb={0.5}>
            Assign Reporting Manager
          </Typography>
        </Box>

        {!isMainForm && (
          <CardActions
            isEdit={isEditable}
            onSave={handleSave}
            isLoading={formik.isSubmitting}
            onCancel={handleCancel}
          />
        )}
      </Box>

      {/* Two-column body */}
      <Grid container spacing={2.5} alignItems="stretch">
        {/* ── LEFT COLUMN ────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
            {/* Card 1: Select a manager */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.grey[400], 0.3)}`,
              }}
            >
              <Typography variant="subtitle1" color="text.primary">
                Select a manager
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Choose from active managers across your organization.
              </Typography>

              {/* Label */}
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                display="block"
                mb={0.75}
              >
                Reporting Manager
              </Typography>

              {/* Autocomplete */}
              {isLoading ? (
                <Skeleton height={40} width="100%" sx={{ borderRadius: 1 }} />
              ) : (
                <CustomTooltip placement="top" title={selectedManager?.fullName || ''}>
                  <Autocomplete
                    options={filteredOptions}
                    getOptionLabel={(option: any) => option?.fullName || ''}
                    isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
                    filterOptions={(x) => x}
                    disabled={!isEditable.value}
                    loading={isFetching}
                    onInputChange={(_e, newInputValue, reason) => {
                      if (reason === 'input') {
                        setEmployeeParams((prev) => ({ ...prev, search: newInputValue }));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Search and select a manager"
                        size="small"
                        fullWidth
                        disabled={!isEditable.value}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isFetching ? <CircularProgress color="inherit" size={16} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    value={selectedManager}
                    onChange={(_e, value) => {
                      const newManagerId = value?.id || '';
                      setSelectedManager(value || null);
                      setFieldValue('reportingManager', newManagerId);
                      setFieldValue('reportingManagerName', value?.fullName || '');
                      setFieldValue('reportingManagerStatus', value?.status ?? null);

                      // Clear stale details immediately
                      setSelectedManagerDetails(null);
                      lastFetchedIdRef.current = null;

                      // Fetch full details for the newly selected manager
                      if (newManagerId) {
                        fetchManagerDetails(newManagerId);
                      }
                    }}
                  />
                </CustomTooltip>
              )}
            </Paper>

            {/* Card 2: Currently assigned */}
            <AnimatePresence>
              {selectedManager?.id && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.25 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.grey[400], 0.3)}`,
                    }}
                  >
                    {/* "Currently assigned" header */}
                    <Box display="flex" alignItems="center" gap={0.75} mb={1.5}>
                      <Iconify icon="solar:check-circle-bold" width={16} color="success.main" />
                      <Typography variant="caption" fontWeight={600} color="success.dark">
                        Currently assigned
                      </Typography>
                    </Box>

                    {/* Manager row */}
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          fontSize: 14,
                          fontWeight: 700,
                          bgcolor: '#00897B',
                          color: '#fff',
                          borderRadius: 1.5,
                        }}
                      >
                        {getInitials(selectedManager?.fullName)}
                      </Avatar>

                      <Box flex={1} minWidth={0}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          color="text.primary"
                          noWrap
                        >
                          {selectedManager?.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {[selectedManager?.roleName, selectedManager?.employeeIdentifier]
                            .filter(Boolean)
                            .join(' · ')}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Grid>

        {/* ── RIGHT COLUMN ───────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.grey[400], 0.3)}`,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Right panel header */}
            <Box mb={2}>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                Manager details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Preview the selected manager&apos;s profile before saving.
              </Typography>
            </Box>

            {/* Right panel body */}
            <Box flex={1} display="flex" flexDirection="column" justifyContent="center">
              <AnimatePresence mode="wait">
                {isDetailLoading ? (
                  <RightLoadingState key="loading" />
                ) : detailError && selectedManager?.id ? (
                  // Graceful fallback: show basic info from dropdown when detail API fails
                  <RightManagerProfile key={selectedManager.id} employee={selectedManager} />
                ) : previewEmployee ? (
                  <RightManagerProfile key={previewEmployee.id} employee={previewEmployee} />
                ) : (
                  <RightEmptyState key="empty" />
                )}
              </AnimatePresence>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export const AssignReportingManager: FieldsType[] = [
  {
    type: 'text',
    label: ' ',
    name: ' ',
    gridProps: { size: { xs: 12, md: 12 } },
    renderComp: (props) => <RenderAssignReportingManager {...props} />,
  },
];
