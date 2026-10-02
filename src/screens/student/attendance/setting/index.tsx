'use client';

import type { RootState } from 'src/redux/store';
import type {
  AttendancePreview,
  AttendanceOptions,
  AttendanceSettings,
  AttendanceException,
} from 'src/redux/student/attendance-management/types';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { attendanceError } from 'src/redux/student/attendance-management/types';
import {
  Box,
  Grid,
  Stack,
  Paper,
  Alert,
  Button,
  Skeleton,
  Checkbox,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';
import {
  useGetAttendanceSettingsQuery,
  useSaveAttendanceDraftMutation,
  usePreviewAttendancePolicyMutation,
  usePublishAttendancePolicyMutation,
} from 'src/redux/student/attendance-management/api';

import AttendanceType from './attendance-type';
import IndividualSchedules from './individual-schedules';
import { useAttendanceContext } from './attendance-context';

const tasks = [
  {
    value: 'school-day',
    title: 'School Day & Applicability',
    icon: 'mdi:calendar-check-outline',
    description: 'Calendar, enrollment start dates and individual schedules.',
  },
  {
    value: 'daily',
    title: 'Daily Marking',
    icon: 'mdi:clipboard-check-outline',
    description: 'Present, absent and optional attendance details.',
  },
  {
    value: 'leave',
    title: 'Leave & Corrections',
    icon: 'mdi:file-document-outline',
    description: 'Leave counting and correction approval rules.',
  },
  {
    value: 'monitoring',
    title: 'Monitoring & Alerts',
    icon: 'mdi:chart-line',
    description: 'Daily completion and low attendance thresholds.',
  },
];
const optionSchema = Yup.object({
  halfDayCredit: Yup.number().min(0).max(1).required(),
  lateCredit: Yup.number().min(0).max(1).required(),
  lowAttendanceThreshold: Yup.number().min(0).max(100).required(),
  schoolTimeZone: Yup.string().required('School timezone is required'),
  markingCutoff: Yup.string()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use a valid school time')
    .required(),
});
export default function AttendanceSettingsScreen() {
  const context = useAttendanceContext();
  const task = tasks.find((item) => item.value === context.params.get('task')) ?? tasks[0];
  const yearId =
    context.params.get('scope') === 'year'
      ? context.params.get('year') || context.currentYear?.id
      : undefined;
  const query = useGetAttendanceSettingsQuery(yearId ? { academicYearId: yearId } : {});
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, gap: 1 }}>
      <CustomBreadcrumbs
        heading="Attendance Settings"
        description="Configure school defaults, academic-year overrides and targeted exceptions. Review the outcomes before publishing."
        links={[
          { name: 'Student', href: '/student/dashboard' },
          { name: 'Attendance', href: '/student/attendance/take-attendance' },
          { name: 'Settings' },
        ]}
      />
      <Box
        component="nav"
        aria-label="Attendance settings tasks"
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2,minmax(0,1fr))',
            xl: 'repeat(4,minmax(0,1fr))',
          },
        }}
      >
        {tasks.map((item) => {
          const params = new URLSearchParams(context.params.toString());
          params.set('task', item.value);
          params.delete('view');
          return (
            <Paper
              key={item.value}
              component={RouterLink}
              href={`/student/attendance/setting?${params.toString()}`}
              variant="outlined"
              aria-current={item.value === task.value ? 'page' : undefined}
              sx={{
                p: 1.5,
                display: 'flex',
                gap: 1,
                textDecoration: 'none',
                color: 'text.primary',
                borderColor: item.value === task.value ? 'primary.main' : 'divider',
                '&:focus-visible': {
                  outline: (theme) => `3px solid ${theme.palette.primary.main}`,
                },
              }}
            >
              <Iconify icon={item.icon} width={24} />
              <Stack>
                <Typography variant="subtitle2">{item.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.description}
                </Typography>
              </Stack>
            </Paper>
          );
        })}
      </Box>
      {query.isError ? (
        <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
          {attendanceError(query.error, 'Attendance settings could not be loaded.')}
        </Alert>
      ) : !query.currentData ? (
        <Skeleton variant="rounded" height={220} />
      ) : (
        <PolicyEditor
          key={yearId || 'school'}
          data={query.currentData}
          task={task.value}
          yearId={yearId}
        />
      )}
    </Box>
  );
}
function PolicyEditor({
  data,
  task,
  yearId,
}: {
  data: AttendanceSettings;
  task: string;
  yearId?: string;
}) {
  const router = useRouter();
  const context = useAttendanceContext();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canEdit = hasGrantedPermission(permissions, 'Students.Attendance.Setting.LeaveType.Add');
  const [revision, setRevision] = useState(data.concurrencyStamp);
  const [preview, setPreview] = useState<AttendancePreview | null>(null);
  const [previewKey, setPreviewKey] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(dayjs().format('YYYY-MM-DD'));
  const [selectedException, setSelectedException] = useState('');
  const [scopeLevel, setScopeLevel] = useState('medium');
  const [scheduleDirty, setScheduleDirty] = useState(false);
  const [save, saving] = useSaveAttendanceDraftMutation();
  const [runPreview, previewing] = usePreviewAttendancePolicyMutation();
  const [publish, publishing] = usePublishAttendancePolicyMutation();
  const formik = useFormik({
    initialValues: data.draftPolicy,
    validationSchema: Yup.object({
      defaults: optionSchema,
      exceptions: Yup.array().of(
        Yup.object({ name: Yup.string().required(), options: optionSchema })
      ),
    }),
    onSubmit: async (policy, helpers) => {
      try {
        const result = await save({
          academicYearId: yearId,
          concurrencyStamp: revision,
          policy,
        }).unwrap();
        setRevision(result.concurrencyStamp);
        helpers.resetForm({ values: result.draftPolicy });
        setPreview(null);
        setPreviewKey('');
        shikshaMitraToast.success({ message: 'Attendance draft saved.' });
      } catch (error) {
        shikshaMitraToast.error({
          message: attendanceError(error, 'Draft could not be saved. Your changes are retained.'),
        });
      }
    },
  });
  const guard = useUnsavedNavigation(formik.dirty || scheduleDirty, { push: router.push });
  const index = formik.values.exceptions.findIndex((item) => item.id === selectedException);
  const path = index < 0 ? 'defaults' : `exceptions.${index}.options`;
  const options = index < 0 ? formik.values.defaults : formik.values.exceptions[index].options;
  const update = (field: keyof AttendanceOptions, value: unknown) => {
    formik.setFieldValue(`${path}.${field}`, value);
    setPreview(null);
  };
  const field = (name: keyof AttendanceOptions, label: string, type = 'number') => (
    <TextField
      fullWidth
      size="small"
      label={label}
      type={type}
      value={options[name]}
      disabled={!canEdit}
      onChange={(event) =>
        update(name, type === 'number' ? Number(event.target.value) : event.target.value)
      }
      helperText={formik.getFieldMeta(`${path}.${name}`).error}
      error={Boolean(formik.getFieldMeta(`${path}.${name}`).error)}
    />
  );
  const toggle = (name: keyof AttendanceOptions, label: string) => (
    <FormControlLabel
      control={
        <Checkbox
          checked={Boolean(options[name])}
          disabled={!canEdit}
          onChange={(_, value) => update(name, value)}
        />
      }
      label={label}
    />
  );
  const busy = saving.isLoading || publishing.isLoading || previewing.isLoading;
  return (
    <Stack spacing={1}>
      <Paper variant="outlined" sx={{ p: 1 }}>
        <CustomSelect
          fullWidth
          size="small"
          label="Policy scope"
          value={yearId ? 'year' : 'school'}
          options={[
            { value: 'school', label: 'School defaults' },
            ...(context.currentYear?.id
              ? [{ value: 'year', label: 'Selected academic year override' }]
              : []),
          ]}
          onChange={(value) =>
            guard.requestNavigation(() =>
              context.update({
                scope: String(value),
                year: value === 'year' ? context.currentYear?.id : undefined,
              })
            )
          }
        />
      </Paper>
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
          <Typography variant="body2" sx={{ flex: 1 }}>
            <Label color="info">Draft</Label> Published version{' '}
            {data.publishedVersionNumber || 'none'} ·{' '}
            {yearId ? 'Academic-year override' : 'School defaults'}
          </Typography>
          <Button
            size="small"
            disabled={!canEdit || (!formik.dirty && Boolean(revision)) || busy}
            onClick={() => formik.submitForm()}
          >
            Save draft
          </Button>
          <Button
            size="small"
            disabled={!canEdit || busy}
            onClick={async () => {
              if (Object.keys(await formik.validateForm()).length) return;
              try {
                const result = await runPreview({
                  academicYearId: yearId,
                  concurrencyStamp: revision,
                  policy: formik.values,
                }).unwrap();
                setPreview(result);
                setPreviewKey(JSON.stringify(formik.values));
              } catch (error) {
                shikshaMitraToast.error({
                  message: attendanceError(error, 'Policy preview failed.'),
                });
              }
            }}
          >
            Preview outcomes
          </Button>
        </Stack>
      </Paper>
      {!canEdit && (
        <Alert severity="info">
          Settings are read-only. Your school administrator can change and publish the policy.
        </Alert>
      )}
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Stack spacing={1}>
          <CustomSelect
            fullWidth
            label="Rule being configured"
            size="small"
            value={selectedException}
            options={[
              { value: '', label: 'Default rules' },
              ...formik.values.exceptions.map((item) => ({ value: item.id, label: item.name })),
            ]}
            onChange={(value) => {
              setSelectedException(String(value));
              const item = formik.values.exceptions.find((exception) => exception.id === value);
              setScopeLevel(
                item?.standardId
                  ? 'class'
                  : item?.stageId
                    ? 'stage'
                    : item?.mediumId
                      ? 'medium'
                      : 'board'
              );
            }}
          />
          {canEdit && (
            <Button
              size="small"
              onClick={() => {
                const id = crypto.randomUUID();
                formik.setFieldValue('exceptions', [
                  ...formik.values.exceptions,
                  {
                    id,
                    name: 'Targeted exception',
                    mediumId: context.currentMedium?.id,
                    options: { ...formik.values.defaults },
                  },
                ]);
                setSelectedException(id);
              }}
            >
              Add targeted exception
            </Button>
          )}
          {index >= 0 && (
            <Grid container spacing={1}>
              <Grid size={{ xs: 12 }}>
                <CustomSelect
                  fullWidth
                  size="small"
                  label="Applicability level"
                  disabled={!canEdit}
                  value={scopeLevel}
                  options={[
                    { value: 'board', label: 'Selected board' },
                    { value: 'medium', label: 'Selected medium' },
                    { value: 'stage', label: 'School level in selected medium' },
                    { value: 'class', label: 'Class or division in selected medium' },
                  ]}
                  onChange={(value) => {
                    setScopeLevel(String(value));
                    const item: AttendanceException = {
                      ...formik.values.exceptions[index],
                      boardId: undefined,
                      mediumId: undefined,
                      stageId: undefined,
                      standardId: undefined,
                      divisionId: undefined,
                    };
                    if (value === 'board') item.boardId = context.currentMedium?.educationBoardId;
                    if (value === 'medium' || value === 'class')
                      item.mediumId = context.currentMedium?.id;
                    if (value === 'stage') {
                      item.mediumId = context.currentMedium?.id;
                      item.stageId = undefined;
                    }
                    formik.setFieldValue(`exceptions.${index}`, item);
                  }}
                />
              </Grid>
              {scopeLevel === 'stage' && (
                <Grid size={{ xs: 12 }}>
                  <CustomSelect
                    fullWidth
                    size="small"
                    label="School level"
                    disabled={!canEdit}
                    value={formik.values.exceptions[index].stageId || ''}
                    options={[
                      { value: '', label: 'Select school level' },
                      ...(context.currentMedium?.educationMediumStages ?? []).map(
                        (stage: { id: string; name: string }) => ({
                          value: stage.id,
                          label: stage.name,
                        })
                      ),
                    ]}
                    onChange={(value) => {
                      formik.setFieldValue(`exceptions.${index}.stageId`, value);
                      formik.setFieldValue(`exceptions.${index}.standardId`, undefined);
                      formik.setFieldValue(`exceptions.${index}.divisionId`, undefined);
                    }}
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Exception name"
                  disabled={!canEdit}
                  value={formik.values.exceptions[index].name}
                  onChange={(event) =>
                    formik.setFieldValue(`exceptions.${index}.name`, event.target.value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CustomSelect
                  fullWidth
                  size="small"
                  label="Class scope"
                  disabled={!canEdit}
                  value={formik.values.exceptions[index].standardId || ''}
                  options={[
                    { value: '', label: 'All classes in selected medium' },
                    ...context.standards.map((item) => ({ value: item.id, label: item.name })),
                  ]}
                  onChange={(value) => {
                    formik.setFieldValue(`exceptions.${index}.standardId`, value || undefined);
                    formik.setFieldValue(`exceptions.${index}.mediumId`, context.currentMedium?.id);
                    formik.setFieldValue(`exceptions.${index}.divisionId`, undefined);
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CustomSelect
                  fullWidth
                  size="small"
                  label="Division scope"
                  disabled={!canEdit || !formik.values.exceptions[index].standardId}
                  value={formik.values.exceptions[index].divisionId || ''}
                  options={[
                    { value: '', label: 'All divisions' },
                    ...(
                      context.standards.find(
                        (item) => item.id === formik.values.exceptions[index].standardId
                      )?.divisions ?? []
                    ).map((item) => ({ value: item.id, label: item.name })),
                  ]}
                  onChange={(value) =>
                    formik.setFieldValue(`exceptions.${index}.divisionId`, value || undefined)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button
                  size="small"
                  color="error"
                  disabled={!canEdit}
                  onClick={() => {
                    formik.setFieldValue(
                      'exceptions',
                      formik.values.exceptions.filter((item) => item.id !== selectedException)
                    );
                    setSelectedException('');
                  }}
                >
                  Remove this draft exception
                </Button>
              </Grid>
            </Grid>
          )}
          {task === 'school-day' && (
            <>
              <Alert severity="info">
                Academic Calendar owns working days, holidays and emergency closures. Attendance
                uses enrollment start dates and schedules; approved shorter hours still count as
                full Present.
              </Alert>
              {field('schoolTimeZone', 'School timezone', 'text')}
            </>
          )}
          {task === 'daily' && (
            <>
              {toggle('allowLate', 'Show optional Late detail')}
              {toggle('allowHalfDay', 'Show optional Half-day detail')}
              <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {field('lateCredit', 'Late present credit (0–1)')}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {field('halfDayCredit', 'Half-day present credit (0–1)')}
                </Grid>
              </Grid>
              <Typography variant="caption">
                Daily attendance begins unmarked. Save draft accepts incomplete attendance; Submit
                requires every expected student to be marked.
              </Typography>
            </>
          )}
          {task === 'leave' && (
            <>
              <CustomSelect
                fullWidth
                size="small"
                label="Approved leave counting"
                disabled={!canEdit}
                value={options.approvedLeaveTreatment}
                options={[
                  { value: 'Exclude', label: 'Exclude leave days from attendance percentage' },
                  { value: 'Absent', label: 'Count approved leave as absence' },
                ]}
                onChange={(value) => update('approvedLeaveTreatment', value)}
              />
              <CustomSelect
                fullWidth
                size="small"
                label="Approved half-day leave"
                disabled={!canEdit || options.approvedLeaveTreatment !== 'Exclude'}
                value={options.halfDayLeaveTreatment || 'HalfDenominator'}
                options={[
                  { value: 'HalfDenominator', label: 'Count half an expected day' },
                  { value: 'Absent', label: 'Count a full expected day' },
                ]}
                onChange={(value) => update('halfDayLeaveTreatment', value)}
                helperText="The remaining approved attendance hours must still be marked. Leave never automatically marks Present."
              />
              {toggle('sameDayCorrectionRequiresReason', 'Require reason for same-day corrections')}
              {toggle(
                'priorDayCorrectionRequiresApproval',
                'Require approval for prior-day corrections'
              )}
              {toggle(
                'lockedCorrectionRequiresApproval',
                'Require approval for locked attendance corrections'
              )}
              <Button
                component={RouterLink}
                href="/student/attendance/setting?task=leave&view=types"
              >
                Manage leave types
              </Button>
            </>
          )}
          {task === 'monitoring' && (
            <>
              <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {field('lowAttendanceThreshold', 'Low attendance threshold (%)')}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {field('markingCutoff', 'Daily marking cutoff', 'time')}
                </Grid>
              </Grid>
              <Alert severity="info">
                Parent alerts, offline marking and biometric/RFID integrations are planned for a
                later rollout. Teachers can review recording completeness in Reports.
              </Alert>
            </>
          )}
        </Stack>
      </Paper>
      {task === 'school-day' && (
        <IndividualSchedules
          onDirtyChange={setScheduleDirty}
          requestNavigation={guard.requestNavigation}
        />
      )}
      {task === 'leave' &&
        (context.params.get('view') === 'types' || context.params.get('tab') === 'leaveType') && (
          <AttendanceType embedded />
        )}
      {preview && previewKey === JSON.stringify(formik.values) && (
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle2">Policy outcome preview</Typography>
            {preview.summary.map((text, i) => (
              <Typography key={i} variant="body2">
                {text}
              </Typography>
            ))}
            {preview.examples.map((item) => (
              <Typography key={item.label} variant="body2">
                <strong>{item.label}:</strong> {item.outcome}
              </Typography>
            ))}
            <TextField
              size="small"
              label="Effective from"
              type="date"
              value={effectiveFrom}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: dayjs().format('YYYY-MM-DD') },
              }}
              onChange={(event) => setEffectiveFrom(event.target.value)}
            />
            <Button
              variant="contained"
              size="small"
              disabled={!canEdit || busy || formik.dirty || !effectiveFrom || !revision}
              onClick={async () => {
                try {
                  const result = await publish({
                    academicYearId: yearId,
                    concurrencyStamp: revision,
                    effectiveFrom,
                  }).unwrap();
                  setRevision(result.concurrencyStamp);
                  formik.resetForm({ values: result.draftPolicy });
                  setPreview(null);
                  shikshaMitraToast.success({ message: 'Attendance policy published.' });
                } catch (error) {
                  shikshaMitraToast.error({
                    message: attendanceError(error, 'Policy could not be published.'),
                  });
                }
              }}
            >
              Publish saved policy
            </Button>
            {formik.dirty && (
              <Typography variant="caption">
                Save this draft, then preview again before publishing.
              </Typography>
            )}
          </Stack>
        </Paper>
      )}
      {data.versions.length > 0 && (
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Typography variant="subtitle2">Published history</Typography>
          {data.versions.map((version) => (
            <Typography variant="body2" key={version.id}>
              Version {version.versionNumber} · effective{' '}
              {dayjs(version.effectiveFrom).format('DD MMM YYYY')}
            </Typography>
          ))}
        </Paper>
      )}
      {guard.confirmation}
    </Stack>
  );
}
