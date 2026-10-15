import { Label } from 'src/components/label';
import CustomSelect from 'src/components/custom-select';
import { Box, Stack, Paper, Alert, Button } from '@mui/material';

import { AdmissionQueryError } from '../admission-query-error';
import { AdmissionAcademicFilters } from '../admission-academic-filters';

import type { useAssessmentWorkspaceData } from './use-assessment-workspace-data';

const ALL = '__all__';
export const assessmentWorkspaceQueues = [
  { value: 'all', label: 'All', color: 'default' },
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'complete', label: 'Complete', color: 'success' },
  { value: 'ongoing', label: 'Ongoing', color: 'info' },
] as const;

export function AssessmentWorkspaceControls({
  data,
}: {
  data: ReturnType<typeof useAssessmentWorkspaceData>;
}) {
  const {
    state,
    academic,
    applicants,
    sessions,
    sessionChoices,
    selectedSession,
    updateWorkbench,
    invalidScope,
    invalidSession,
    setScope,
  } = data;
  return (
    <>
      <AdmissionAcademicFilters
        allowAllHierarchy
        boardId={academic.boardId}
        mediumId={academic.mediumId}
        standardId={academic.standardId}
        onChange={academic.update}
        filterAction={
          <Box sx={{ width: { xs: '100%', lg: 260 }, minWidth: 0 }}>
            <CustomSelect
              label="Session"
              isSearch
              value={state.sessionId || ALL}
              isLoading={sessions.isLoading}
              options={[
                { value: ALL, label: 'All sessions' },
                ...sessionChoices.map((session) => ({
                  value: session.id,
                  label: `${session.name}${session.isCancelled ? ' (cancelled)' : ''}`,
                })),
              ]}
              onChange={(value) =>
                updateWorkbench({
                  assessmentSession: value === ALL ? undefined : String(value),
                  assessmentPage: 0,
                })
              }
            />
          </Box>
        }
      />
      {sessions.isError && <AdmissionQueryError onRetry={sessions.refetch} />}
      {invalidScope && (
        <Alert
          severity="warning"
          action={<Button onClick={() => setScope('')}>Clear filter</Button>}
        >
          This assessment is unavailable in the selected academic context.
        </Alert>
      )}
      {invalidSession && (
        <Alert
          severity="warning"
          action={
            <Button
              onClick={() => updateWorkbench({ assessmentSession: undefined, assessmentPage: 0 })}
            >
              Clear session
            </Button>
          }
        >
          This session is unavailable in the selected academic context.
          {selectedSession.isError && <Button onClick={selectedSession.refetch}>Retry</Button>}
        </Alert>
      )}
      {selectedSession.currentData?.roomReservationStatus === 2 && (
        <Alert severity="info">Room approval is pending. Bookings are held until approval.</Alert>
      )}
      <Paper variant="outlined" sx={{ px: 1, py: 1, flexShrink: 0, minWidth: 0 }}>
        <Stack
          direction="row"
          role="group"
          aria-label="Assessment status filter"
          sx={{ gap: 2, overflowX: 'auto' }}
        >
          {assessmentWorkspaceQueues.map((tab) => (
            <Button
              key={tab.value}
              size="small"
              variant="text"
              aria-pressed={state.status === tab.value}
              sx={{
                minHeight: 48,
                borderRadius: 0,
                flexShrink: 0,
                whiteSpace: 'nowrap',
                px: 1.5,
                color: state.status === tab.value ? 'text.primary' : 'text.secondary',
                borderBottom: 2,
                borderColor: state.status === tab.value ? 'text.primary' : 'transparent',
              }}
              onClick={() =>
                updateWorkbench({
                  assessmentStatus: tab.value === 'all' ? undefined : tab.value,
                  assessmentQueue: undefined,
                  assessmentPage: 0,
                })
              }
            >
              {tab.label}
              {!applicants.isError &&
                !invalidScope &&
                !invalidSession &&
                applicants.currentData?.statusCounts && (
                  <Label sx={{ ml: 1 }} color={tab.color}>
                    {applicants.currentData.statusCounts[tab.value]}
                  </Label>
                )}
            </Button>
          ))}
        </Stack>
      </Paper>
    </>
  );
}
