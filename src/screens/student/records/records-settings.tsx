'use client';

import type { RootState } from 'src/redux/store';
import type {
  RecordsPolicyPreview,
  StudentRecordsSettings,
} from 'src/redux/student/records/student-records-types';

import { useState } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Stack,
  Paper,
  Alert,
  Button,
  Skeleton,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  useGetStudentRecordsSettingsQuery,
  useSaveStudentRecordsDraftMutation,
  useGetStudentRecordsSettingsRolesQuery,
  usePreviewStudentRecordsPolicyMutation,
  usePublishStudentRecordsPolicyMutation,
} from 'src/redux/student/records/student-records-api';

import { recordsQueryUrl } from './records-url-state';
import { settingsTasks, recordsPolicySchema } from './records-settings-model';
import {
  AccessSettings,
  ChangesSettings,
  DocumentsSettings,
  TransitionsSettings,
} from './records-settings-sections';

import type { RecordsSettingsTask } from './records-settings-model';

const sectionPath = (task: RecordsSettingsTask) => studentPaths.records.settingsSections[task];
const taskQuery = (scope: string, yearId?: string) =>
  scope === 'year' && yearId ? `?scope=year&year=${encodeURIComponent(yearId)}` : '';

function SettingsHeader({ task }: { task?: RecordsSettingsTask }) {
  const selected = settingsTasks.find((item) => item.key === task);
  return (
    <CustomBreadcrumbs
      heading={selected?.title ?? 'Student Records Settings'}
      description={
        selected?.description ??
        'Configure school rules for daily records, documents, and student transitions.'
      }
      links={[
        { name: 'Students', href: studentPaths.dashboard },
        { name: 'Student Records', href: studentPaths.records.root },
        { name: 'Settings', ...(task ? { href: studentPaths.records.settingsWorkspace } : {}) },
        ...(selected ? [{ name: selected.title }] : []),
      ]}
    />
  );
}

function SettingsNavigator({ task, suffix = '' }: { task?: RecordsSettingsTask; suffix?: string }) {
  return (
    <Box
      component="nav"
      aria-label="Student Records settings tasks"
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          xl: 'repeat(4, minmax(0, 1fr))',
        },
        gap: 1.5,
      }}
    >
      {settingsTasks.map((item) => (
        <Paper
          key={item.key}
          component={RouterLink}
          href={`${sectionPath(item.key)}${suffix}`}
          aria-current={task === item.key ? 'page' : undefined}
          variant="outlined"
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            p: 2,
            color: 'inherit',
            textDecoration: 'none',
            borderColor: task === item.key ? 'primary.main' : 'divider',
            '&:hover': { borderColor: 'primary.main' },
            '&:focus-visible': {
              outline: (theme) => `3px solid ${theme.palette.primary.main}`,
              outlineOffset: 2,
            },
          }}
        >
          <Iconify icon={item.icon} width={24} sx={{ color: 'primary.main', flexShrink: 0 }} />
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">{item.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              {item.description}
            </Typography>
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}

export default function RecordsSettings({ task }: { task?: RecordsSettingsTask }) {
  const params = useSearchParams();
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear);
  const scope = params.get('scope') === 'year' ? 'year' : 'school';
  const academicYearId = scope === 'year' ? (params.get('year') ?? currentYear?.id) : undefined;
  const query = useGetStudentRecordsSettingsQuery(academicYearId ? { academicYearId } : undefined, {
    skip: !task || (scope === 'year' && !academicYearId),
  });
  if (!task)
    return (
      <Stack spacing={2}>
        <SettingsHeader />
        <SettingsNavigator />
        <Alert severity="info">
          School defaults apply across academic years. Open a task to save a draft, review its
          effect, and publish it. Academic-year overrides are configured inside each task.
        </Alert>
      </Stack>
    );
  if (scope === 'year' && !academicYearId)
    return (
      <Stack spacing={2}>
        <SettingsHeader task={task} />
        <SettingsNavigator task={task} />
        <Alert severity="warning">
          Select an academic year in the school context before configuring an override.
        </Alert>
        <Button component={RouterLink} href={sectionPath(task)}>
          Open school defaults
        </Button>
      </Stack>
    );
  if (!query.currentData)
    return (
      <Stack spacing={2}>
        <SettingsHeader task={task} />
        <SettingsNavigator task={task} suffix={taskQuery(scope, academicYearId)} />
        {query.isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={() => query.refetch()}>
                Retry
              </Button>
            }
          >
            Student Records settings could not be loaded. Retry before editing.
          </Alert>
        ) : (
          <>
            <Skeleton variant="rounded" height={96} />
            <Skeleton variant="rounded" height={280} />
          </>
        )}
      </Stack>
    );
  return (
    <RecordsSettingsEditor
      key={`${scope}-${academicYearId ?? 'school'}-${task}`}
      task={task}
      initial={query.currentData}
      academicYearId={academicYearId}
      reload={() => query.refetch().unwrap()}
    />
  );
}

function RecordsSettingsEditor({
  task,
  initial,
  academicYearId,
  reload,
}: {
  task: RecordsSettingsTask;
  initial: StudentRecordsSettings;
  academicYearId?: string;
  reload: () => Promise<StudentRecordsSettings>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canEdit = hasGrantedPermission(permissions, 'Students.Records.Settings.Add');
  const canPublish = hasGrantedPermission(permissions, 'Students.Records.Settings.Publish');
  const [record, setRecord] = useState(initial);
  const [preview, setPreview] = useState<{
    result: RecordsPolicyPreview;
    signature: string;
  } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [save, saveState] = useSaveStudentRecordsDraftMutation();
  const [previewPolicy, previewState] = usePreviewStudentRecordsPolicyMutation();
  const [publish, publishState] = usePublishStudentRecordsPolicyMutation();
  const roleQuery = useGetStudentRecordsSettingsRolesQuery(undefined, {
    skip: task !== 'changes' && task !== 'access',
  });
  const busy = saveState.isLoading || previewState.isLoading || publishState.isLoading;
  const form = useFormik({
    initialValues: initial.draftPolicy,
    validationSchema: recordsPolicySchema,
    onSubmit: async (values) => {
      setFailure(null);
      try {
        const saved = await save({
          academicYearId,
          concurrencyStamp: record.concurrencyStamp,
          policy: values,
        }).unwrap();
        setRecord(saved);
        form.resetForm({ values: saved.draftPolicy });
        setPreview(null);
        shikshaMitraToast.success({
          message: 'Student Records draft saved. Published rules have not changed.',
        });
      } catch (error) {
        setFailure(
          (error as { status?: number })?.status === 409
            ? 'Another staff member changed this configuration. Reload the saved draft and review your changes before retrying.'
            : 'The draft could not be saved. Check the rules and retry. Your changes are still available.'
        );
      }
    },
  });
  const guard = useUnsavedNavigation(form.dirty, { push: router.push });
  const signature = JSON.stringify(form.values);
  const previewCurrent = preview?.signature === signature;
  const roleOptions =
    roleQuery.data?.items.map((role) => ({ value: role.name, label: role.name })) ?? [];
  const validate = async () => {
    const errors = await form.validateForm();
    if (!Object.keys(errors).length) return true;
    await form.submitForm();
    setFailure('Review the highlighted rules before saving or previewing.');
    return false;
  };
  const requestPreview = async () => {
    if (!(await validate())) return;
    setFailure(null);
    try {
      const result = await previewPolicy({
        academicYearId,
        concurrencyStamp: record.concurrencyStamp,
        policy: form.values,
      }).unwrap();
      setPreview({ result, signature });
      setPreviewOpen(true);
    } catch (error) {
      setFailure(
        (error as { status?: number })?.status === 409
          ? 'This draft changed on the server. Reload before previewing.'
          : 'These rules could not be previewed. Check role choices and policy fields, then retry.'
      );
    }
  };
  const publishDraft = async () => {
    if (form.dirty || !previewCurrent || !record.concurrencyStamp || !canPublish) return;
    setFailure(null);
    try {
      const published = await publish({
        academicYearId,
        concurrencyStamp: record.concurrencyStamp,
      }).unwrap();
      setRecord(published);
      form.resetForm({ values: published.draftPolicy });
      setConfirmPublish(false);
      setPreview(null);
      shikshaMitraToast.success({ message: 'Student Records rules published.' });
    } catch (error) {
      setConfirmPublish(false);
      setFailure(
        (error as { status?: number })?.status === 409
          ? 'Another staff member changed the draft. Reload, preview, and publish again.'
          : 'Publishing failed. The existing published rules remain in effect. Retry after reviewing the draft.'
      );
    }
  };
  const reloadDraft = async () => {
    try {
      const saved = await reload();
      setRecord(saved);
      form.resetForm({ values: saved.draftPolicy });
      setPreview(null);
      setFailure(null);
    } catch {
      setFailure(
        'The saved draft could not be reloaded. Your current changes are still available.'
      );
    }
  };
  const editor = {
    form,
    disabled: !canEdit || busy,
    roles: roleOptions,
    rolesUnavailable: roleQuery.isLoading || roleQuery.isError,
  };
  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      <SettingsHeader task={task} />
      <SettingsNavigator
        task={task}
        suffix={taskQuery(academicYearId ? 'year' : 'school', academicYearId)}
      />
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
          <CustomSelect
            label="Configuration scope"
            value={academicYearId ? 'year' : 'school'}
            options={[
              { value: 'school', label: 'School defaults' },
              ...(currentYear?.id
                ? [
                    {
                      value: 'year',
                      label: `${currentYear.name ?? 'Selected academic year'} override`,
                    },
                  ]
                : []),
            ]}
            onChange={(value) =>
              guard.requestNavigation(() =>
                router.push(
                  recordsQueryUrl(pathname, params.toString(), {
                    scope: value === 'year' ? 'year' : undefined,
                    year: value === 'year' ? currentYear?.id : undefined,
                  })
                )
              )
            }
            disabled={busy}
            formControlProps={{ sx: { minWidth: { md: 260 } } }}
          />
          <Box sx={{ flex: 1 }}>
            <Label color={record.isStarter ? 'warning' : 'success'}>
              {record.isStarter
                ? 'Starter rules in use'
                : `Published version ${record.publishedVersionNumber}`}
            </Label>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {academicYearId
                ? 'This draft applies to the selected academic year when published.'
                : 'These defaults apply to years without a published override.'}{' '}
              {form.dirty ? 'Unsaved changes.' : 'Draft loaded.'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Button
              disabled={!canEdit || busy || (!form.dirty && Boolean(record.id))}
              loading={saveState.isLoading}
              onClick={() => form.submitForm()}
            >
              Save draft
            </Button>
            <Button disabled={busy} loading={previewState.isLoading} onClick={requestPreview}>
              Preview rules
            </Button>
            <Button
              variant="contained"
              disabled={
                !canPublish || busy || form.dirty || !previewCurrent || !record.concurrencyStamp
              }
              loading={publishState.isLoading}
              onClick={() => setConfirmPublish(true)}
            >
              Publish
            </Button>
          </Stack>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Save the draft, then preview the saved rules to enable Publish. Existing requests retain
          their original rules.
        </Typography>
      </Paper>
      {!canEdit && (
        <Alert severity="info">
          You can review these settings. Ask an authorized administrator to edit the draft.
        </Alert>
      )}
      {failure && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => guard.requestNavigation(reloadDraft)}>
              Reload saved draft
            </Button>
          }
        >
          {failure}
        </Alert>
      )}
      {roleQuery.isError && (task === 'changes' || task === 'access') && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => roleQuery.refetch()}>
              Retry
            </Button>
          }
        >
          Security roles could not be loaded. Existing selections are preserved; role selection is
          unavailable until this succeeds.
        </Alert>
      )}
      <Box component="form" onSubmit={form.handleSubmit} noValidate>
        {task === 'changes' && <ChangesSettings {...editor} />}
        {task === 'documents' && <DocumentsSettings {...editor} />}
        {task === 'transitions' && <TransitionsSettings {...editor} />}
        {task === 'access' && <AccessSettings {...editor} />}
      </Box>
      {guard.confirmation}
      <CustomDialog
        open={previewOpen}
        handleClose={() => setPreviewOpen(false)}
        title="Review Student Records rules"
        hasForm={false}
        maxWidth="sm"
      >
        <DialogScrollContent>
          <Stack spacing={1.5}>
            {preview?.result.summary.map((line, index) => (
              <Typography key={index} variant="body2">
                {line}
              </Typography>
            ))}
            {!previewCurrent && (
              <Alert severity="warning">
                The draft changed after this preview. Preview again before publishing.
              </Alert>
            )}
          </Stack>
        </DialogScrollContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close preview</Button>
        </DialogActions>
      </CustomDialog>
      <CustomDialog
        open={confirmPublish}
        handleClose={() => !busy && setConfirmPublish(false)}
        title="Publish Student Records rules?"
        hasForm={false}
        maxWidth="xs"
      >
        <DialogScrollContent>
          <Typography variant="body2">
            New operations will use these rules for{' '}
            {academicYearId ? 'this academic year' : 'the school default scope'}. Requests already
            submitted keep their original approval rules.
          </Typography>
        </DialogScrollContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setConfirmPublish(false)}>
            Keep draft
          </Button>
          <Button variant="contained" loading={publishState.isLoading} onClick={publishDraft}>
            Publish rules
          </Button>
        </DialogActions>
      </CustomDialog>
    </Stack>
  );
}
