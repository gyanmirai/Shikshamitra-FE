import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Label } from 'src/components/label';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {
  Box,
  Card,
  List,
  Grid,
  Stack,
  Avatar,
  Button,
  Divider,
  ListItem,
  Typography,
  CardContent,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';

// Styled components for custom visuals
const StatusChipColor = (status: string): LabelColor => {
  let color: LabelColor = 'default';

  if (status === 'HalfDayLeave') {
    color = 'warning'; // Orange
  } else if (status === 'Present') {
    color = 'success'; // Green
  } else if (status === 'All') {
    color = 'default';
  }

  return color;
};

const LeaveCard = ({
  title,
  count,
  percentage,
  color,
}: {
  title: string;
  count: number;
  percentage: number;
  color: string;
}) => (
  <Card
    variant="outlined"
    sx={{
      height: '100%',
      borderRadius: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}
  >
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box
          sx={{
            width: 4,
            height: 24,
            bgcolor: color,
            borderRadius: 1,
          }}
        />
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Stack direction="row" alignItems="baseline" spacing={0.5}>
            <Typography variant="h6" fontWeight="bold">
              {count}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ({percentage}%)
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const LeaveManagement = () => {
  const requests = [
    {
      id: 1,
      name: 'Kanwar Rajan',
      type: 'Sick Leave',
      duration: '2 Days',
      status: 'HalfDayLeave',
      avatar: '',
    },
    {
      id: 2,
      name: 'Kumar Rajes',
      type: 'Sick Leave',
      duration: '2 Days',
      status: 'Present',
      avatar: '',
    },
    {
      id: 3,
      name: 'Jinjala Dharmik',
      type: 'Casual Leave',
      duration: '2 Days',
      status: 'All',
      avatar: '',
    },
  ];

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 3,
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">
          Leave Management
        </Typography>
        <Stack direction="row" spacing={1}>
          <Label color="warning">Pending : 5</Label>
          <Label color="success">Approved : 12 </Label>
        </Stack>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <LeaveCard title="Sick Leave" count={12} percentage={52.2} color="#D81B60" />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <LeaveCard title="Casual Leave" count={8} percentage={34.2} color="#1E88E5" />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <LeaveCard title="Paid Leave" count={8} percentage={34.2} color="#E57373" />
        </Grid>
      </Grid>

      {/* Recent Requests */}
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        Recent Requests
      </Typography>
      <List disablePadding sx={{ flexGrow: 1 }}>
        {requests.map((req) => (
          <ListItem
            key={req.id}
            disableGutters
            secondaryAction={
              <Label color={StatusChipColor(req.status)} variant="soft">
                {req.status}
              </Label>
            }
            sx={{ py: 1.5 }}
          >
            <ListItemAvatar>
              <Avatar src={req.avatar} alt={req.name} />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="subtitle2" fontWeight="600">
                  {req.name}
                </Typography>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {req.type} • {req.duration}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Footer */}
      <Box display="flex" justifyContent="flex-end">
        <Button
          endIcon={<ArrowForwardIosIcon sx={{ fontSize: '12px !important' }} />}
          sx={{ textTransform: 'none', color: 'text.primary', fontWeight: 600 }}
        >
          View All Requests
        </Button>
      </Box>
    </Card>
  );
};

export default LeaveManagement;
