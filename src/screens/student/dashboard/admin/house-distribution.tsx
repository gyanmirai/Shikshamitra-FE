import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Stack, CardHeader, Typography } from '@mui/material';

export default function HouseDistribution() {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          transition: 'all 0.3s ease-in-out',
        },
      }}
    >
      <CardHeader
        sx={{ mt: -1, ml: -1 }}
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box component="span">House Distribution</Box>
            <CustomTooltip
              title="Distribution of students across different school houses."
              arrow
              placement="top"
            >
              <Iconify
                icon="eva:info-outline"
                width={18}
                sx={{ color: 'text.disabled', cursor: 'pointer' }}
              />
            </CustomTooltip>
          </Stack>
        }
      />

      <Stack sx={{ p: 3, flexGrow: 1, justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          No house distribution found.
        </Typography>
      </Stack>
    </Card>
  );
}
