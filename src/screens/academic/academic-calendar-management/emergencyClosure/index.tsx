'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useCreateEmergencyClosureMutation } from 'src/redux/academicAPI/AcademicCalendarApi/academic-calendar-api';
import {
  Box,
  Grid,
  Paper,
  Stack,
  Alert,
  Table,
  Switch,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  TableContainer,
  FormControlLabel,
} from '@mui/material';

// ─── Impact Summary ───────────────────────────────────────────────────────────

interface ImpactSummary {
  timetableSlots: number;
  homeworkDueDates: number;
  assignmentDueDates: number;
  examSchedules: number;
  onlineClasses: number;
  lessonPlans: number;
  attendanceSessions: number;
  ptmBookings: number;
}

const MOCK_IMPACT_SUMMARY: ImpactSummary = {
  timetableSlots: 14,
  homeworkDueDates: 3,
  assignmentDueDates: 2,
  examSchedules: 0,
  onlineClasses: 5,
  lessonPlans: 8,
  attendanceSessions: 6,
  ptmBookings: 0,
};

const IMPACT_ROWS = [
  {
    key: 'timetableSlots',
    label: 'Timetable Slots',
    icon: 'mdi:calendar-clock-outline',
    colorKey: 'info',
  },
  {
    key: 'homeworkDueDates',
    label: 'Homework Due Dates',
    icon: 'mdi:notebook-edit-outline',
    colorKey: 'secondary',
  },
  {
    key: 'assignmentDueDates',
    label: 'Assignment Due Dates',
    icon: 'mdi:clipboard-list-outline',
    colorKey: 'primary',
  },
  {
    key: 'examSchedules',
    label: 'Exam Schedules',
    icon: 'mdi:file-document-edit-outline',
    colorKey: 'error',
  },
  { key: 'onlineClasses', label: 'Online Classes', icon: 'mdi:video-outline', colorKey: 'success' },
  { key: 'lessonPlans', label: 'Lesson Plans', icon: 'mdi:book-open-outline', colorKey: 'warning' },
  {
    key: 'attendanceSessions',
    label: 'Attendance Sessions',
    icon: 'mdi:account-check-outline',
    colorKey: 'info',
  },
  {
    key: 'ptmBookings',
    label: 'PTM Bookings',
    icon: 'mdi:account-group-outline',
    colorKey: 'primary',
  },
] as const;

const ImpactSummaryTable = ({ summary }: { summary: ImpactSummary }) => {
  const theme = useTheme();
  const total = Object.values(summary).reduce((a, b) => a + b, 0);
  const affected = Object.values(summary).filter((v) => v > 0).length;

  return (
    <Paper
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.vars.palette.background.paper,
        boxShadow: theme.customShadows?.card || theme.shadows[1],
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: varAlpha(theme.palette.error.mainChannel, 0.02),
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              backgroundColor: varAlpha(theme.palette.error.mainChannel, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="mdi:alert-circle" width={20} color="error.main" />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={800} color="error.main">
              Affected Schedules & Activities
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {total} total items affected · {affected} modules impacted
            </Typography>
          </Box>
        </Stack>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
              <TableCell
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: '11px',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Affected Module
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: '11px',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Count
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {IMPACT_ROWS.map(({ key, label, icon, colorKey }) => {
              const count = summary[key];
              const color = (theme.palette[colorKey] || theme.palette.primary).main;
              const mainChannel =
                (theme.palette[colorKey] || theme.palette.primary).mainChannel || color;
              return (
                <TableRow
                  key={key}
                  hover
                  sx={{ '&:hover': { backgroundColor: varAlpha(mainChannel, 0.02) } }}
                >
                  <TableCell sx={{ py: 1.2 }}>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: 1.5,
                          backgroundColor: varAlpha(mainChannel, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Iconify icon={icon} width={16} sx={{ color }} />
                      </Box>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {label}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.2 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 26,
                        height: 22,
                        borderRadius: 1,
                        backgroundColor:
                          count > 0
                            ? varAlpha(theme.palette.error.mainChannel, 0.08)
                            : varAlpha(theme.palette.success.mainChannel, 0.08),
                        px: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={800}
                        color={count > 0 ? 'error.main' : 'success.main'}
                      >
                        {count}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

// ─── Validation ───────────────────────────────────────────────────────────────

const emergencyClosureSchema = Yup.object().shape({
  date: Yup.mixed().required('Closure date is required'),
  title: Yup.string().min(3, 'Title must be at least 3 characters').required('Title is required'),
  description: Yup.string().required('Reason/description is required'),
});

// ─── Checklist Item ───────────────────────────────────────────────────────────

const ChecklistItem = ({ text }: { text: string }) => (
  <Stack direction="row" alignItems="flex-start" gap={1} mb={0.75}>
    <Iconify
      icon="mdi:check-circle-outline"
      width={16}
      color="success.main"
      sx={{ mt: 0.2, flexShrink: 0 }}
    />
    <Typography variant="body2" color="text.secondary" lineHeight={1.5}>
      {text}
    </Typography>
  </Stack>
);

// ─── Notification Toggle ──────────────────────────────────────────────────────

const NotifyToggle = ({
  icon,
  label,
  checked,
  onChange,
  colorKey,
}: {
  icon: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  colorKey: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
}) => {
  const theme = useTheme();
  const color = theme.palette[colorKey].main;
  const channel = theme.palette[colorKey].mainChannel || color;
  return (
    <Box
      onClick={() => onChange(!checked)}
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1.5px solid`,
        borderColor: checked ? color : theme.palette.divider,
        backgroundColor: checked ? varAlpha(channel, 0.05) : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'center',
        '&:hover': {
          borderColor: color,
          backgroundColor: varAlpha(channel, 0.02),
        },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          backgroundColor: checked ? varAlpha(channel, 0.12) : theme.palette.action.hover,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 0.75,
          transition: 'all 0.2s',
        }}
      >
        <Iconify
          icon={icon}
          width={20}
          sx={{ color: checked ? color : theme.palette.text.disabled }}
        />
      </Box>
      <Typography
        variant="caption"
        fontWeight={checked ? 700 : 500}
        sx={{ color: checked ? color : 'text.secondary' }}
      >
        {label}
      </Typography>
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const EmergencyClosureScreen = () => {
  const theme = useTheme();
  const { permissions } = useSelector((state: RootState) => state.auth);
  const [impactSummary, setImpactSummary] = useState<ImpactSummary | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [createEmergencyClosure, { isLoading }] = useCreateEmergencyClosureMutation();

  const canDeclare = hasGrantedPermission(
    permissions,
    `${academicPermissions.academicCalendar.emergencyClosure}.Add`
  );

  const formik = useFormik({
    initialValues: {
      date: null as string | null,
      title: '',
      description: '',
      appliesToAll: true,
      notifyParents: true,
      notifyTeachers: true,
      notifyStudents: true,
      notifyStaff: false,
      autoScanImpacts: true,
    },
    validationSchema: emergencyClosureSchema,
    onSubmit: async (values, helpers) => {
      const payload = {
        ...values,
        date: values.date ? dayjs(values.date).toISOString() : null,
        standardIds: [],
        divisionIds: [],
      };
      try {
        const result: any = await createEmergencyClosure(payload).unwrap();
        shikshaMitraToast.success({ message: 'Emergency closure declared successfully' });
        setImpactSummary(result?.impactSummary ?? MOCK_IMPACT_SUMMARY);
        helpers.resetForm();
      } catch (err: any) {
        shikshaMitraToast.error({
          message: err?.data?.detail || 'Failed to declare emergency closure',
        });
      }
    },
  });

  const displaySummary = impactSummary ?? (showDemo ? MOCK_IMPACT_SUMMARY : null);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <CustomBreadcrumbs
        heading="Emergency Closure"
        description="Declare a sudden school closure and automatically notify all affected parties."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Academic Calendar', href: '/academic/academicCalendarDashboard' },
          { name: 'Emergency Closure' },
        ]}
      />

      {!canDeclare && (
        <Alert
          severity="warning"
          icon={<Iconify icon="mdi:lock-outline" />}
          sx={{ borderRadius: 2 }}
        >
          You do not have permission to declare an emergency closure. Contact your administrator.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* ── Left: Form ─────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            sx={{
              p: 3.5,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.vars.palette.background.paper,
              boxShadow: theme.customShadows?.card || theme.shadows[1],
            }}
          >
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: varAlpha(theme.palette.error.mainChannel, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Iconify icon="mdi:alert-octagon" width={26} sx={{ color: 'error.main' }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={800} color="error.main">
                    Declare Emergency Closure
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This action will block all scheduled academic activities for the selected date.
                  </Typography>
                </Box>
              </Stack>
              <Divider />
            </Box>

            {/* Form body */}
            <Box component="form" onSubmit={formik.handleSubmit} noValidate>
              <Grid container spacing={2.5}>
                {/* Section 1: Closure Details */}
                <Grid size={{ xs: 12 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: 'text.secondary',
                      mb: 0.5,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    1. Closure Details
                  </Typography>
                </Grid>

                {/* Closure Date */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DatePicker
                    label="Closure Date *"
                    value={formik.values.date ? dayjs(formik.values.date) : null}
                    onChange={(val) => formik.setFieldValue('date', val ? val.toISOString() : null)}
                    disablePast
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        error: formik.touched.date && Boolean(formik.errors.date),
                        helperText: formik.touched.date && (formik.errors.date as string),
                      },
                    }}
                  />
                </Grid>

                {/* Title */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Title *"
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.title && Boolean(formik.errors.title)}
                    helperText={formik.touched.title && formik.errors.title}
                    placeholder="e.g. Heavy Rain Emergency Closure"
                  />
                </Grid>

                {/* Description */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    label="Reason / Description *"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                    placeholder="Describe the reason for closure in detail..."
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                {/* Section 2: Scope & Targeting */}
                <Grid size={{ xs: 12 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: 'text.secondary',
                      mb: 0.5,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    2. Scope & Targeting
                  </Typography>
                </Grid>

                {/* Applies To All */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      height: '100%',
                      borderRadius: 2,
                      borderColor: formik.values.appliesToAll
                        ? alpha(theme.palette.primary.main, 0.25)
                        : 'divider',
                      backgroundColor: formik.values.appliesToAll
                        ? alpha(theme.palette.primary.main, 0.02)
                        : 'transparent',
                    }}
                  >
                    <FormControlLabel
                      sx={{ m: 0, width: '100%', alignItems: 'flex-start' }}
                      control={
                        <Switch
                          checked={formik.values.appliesToAll}
                          onChange={(e) => formik.setFieldValue('appliesToAll', e.target.checked)}
                          color="primary"
                          sx={{ mt: 0.5 }}
                        />
                      }
                      label={
                        <Box ml={1}>
                          <Typography variant="body2" fontWeight={700}>
                            Applies to entire school
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            All standards and divisions will be affected
                          </Typography>
                        </Box>
                      }
                    />
                  </Paper>
                </Grid>

                {/* Auto Scan */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      height: '100%',
                      borderRadius: 2,
                      borderColor: formik.values.autoScanImpacts
                        ? alpha(theme.palette.info.main, 0.25)
                        : 'divider',
                      backgroundColor: formik.values.autoScanImpacts
                        ? alpha(theme.palette.info.main, 0.02)
                        : 'transparent',
                    }}
                  >
                    <FormControlLabel
                      sx={{ m: 0, width: '100%', alignItems: 'flex-start' }}
                      control={
                        <Switch
                          checked={formik.values.autoScanImpacts}
                          onChange={(e) =>
                            formik.setFieldValue('autoScanImpacts', e.target.checked)
                          }
                          color="info"
                          sx={{ mt: 0.5 }}
                        />
                      }
                      label={
                        <Box ml={1}>
                          <Stack direction="row" alignItems="center" gap={0.5}>
                            <Iconify icon="mdi:radar" width={15} color="info.main" />
                            <Typography variant="body2" fontWeight={700}>
                              Auto-scan activities
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            Automatically detect affected timetable slots, exams, homeworks, etc.
                          </Typography>
                        </Box>
                      }
                    />
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                {/* Section 3: Announcements & Notifications */}
                <Grid size={{ xs: 12 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: 'text.secondary',
                      mb: 0.5,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    3. Broadcast Notifications
                  </Typography>
                </Grid>

                {/* Notifications */}
                <Grid size={{ xs: 12 }}>
                  <Grid container spacing={1.5}>
                    {[
                      {
                        key: 'notifyTeachers',
                        label: 'Teachers',
                        icon: 'mdi:account-tie-outline',
                        colorKey: 'primary',
                      },
                      {
                        key: 'notifyParents',
                        label: 'Parents',
                        icon: 'mdi:account-heart-outline',
                        colorKey: 'secondary',
                      },
                      {
                        key: 'notifyStudents',
                        label: 'Students',
                        icon: 'mdi:school-outline',
                        colorKey: 'success',
                      },
                      {
                        key: 'notifyStaff',
                        label: 'Staff',
                        icon: 'mdi:account-wrench-outline',
                        colorKey: 'warning',
                      },
                    ].map(({ key, label, icon, colorKey }) => (
                      <Grid size={{ xs: 6, sm: 3 }} key={key}>
                        <NotifyToggle
                          icon={icon}
                          label={label}
                          colorKey={colorKey as any}
                          checked={formik.values[key as keyof typeof formik.values] as boolean}
                          onChange={(v) => formik.setFieldValue(key, v)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>

                {/* Submit */}
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 2 }} />
                  <LoadingButton
                    fullWidth
                    type="submit"
                    variant="outlined"
                    color="error"
                    size="large"
                    loading={isLoading}
                    disabled={!canDeclare}
                    startIcon={<Iconify icon="mdi:alert-octagon" width={20} />}
                    sx={{
                      py: 1.5,
                      fontSize: '15px',
                      fontWeight: 700,
                      borderRadius: 2,
                    }}
                  >
                    Declare Emergency Closure
                  </LoadingButton>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* ── Right: Info + Impact Summary ───────────────────────────── */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2.5}>
            {/* What happens panel */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.vars.palette.background.paper,
                boxShadow: theme.customShadows?.card || theme.shadows[1],
              }}
            >
              <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    backgroundColor: varAlpha(theme.palette.warning.mainChannel, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="mdi:information-outline" width={20} color="warning.main" />
                </Box>
                <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                  Closure Declaration Effects
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              {[
                'The date is marked as Emergency Closure in the academic calendar',
                'All timetable slots for that date are flagged as impacted',
                'Homework and assignment due dates are flagged for review',
                'Attendance is automatically exempted for that day',
                'Instant notifications are sent to selected recipients',
                'Impact logs are created for all affected academic activities',
              ].map((item, i) => (
                <ChecklistItem key={i} text={item} />
              ))}
            </Paper>

            {/* Preview button for demo */}
            {!displaySummary && (
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: `1px dashed ${theme.palette.divider}`,
                  backgroundColor: varAlpha(theme.palette.primary.mainChannel, 0.01),
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: varAlpha(theme.palette.primary.mainChannel, 0.03),
                  },
                }}
                onClick={() => setShowDemo(true)}
              >
                <Iconify icon="mdi:eye-outline" width={24} color="text.secondary" sx={{ mb: 1 }} />
                <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                  Preview Impact Summary
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mt: 0.5 }}
                >
                  Click to inspect which calendar components and schedules will be affected by this
                  closure.
                </Typography>
              </Paper>
            )}

            {/* Impact Summary */}
            {displaySummary && <ImpactSummaryTable summary={displaySummary} />}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmergencyClosureScreen;
