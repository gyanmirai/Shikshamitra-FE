import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Stack, CardHeader, Typography } from '@mui/material';

const renderInfoTooltip = (title: string, tooltipText: string) => (
  <Stack direction="row" alignItems="center" spacing={1}>
    <Box component="span">{title}</Box>
    <CustomTooltip title={tooltipText} arrow placement="top">
      <Iconify
        icon="eva:info-outline"
        width={18}
        sx={{ color: 'text.disabled', cursor: 'pointer' }}
      />
    </CustomTooltip>
  </Stack>
);

const AlertCenter = () => (
  <Card>
    <CardHeader
      title={renderInfoTooltip(
        'Alert Center',
        'Student alerts that require administrative follow-up.'
      )}
    />
    <Stack sx={{ p: 3, minHeight: 220, justifyContent: 'center' }}>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        No student alerts found.
      </Typography>
    </Stack>
  </Card>
);

export default AlertCenter;
