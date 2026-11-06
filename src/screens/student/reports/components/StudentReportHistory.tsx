import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Stack, Button, Typography } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { StudentFeedback } from 'src/components/student-feedback';

import StudentReportScopeDialog from './StudentReportScopeDialog';
import { studentReportTitle } from '../utils/compliance-report-model';
import { useStudentReportHistory } from '../hooks/use-student-report-history';
import { studentReportHistoryColumns } from './student-report-history-columns';

export default function StudentReportHistory() {
  const history = useStudentReportHistory();
  return (
    <Stack spacing={1} sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>
      <Typography variant="body2" color="text.secondary">
        Generated Records and Compliance reports requested by you, across academic years. Each file
        keeps the scope of its request. Unsupported legacy catalog reports do not create history
        entries.
      </Typography>
      {!history.canView && (
        <StudentFeedback
          notificationKey="student-reports-history-access"
          presentation="inline"
          severity="info"
        >
          Student Reports view access is required to read generated files.
        </StudentFeedback>
      )}
      <CustomizableTable
        tableId="student-generated-report-history"
        tableTitle="Generated Reports"
        columns={studentReportHistoryColumns(history)}
        data={history.canView ? (history.jobs.currentData?.items ?? []) : []}
        showColumns
        showFullScreen
        showExport={false}
        isSearch={false}
        isFilter={false}
        isLoading={history.jobs.isFetching && !history.jobs.currentData}
        isRefreshing={history.jobs.isFetching && Boolean(history.jobs.currentData)}
        error={
          history.jobs.isError
            ? 'Generated reports could not be loaded. Retry to check their current status.'
            : undefined
        }
        onRetry={() => history.jobs.refetch()}
        noDataText={
          history.canView
            ? 'No reports have been generated yet.'
            : 'Report history is unavailable without view access.'
        }
        serverSidePagination
        page={history.page}
        rowsPerPage={history.size}
        rowsPerPageOptions={[10, 25, 50, 100]}
        maxServerRowsPerPage={100}
        totalCount={history.jobs.currentData?.totalCount ?? 0}
        onServerPagination={(page, size) => {
          history.setPage(page - 1);
          history.setSize(size);
        }}
        wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
      />
      <ConfirmDialog
        open={Boolean(history.decision)}
        onClose={() => history.setDecision(null)}
        disableCancel={history.busy}
        bodyBusy={history.busy}
        title={
          history.decision?.kind === 'cancel'
            ? 'Cancel Report Generation?'
            : 'Generate Report Again?'
        }
        icon="warning"
        content={
          history.decision?.kind === 'cancel'
            ? `Stop generating ${studentReportTitle(history.decision.job.reportType)}? Source student records remain unchanged.`
            : `Generate ${history.decision ? studentReportTitle(history.decision.job.reportType) : 'this report'} using its saved request scope and your current permissions? Current stored values will be used.`
        }
        action={
          <Button
            size="small"
            color="inherit"
            variant="contained"
            disabled={history.busy || !history.decisionAllowed}
            onClick={history.confirm}
            startIcon={
              <Iconify
                icon={
                  history.decision?.kind === 'cancel'
                    ? GlobalIcons.cancel
                    : GlobalIcons.generateReport
                }
              />
            }
          >
            {history.decision?.kind === 'cancel' ? 'Cancel generation' : 'Generate report'}
          </Button>
        }
      />
      {history.scopeJob && (
        <StudentReportScopeDialog
          job={history.scopeJob}
          onClose={() => history.setScopeJob(null)}
        />
      )}
    </Stack>
  );
}
