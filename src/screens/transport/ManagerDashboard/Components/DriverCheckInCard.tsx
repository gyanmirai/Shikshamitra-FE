import { useTheme } from '@mui/material/styles';
import { Box, Card, Stack, Tooltip, CardHeader, Typography } from '@mui/material';

const DriverCheckInCard = () => {
  const theme = useTheme();

  const data = [
    { label: 'Checked In', value: 12, color: theme.palette.success.main },
    { label: 'Not Checked In', value: 3, color: theme.palette.warning.main },
    { label: 'Late Check-In', value: 1, color: theme.palette.error.main },
  ];

  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <Card>
      <CardHeader title="Driver Check-In Status (Today)" />

      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          {data.map((item) => (
            <Stack
              key={item.label}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                <Typography variant="subtitle2">{item.label}</Typography>
              </Stack>
              <Typography variant="subtitle2">{item.value}</Typography>
            </Stack>
          ))}
        </Stack>

        <Box sx={{ display: 'flex', height: 10, borderRadius: 1, overflow: 'hidden', mt: 3 }}>
          {data.map((item) => (
            <Tooltip key={item.label} title={`${item.label}: ${item.value}`}>
              <Box
                sx={{
                  width: `${(item.value / total) * 100}%`,
                  bgcolor: item.color,
                  height: '100%',
                }}
              />
            </Tooltip>
          ))}
        </Box>
      </Box>
    </Card>
  );
};

export default DriverCheckInCard;
