import React from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Card, List, Avatar, ListItem, Typography } from '@mui/material';
import { useGetRouteStopsDataQuery } from 'src/redux/transport/vehicle-management/route-management-api';

type RouteStop = {
  id: string | number;
  name: string;
};

const RouteStopsCard = () => {
  const { data: mockStopsData } = useQueryAndMutation<{ data: RouteStop[] }>({
    type: 'query',
    currentQueryAndMutation: useGetRouteStopsDataQuery,
  });

  return (
    <Card sx={{ p: 3, borderRadius: 2, boxShadow: 4, height: '100%' }}>
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" color="primary" fontWeight="bold" sx={{ marginTop: -1 }}>
            Route Stops
          </Typography>

          <Box>
            Total Stops :{' '}
            <Box component="span" sx={{ color: '#212121' }}>
              {mockStopsData?.length || 15}
            </Box>
          </Box>
        </Box>

        <List>
          <Scrollbar sx={{ height: 400 }}>
            {mockStopsData?.map((stop: RouteStop, index: number) => (
              <ListItem
                key={stop.id}
                sx={{
                  px: 0,
                  py: 0,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  position: 'relative',
                }}
              >
                {/* Vertical connecting line */}
                {index < mockStopsData.length - 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '16px',
                      top: '32px',
                      bottom: '-16px',
                      width: '2px',
                      backgroundColor: '#E0E0E0',
                      zIndex: 0,
                    }}
                  />
                )}

                {/* Avatar */}
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: index === 0 ? '#00C853' : '#2196F3',
                    fontSize: '16px',
                    fontWeight: 500,
                    color: 'white',
                    flexShrink: 0,
                    zIndex: 1,
                    position: 'relative',
                  }}
                >
                  {index === 0 ? '✓' : index}
                </Avatar>

                {/* Stop Details */}
                <Box sx={{ flex: 1, py: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#757575',
                      fontSize: '12px',
                      display: 'block',
                      lineHeight: 1.5,
                      mb: 0.25,
                    }}
                  >
                    {index === 0 ? 'Start Point' : `Stop ${index}`}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#212121',
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: 1.5,
                      mb: 2,
                    }}
                  >
                    {stop.name}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </Scrollbar>
        </List>

        {/* Total Stops Footer */}
      </Box>
    </Card>
  );
};

export default RouteStopsCard;
