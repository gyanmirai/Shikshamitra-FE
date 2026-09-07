import type { Theme } from '@mui/material/styles';

import { alpha } from '@mui/material/styles';
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
    <Stack spacing={1.5}>
      {visibleIssues.length > 0 && (
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: (theme) => alpha(theme.palette.warning.main, 0.28),
            bgcolor: (theme) => alpha(theme.palette.warning.main, 0.06),
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
            <Iconify icon={GlobalIcons.bell} color="warning.main" width={19} height={19} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }}>
              Readiness attention
            </Typography>
            <Chip size="small" color="warning" variant="soft" label={visibleIssues.length} />
          </Stack>

          <Stack spacing={1} component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
            {visibleIssues.map((issue) => {
              const isBlocking = issue.severity === 'blocking';

              return (
                <Box
                  component="li"
                  key={issue.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: (theme: Theme) =>
                      alpha(
                        isBlocking ? theme.palette.error.main : theme.palette.warning.main,
                        0.2
                      ),
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
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
            p: 2,
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.info.main, 0.06),
            border: '1px solid',
            borderColor: (theme) => alpha(theme.palette.info.main, 0.2),
          }}
        >
          <Stack direction="row" alignItems="flex-start" spacing={1.25}>
            <Iconify icon={GlobalIcons.info} color="info.main" width={20} height={20} />
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
    </Stack>
  );
}
