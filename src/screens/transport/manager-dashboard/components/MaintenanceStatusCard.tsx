import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Box, Card, Stack, CardHeader, Typography, LinearProgress } from '@mui/material';

const MaintenanceStatusCard = () => {
  const theme = useTheme();

  const data = [
    { label: 'Service Due Soon', value: 60, color: theme.palette.warning.darkChannel },
    { label: 'Insurance Expiry', value: 30, color: theme.palette.success.darkChannel },
    { label: 'Fitness Expiry', value: 10, color: theme.palette.success.darkChannel },
  ];

  return (
    <Card>
      <CardHeader title="Maintenance Due (Next 15 days)" />
      <Stack spacing={3} sx={{ p: 3 }}>
        {data.map((item) => (
          <Box key={item.label}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle2">{item.label}</Typography>
              <Typography variant="subtitle2">{item.value}%</Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={item.value}
              sx={{
                height: 8,
                bgcolor: varAlpha(item.color, 0.16),
                '& .MuiLinearProgress-bar': {
                  bgcolor: item.color,
                },
              }}
            />
          </Box>
        ))}
      </Stack>
    </Card>
  );
};

export default MaintenanceStatusCard;
