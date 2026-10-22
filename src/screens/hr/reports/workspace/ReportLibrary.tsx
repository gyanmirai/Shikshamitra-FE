import type { IColumn } from 'src/components/customizabaleTable/types';
import type { ReportTemplate } from 'src/redux/hr/hrReportingWorkspaceApi';

import { useState } from 'react';
import { RouterLink } from 'src/routes/components';
import { hrReportPaths } from 'src/constants/hr-report-paths';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { Box, Chip, Stack, Alert, Button, MenuItem, TextField } from '@mui/material';
import { useArchiveReportingTemplateMutation } from 'src/redux/hr/hrReportingWorkspaceApi';

import { useReportTableState } from '../hooks/useReportTableState';
import { useHrReportPermissions } from '../hooks/useHrReportPermissions';
import { reportError, reportListPagination } from '../reporting-workspace-utils';

const categories = [
  'All',
  'Staff',
  'Attendance',
  'Leave',
  'Payroll',
  'Performance',
  'Policies and Audit',
];

export function ReportLibrary({
  templates,
  purpose = 'manage',
}: {
  templates: ReportTemplate[];
  purpose?: 'manage' | 'choose';
}) {
  const tableState = useReportTableState();
  const { query, updateQuery } = tableState;
  const permissions = useHrReportPermissions();
  const choosing = purpose === 'choose';
  const requestedCategory = query.get('category') || 'All';
  const category = categories.includes(requestedCategory) ? requestedCategory : 'All';
  const requestedLibrary = query.get('library') || 'all';
  const library = ['all', 'builtin', 'private', 'organization'].includes(requestedLibrary)
    ? requestedLibrary
    : 'all';
  const { page, pageSize } = reportListPagination(query);
  const [archive, setArchive] = useState<ReportTemplate | null>(null);
  const [error, setError] = useState('');
  const [archiveTemplate, archiving] = useArchiveReportingTemplateMutation();
  const filtered = templates.filter(
    (template) =>
      (!choosing || template.publishedRevision > 0) &&
      (category === 'All' ||
        template.category === (category === 'Policies and Audit' ? 'Policies' : category)) &&
      (library === 'all' ||
        (library === 'builtin'
          ? template.isBuiltIn
          : library === 'private'
            ? template.visibility === 'private'
            : template.visibility === 'organization'))
  );
  const columns: IColumn[] = [
    {
      filterType: 'string',
      id: 'name',
      label: 'Template',
      minWidth: 240,
      sticky: true,
      stickyOnMobile: false,
      render: (_, row) => (
        <Stack spacing={0.25}>
          {choosing ? (
            <Box
              component={RouterLink}
              href={hrReportPaths.generate(row.id, query.toString())}
              sx={{ fontWeight: 600, color: 'inherit', textDecoration: 'none' }}
            >
              {row.name}
            </Box>
          ) : (
            <Box component="span" sx={{ fontWeight: 600 }}>
              {row.name}
            </Box>
          )}
          <Box
            component="span"
            sx={{ color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'normal' }}
          >
            {row.description}
          </Box>
        </Stack>
      ),
    },
    {
      filterType: 'string',
      id: 'description',
      label: 'Description',
      minWidth: 240,
      defaultHidden: true,
    },
    {
      id: 'category',
      label: 'Category',
      minWidth: 130,
      filterType: 'enum',
      enumOptions: categories
        .filter((value) => value !== 'All')
        .map((value) => ({
          label: value,
          value: value === 'Policies and Audit' ? 'Policies' : value,
        })),
    },
    {
      filterType: 'enum',
      enumOptions: ['Built-in', 'My template', 'School template'].map((value) => ({
        label: value,
        value,
      })),
      id: 'ownership',
      label: 'Library',
      minWidth: 130,
      render: (value) => <Chip size="small" variant="outlined" label={value} />,
    },
    ...(!choosing
      ? [
          {
            filterType: 'enum' as const,
            enumOptions: ['Draft', 'Published', 'Unpublished changes'].map((value) => ({
              label: value,
              value,
            })),
            id: 'lifecycle',
            label: 'Status',
            minWidth: 140,
            render: (value: string) => <Chip size="small" variant="outlined" label={value} />,
          },
        ]
      : []),
    {
      isSort: false,
      isFilter: false,
      id: 'actions',
      label: 'Actions',
      minWidth: choosing ? 150 : 120,
      sticky: true,
      stickyPosition: 'right',
      stickyOnMobile: false,
      excludeFromExport: true,
      render: (_, row) =>
        choosing ? (
          <Button
            component={RouterLink}
            href={hrReportPaths.generate(row.id, query.toString())}
            size="small"
            variant="outlined"
            sx={{ whiteSpace: 'nowrap' }}
            aria-label={`Choose ${row.name}`}
          >
            Choose template
          </Button>
        ) : (
          <AdaptiveThreeDotsActions
            moreLabel={`Actions for ${row.name}`}
            actions={[
              ...(row.template.canEdit
                ? [
                    {
                      id: 'edit',
                      label: `Edit ${row.name}`,
                      icon: 'solar:pen-bold',
                      href: hrReportPaths.design(row.id),
                    },
                  ]
                : []),
              ...(permissions.canBuild
                ? [
                    {
                      id: 'copy',
                      label: `Customize a copy of ${row.name}`,
                      icon: 'solar:copy-bold',
                      href: hrReportPaths.design(row.id, true),
                    },
                  ]
                : []),
              ...(row.template.canEdit && permissions.canDelete
                ? [
                    {
                      id: 'archive',
                      label: `Archive ${row.name}`,
                      icon: 'solar:archive-down-bold',
                      onClick: () => setArchive(row.template),
                    },
                  ]
                : []),
            ]}
          />
        ),
    },
  ];
  const data = filtered.map((template) => ({
    ...template,
    template,
    ownership: template.isBuiltIn
      ? 'Built-in'
      : template.visibility === 'private'
        ? 'My template'
        : 'School template',
    lifecycle:
      template.publishedRevision === 0
        ? 'Draft'
        : template.revision > template.publishedRevision
          ? 'Unpublished changes'
          : 'Published',
  }));
  return (
    <Stack spacing={1} sx={{ flex: 1, height: 1, minHeight: 0, minWidth: 0 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <TextField
          select
          size="small"
          label="Category"
          value={category}
          onChange={(event) => updateQuery({ category: event.target.value, page: '0' })}
          sx={{ minWidth: 160 }}
        >
          {categories.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Library"
          value={library}
          onChange={(event) => updateQuery({ library: event.target.value, page: '0' })}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="all">All templates</MenuItem>
          <MenuItem value="builtin">Built-in</MenuItem>
          <MenuItem value="private">My templates</MenuItem>
          <MenuItem value="organization">School templates</MenuItem>
        </TextField>
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          showColumns
          showExport
          showFullScreen
          exportScope="all"
          tableId={choosing ? 'hr-report-template-chooser' : 'hr-report-template-library'}
          tableTitle={choosing ? 'Available report templates' : 'Report templates'}
          columns={columns}
          data={data}
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onPaginationChange={(nextPage, size) =>
            updateQuery({ page: String(nextPage), pageSize: String(size) })
          }
          {...tableState}
          searchableFields={['name', 'description', 'category', 'ownership', 'lifecycle']}
          searchFieldProps={{
            placeholder: 'Search report templates',
            inputProps: { 'aria-label': 'Search report templates' },
          }}
          noDataText={
            choosing
              ? 'No runnable templates match your selection. Try another category or library.'
              : 'No matching templates. Try another category or library.'
          }
          wrapperProps={{ sx: { height: 1, minHeight: 0 } }}
          tableContainerProps={{ sx: { height: 1 } }}
        />
      </Box>
      <ConfirmDialog
        open={!!archive}
        onClose={() => {
          if (!archiving.isLoading) setArchive(null);
        }}
        title="Archive report template?"
        content={`“${archive?.name || ''}” will no longer be available for generation. Captured reports remain unchanged.`}
        action={
          <Button
            size="small"
            variant="contained"
            disabled={archiving.isLoading}
            onClick={async () => {
              if (!archive) return;
              setError('');
              try {
                await archiveTemplate({
                  id: archive.id,
                  concurrencyStamp: archive.concurrencyStamp!,
                }).unwrap();
                setArchive(null);
              } catch (failure) {
                setError(reportError(failure));
                setArchive(null);
              }
            }}
          >
            Archive template
          </Button>
        }
      />
    </Stack>
  );
}
