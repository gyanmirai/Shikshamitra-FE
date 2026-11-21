import type { LibraryReportOptions } from 'src/redux/library/library-adapters';

import { LoadingButton } from '@mui/lab';
import { Alert, Stack, Typography } from '@mui/material';

import { useReportDraft } from './use-report-draft';
import { ReportFilterFields } from './ReportFilterFields';
import { LibraryReportPreview } from './LibraryReportPreview';

import type { LibraryReportIdentity } from './report-draft-types';

export default function BackendReportPanel({
  report,
  options,
}: {
  report: LibraryReportIdentity;
  options?: LibraryReportOptions;
}) {
  const draft = useReportDraft(report, options);
  if (report.isComingSoon)
    return (
      <Stack spacing={2} sx={{ p: 3 }}>
        <Alert severity="info">This report requires a workflow that is not available yet.</Alert>
        <Typography variant="body2" color="text.secondary">
          {report.description}
        </Typography>
      </Stack>
    );
  return (
    <Stack spacing={2} sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <ReportFilterFields
        report={report}
        options={options}
        values={draft.values}
        disabled={draft.busy}
        onChange={draft.onChange}
      />
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <LoadingButton
          variant="outlined"
          size="small"
          onClick={draft.onPreview}
          loading={draft.previewState.isLoading}
          disabled={!draft.academicYearId || draft.invalid || draft.busy}
        >
          Preview
        </LoadingButton>
        {draft.canExport && (
          <LoadingButton
            variant="contained"
            size="small"
            onClick={draft.onExport}
            loading={draft.exportState.isLoading}
            disabled={!draft.academicYearId || draft.invalid || draft.busy}
          >
            Generate report
          </LoadingButton>
        )}
      </Stack>
      {!draft.academicYearId && (
        <Alert severity="info">Select an academic year to run reports.</Alert>
      )}
      {draft.invalid && (
        <Alert severity="error">Choose valid school dates, with From on or before To.</Alert>
      )}
      <LibraryReportPreview preview={draft.preview} reportId={report.id} />
    </Stack>
  );
}
