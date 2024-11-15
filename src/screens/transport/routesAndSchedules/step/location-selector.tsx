import L from 'leaflet';
import React, { useState } from 'react';
import { Popup, Marker, TileLayer, MapContainer, useMapEvents } from 'react-leaflet';

import { Box, Switch, Typography } from '@mui/material';

import { CONFIG } from 'src/config-global';

// Define types for coordinates and location data
interface Coordinates {
  lat: number;
  lng: number;
}

interface LocationDetail {
  coordinates: Coordinates;
  name: string;
}

// Define props interface
interface LocationPickerProps {
  onLocationSelect: (location: any, type: any) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect }) => {
  const [isStartPoint, setIsStartPoint] = useState(true);
  const [selectedStart, setSelectedStart] = useState<Coordinates | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Coordinates | null>(null);
  const [selectedStartDetail, setSelectedStartDetail] = useState<string | null>(null);
  const [selectedEndDetail, setSelectedEndDetail] = useState<string | null>(null);

  const fetchCityName = async (lat: number, lng: number): Promise<string> => {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const data = await response.json();
    return data.display_name || data.address?.suburb || data.address?.neighbourhood || "Unknown Location";
  };

  const DetectClick: React.FC = () => {
    useMapEvents({
      click: async (event) => {
        const { lat, lng } = event.latlng;
        const locationName = await fetchCityName(lat, lng);
        const coordinates = { lat, lng };

        if (isStartPoint) {
          setSelectedStart(coordinates);
          setSelectedStartDetail(locationName);
          onLocationSelect({
            start: { coordinates, name: locationName },
        },"start");
        
        } else {
          setSelectedEnd(coordinates);
          setSelectedEndDetail(locationName);
          onLocationSelect({
            end: { coordinates, name: locationName },
          }, "end");
           
        }
      },
    });
    return null;
  };

  const handleSwitchChange = () => {
    setIsStartPoint((prev) => !prev);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography>{isStartPoint ? 'Set Start Point' : 'Set End Point'}</Typography>
        <Switch checked={!isStartPoint} onChange={handleSwitchChange} />
        <Typography>{isStartPoint ? 'End Point' : 'Start Point'}</Typography>
      </Box>

      <MapContainer
        center={selectedStart || { lat: 21.1492, lng: 72.8865 }}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {selectedStart && (
          <Marker position={selectedStart} icon={L.icon({ iconUrl: `${CONFIG.site.basePath}/assets/images/location/placeholder.png`, iconSize: [25, 41], iconAnchor: [12, 41] })}>
            <Popup>Start Point: {selectedStartDetail}</Popup>
          </Marker>
        )}
        {selectedEnd && (
          <Marker position={selectedEnd} icon={L.icon({ iconUrl: `${CONFIG.site.basePath}/assets/images/location/placeholder.png`, iconSize: [25, 41], iconAnchor: [12, 41] })}>
            <Popup>End Point: {selectedEndDetail}</Popup>
          </Marker>
        )}
        <DetectClick />
      </MapContainer>
    </Box>
  );
};

export default LocationPicker;
