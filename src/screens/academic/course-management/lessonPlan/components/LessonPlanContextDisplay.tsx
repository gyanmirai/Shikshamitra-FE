import { Box, Typography } from '@mui/material';

type ContextItem = {
  label: string;
  value: string;
};

type Props = {
  teacherName: string;
  plannedDate: string;
  period: string;
  className: string;
  divisionName: string;
  subjectName: string;
};

export function LessonPlanContextDisplay({
  teacherName,
  plannedDate,
  period,
  className,
  divisionName,
  subjectName,
}: Props) {
  const items: ContextItem[] = [
    { label: 'Teacher', value: teacherName },
    { label: 'Planned date', value: plannedDate },
    { label: 'Period / time', value: period },
    { label: 'Class', value: className },
    { label: 'Division', value: divisionName },
    { label: 'Subject', value: subjectName },
  ];

  return (
    <Box
      component="dl"
      aria-label="Selected schedule context"
      sx={{
        m: 0,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        gap: 1,
      }}
    >
      {items.map((item) => (
        <Box
          component="div"
          key={item.label}
          sx={{
            minWidth: 0,
            px: 1.5,
            py: 1.25,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1.25,
            bgcolor: 'background.paper',
          }}
        >
          <Typography component="dt" variant="caption" color="text.secondary" fontWeight={600}>
            {item.label}
          </Typography>
          <Typography
            component="dd"
            variant="body2"
            fontWeight={700}
            sx={{ m: 0, mt: 0.25, overflowWrap: 'anywhere' }}
          >
            {item.value || 'Not available'}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
