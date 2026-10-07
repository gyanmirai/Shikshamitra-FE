import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Chip, Stack, Typography } from '@mui/material';

type PlanningIssue = {
  description?: string;
  id: string;
  severity: string;
  title: string;
};

type Readiness = {
  blocking: PlanningIssue[];
  warnings: PlanningIssue[];
};

type ScheduleExamPreviewAlertsProps = {
  missingRoomAssignmentCount?: number;
  readiness: Readiness | null;
  warningCount: number;
};

export function ScheduleExamPreviewAlerts({
  missingRoomAssignmentCount = 0,
  readiness,
  warningCount,
}: ScheduleExamPreviewAlertsProps) {
  const visibleIssues = readiness
    ? [...readiness.blocking, ...(warningCount > 0 ? readiness.warnings : [])]
    : [];

  if (!visibleIssues.length && missingRoomAssignmentCount <= 0) return null;

  return (
    <>
      {visibleIssues.length > 0 && (
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: 'var(--shadows-2)',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
            <Iconify icon={GlobalIcons.bell} color="text.secondary" width={18} height={18} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }}>
              Readiness attention
            </Typography>
            <Chip size="small" variant="soft" label={visibleIssues.length} />
          </Stack>

          <Stack component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
            {visibleIssues.map((issue) => {
              const isBlocking = issue.severity === 'blocking';

              return (
                <Box
                  component="li"
                  key={issue.id}
                  sx={{
                    py: 1,
                    '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' },
                    '&:last-child': { pb: 0 },
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    gap={1}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {issue.title}
                    </Typography>
                    <Chip
                      size="small"
                      color={isBlocking ? 'error' : 'warning'}
                      variant="soft"
                      label={isBlocking ? 'Issue' : 'Warning'}
                    />
                  </Stack>
                  {issue.description && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mt: 0.5 }}
                    >
                      {issue.description}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}

      {missingRoomAssignmentCount > 0 && (
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'var(--shadows-2)',
          }}
        >
          <Stack direction="row" alignItems="flex-start" spacing={0.75}>
            <Iconify
              icon={GlobalIcons.info}
              color="text.secondary"
              width={18}
              height={18}
              sx={{ mt: 0.25, flexShrink: 0 }}
            />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {missingRoomAssignmentCount} room assignment gap
                {missingRoomAssignmentCount > 1 ? 's' : ''}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Room assignment is optional. You can publish now and assign rooms later.
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}
    </>
  );
}
