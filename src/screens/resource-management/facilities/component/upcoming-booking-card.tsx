import { Box, Card, Divider, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

interface BookingCardProps {
  title: string;
  subtitle: string;
  date: string;
  time: string;
  person: string;
  department: string;
  status: string;
}

const BookingCard = ({
  title,
  subtitle,
  date,
  time,
  person,
  department,
  status,
}: BookingCardProps) => (
  <Card
    sx={{
      p: 2,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      borderRadius: 2,
      boxShadow: 3,
      border: '1px solid #E0E0E0',
    }}
  >
    {/* Left Side */}
    <Box display="flex" flexDirection="column" justifyContent="space-between">
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>

      <Box mt={1} display="flex" flexDirection="column" gap={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <Iconify icon="uil:calender" width={20} />
          <Typography variant="body2">{date}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Iconify icon="mdi:clock-outline" width={20} />
          <Typography variant="body2">{time}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Iconify icon="mdi:account-outline" width={20} />
          <Typography variant="body2">
            {person} ({department})
          </Typography>
        </Box>
      </Box>
    </Box>

    {/* Divider for separation */}
    <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

    {/* Right Side */}
    <Box display="flex" alignItems="center">
      <Typography
        variant="subtitle1"
        sx={{
          px: 2,
          py: 1,
          borderRadius: 1,
          backgroundColor:
            status === 'Confirmed'
              ? 'success.light'
              : status === 'Pending'
                ? 'warning.light'
                : 'grey.300',
          color:
            status === 'Confirmed'
              ? 'success.dark'
              : status === 'Pending'
                ? 'warning.dark'
                : 'text.primary',
          fontWeight: 500,
        }}
      >
        {status}
      </Typography>
    </Box>
  </Card>
);

export default BookingCard;
