import {
  Box,
  Alert,
  Button,
  Skeleton,
  Typography,
  LinearProgress,
  TablePagination,
} from '@mui/material';

import AuditLogsTable from './AuditLogsTable';
import { AUDIT_VIEWS } from './AuditViewTabs';
import AuditTimelineView from './AuditTimelineView';
import AuditAnalyticsView from './AuditAnalyticsView';

import type useCalendarAuditLogs from '../useCalendarAuditLogs';

export default function AuditContentPanels({
  audit,
}: {
  audit: ReturnType<typeof useCalendarAuditLogs>;
}) {
  return (
    <>
      {AUDIT_VIEWS.map(({ value }) => (
        <Box
          key={value}
          role="tabpanel"
          id={`audit-${value}-panel`}
          aria-labelledby={`audit-${value}-tab`}
          hidden={audit.view !== value}
          sx={{
            display: audit.view === value ? 'flex' : 'none',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {audit.view === value &&
            (value === 'table' ? (
              <AuditLogsTable
                logs={audit.displayedLogs}
                loading={audit.pending}
                refreshing={audit.refreshing}
                error={audit.error}
                onRetry={audit.retry}
                totalCount={audit.totalCount}
                page={audit.page}
                rowsPerPage={audit.rowsPerPage}
                onPageChange={audit.changePage}
                onRowClick={audit.setSelectedLog}
                hasActiveFilters={audit.hasActiveFilters}
                onResetFilters={audit.resetFilters}
                action={audit.filters.action}
                onActionChange={(action) => audit.changeFilters({ ...audit.filters, action })}
              />
            ) : (
              <>
                {audit.error ? (
                  <Alert
                    severity="error"
                    action={
                      <Button size="small" color="inherit" onClick={audit.retry}>
                        Retry
                      </Button>
                    }
                  >
                    Audit history could not be loaded. Please retry.
                  </Alert>
                ) : audit.pending ? (
                  <Skeleton variant="rounded" height="100%" aria-label="Loading audit history" />
                ) : (
                  <>
                    {audit.refreshing && <LinearProgress aria-label="Refreshing audit history" />}
                    <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                      Current page of audit history
                    </Typography>
                    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                      {value === 'timeline' ? (
                        <AuditTimelineView
                          logs={audit.displayedLogs}
                          onLogClick={audit.setSelectedLog}
                          hasActiveFilters={audit.hasActiveFilters}
                        />
                      ) : (
                        <AuditAnalyticsView logs={audit.displayedLogs} />
                      )}
                    </Box>
                  </>
                )}
                <TablePagination
                  component="div"
                  count={audit.totalCount ?? 0}
                  page={audit.page}
                  rowsPerPage={audit.rowsPerPage}
                  rowsPerPageOptions={[10, 20, 25, 50, 100]}
                  disabled={audit.pending || Boolean(audit.error)}
                  onPageChange={(_, page) => audit.changePage(page, audit.rowsPerPage)}
                  onRowsPerPageChange={(event) => audit.changePage(0, Number(event.target.value))}
                  sx={{ flexShrink: 0, '& .MuiTablePagination-toolbar': { flexWrap: 'wrap' } }}
                />
              </>
            ))}
        </Box>
      ))}
    </>
  );
}
