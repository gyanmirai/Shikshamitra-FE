'use client';

import type { MouseEvent } from 'react';
import type { RootState } from 'src/redux/store';
import type { SalaryTemplate } from 'src/redux/hr/salary-template-api';
import type {
  IData,
  IColumn,
  CustomizableTableRowProps,
} from 'src/components/customizabaleTable/types';

import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import { useId, useMemo, useState, useCallback } from 'react';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  useGetSalaryTemplatesQuery,
  useArchiveSalaryTemplateMutation,
  useSetDefaultSalaryTemplateMutation,
} from 'src/redux/hr/salary-template-api';
import {
  Box,
  Link,
  Alert,
  Button,
  Select,
  MenuItem,
  MenuList,
  Typography,
  InputLabel,
  FormControl,
  ListItemIcon,
  ListItemText,
  DialogActions,
} from '@mui/material';

type SalaryTemplateRow = SalaryTemplate & {
  defaultLabel: string;
  activeVersionLabel: string;
  componentCount: number;
  updatedLabel: string;
};

const statusColor: Record<SalaryTemplate['status'], 'success' | 'warning' | 'default'> = {
  ACTIVE: 'success',
  NEEDS_SETUP: 'warning',
  ARCHIVED: 'default',
};

const statusLabel: Record<SalaryTemplate['status'], string> = {
  ACTIVE: 'Active',
  NEEDS_SETUP: 'Needs setup',
  ARCHIVED: 'Archived',
};

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
  const canSetDefault = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.salaryTemplateActions.setDefault
  );
  const canArchive = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.salaryTemplateActions.archive
  );
  const { data, isLoading, isError, error: tableError, refetch } = useGetSalaryTemplatesQuery();
  const [setDefault, defaultState] = useSetDefaultSalaryTemplateMutation();
  const [archive, archiveState] = useArchiveSalaryTemplateMutation();
  const [archiveTarget, setArchiveTarget] = useState<SalaryTemplate | null>(null);
  const [replacementId, setReplacementId] = useState('');

  const replacementLabelId = useId();
  const templates = useMemo(() => data?.items || [], [data?.items]);
  const rows = useMemo<SalaryTemplateRow[]>(
    () =>
      templates.map((template) => ({
        ...template,
        defaultLabel: template.isDefault ? 'School default' : 'No',
        activeVersionLabel: template.activeVersion
          ? `Version ${template.activeVersion}`
          : 'Not active',
        componentCount: template.editableVersion.rules.length,
        updatedLabel: new Intl.DateTimeFormat('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(new Date(template.updatedAt)),
      })),
    [templates]
  );
  const busy = defaultState.isLoading || archiveState.isLoading;

  const editorHref = useCallback(
    (template?: SalaryTemplate) =>
      template
        ? hrPaths.payroll.settings.salaryTemplateEditor(template.id) +
          (template.status === 'ARCHIVED' || !canEdit ? '?mode=view' : '')
        : hrPaths.payroll.settings.salaryTemplateCreate,
    [canEdit]
  );
  const openTemplate = useCallback(
    (template: SalaryTemplate) => router.push(editorHref(template)),
    [editorHref, router]
  );

  const setDefaultTemplate = useCallback(
    async (template: SalaryTemplate) => {
      try {
        await setDefault(template.id).unwrap();
        toast.success(`${template.name} is now the school default.`);
      } catch {
        toast.error('Unable to change the school default template.');
      }
    },
    [setDefault]
  );

  const confirmArchive = async () => {
    if (!archiveTarget) return;
    try {
      await archive({
        id: archiveTarget.id,
        replacementDefaultTemplateId: archiveTarget.isDefault ? replacementId : null,
      }).unwrap();
      toast.success(`${archiveTarget.name} was archived.`);
      setArchiveTarget(null);
      setReplacementId('');
    } catch {
      toast.error('Unable to archive the salary template.');
    }
  };

  const rowProps = useCallback(
    (row: IData): CustomizableTableRowProps => {
      const template = row as SalaryTemplateRow;
      return {
        onClick: () => openTemplate(template),
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

  const columns = useMemo<IColumn[]>(
    () => [
      {
        id: 'name',
        label: 'Template',
        filterType: 'string',
        sticky: true,
        stickyPosition: 'left',
        minWidth: 220,
        render: (value, row) => {
          const template = row as SalaryTemplateRow;
          return (
            <Link
              component={RouterLink}
              href={editorHref(template)}
              color="text.primary"
              fontWeight={600}
              underline="hover"
              onClick={(event: MouseEvent<HTMLAnchorElement>) => event.stopPropagation()}
              sx={{ display: 'inline-block', maxWidth: 280, overflowWrap: 'anywhere' }}
            >
              {value}
            </Link>
          );
        },
      },
      {
        id: 'defaultLabel',
        label: 'Default',
        filterType: 'enum',
        enumOptions: [
          { label: 'School default', value: 'School default' },
          { label: 'No', value: 'No' },
        ],
        minWidth: 140,
        render: (value) =>
          value === 'School default' ? <Label color="primary">School default</Label> : 'No',
      },
      {
        id: 'activeVersion',
        label: 'Active version',
        filterType: 'number',
        minWidth: 140,
        render: (_value, row) => row.activeVersionLabel,
        exportValue: (_value, row) => String(row.activeVersionLabel),
      },
      {
        id: 'componentCount',
        label: 'Components',
        filterType: 'number',
        align: 'right',
        minWidth: 120,
      },
      {
        id: 'updatedAt',
        label: 'Last updated',
        filterType: 'date',
        minWidth: 150,
        render: (_value, row) => row.updatedLabel,
      },
      {
        id: 'status',
        label: 'Status',
        filterType: 'enum',
        enumOptions: [
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Needs setup', value: 'NEEDS_SETUP' },
          { label: 'Archived', value: 'ARCHIVED' },
        ],
        minWidth: 130,
        render: (_, row) => {
          const template = row as SalaryTemplateRow;
          return <Label color={statusColor[template.status]}>{statusLabel[template.status]}</Label>;
        },
      },
      {
        id: 'actions',
        label: 'Actions',
        sticky: true,
        stickyPosition: 'right',
        isSort: false,
        isFilter: false,
        excludeFromExport: true,
        minWidth: 120,
        render: (_, row) => {
          const template = row as SalaryTemplateRow;
          const editable = canEdit && template.status !== 'ARCHIVED';
          const canChooseDefault =
            canSetDefault && template.status === 'ACTIVE' && !template.isDefault;
          return (
            <Box
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <ThreeDotsActions
                deleteLabel={`Delete ${String(row.fullName || row.employeeName || row.name || row.title || row.policyTitle || row.id || 'record')}`}
                showViewIcon={!editable}
                showEditIcon={editable}
                showThreeDots={canChooseDefault || (canArchive && template.status !== 'ARCHIVED')}
                viewLabel={`View ${template.name}`}
                editLabel={`Edit ${template.name}`}
                moreLabel={`More actions for ${template.name}`}
                disableEditIcon={busy}
                handleViewClick={() => openTemplate(template)}
                handleEditClick={() => openTemplate(template)}
                actions={({ popover }) => (
                  <MenuList dense>
                    {canChooseDefault ? (
                      <MenuItem
                        onClick={() => {
                          popover.onClose();
                          setDefaultTemplate(template);
                        }}
                      >
                        <ListItemIcon>
                          <Iconify icon="mdi:star" width={18} />
                        </ListItemIcon>
                        <ListItemText>Set as school default</ListItemText>
                      </MenuItem>
                    ) : null}
                    {canArchive && template.status !== 'ARCHIVED' ? (
                      <MenuItem
                        sx={{ color: 'error.main' }}
                        onClick={() => {
                          popover.onClose();
                          setArchiveTarget(template);
                        }}
                      >
                        <ListItemIcon sx={{ color: 'inherit' }}>
                          <Iconify icon="mdi:archive" width={18} />
                        </ListItemIcon>
                        <ListItemText>Archive</ListItemText>
                      </MenuItem>
                    ) : null}
                  </MenuList>
                )}
              />
            </Box>
          );
        },
      },
    ],
    [busy, canArchive, canEdit, canSetDefault, editorHref, openTemplate, setDefaultTemplate]
  );

  const replacementOptions = templates.filter(
    (template) => template.id !== archiveTarget?.id && template.status === 'ACTIVE'
  );

  return (
    <Box sx={{ height: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        sx={{
          flexShrink: 0,
          display: { xs: 'grid', lg: 'flex' },
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 1,
          py: { xs: 1, lg: 0 },
          '& > *': { m: '0 !important' },
          '& > .MuiStack-root': { flexShrink: 0 },
        }}
        slotProps={{
          heading: {},
          action: { justifySelf: 'end' },
          moreLink: {},
          breadcrumbs: { minWidth: 0, '& .MuiBreadcrumbs-li': { whiteSpace: 'nowrap' } },
        }}
        heading="Salary Templates"
        description="Create reusable salary defaults. Changes apply to future salary setups; existing staff salaries stay unchanged."
        links={[
          { name: 'Payroll Management', href: hrPaths.payroll.root },
          { name: 'Salary Templates' },
        ]}
        action={
          canAdd ? (
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon="mdi:plus" width={18} />}
              onClick={() => router.push(editorHref())}
              sx={{ minWidth: 140 }}
            >
              Create Template
            </Button>
          ) : null
        }
      />

      {isError ? (
        <Alert
          severity="error"
          action={
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:refresh" />}
              onClick={() => refetch()}
            >
              Retry
            </Button>
          }
        >
          Unable to load salary templates.
        </Alert>
      ) : (
        <CustomizableTable
          showColumns
          showExport
          showFullScreen
          exportScope="all"
          tableId="salary-template-table"
          tableTitle="Salary templates"
          error={tableError}
          onRetry={refetch}
          columns={columns}
          data={rows}
          isLoading={isLoading}
          rowProps={rowProps}
          noDataText="No salary templates are available. Create the school default template to begin."
          wrapperProps={{ sx: { flex: 1, minHeight: 0, overflow: 'hidden' } }}
          tableContainerProps={{ sx: { height: '100%' } }}
        />
      )}

      <CustomDialog
        open={Boolean(archiveTarget)}
        handleClose={() => {
          if (!archiveState.isLoading) {
            setArchiveTarget(null);
            setReplacementId('');
          }
        }}
        title="Archive salary template?"
        maxWidth="sm"
        hasForm={false}
      >
        <DialogScrollContent>
          <Typography mb={2}>
            Existing staff salary revisions will remain unchanged. This template will no longer be
            available for new salary setups.
          </Typography>
          {archiveTarget?.isDefault ? (
            replacementOptions.length ? (
              <FormControl fullWidth required size="small">
                <InputLabel id={replacementLabelId}>Replacement school default</InputLabel>
                <Select
                  size="small"
                  labelId={replacementLabelId}
                  label="Replacement school default"
                  value={replacementId}
                  onChange={(event) => setReplacementId(event.target.value)}
                >
                  {replacementOptions.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Alert severity="warning">
                Create another active template before archiving the school default.
              </Alert>
            )
          ) : null}
        </DialogScrollContent>
        <DialogActions>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:close" />}
            disabled={archiveState.isLoading}
            onClick={() => {
              setArchiveTarget(null);
              setReplacementId('');
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            size="small"
            loading={archiveState.isLoading}
            startIcon={<Iconify icon="mdi:archive" />}
            color="error"
            variant="contained"
            disabled={busy || Boolean(archiveTarget?.isDefault && !replacementId)}
            onClick={confirmArchive}
          >
            Archive
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
}
