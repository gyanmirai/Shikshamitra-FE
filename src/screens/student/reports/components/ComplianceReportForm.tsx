'use client';

import type { ComplianceReportType } from 'src/redux/student/records/student-record-reports-api';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { Stack, Button, Typography, LinearProgress } from '@mui/material';

import ComplianceReportPreview from './ComplianceReportPreview';
import ComplianceReportScopeFields from './ComplianceReportScopeFields';
import { useComplianceReportForm } from '../hooks/use-compliance-report-form';
import { complianceReportDefinitions } from '../utils/compliance-report-model';

export default function ComplianceReportForm({
  reportType,
  onGenerated,
}: {
  reportType: ComplianceReportType;
  onGenerated: () => void;
}) {
  const editor = useComplianceReportForm(reportType);
  const definition = complianceReportDefinitions[reportType];
  return (
    <Stack
      component="form"
      noValidate
      onSubmit={editor.form.handleSubmit}
      spacing={2}
      sx={{ minWidth: 0 }}
    >
      <FormSectionCard
        title="Report Scope"
        icon={GlobalIcons.report}
        descriptionTooltip="Scope is limited to active eligible Student Records in your tenant and permitted academic hierarchy. All identifiers in this report are masked."
      >
        <Typography variant="body2">{definition.description}</Typography>
        {!editor.canRead && (
          <StudentFeedback
            notificationKey="student-compliance-report-access"
            presentation="inline"
            severity="info"
          >
            Student Reports, Student List and Identity Compliance view access are required.
          </StudentFeedback>
        )}
        <ComplianceReportScopeFields editor={editor} />
        {editor.options.isFetching && <LinearProgress aria-label="Loading report scope" />}
        {editor.options.isError && (
          <StudentFeedback
            notificationKey="student-compliance-report-scope"
            severity="error"
            toastAction={
              <Button size="small" onClick={() => editor.options.refetch()}>
                Retry
              </Button>
            }
          >
            Report scope could not be loaded. Retry before previewing.
          </StudentFeedback>
        )}
        {!editor.validScope && (
          <Typography role="alert" color="error.main" variant="body2">
            A saved filter is no longer available. Choose an available scope.
          </Typography>
        )}
      </FormSectionCard>
      <FormSectionCard
        title="Report Columns"
        icon={GlobalIcons.documentIcon}
        descriptionTooltip="These are factual stored values. Policy masks apply to preview and export; unavailable values stay blank."
      >
        <Typography variant="body2">{definition.columns}</Typography>
        <Typography variant="caption" color="text.secondary">
          Identifiers remain masked in preview and Excel. Generating a report does not change
          verification, consent, benefit or UDISE sync status.
        </Typography>
      </FormSectionCard>
      <Stack direction="row" justifyContent="flex-end">
        <Button
          type="submit"
          variant="contained"
          color="inherit"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.eye} />}
          disabled={
            !editor.canRead ||
            !editor.year?.id ||
            !editor.validScope ||
            editor.options.isFetching ||
            editor.options.isError ||
            !editor.options.currentData
          }
        >
          Preview report
        </Button>
      </Stack>
      {editor.request && editor.canRead && (
        <ComplianceReportPreview
          request={editor.request}
          title={definition.title}
          scopeLabel={`${editor.year?.name ?? ''} · ${editor.boards.find((item) => item.id === editor.form.values.boardId)?.name ?? (reportType === 'GujaratCompliance' ? 'All available GSEB boards' : 'All available boards')} · ${editor.mediums.find((item) => item.id === editor.form.values.mediumId)?.name ?? 'All available mediums'} · ${editor.standards.find((item) => item.id === editor.form.values.standardId)?.name ?? 'All available classes'} · ${editor.divisions.find((item) => item.id === editor.form.values.divisionId)?.name ?? 'All available divisions'}`}
          canGenerate={editor.canGenerate}
          onClose={() => editor.setRequest(null)}
          onGenerated={onGenerated}
        />
      )}
    </Stack>
  );
}
