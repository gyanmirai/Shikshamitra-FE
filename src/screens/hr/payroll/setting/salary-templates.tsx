'use client';

import type { RootState } from 'src/redux/store';
import type { SalaryTemplate } from 'src/redux/hr/salary-template-api';

import * as Yup from 'yup';
import { toast } from 'sonner';
import { useState } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Add, Edit, Star, Archive, Preview, ContentCopy } from '@mui/icons-material';
import {
  Box,
  Grid,
  Chip,
  Card,
  Alert,
  Button,
  TextField,
  Typography,
  CardContent,
  CardActions,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  useGetSalaryTemplatesQuery,
  useCloneSalaryTemplateMutation,
  useCreateSalaryTemplateMutation,
  useArchiveSalaryTemplateMutation,
  useSetDefaultSalaryTemplateMutation,
  useCreateSalaryTemplateVersionMutation,
} from 'src/redux/hr/salary-template-api';

const templateSchema = Yup.object({
  name: Yup.string().trim().required('Template name is required.').max(160),
  description: Yup.string().trim().max(500),
});

type DialogIntent = 'create' | 'clone';

export default function SalaryTemplateSettings() {
  const router = useRouter();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canAdd = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.salaryTemplateActions.add
  );
  const canEdit = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.salaryTemplateActions.edit
  );
  const canPublish = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.salaryTemplateActions.publish
  );
  const canSetDefault = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.salaryTemplateActions.setDefault
  );
  const canArchive = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.salaryTemplateActions.archive
  );
  const { data, isLoading, isError, refetch } = useGetSalaryTemplatesQuery();
  const [setDefault, defaultState] = useSetDefaultSalaryTemplateMutation();
  const [archive, archiveState] = useArchiveSalaryTemplateMutation();
  const [clone, cloneState] = useCloneSalaryTemplateMutation();
  const [createTemplate, createState] = useCreateSalaryTemplateMutation();
  const [createVersion, versionState] = useCreateSalaryTemplateVersionMutation();
  const [dialogIntent, setDialogIntent] = useState<DialogIntent | null>(null);
  const [cloneSource, setCloneSource] = useState<SalaryTemplate | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<SalaryTemplate | null>(null);
  const busy =
    defaultState.isLoading ||
    archiveState.isLoading ||
    cloneState.isLoading ||
    createState.isLoading ||
    versionState.isLoading;

  const closeTemplateDialog = () => {
    setDialogIntent(null);
    setCloneSource(null);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: { name: '', description: '' },
    validationSchema: templateSchema,
    onSubmit: async (values) => {
      try {
        const result =
          dialogIntent === 'clone' && cloneSource
            ? await clone({ id: cloneSource.id, name: values.name.trim() }).unwrap()
            : await createTemplate({
                name: values.name.trim(),
                description: values.description.trim() || null,
              }).unwrap();
        closeTemplateDialog();
        toast.success(
          dialogIntent === 'clone' ? 'Template cloned as a draft.' : 'Blank template created.'
        );
        router.push(hrPaths.payroll.settings.salaryTemplateEditor(result.id, result.latest.id));
      } catch {
        toast.error('Unable to create the salary template.');
      }
    },
  });

  const openCreateDialog = () => {
    formik.resetForm();
    setCloneSource(null);
    setDialogIntent('create');
  };

  const openCloneDialog = (template: SalaryTemplate) => {
    formik.resetForm({ values: { name: `${template.name} Copy`, description: '' } });
    setCloneSource(template);
    setDialogIntent('clone');
  };

  const run = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action();
      toast.success(message);
      return true;
    } catch {
      toast.error('Unable to update the salary template.');
      return false;
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" action={<Button onClick={() => refetch()}>Retry</Button>}>
        Unable to load salary templates.
      </Alert>
    );
  }

  const templateItems = data?.items || [];

  return (
    <>
      <Box
        display="flex"
        alignItems={{ xs: 'stretch', md: 'flex-start' }}
        gap={2}
        mb={2}
        flexDirection={{ xs: 'column', md: 'row' }}
      >
        <Alert severity="info" sx={{ flex: 1 }}>
          Build templates from your active earning and deduction components. Published versions are
          immutable, and existing employee salary components never change automatically.
        </Alert>
        {canAdd ? (
          <Button
            variant="contained"
            startIcon={<Add />}
            disabled={busy}
            onClick={openCreateDialog}
          >
            Create template
          </Button>
        ) : null}
      </Box>
      {!templateItems.length ? (
        <Alert severity="warning">
          No salary templates are available. Create a blank template to begin.
        </Alert>
      ) : null}
      <Grid container spacing={2}>
        {templateItems.map((template) => (
          <Grid key={template.id} size={{ xs: 12, md: 6, xl: 4 }}>
            <Card
              variant="outlined"
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <CardContent sx={{ flex: 1 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1} flexWrap="wrap">
                  <Typography variant="h6">{template.name}</Typography>
                  <Chip
                    size="small"
                    label={template.status}
                    color={
                      template.status === 'PUBLISHED'
                        ? 'success'
                        : template.status === 'DRAFT'
                          ? 'warning'
                          : 'default'
                    }
                    variant="soft"
                  />
                  {template.isDefault ? (
                    <Chip
                      size="small"
                      icon={<Star />}
                      label="Default"
                      color="primary"
                      variant="soft"
                    />
                  ) : null}
                </Box>
                <Typography variant="body2" color="text.secondary" mb={1.5}>
                  {template.description || 'No description provided.'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Latest version: {template.latest.versionNumber} · {template.latest.rules.length}{' '}
                  components
                </Typography>
              </CardContent>
              <CardActions sx={{ flexWrap: 'wrap' }}>
                {canEdit &&
                template.latest.status === 'PUBLISHED' &&
                template.status !== 'ARCHIVED' ? (
                  <Button
                    size="small"
                    startIcon={<Add />}
                    disabled={busy}
                    onClick={async () => {
                      try {
                        const result = await createVersion(template.id).unwrap();
                        router.push(
                          hrPaths.payroll.settings.salaryTemplateEditor(result.id, result.latest.id)
                        );
                      } catch {
                        toast.error('Unable to create a draft version.');
                      }
                    }}
                  >
                    New draft
                  </Button>
                ) : null}
                {(canEdit || canPublish) && template.latest.status === 'DRAFT' ? (
                  <Button
                    size="small"
                    startIcon={canEdit ? <Edit /> : <Preview />}
                    disabled={busy}
                    onClick={() =>
                      router.push(
                        hrPaths.payroll.settings.salaryTemplateEditor(
                          template.id,
                          template.latest.id
                        )
                      )
                    }
                  >
                    {canEdit ? 'Edit draft' : 'Review draft'}
                  </Button>
                ) : null}
                {canSetDefault && template.status === 'PUBLISHED' && !template.isDefault ? (
                  <Button
                    size="small"
                    startIcon={<Star />}
                    disabled={busy}
                    onClick={() =>
                      run(() => setDefault(template.id).unwrap(), 'Default template updated.')
                    }
                  >
                    Set default
                  </Button>
                ) : null}
                {canAdd ? (
                  <Button
                    size="small"
                    startIcon={<ContentCopy />}
                    disabled={busy || template.status === 'ARCHIVED'}
                    onClick={() => openCloneDialog(template)}
                  >
                    Clone
                  </Button>
                ) : null}
                {canArchive ? (
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Archive />}
                    disabled={busy || template.status === 'ARCHIVED'}
                    onClick={() => setArchiveTarget(template)}
                  >
                    Archive
                  </Button>
                ) : null}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <CustomDialog
        open={Boolean(dialogIntent)}
        handleClose={closeTemplateDialog}
        title={dialogIntent === 'clone' ? 'Clone salary template' : 'Create salary template'}
        maxWidth="sm"
      >
        <DialogScrollContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {dialogIntent === 'clone'
              ? `Copy ${cloneSource?.name || 'this template'} into an independent draft.`
              : 'Start with a blank draft, then add the earning and deduction components you need.'}
          </Typography>
          <Box display="grid" gap={2}>
            <TextField
              autoFocus
              fullWidth
              label="Template name"
              {...formik.getFieldProps('name')}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            {dialogIntent === 'create' ? (
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Description"
                {...formik.getFieldProps('description')}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            ) : null}
          </Box>
        </DialogScrollContent>
        <DialogActions>
          <Button variant="outlined" size="small" onClick={closeTemplateDialog}>
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            disabled={formik.isSubmitting || busy}
            onClick={() => formik.handleSubmit()}
          >
            {dialogIntent === 'clone' ? 'Clone' : 'Create draft'}
          </Button>
        </DialogActions>
      </CustomDialog>

      <CustomDialog
        open={Boolean(archiveTarget)}
        handleClose={() => setArchiveTarget(null)}
        title="Archive salary template?"
        maxWidth="xs"
        hasForm={false}
      >
        <DialogScrollContent>
          <Typography variant="body2" color="text.secondary">
            {archiveTarget?.name} will no longer be available for new salary calculations. Existing
            employee structures and locked payroll snapshots will not change.
          </Typography>
        </DialogScrollContent>
        <DialogActions>
          <Button variant="outlined" size="small" onClick={() => setArchiveTarget(null)}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            size="small"
            disabled={!archiveTarget || archiveState.isLoading}
            onClick={async () => {
              if (!archiveTarget) return;
              const succeeded = await run(
                () => archive(archiveTarget.id).unwrap(),
                'Template archived.'
              );
              if (succeeded) setArchiveTarget(null);
            }}
          >
            Archive
          </Button>
        </DialogActions>
      </CustomDialog>
    </>
  );
}
