import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import CustomSelect from 'src/components/custom-select';
import { Tab, Tabs, Alert, Paper, Button, Tooltip, IconButton } from '@mui/material';

import { AdmissionQueryError } from '../admission-query-error';
import { assessmentQueues } from './assessment-workbench-model';

import type { useAssessmentWorkbenchData } from './use-assessment-workbench-data';

export function AssessmentWorkbenchControls({
  data,
}: {
  data: ReturnType<typeof useAssessmentWorkbenchData>;
}) {
  const {
    state,
    href,
    visibleScope,
    sessions,
    sessionId,
    invalidSession,
    applicants,
    updateWorkbench,
  } = data;
  return (
    <>
      <Paper variant="outlined" sx={{ px: 1 }}>
        <Tabs
          value={state.tab}
          aria-label="Assessment workspace"
          variant="scrollable"
          scrollButtons="auto"
        >
          {[
            { value: 'sessions', label: 'Sessions', icon: 'mdi:calendar-outline' },
            { value: 'applicants', label: 'Applicants', icon: 'mdi:account-group-outline' },
          ].map((item) => (
            <Tab
              key={item.value}
              value={item.value}
              label={item.label}
              icon={<Iconify icon={item.icon} />}
              iconPosition="start"
              component={RouterLink}
              href={href({ assessmentTab: item.value })}
              id={`assessment-tab-${item.value}`}
              aria-controls={`assessment-panel-${item.value}`}
            />
          ))}
        </Tabs>
      </Paper>
      {state.tab === 'applicants' && visibleScope && (
        <>
          {visibleScope.schedulingEnabled && (
            <CustomSelect
              label="Session"
              value={sessionId}
              isLoading={sessions.isLoading}
              disabled={sessions.isError}
              options={[
                { value: '', label: 'All sessions' },
                ...(sessions.currentData ?? []).map((item) => ({
                  value: item.id,
                  label: `${item.name}${item.isCancelled ? ' (cancelled)' : ''}`,
                })),
              ]}
              onChange={(value) =>
                updateWorkbench({ assessmentSession: String(value), assessmentPage: 0 })
              }
            />
          )}
          {sessions.isError && visibleScope.schedulingEnabled && (
            <AdmissionQueryError onRetry={sessions.refetch} />
          )}
          {invalidSession && (
            <Alert
              severity="warning"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() =>
                    updateWorkbench({ assessmentSession: undefined, assessmentPage: 0 })
                  }
                >
                  Clear session filter
                </Button>
              }
            >
              This session is unavailable in the selected offering and stage. Clear the filter to
              view applicants.
            </Alert>
          )}
          <Paper
            variant="outlined"
            sx={{ p: 1, display: 'flex', gap: 0.5, overflowX: 'auto' }}
            role="group"
            aria-label="Filter assessment queue"
          >
            {assessmentQueues.map((item) => (
              <Button
                key={item.value}
                size="small"
                variant={state.queue === item.value ? 'contained' : 'text'}
                aria-pressed={state.queue === item.value}
                sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                onClick={() =>
                  updateWorkbench({
                    assessmentQueue: item.value === 'all' ? undefined : item.value,
                    assessmentPage: 0,
                  })
                }
              >
                {item.label}
                {!invalidSession && applicants.currentData && !applicants.isError
                  ? ` ${applicants.currentData.counts[item.value]}`
                  : ''}
              </Button>
            ))}
            <Tooltip title="Refresh applicants">
              <span>
                <IconButton
                  size="small"
                  aria-label="Refresh assessment applicants"
                  disabled={invalidSession || applicants.isUninitialized || applicants.isFetching}
                  onClick={applicants.refetch}
                >
                  <Iconify icon="mdi:refresh" />
                </IconButton>
              </span>
            </Tooltip>
          </Paper>
        </>
      )}
    </>
  );
}
