import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const STEPS = [
  {
    title: '1. Choose a class',
    description: 'Only examinations scheduled for the selected class are shown.',
  },
  {
    title: '2. Open the guided setup',
    description: 'Confirm the session, rooms and seating rules before applying anything.',
  },
  {
    title: '3. Review and publish',
    description: 'Resolve capacity issues, validate the result and publish the approved plan.',
  },
];

export default function SeatingPlanHelpTooltip() {
  return (
    <Box sx={{ p: 1.5, maxWidth: 360 }}>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Seating plan workflow
      </Typography>
      <Stack spacing={1}>
        {STEPS.map((step) => (
          <Box key={step.title}>
            <Typography variant="caption" color="text.primary" fontWeight={700} display="block">
              {step.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {step.description}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
