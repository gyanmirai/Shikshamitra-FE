import type { HrReportSource, HrReportTemplate } from 'src/redux/hr/hrReportsApi';

import { useMemo, useState, useCallback } from 'react';
import { Box, Alert, Stack, Button } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { usePreviewHrReportMutation } from 'src/redux/hr/hrReportsApi';

import { HrReportActions } from './builder/HrReportActions';
import { HrReportPreviewTable } from './HrReportPreviewTable';
import { HrReportChartPreview } from './HrReportChartPreview';
import { useHrReportExports } from '../hooks/useHrReportExports';
import { HrReportScheduleDialog } from './HrReportScheduleDialog';
import { useHrReportTemplates } from '../hooks/useHrReportTemplates';
import { HrReportBasicsSection } from './builder/HrReportBasicsSection';
import { HrReportBuilderReview } from './builder/HrReportBuilderReview';
import { HrReportFiltersSection } from './builder/HrReportFiltersSection';
import { useHrReportBuilderState } from '../hooks/useHrReportBuilderState';
import { HrReportTimelineSection } from './builder/HrReportTimelineSection';
import { HrReportGroupingSection } from './builder/HrReportGroupingSection';
import { HrReportAnalyticsSection } from './builder/HrReportAnalyticsSection';
import { DEFAULT_HR_REPORT_PAGE_SIZE, getHrReportRequestSignature } from '../hr-report-utils';
import {
  useHrReportSchedules,
  createDefaultHrReportScheduleForm,
} from '../hooks/useHrReportSchedules';

import type { HrReportQueuedExport } from '../hr-report-types';
import type { HrReportPermissions } from '../hr-report-permissions';

type HrReportBuilderProps = {
  source: HrReportSource;
  template?: HrReportTemplate;
  isFetchingExports: boolean;
  refetchExports: () => unknown;
  permissions: HrReportPermissions;
  onExportQueued?: (exportJob: HrReportQueuedExport) => void;
};

export function HrReportBuilder({
  source,
  template,
  isFetchingExports,
  refetchExports,
  permissions,
  onExportQueued,
}: HrReportBuilderProps) {
  const builder = useHrReportBuilderState(source, template);
  const [previewReport, { data: preview, isLoading: isPreviewLoading }] =
    usePreviewHrReportMutation();
  const [isScheduleOpen, setScheduleOpen] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const templates = useHrReportTemplates({
    source,
    state: builder.state,
    setState: builder.setState,
    requestFor: builder.requestFor,
  });
  const exports = useHrReportExports({
    isFetchingExports,
    refetchExports,
    onExportQueued,
    requestFor: builder.requestFor,
  });
  const schedules = useHrReportSchedules({
    templateId: builder.state.selectedTemplate?.id,
    requestFor: builder.requestFor,
  });
  const scheduleDefaultValue = useMemo(
    () => createDefaultHrReportScheduleForm(builder.state.reportName || source.label),
    [builder.state.reportName, source.label]
  );
  const currentPreviewSignature = useMemo(
    () =>
      getHrReportRequestSignature(
        builder.requestFor(
          builder.lastRequest?.page ?? 1,
          builder.lastRequest?.pageSize ?? DEFAULT_HR_REPORT_PAGE_SIZE
        )
      ),
    [builder]
  );
  const isPreviewStale = builder.lastRequest?.signature !== currentPreviewSignature;

  const handlePreview = useCallback(
    async (page = 1, pageSize = DEFAULT_HR_REPORT_PAGE_SIZE) => {
      const request = builder.requestFor(page, pageSize);
      await previewReport(request).unwrap();
      builder.setLastRequest({ page, pageSize, signature: getHrReportRequestSignature(request) });
    },
    [builder, previewReport]
  );

  const handleDeleteTemplate = useCallback(async () => {
    await templates.deleteSelectedTemplate();
    setDeleteConfirmOpen(false);
  }, [templates]);

  return (
    <Stack
      data-testid="hr-report-builder"
      spacing={2}
      sx={{ p: 2, height: '100%', minWidth: 0, minHeight: 0, overflow: 'auto' }}
    >
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
        <Stack spacing={2}>
          <HrReportBasicsSection
            state={builder.state}
            setState={builder.setState}
            columnFields={builder.columnFields}
          />
          <HrReportTimelineSection
            state={builder.state}
            setState={builder.setState}
            dateFields={builder.dateFields}
            dateRangeError={builder.dateRangeError}
            isPayrollSource={builder.isPayrollSource}
            timelineChips={builder.timelineChips}
            onClearTimeline={builder.clearTimeline}
          />
          <HrReportGroupingSection
            state={builder.state}
            setState={builder.setState}
            sortableFields={builder.sortableFields}
            groupFields={builder.groupFields}
            summaryFields={builder.summaryFields}
          />
          <HrReportAnalyticsSection
            state={builder.state}
            setState={builder.setState}
            chartCategoryFields={builder.chartCategoryFields}
            chartValueFields={builder.chartValueFields}
            chartCategoryValue={builder.chartCategoryValue}
            chartValueField={builder.chartValueField}
          />
          <HrReportFiltersSection
            conditions={builder.state.conditions}
            filterFields={builder.filterFields}
            onAddCondition={builder.addCondition}
            onUpdateCondition={builder.updateCondition}
            onRemoveCondition={builder.removeCondition}
          />
          <HrReportBuilderReview
            state={builder.state}
            sourceLabel={source.label}
            preview={preview}
            isPreviewStale={isPreviewStale}
          />
          <HrReportActions
            hasSelectedTemplate={Boolean(builder.state.selectedTemplate)}
            permissions={permissions}
            isTimelineInvalid={builder.isTimelineInvalid}
            isPreviewLoading={isPreviewLoading}
            isSavingTemplate={templates.isSavingTemplate}
            isCreatingExport={exports.isCreatingExport}
            isFetchingExports={exports.isExportHistoryFetching}
            isScheduling={schedules.isScheduling}
            onPreview={() =>
              handlePreview(1, builder.lastRequest?.pageSize ?? DEFAULT_HR_REPORT_PAGE_SIZE)
            }
            onSaveTemplate={() => templates.saveTemplate(false)}
            onPublishTemplate={() => templates.saveTemplate(true)}
            onExportExcel={() => exports.exportReport('excel')}
            onExportPdf={() => exports.exportReport('pdf')}
            onSchedule={() => setScheduleOpen(true)}
            onDuplicateTemplate={templates.duplicateSelectedTemplate}
            onDeleteTemplate={() => setDeleteConfirmOpen(true)}
          />
        </Stack>
      </Box>

      {preview?.queryWarnings?.length ? (
        <Stack spacing={1}>
          {preview.queryWarnings.map((warning) => (
            <Alert key={warning} severity="warning">
              {warning}
            </Alert>
          ))}
        </Stack>
      ) : null}

      <HrReportChartPreview chart={preview?.chart} />
      <HrReportPreviewTable
        preview={preview}
        reportName={builder.state.reportName}
        sourceLabel={source.label}
        isLoading={isPreviewLoading}
        onPageChange={handlePreview}
      />
      <HrReportScheduleDialog
        open={isScheduleOpen}
        defaultValue={scheduleDefaultValue}
        isSubmitting={schedules.isScheduling}
        onClose={() => setScheduleOpen(false)}
        onSubmit={schedules.createReportSchedule}
      />
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete report template?"
        icon="warning"
        content={`This will permanently delete "${builder.state.selectedTemplate?.name ?? 'this template'}".`}
        action={
          <Button color="error" variant="contained" size="small" onClick={handleDeleteTemplate}>
            Delete Template
          </Button>
        }
      />
    </Stack>
  );
}
