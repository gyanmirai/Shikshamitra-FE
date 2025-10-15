import React from 'react';
import { DragIndicator } from '@mui/icons-material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetRouteStopsDataQuery } from 'src/redux/transport/vehicle-management/route-management-api';
import {
  Box,
  Card,
  List,
  Chip,
  Avatar,
  ListItem,
  Typography,
  IconButton,
  CardContent,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

type RouteStop = {
  id: string | number;
  name: string;
  students: number;
  time: string;
};

const RouteStopsCard = () => {
  const { data: mockStopsData } = useQueryAndMutation<{ data: RouteStop[] }>({
    type: 'query',
    currentQueryAndMutation: useGetRouteStopsDataQuery,
  });

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 4, height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
          Route Stops
        </Typography>

        <List sx={{ p: 0 }}>
          {mockStopsData?.map((stop: RouteStop, index: number) => (
            <ListItem
              key={stop.id}
              sx={{
                px: 0,
                py: 2,
                display: 'flex',
                alignItems: 'center',
                borderBottom: index < mockStopsData.length - 1 ? '1px solid #f0f0f0' : 'none',
              }}
            >
              {/* Drag Handle */}
              <ListItemIcon sx={{ minWidth: 40 }}>
                <IconButton size="small" sx={{ cursor: 'grab', color: 'text.secondary' }}>
                  <DragIndicator fontSize="small" />
                </IconButton>
              </ListItemIcon>

              {/* Stop Number Avatar */}
              <Box sx={{ mr: 2 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: 'primary.main',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  {stop.id}
                </Avatar>
              </Box>

              {/* Stop Details */}
              <ListItemText
                primary={
                  <Typography variant="body1" fontWeight="600" sx={{ mb: 0.5 }}>
                    {stop.name}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    Total Students: {stop.students.toString().padStart(2, '0')}
                  </Typography>
                }
                sx={{ flex: 1, minWidth: 0 }}
              />

              {/* Time Chip */}
              <Chip
                label={stop.time}
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: 2,
                  fontWeight: 500,
                  minWidth: 80,
                  backgroundColor: 'background.paper',
                  borderColor: 'divider',
                }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default RouteStopsCard;
