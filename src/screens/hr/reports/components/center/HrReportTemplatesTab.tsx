import type { HrReportTemplate } from 'src/redux/hr/hrReportsApi';
import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import { useMemo } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { Chip, Stack, Button, Tooltip, IconButton } from '@mui/material';

import { formatHrReportDateTime } from '../../hr-report-utils';
import { HrReportCenterEmptyState } from './HrReportCenterEmptyState';

import type { HrReportTemplateAction } from '../../hr-report-types';
import type { HrReportPermissions } from '../../hr-report-permissions';

type HrReportTemplatesTabProps = {
  templates: HrReportTemplate[];
  isLoading: boolean;
  permissions: HrReportPermissions;
  onOpenTemplate: (template: HrReportTemplate) => void;
  onRunTemplate: (template: HrReportTemplate) => void;
  onTemplateAction: (action: HrReportTemplateAction, template: HrReportTemplate) => void;
};

type TemplateRow = IData & {
  id: string;
  name: string;
  category: string;
  visibility: string;
  status: string;
  lastModificationTime?: string;
  creationTime: string;
  template: HrReportTemplate;
};

const asTemplateRow = (row: IData) => row as TemplateRow;

export function HrReportTemplatesTab({
  templates,
  isLoading,
  permissions,
  onOpenTemplate,
  onRunTemplate,
  onTemplateAction,
}: HrReportTemplatesTabProps) {
  const rows = useMemo<TemplateRow[]>(
    () =>
      [...templates]
        .sort(
          (left, right) =>
            new Date(right.lastModificationTime || right.creationTime).getTime() -
            new Date(left.lastModificationTime || left.creationTime).getTime()
        )
        .map((template) => ({
          id: `template-${template.id}`,
          name: template.name,
          category: template.category,
          visibility: template.visibility,
          status: template.status,
          lastModificationTime: template.lastModificationTime,
          creationTime: template.creationTime,
          template,
        })),
    [templates]
  );

  const columns = useMemo<IColumn[]>(
    () => [
      { id: 'name', label: 'Template', minWidth: '16vw', align: 'left' as const, sticky: true },
      { id: 'category', label: 'Category', minWidth: '10vw', align: 'left' as const },
      {
        id: 'visibility',
        label: 'Visibility',
        minWidth: '9vw',
        align: 'left' as const,
        render: (value: string) => (value === 'organization' ? 'Organization' : 'Private'),
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: '9vw',
        align: 'left' as const,
        render: (value: string) => (
          <Chip
            size="small"
            label={value}
            color={value === 'Published' ? 'success' : 'default'}
            variant="soft"
          />
        ),
      },
      {
        id: 'lastModificationTime',
        label: 'Updated',
        minWidth: '13vw',
        align: 'left' as const,
        render: (_value, rawRow) => {
          const row = asTemplateRow(rawRow);
          return formatHrReportDateTime(row.lastModificationTime || row.creationTime);
        },
      },
      {
        id: 'action',
        label: 'Action',
        minWidth: '22vw',
        align: 'left' as const,
        isFilter: false,
        isSort: false,
        render: (_value, rawRow) => {
          const row = asTemplateRow(rawRow);
          const nextPublishAction = row.template.status === 'Published' ? 'draft' : 'publish';
          return (
            <Stack direction="row" spacing={0.5} alignItems="center">
              {permissions.canExport ? (
                <Button
                  data-testid="hr-report-template-run-button"
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon="solar:play-circle-bold" />}
                  onClick={() => onRunTemplate(row.template)}
                >
                  Run Report
                </Button>
              ) : null}
              <Button
                data-testid="hr-report-template-open-button"
                size="small"
                variant="text"
                startIcon={<Iconify icon={GlobalIcons.report} />}
                onClick={() => onOpenTemplate(row.template)}
              >
                Open Builder
              </Button>
              {permissions.canManageTemplates ? (
                <>
                  <Tooltip title="Duplicate template">
                    <IconButton
                      data-testid="hr-report-template-duplicate-button"
                      size="small"
                      onClick={() => onTemplateAction('duplicate', row.template)}
                    >
                      <Iconify icon="solar:copy-bold" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    title={
                      nextPublishAction === 'publish'
                        ? 'Publish template'
                        : 'Move template back to draft'
                    }
                  >
                    <IconButton
                      data-testid="hr-report-template-publish-toggle-button"
                      size="small"
                      onClick={() => onTemplateAction(nextPublishAction, row.template)}
                    >
                      <Iconify
                        icon={
                          nextPublishAction === 'publish'
                            ? GlobalIcons.publish
                            : GlobalIcons.draftIcon
                        }
                      />
                    </IconButton>
                  </Tooltip>
                </>
              ) : null}
              {permissions.canDelete ? (
                <Tooltip title="Delete template">
                  <IconButton
                    data-testid="hr-report-template-delete-button"
                    size="small"
                    onClick={() => onTemplateAction('delete', row.template)}
                  >
                    <Iconify icon={GlobalIcons.delete} />
                  </IconButton>
                </Tooltip>
              ) : null}
            </Stack>
          );
        },
      },
    ],
    [
      onOpenTemplate,
      onRunTemplate,
      onTemplateAction,
      permissions.canDelete,
      permissions.canExport,
      permissions.canManageTemplates,
    ]
  );

  return (
    <CustomizableTable
      tableId="hr-report-templates"
      tableTitle="Templates"
      columns={columns}
      data={rows}
      isLoading={isLoading}
      isSearch
      noDataText={
        <HrReportCenterEmptyState
          icon="solar:document-add-bold"
          title="No templates saved"
          description="Save a draft or publish a builder setup to reuse it from this tab."
        />
      }
    />
  );
}
