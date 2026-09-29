import Link from 'next/link';
import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Stack, Button, Typography } from '@mui/material';
import { DashboardWidgetWrapper } from 'src/screens/mainDashboard/component/dashboard-widget-wrapper';

const priorityColor = {
  high: 'error',
  medium: 'warning',
  low: 'success',
} as const;

interface PendingTaskItem {
  id: string;
  title: string;
  count: number;
  priority: 'high' | 'medium' | 'low';
  action: string;
  icon: string;
  path: string;
}

function PendingTaskCenter({ tasks }: { tasks?: PendingTaskItem[] }) {
  const displayTasks = tasks || [];
  const urgentCount = displayTasks.filter((t) => t.priority === 'high').length;

  return (
    <DashboardWidgetWrapper
      title="Pending Task Center"
      subheader="Actionable tasks requiring attention today"
      action={
        urgentCount > 0 ? (
          <Label color="error" variant="soft">
            {urgentCount} Urgent
          </Label>
        ) : null
      }
    >
      {displayTasks.length === 0 ? (
        <EmptyContent
          filled
          title="No pending academic tasks"
          description="New evaluation and grade-entry work will appear here."
          sx={{ minHeight: 220 }}
          slotProps={{ img: { maxWidth: 96 } }}
        />
      ) : null}
      <Stack spacing={1}>
        {displayTasks.map((task) => (
          <Stack
            key={task.id}
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              p: 1.25,
              borderRadius: 1.5,
              border: (theme) =>
                `1px solid ${alpha(theme.palette[priorityColor[task.priority] || 'info'].main, 0.2)}`,
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1,
                display: 'grid',
                placeItems: 'center',
                color: `${priorityColor[task.priority] || 'info'}.main`,
                flexShrink: 0,
              }}
            >
              <Iconify icon={task.icon || 'solar:info-circle-bold'} width={18} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }}>
                <Typography variant="subtitle2">{task.count}</Typography>
                <Typography variant="body2" noWrap>
                  {task.title}
                </Typography>
              </Stack>
              <Label variant="soft" color={priorityColor[task.priority] || 'info'}>
                {task.priority} priority
              </Label>
            </Box>

            <Button
              component={Link}
              href={task.path}
              size="small"
              variant="contained"
              color="inherit"
            >
              {task.action}
            </Button>
          </Stack>
        ))}
      </Stack>
    </DashboardWidgetWrapper>
  );
}

export { PendingTaskCenter };
