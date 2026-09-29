import { Label } from 'src/components/label';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Stack, Avatar, Button, Typography } from '@mui/material';
import { DashboardWidgetWrapper } from 'src/screens/mainDashboard/component/dashboard-widget-wrapper';

interface AttentionStudentItem {
  id: string;
  name: string;
  classDivision: string;
  attendance: number | null;
  performance: number;
  warning: string;
  avatarUrl: string;
}

function StudentsAttentionPanel({ students }: { students?: AttentionStudentItem[] }) {
  const displayStudents = students || [];

  return (
    <DashboardWidgetWrapper
      title="Students Needing Attention"
      subheader="Low attendance and weak performance flags"
    >
      {displayStudents.length === 0 ? (
        <EmptyContent
          filled
          title="No students need immediate attention"
          description="Performance and attendance flags from your assigned classes will appear here."
          sx={{ minHeight: 220 }}
          slotProps={{ img: { maxWidth: 96 } }}
        />
      ) : null}
      <Stack spacing={1}>
        {displayStudents.map((student) => (
          <Stack
            key={student.id}
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              p: 1.25,
              borderRadius: 1.5,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Avatar src={student.avatarUrl} alt={student.name} sx={{ width: 40, height: 40 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {student.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {student.classDivision}
                {student.attendance === null ? '' : ` • Att ${student.attendance}%`} • Perf{' '}
                {student.performance}%
              </Typography>
              <Label variant="soft" color="error" sx={{ mt: 0.5 }}>
                {student.warning}
              </Label>
            </Box>
            <Button size="small" variant="outlined">
              Profile
            </Button>
          </Stack>
        ))}
      </Stack>
    </DashboardWidgetWrapper>
  );
}

export { StudentsAttentionPanel };
