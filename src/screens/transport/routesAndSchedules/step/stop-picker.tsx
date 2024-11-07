import L from 'leaflet';
import React, { useState } from 'react';
import { Popup, Marker, TileLayer, MapContainer, useMapEvents } from 'react-leaflet';

import DeleteIcon from '@mui/icons-material/Delete';
import { Box, List, Button, ListItem, IconButton, Typography, ListItemText } from '@mui/material';

import { CONFIG } from 'src/config-global';

interface BusStop {
  id: number;
  name: string;
  coordinates: [number, number];
}

interface BusStopPickerProps {
   stepOneInfo:any;
  onStopsChange: (stops: any) => void;
}

const BusStopPicker: React.FC<BusStopPickerProps> = ({ onStopsChange, stepOneInfo }) => {
    console.log("stepOneinfo", stepOneInfo)
  const [busStops, setBusStops] = useState<BusStop[]>([]);

  const fetchCityName = async (lat: number, lng: number) => {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const data = await response.json();
    return data.display_name || 'Unknown Location';
  };

  const DetectClick = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        const locationName = await fetchCityName(lat, lng);
        const newStop: BusStop = { id: Math.random(), name: locationName, coordinates: [lat, lng] };
        setBusStops((prev) => [...prev, newStop]);
        onStopsChange([...busStops, newStop]);
      },
    });
    return null;
  };

  const handleDeleteStop = (stopId: number) => {
    const updatedStops = busStops.filter((stop) => stop.id !== stopId);
    setBusStops(updatedStops);
    onStopsChange(updatedStops);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
      <Box sx={{ flex: 1, height: '400px' }}>
        <MapContainer
          center={stepOneInfo.startPoint.coordinates}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DetectClick />
          {busStops.map((stop) => (
            <Marker key={stop.id} position={stop.coordinates} icon={L.icon({ iconUrl: `${CONFIG.site.basePath}/assets/images/location/placeholder.png`, iconSize: [25, 41], iconAnchor: [12, 41] })}>
              <Popup>{stop.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>

      <Box sx={{ flex: 1, padding: 2, overflowY: 'auto' }}>
        <Typography variant="h6">Bus Stops</Typography>
        <List>
          {busStops.map((stop) => (
            <ListItem key={stop.id} secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteStop(stop.id)}>
                <DeleteIcon />
              </IconButton>
            }>
              <ListItemText primary={stop.name} />
            </ListItem>
          ))}
        </List>
        <Button onClick={() => setBusStops([])} color="secondary">Clear All Stops</Button>
      </Box>
    </Box>
  );
};

export default BusStopPicker;
