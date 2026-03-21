import React from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Card, List, Avatar, ListItem, Typography } from '@mui/material';
import { useGetRouteStopsQuery } from 'src/redux/transport/vehicle-management/route-management-api';

type RouteStop = {
  id: string | number;
  name: string;
};

const RouteStopsCard = () => {
  const { data: mockStopsData } = useQueryAndMutation<{ data: RouteStop[] }>({
    type: 'query',
    currentQueryAndMutation: useGetRouteStopsQuery,
    params: {
      routeId: '',
      academicMediumId: '',
    },
  });

  return (
    <Card
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        },
      }}
    >
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            pb: 2,
            borderBottom: '2px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="overline"
            color="primary"
            fontWeight="700"
            sx={{
              fontSize: '0.7rem',
              letterSpacing: '0.08em',
            }}
          >
            Route Stops
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'action.hover',
              px: 2,
              py: 0.75,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            >
              Total Stops:
            </Typography>
            <Typography
              variant="body2"
              fontWeight="700"
              sx={{
                color: 'primary.main',
                fontSize: '0.9rem',
              }}
            >
              {mockStopsData?.length || 0}
            </Typography>
          </Box>
        </Box>

        <List sx={{ pt: 1 }}>
          <Scrollbar sx={{ height: 400, pr: 1 }}>
            {mockStopsData?.map((stop: RouteStop, index: number) => (
              <ListItem
                key={stop.id}
                sx={{
                  px: 0,
                  py: 1,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  position: 'relative',
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {/* Vertical connecting line */}
                {index < mockStopsData.length - 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '19px',
                      top: '40px',
                      bottom: '-8px',
                      width: '2px',
                      bgcolor: 'grey.500',
                      zIndex: 0,
                    }}
                  />
                )}

                {/* Avatar */}
                <Avatar
                  sx={{
                    width: 38,
                    height: 38,
                    bgcolor: index === 0 ? 'success.main' : 'grey.500',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'white',
                    flexShrink: 0,
                    zIndex: 1,
                    position: 'relative',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    border: '2px solid',
                    borderColor: 'background.paper',
                  }}
                >
                  {index === 0 ? '✓' : index}
                </Avatar>

                {/* Stop Details */}
                <Box sx={{ flex: 1, py: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.7rem',
                      display: 'block',
                      lineHeight: 1.5,
                      mb: 0.5,
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {index === 0 ? 'Start Point' : `Stop ${index}`}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.primary',
                      fontSize: '0.9rem',
                      fontWeight: 500,
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
