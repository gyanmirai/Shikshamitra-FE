import React from 'react';

import { Box,  List,  ListItem,  Typography,  ListItemText } from '@mui/material';

import TransportMap from '../component/view-on-map-dialog';





interface RoutePoint {
  id: number;
  name: string;
  coordinates: [number, number];
}

interface RouteDetailsNew {
  startPoint:any;
  endPoint:any;
  stops: any;
}

interface FinalRouteProps {
  routeDetails: RouteDetailsNew;
}

const FinalRoute: React.FC<FinalRouteProps> = ({ routeDetails }) => {
  const { startPoint, endPoint, stops } = routeDetails;

  const lastIndex = stops.length-1;
 
  console.log("final screen final route", stops)

  return (
    <Box padding={2} border={1} borderColor="grey.300" borderRadius={2}>
      <Typography variant="h6" gutterBottom>
        Final Route Overview
      </Typography>

      <Box marginBottom={2}>
        <Typography variant="subtitle1">
          <strong>Start Point:</strong> {startPoint?.name || 'Not Set'}
        </Typography>
        <Typography variant="subtitle1">
          <strong>End Point:</strong> {endPoint?.name || 'Not Set'}
        </Typography>
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        <strong>Stops:</strong>
      </Typography>
      <List>
        {stops[lastIndex].length > 0 ? (
          stops[lastIndex].map((stop:any) => (
            <ListItem key={stop.id}>
              <ListItemText primary={stop.name} />
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No stops added
          </Typography>
        )}
      </List>
   

      {startPoint && endPoint && (
        <TransportMap 
          start={startPoint.coordinates} 
          end={endPoint.coordinates} 
          waypoints={stops[lastIndex].map((stop:any) => stop.coordinates)} 
        />
      )} 
     </Box>
  );
};

export default FinalRoute;
