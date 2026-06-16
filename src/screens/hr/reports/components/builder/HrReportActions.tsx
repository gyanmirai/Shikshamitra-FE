import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Stack, Button, Tooltip, IconButton, Typography, CircularProgress } from '@mui/material';

import type { HrReportPermissions } from '../../hr-report-permissions';

type HrReportActionsProps = {
  hasSelectedTemplate: boolean;
  permissions: HrReportPermissions;
  isTimelineInvalid: boolean;
  isPreviewLoading: boolean;
  isSavingTemplate: boolean;
  isCreatingExport: boolean;
  isFetchingExports: boolean;
  isScheduling: boolean;
  onPreview: () => void;
  onSaveTemplate: () => void;
  onPublishTemplate: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onSchedule: () => void;
  onDuplicateTemplate: () => void;
  onDeleteTemplate: () => void;
};

export function HrReportActions({
  hasSelectedTemplate,
  permissions,
  isTimelineInvalid,
  isPreviewLoading,
  isSavingTemplate,
  isCreatingExport,
  isFetchingExports,
  isScheduling,
  onPreview,
  onSaveTemplate,
  onPublishTemplate,
  onExportExcel,
  onExportPdf,
  onSchedule,
  onDuplicateTemplate,
  onDeleteTemplate,
}: HrReportActionsProps) {
  const isBusy = isPreviewLoading || isCreatingExport || isFetchingExports || isScheduling;

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Button
        data-testid="hr-report-preview-button"
        variant="contained"
        size="small"
        startIcon={<Iconify icon={GlobalIcons.report} />}
        disabled={isPreviewLoading || isTimelineInvalid}
        onClick={onPreview}
      >
        Preview
      </Button>
      {permissions.canManageTemplates ? (
        <>
          <Tooltip title="Save this setup as a private draft template">
            <span>
              <Button
                data-testid="hr-report-save-template-button"
                variant="outlined"
                size="small"
                disabled={isSavingTemplate}
                onClick={onSaveTemplate}
              >
                Save Draft
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Publish this template for other HR report users">
            <span>
              <Button
                data-testid="hr-report-publish-template-button"
                variant="outlined"
                size="small"
                disabled={isSavingTemplate}
                onClick={onPublishTemplate}
              >
                Publish Template
              </Button>
            </span>
          </Tooltip>
        </>
      ) : null}
      {permissions.canExport ? (
        <>
          <Tooltip title="Queue the Excel file and track it in Reports Center">
            <span>
              <Button
                data-testid="hr-report-export-excel-button"
                variant="outlined"
                size="small"
                startIcon={<Iconify icon={GlobalIcons.excel} />}
                disabled={isCreatingExport || isTimelineInvalid}
                onClick={onExportExcel}
              >
                Export Excel
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Queue the PDF file and track it in Reports Center">
            <span>
              <Button
                data-testid="hr-report-export-pdf-button"
                variant="outlined"
                size="small"
                startIcon={<Iconify icon={GlobalIcons.pdf} />}
                disabled={isCreatingExport || isTimelineInvalid}
                onClick={onExportPdf}
              >
                Export PDF
              </Button>
            </span>
          </Tooltip>
          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
            Exports are prepared in the background and appear in Reports Center.
          </Typography>
        </>
      ) : null}
      {permissions.canSchedule ? (
        <Button
          data-testid="hr-report-schedule-button"
          variant="outlined"
          size="small"
          startIcon={<Iconify icon="solar:calendar-add-bold" />}
          disabled={isScheduling || isTimelineInvalid}
          onClick={onSchedule}
        >
          Schedule
        </Button>
      ) : null}
      {hasSelectedTemplate && permissions.canManageTemplates ? (
        <>
          <Tooltip title="Duplicate template">
            <IconButton
              data-testid="hr-report-duplicate-template-button"
              size="small"
              onClick={onDuplicateTemplate}
            >
              <Iconify icon="solar:copy-bold" />
            </IconButton>
          </Tooltip>
          {permissions.canDelete ? (
            <Tooltip title="Delete template">
              <IconButton
                data-testid="hr-report-delete-template-button"
                size="small"
                onClick={onDeleteTemplate}
              >
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Tooltip>
          ) : null}
        </>
      ) : null}
      {isBusy && <CircularProgress size={24} />}
    </Stack>
  );
}
