import type { ReportTemplate } from 'src/redux/hr/hrReportingWorkspaceApi';

import { useMemo, useState } from 'react';
import { useRouter } from 'src/routes/hooks';
import MoreVert from '@mui/icons-material/MoreVert';
import { hrReportPaths } from 'src/constants/hr-report-paths';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { useArchiveReportingTemplateMutation } from 'src/redux/hr/hrReportingWorkspaceApi';
import {
  Box,
  Menu,
  List,
  Chip,
  Stack,
  Alert,
  Button,
  MenuItem,
  TextField,
  IconButton,
  ListItemText,
  ListItemButton,
} from '@mui/material';

import { reportError } from '../reporting-workspace-utils';
import { useHrReportPermissions } from '../hooks/useHrReportPermissions';

const categories = [
  'All',
  'Staff',
  'Attendance',
  'Leave',
  'Payroll',
  'Performance',
  'Policies and Audit',
];
export function ReportLibrary({ templates }: { templates: ReportTemplate[] }) {
  const router = useRouter();
  const permissions = useHrReportPermissions();
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [library, setLibrary] = useState('all');
  const [archive, setArchive] = useState<ReportTemplate | null>(null);
  const [menu, setMenu] = useState<{ anchor: HTMLElement; template: ReportTemplate } | null>(null);
  const [error, setError] = useState('');
  const [archiveTemplate, archiving] = useArchiveReportingTemplateMutation();
  const filtered = templates.filter(
    (t) =>
      (category === 'All' ||
        (category === 'Policies and Audit'
          ? t.category === 'Policies'
          : t.category === category)) &&
      (library === 'all' ||
        (library === 'builtin'
          ? t.isBuiltIn
          : library === 'private'
            ? t.visibility === 'private'
            : t.visibility === 'organization'))
  );
  const columns = useMemo(
    () => [
      {
        id: 'name',
        label: 'Template',
        minWidth: '240px',
        sticky: true,
        stickyOnMobile: false,
        isSort: false,
        isFilter: false,
        render: (_: unknown, row: any) => (
          <Stack spacing={0.25}>
            <Box component="span" sx={{ fontWeight: 600 }}>
              {row.name}
            </Box>
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
        id: 'category',
        label: 'Category',
        minWidth: 130,
      },
      {
        id: 'layout',
        label: 'Layout',
        minWidth: 160,
      },
      {
        id: 'ownership',
        label: 'Library',
        minWidth: '110px',
        isSort: false,
        isFilter: false,
        render: (v: string) => <Chip size="small" variant="outlined" label={v} />,
      },
      {
        id: 'actions',
        label: 'Actions',
        minWidth: '140px',
        sticky: true,
        stickyPosition: 'right' as const,
        isSort: false,
        isFilter: false,
        render: (_: unknown, row: any) => (
          <Stack direction="row" spacing={0.5}>
            <Button
              size="small"
              variant="contained"
              disabled={row.template.publishedRevision === 0}
              onClick={() => router.push(hrReportPaths.generate(row.id))}
            >
              Generate
            </Button>
            {(permissions.canBuild || row.template.canEdit) && (
              <IconButton
                size="small"
                aria-label={`Actions for ${row.name}`}
                aria-haspopup="menu"
                onClick={(event) =>
                  setMenu({ anchor: event.currentTarget, template: row.template })
                }
              >
                <MoreVert fontSize="small" />
              </IconButton>
            )}
          </Stack>
        ),
      },
    ],
    [permissions.canBuild, router]
  );
  const data = filtered.map((template) => ({
    ...template,
    template,
    layout: {
      detail: 'Detail table',
      summary: 'Grouped summary',
      attendanceMatrix: 'Monthly register',
      salaryComponents: 'Salary component register',
    }[template.definition.layout],
    ownership: template.isBuiltIn
      ? 'Built-in'
      : template.visibility === 'private'
        ? 'My template'
        : 'School template',
  }));
  return (
    <Box sx={{ display: 'flex', height: 1, minHeight: 0, gap: 2 }}>
      <Menu anchorEl={menu?.anchor} open={!!menu} onClose={() => setMenu(null)}>
        {permissions.canBuild && (
          <MenuItem
            onClick={() => {
              if (menu) router.push(hrReportPaths.design(menu.template.id, true));
              setMenu(null);
            }}
          >
            Customize a copy
          </MenuItem>
        )}
        {menu?.template.canEdit && (
          <MenuItem
            onClick={() => {
              router.push(hrReportPaths.design(menu.template.id));
              setMenu(null);
            }}
          >
            Edit template
          </MenuItem>
        )}
        {menu?.template.canEdit && permissions.canDelete && (
          <MenuItem
            onClick={() => {
              setArchive(menu.template);
              setMenu(null);
            }}
          >
            Archive
          </MenuItem>
        )}
      </Menu>
      <Box
        component="nav"
        aria-label="Report categories"
        sx={{
          width: 180,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          borderRight: 1,
          borderColor: 'divider',
          pr: 1,
          overflow: 'auto',
        }}
      >
        <List disablePadding>
          {categories.map((c) => (
            <ListItemButton
              key={c}
              selected={category === c}
              onClick={() => setCategory(c)}
              sx={{ borderRadius: 1, mb: 0.5 }}
            >
              <ListItemText primary={c} primaryTypographyProps={{ variant: 'body2' }} />
            </ListItemButton>
          ))}
        </List>
      </Box>
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            select
            size="small"
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            sx={{ minWidth: 160, display: { md: 'none' } }}
          >
            {categories.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Library"
            value={library}
            onChange={(e) => setLibrary(e.target.value)}
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
            tableId="hr-report-template-library"
            tableTitle="Report templates"
            columns={columns}
            data={data}
            searchTerm={search}
            onSearchInputChange={setSearch}
            searchableFields={['name', 'description', 'category', 'layout', 'ownership']}
            searchFieldProps={{
              placeholder: 'Search report templates',
              inputProps: { 'aria-label': 'Search report templates' },
            }}
            isFilter={false}
            noDataText="No matching templates. Try another category or search."
            wrapperProps={{ sx: { height: 1, minHeight: 0 } }}
            tableContainerProps={{ sx: { height: 1 } }}
          />
        </Box>
      </Stack>
      <ConfirmDialog
        open={!!archive}
        onClose={() => setArchive(null)}
        title="Archive report template?"
        content={`“${archive?.name || ''}” will no longer be available for generation. Captured reports remain unchanged.`}
        action={
          <Button
            size="small"
            variant="contained"
            disabled={archiving.isLoading}
            onClick={async () => {
              if (!archive) return;
              try {
                await archiveTemplate({
                  id: archive.id,
                  concurrencyStamp: archive.concurrencyStamp!,
                }).unwrap();
                setArchive(null);
              } catch (e) {
                setError(reportError(e));
                setArchive(null);
              }
            }}
          >
            Archive template
          </Button>
        }
      />
    </Box>
  );
}
