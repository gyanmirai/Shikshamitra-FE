'use client';

import { Iconify } from 'src/components/iconify';
import { Box, Stack, Alert, Button } from '@mui/material';
import { academicPaths } from 'src/constants/academic-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AuditViewTabs from './components/AuditViewTabs';
import useCalendarAuditLogs from './useCalendarAuditLogs';
import AuditExportMenu from './components/AuditExportMenu';
import AuditSmartFilters from './components/AuditSmartFilters';
import AuditContentPanels from './components/AuditContentPanels';
import AuditAISummaryDrawer from './components/AuditAISummaryDrawer';
import AuditLogDetailsDrawer from './components/AuditLogDetailsDrawer';

export default function CalendarAuditLogs() {
  const audit = useCalendarAuditLogs();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 1,
        minHeight: 0,
        minWidth: 0,
        gap: 1,
        overflow: 'hidden',
      }}
    >
      <CustomBreadcrumbs
        heading="Audit Logs"
        description="Read-only, school-wide calendar history across all academic mediums. Review recorded changes, impact, and accountability."
        links={[
          { name: 'Academics', href: academicPaths.dashboard },
          { name: 'Academic Calendar', href: academicPaths.academicCalendar.dashboard },
          { name: 'Audit Logs' },
        ]}
        action={
          audit.canView && (
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="flex-end">
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                disabled={audit.pending || Boolean(audit.error)}
                startIcon={<Iconify icon="mdi:format-list-bulleted" width={16} />}
                onClick={() => {
                  audit.setSummaryLog(null);
                  audit.setSummaryOpen(true);
                }}
              >
                Page summary
              </Button>
              <Button
                size="small"
                variant="contained"
                color="inherit"
                disabled={audit.pending || Boolean(audit.error) || !audit.displayedLogs.length}
                startIcon={<Iconify icon="mdi:download" width={16} />}
                onClick={(event) => audit.setExportAnchor(event.currentTarget)}
                title="Export displayed audit logs on this page"
                aria-label="Export displayed logs"
              >
                Export logs
              </Button>
            </Stack>
          )
        }
      />
      {!audit.canView ? (
        <Alert severity="error">You do not have permission to view audit logs.</Alert>
      ) : (
        <>
          <AuditViewTabs view={audit.view} onChange={audit.setView} />
          <AuditSmartFilters
            entityTypes={audit.entityTypes}
            filters={audit.filters}
            onChange={audit.changeFilters}
            onReset={audit.resetFilters}
            totalCount={audit.error ? undefined : audit.totalCount}
            displayedCount={audit.displayedLogs.length}
            failed={Boolean(audit.error)}
          />
          <AuditContentPanels audit={audit} />
          <AuditLogDetailsDrawer
            open={Boolean(audit.selectedLog)}
            onClose={() => audit.setSelectedLog(null)}
            log={audit.selectedLog}
            canViewSensitiveMetadata
            canAddReviewNote={audit.canAddNote}
            canRestore={false}
            canViewAIInsights
            onAddNote={audit.saveNote}
            onAIExplain={(log) => {
              audit.setSummaryLog(log);
              audit.setSummaryOpen(true);
            }}
          />
          <AuditAISummaryDrawer
            open={audit.summaryOpen}
            onClose={() => audit.setSummaryOpen(false)}
            log={audit.summaryLog}
            logs={audit.displayedLogs}
          />
          <AuditExportMenu
            logs={audit.displayedLogs}
            anchorEl={audit.exportAnchor}
            open={Boolean(audit.exportAnchor)}
            onClose={() => audit.setExportAnchor(null)}
          />
        </>
      )}
    </Box>
  );
}
