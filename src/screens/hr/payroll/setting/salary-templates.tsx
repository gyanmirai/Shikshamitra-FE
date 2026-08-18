'use client';

import type { RootState } from 'src/redux/store';
import type { MouseEvent, KeyboardEvent } from 'react';
import type {
  IData,
  IColumn,
  CustomizableTableRowProps,
} from 'src/components/customizabaleTable/types';
import type { SalaryTemplate } from 'src/redux/hr/salary-template-api';

import * as Yup from 'yup';
import { toast } from 'sonner';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { useMemo, useState, useCallback } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  useGetSalaryTemplatesQuery,
  useCloneSalaryTemplateMutation,
  useCreateSalaryTemplateMutation,
  useArchiveSalaryTemplateMutation,
  useSetDefaultSalaryTemplateMutation,
  useCreateSalaryTemplateVersionMutation,
} from 'src/redux/hr/salary-template-api';
import {
  Box,
  Grid,
  Card,
  Link,
  Alert,
  Button,
  Skeleton,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  CardContent,
  CardActions,
  ListItemIcon,
  ListItemText,
  ToggleButton,
  DialogActions,
  CardActionArea,
  ToggleButtonGroup,
} from '@mui/material';

const templateSchema = Yup.object({
  name: Yup.string().trim().required('Template name is required.').max(160),
  description: Yup.string().trim().max(500),
});

type DialogIntent = 'create' | 'clone';
type SalaryTemplateView = 'table' | 'cards';
type SalaryTemplateTableRow = SalaryTemplate & {
  versionNumber: number;
  componentCount: number;
};

type TemplateTableActionsProps = {
  template: SalaryTemplate;
  busy: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canPublish: boolean;
  canSetDefault: boolean;
  canArchive: boolean;
  onOpen: (template: SalaryTemplate) => void;
  onCreateVersion: (template: SalaryTemplate) => Promise<void>;
  onSetDefault: (template: SalaryTemplate) => Promise<void>;
  onClone: (template: SalaryTemplate) => void;
  onArchive: (template: SalaryTemplate) => void;
};

const statusColor: Record<SalaryTemplate['status'], 'success' | 'warning' | 'default'> = {
  PUBLISHED: 'success',
  DRAFT: 'warning',
  ARCHIVED: 'default',
};

function templateEditorPath(template: SalaryTemplate) {
  return hrPaths.payroll.settings.salaryTemplateEditor(template.id, template.latest.id);
}

function TemplateStatus({ template }: { template: SalaryTemplate }) {
  return (
    <Box display="flex" alignItems="center" gap={0.75} flexWrap="wrap">
      <Label color={statusColor[template.status]}>{template.status}</Label>
      {template.isDefault ? (
        <Label
          color="primary"
          startIcon={<Iconify icon="mdi:star" width={16} aria-hidden="true" />}
        >
          Default
        </Label>
      ) : null}
    </Box>
  );
}

function TemplateTableActions({
  template,
  busy,
  canAdd,
  canEdit,
  canPublish,
  canSetDefault,
  canArchive,
  onOpen,
  onCreateVersion,
  onSetDefault,
  onClone,
  onArchive,
}: TemplateTableActionsProps) {
  const canOpenDraft = (canEdit || canPublish) && template.latest.status === 'DRAFT';
  const canCreateVersion =
    canEdit && template.latest.status === 'PUBLISHED' && template.status !== 'ARCHIVED';
  const canChooseDefault = canSetDefault && template.status === 'PUBLISHED' && !template.isDefault;
  const showMoreActions = canCreateVersion || canChooseDefault || canAdd || canArchive;

  return (
    <ThreeDotsActions
      showViewIcon
      showEditIcon={canOpenDraft}
      showThreeDots={showMoreActions}
      viewLabel={`View ${template.name}`}
      editLabel={`${canEdit ? 'Edit' : 'Review'} ${template.name}`}
      moreLabel={`More actions for ${template.name}`}
      disableEditIcon={busy}
      handleViewClick={() => onOpen(template)}
      handleEditClick={() => onOpen(template)}
      actions={({ popover }) => (
        <MenuList dense>
          {canCreateVersion ? (
            <MenuItem
              disabled={busy}
              onClick={async () => {
                popover.onClose();
                await onCreateVersion(template);
              }}
            >
              <ListItemIcon>
                <Iconify icon="mdi:plus" width={18} aria-hidden="true" />
              </ListItemIcon>
              <ListItemText>New draft</ListItemText>
            </MenuItem>
          ) : null}
          {canChooseDefault ? (
            <MenuItem
              disabled={busy}
              onClick={async () => {
                popover.onClose();
                await onSetDefault(template);
              }}
            >
              <ListItemIcon>
                <Iconify icon="mdi:star" width={18} aria-hidden="true" />
              </ListItemIcon>
              <ListItemText>Set default</ListItemText>
            </MenuItem>
          ) : null}
          {canAdd ? (
            <MenuItem
              disabled={busy || template.status === 'ARCHIVED'}
              onClick={() => {
                popover.onClose();
                onClone(template);
              }}
            >
              <ListItemIcon>
                <Iconify icon="mdi:content-copy" width={18} aria-hidden="true" />
              </ListItemIcon>
              <ListItemText>Clone</ListItemText>
            </MenuItem>
          ) : null}
          {canArchive ? (
            <MenuItem
              disabled={busy || template.status === 'ARCHIVED'}
              onClick={() => {
                popover.onClose();
                onArchive(template);
              }}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <Iconify icon="mdi:archive" width={18} aria-hidden="true" />
              </ListItemIcon>
              <ListItemText>Archive</ListItemText>
            </MenuItem>
          ) : null}
        </MenuList>
      )}
    />
  );
}

export default function SalaryTemplateSettings() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
  const view: SalaryTemplateView = searchParams.get('view') === 'cards' ? 'cards' : 'table';
  const busy =
    defaultState.isLoading ||
    archiveState.isLoading ||
    cloneState.isLoading ||
    createState.isLoading ||
    versionState.isLoading;

  const templateItems = useMemo(() => data?.items || [], [data?.items]);
  const tableRows = useMemo<SalaryTemplateTableRow[]>(
    () =>
      templateItems.map((template) => ({
        ...template,
        versionNumber: template.latest.versionNumber,
        componentCount: template.latest.rules.length,
      })),
    [templateItems]
  );

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
        router.push(templateEditorPath(result));
      } catch {
        toast.error('Unable to create the salary template.');
      }
    },
  });
  const resetTemplateForm = formik.resetForm;

  const openCreateDialog = () => {
    formik.resetForm();
    setCloneSource(null);
    setDialogIntent('create');
  };

  const openCloneDialog = useCallback(
    (template: SalaryTemplate) => {
      resetTemplateForm({ values: { name: `${template.name} Copy`, description: '' } });
      setCloneSource(template);
      setDialogIntent('clone');
    },
    [resetTemplateForm]
  );

  const openTemplate = useCallback(
    (template: SalaryTemplate) => {
      router.push(templateEditorPath(template));
    },
    [router]
  );

  const getTemplateRowProps = useCallback(
    (row: IData): CustomizableTableRowProps => {
      const template = row as SalaryTemplateTableRow;
      return {
        role: 'link',
        tabIndex: 0,
        'aria-label': `Open ${template.name}`,
        onClick: () => openTemplate(template),
        onKeyDown: (event: KeyboardEvent<HTMLTableRowElement>) => {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          openTemplate(template);
        },
        sx: {
          cursor: 'pointer',
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: -2,
          },
        },
      };
    },
    [openTemplate]
  );

  const run = useCallback(async (action: () => Promise<unknown>, message: string) => {
    try {
      await action();
      toast.success(message);
      return true;
    } catch {
      toast.error('Unable to update the salary template.');
      return false;
    }
  }, []);

  const createDraftVersion = useCallback(
    async (template: SalaryTemplate) => {
      try {
        const result = await createVersion(template.id).unwrap();
        router.push(templateEditorPath(result));
      } catch {
        toast.error('Unable to create a draft version.');
      }
    },
    [createVersion, router]
  );

  const setDefaultTemplate = useCallback(
    async (template: SalaryTemplate) => {
      await run(() => setDefault(template.id).unwrap(), 'Default template updated.');
    },
    [run, setDefault]
  );

  const handleViewChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, nextView: SalaryTemplateView | null) => {
      if (!nextView || nextView === view) return;
      const nextParams = new URLSearchParams(searchParams.toString());
      if (nextView === 'cards') nextParams.set('view', 'cards');
      else nextParams.delete('view');
      const query = nextParams.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams, view]
  );

  const tableColumns = useMemo<IColumn[]>(
    () => [
      {
        id: 'name',
        label: 'Template',
        filterType: 'string',
        sticky: true,
        stickyPosition: 'left',
        minWidth: 220,
        render: (value, row) => {
          const template = row as SalaryTemplateTableRow;
          return (
            <Link
              component={RouterLink}
              href={templateEditorPath(template)}
              underline="hover"
              color="text.primary"
              fontWeight={600}
              onClick={(event: MouseEvent<HTMLAnchorElement>) => event.stopPropagation()}
              sx={{ display: 'inline-block', maxWidth: 280, overflowWrap: 'anywhere' }}
            >
              {value}
            </Link>
          );
        },
      },
      {
        id: 'description',
        label: 'Description',
        filterType: 'string',
        minWidth: 300,
        render: (value) => (
          <Typography
            variant="body2"
            color="text.secondary"
            title={value || 'No description provided.'}
            sx={{
              maxWidth: 440,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflowWrap: 'anywhere',
            }}
          >
            {value || 'No description provided.'}
          </Typography>
        ),
      },
      {
        id: 'versionNumber',
        label: 'Latest Version',
        filterType: 'number',
        align: 'right',
        minWidth: 130,
      },
      {
        id: 'componentCount',
        label: 'Components',
        filterType: 'number',
        align: 'right',
        minWidth: 120,
      },
      {
        id: 'status',
        label: 'Status',
        filterType: 'enum',
        enumOptions: [
          { label: 'Draft', value: 'DRAFT' },
          { label: 'Published', value: 'PUBLISHED' },
          { label: 'Archived', value: 'ARCHIVED' },
        ],
        sticky: true,
        stickyPosition: 'right',
        minWidth: 170,
        render: (_value, row) => <TemplateStatus template={row as SalaryTemplateTableRow} />,
      },
      {
        id: 'action',
        label: 'Actions',
        sticky: true,
        stickyPosition: 'right',
        isSort: false,
        isFilter: false,
        excludeFromExport: true,
        minWidth: 120,
        render: (_value, row) => (
          <TemplateTableActions
            template={row as SalaryTemplateTableRow}
            busy={busy}
            canAdd={canAdd}
            canEdit={canEdit}
            canPublish={canPublish}
            canSetDefault={canSetDefault}
            canArchive={canArchive}
            onOpen={openTemplate}
            onCreateVersion={createDraftVersion}
            onSetDefault={setDefaultTemplate}
            onClone={openCloneDialog}
            onArchive={setArchiveTarget}
          />
        ),
      },
    ],
    [
      busy,
      canAdd,
      canArchive,
      canEdit,
      canPublish,
      canSetDefault,
      createDraftVersion,
      openCloneDialog,
      openTemplate,
      setDefaultTemplate,
    ]
  );

  return (
    <>
      <Box display="flex" flexDirection="column" flex={1} minHeight={0}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="flex-end"
          gap={1}
          mb={2}
          flexWrap="wrap"
        >
          <ToggleButtonGroup
            exclusive
            size="small"
            value={view}
            onChange={handleViewChange}
            aria-label="Salary template view"
          >
            <ToggleButton value="table" aria-label="Table view" sx={{ gap: 0.75 }}>
              <Iconify icon="mdi:table" width={18} aria-hidden="true" />
              Table
            </ToggleButton>
            <ToggleButton value="cards" aria-label="Card view" sx={{ gap: 0.75 }}>
              <Iconify icon="mdi:view-grid" width={18} aria-hidden="true" />
              Cards
            </ToggleButton>
          </ToggleButtonGroup>
          {canAdd ? (
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon="mdi:plus" width={18} aria-hidden="true" />}
              disabled={busy}
              onClick={openCreateDialog}
            >
              Create Template
            </Button>
          ) : null}
        </Box>

        {isError ? (
          <Alert severity="error" action={<Button onClick={() => refetch()}>Retry</Button>}>
            Unable to load salary templates. Retry to continue.
          </Alert>
        ) : null}

        {!isError && view === 'table' ? (
          <CustomizableTable
            tableId="salary-template-table"
            tableTitle="Salary Templates"
            columns={tableColumns}
            data={tableRows}
            isLoading={isLoading}
            rowProps={getTemplateRowProps}
            noDataText="No salary templates are available. Create a blank template to begin."
            wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
            tableContainerProps={{ sx: { height: '100%' } }}
          />
        ) : null}

        {!isError && view === 'cards' ? (
          <Box flex={1} minHeight={0} overflow="auto" pr={0.5}>
            {isLoading ? (
              <Grid container spacing={2} aria-label="Loading salary templates">
                {[0, 1, 2].map((item) => (
                  <Grid key={item} size={{ xs: 12, md: 6, xl: 4 }}>
                    <Card variant="outlined" sx={{ p: 2, minHeight: 220 }}>
                      <Skeleton width="65%" height={34} />
                      <Skeleton width="90%" />
                      <Skeleton width="75%" />
                      <Skeleton width="45%" sx={{ mt: 3 }} />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : null}
            {!isLoading && !templateItems.length ? (
              <Alert severity="warning">
                No salary templates are available. Create a blank template to begin.
              </Alert>
            ) : null}
            {!isLoading && templateItems.length ? (
              <Grid container spacing={2}>
                {templateItems.map((template) => (
                  <Grid key={template.id} size={{ xs: 12, md: 6, xl: 4 }}>
                    <Card
                      variant="outlined"
                      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                    >
                      <CardActionArea
                        component={RouterLink}
                        href={templateEditorPath(template)}
                        aria-label={`Open ${template.name}`}
                        sx={{ flex: 1, display: 'flex', alignItems: 'stretch' }}
                      >
                        <CardContent sx={{ flex: 1, width: '100%' }}>
                          <Box display="flex" alignItems="center" gap={1} mb={1} flexWrap="wrap">
                            <Typography variant="h6" sx={{ overflowWrap: 'anywhere' }}>
                              {template.name}
                            </Typography>
                            <TemplateStatus template={template} />
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={1.5}
                            sx={{ overflowWrap: 'anywhere' }}
                          >
                            {template.description || 'No description provided.'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Latest version: {template.latest.versionNumber} ·{' '}
                            {template.latest.rules.length} components
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                      <CardActions sx={{ flexWrap: 'wrap' }}>
                        {canEdit &&
                        template.latest.status === 'PUBLISHED' &&
                        template.status !== 'ARCHIVED' ? (
                          <Button
                            size="small"
                            startIcon={<Iconify icon="mdi:plus" width={18} aria-hidden="true" />}
                            disabled={busy}
                            onClick={() => createDraftVersion(template)}
                          >
                            New draft
                          </Button>
                        ) : null}
                        {(canEdit || canPublish) && template.latest.status === 'DRAFT' ? (
                          <Button
                            size="small"
                            startIcon={
                              <Iconify
                                icon={canEdit ? 'mdi:pencil' : 'mdi:eye'}
                                width={18}
                                aria-hidden="true"
                              />
                            }
                            disabled={busy}
                            onClick={() => openTemplate(template)}
                          >
                            {canEdit ? 'Edit draft' : 'Review draft'}
                          </Button>
                        ) : null}
                        {canSetDefault && template.status === 'PUBLISHED' && !template.isDefault ? (
                          <Button
                            size="small"
                            startIcon={<Iconify icon="mdi:star" width={18} aria-hidden="true" />}
                            disabled={busy}
                            onClick={() => setDefaultTemplate(template)}
                          >
                            Set default
                          </Button>
                        ) : null}
                        {canAdd ? (
                          <Button
                            size="small"
                            startIcon={
                              <Iconify icon="mdi:content-copy" width={18} aria-hidden="true" />
                            }
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
                            startIcon={<Iconify icon="mdi:archive" width={18} aria-hidden="true" />}
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
            ) : null}
          </Box>
        ) : null}
      </Box>

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
              autoComplete="off"
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
                autoComplete="off"
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
