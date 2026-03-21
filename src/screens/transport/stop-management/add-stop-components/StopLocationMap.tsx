import L from 'leaflet';
import React, { useState, useEffect } from 'react';
import { Box, Card, Typography } from '@mui/material';
import { Popup, Marker, TileLayer, MapContainer, useMapEvents } from 'react-leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationCoordinates {
  latitude?: number;
  longitude?: number;
}

interface SelectedLocation {
  name: string;
  coordinates?: LocationCoordinates;
}

interface StopLocationMapProps {
  formik: any;
  selectedLocation?: SelectedLocation;
  onLocationSelect?: (coordinates: LocationCoordinates) => void;
}

// Custom component to handle map clicks
const MapClickHandler = ({
  onLocationSelect,
  formik,
}: {
  onLocationSelect?: (coordinates: LocationCoordinates) => void;
  formik: any;
}) => {
  useMapEvents({
    click: (event) => {
      const { lat, lng } = event.latlng;
      const newCoordinates = {
        latitude: lat,
        longitude: lng,
      };

      // Update formik coordinates
      formik.setFieldValue('coordinates', newCoordinates);

      if (onLocationSelect) {
        onLocationSelect(newCoordinates);
      }
    },
  });
  return null;
};

const StopLocationMap: React.FC<StopLocationMapProps> = ({
  formik,
  selectedLocation,
  onLocationSelect,
}) => {
  // Default position (Surat, Gujarat - matching your data)
  const defaultPosition: [number, number] = [21.1702, 72.8311];

  const [position, setPosition] = useState<[number, number]>(() => {
    if (formik.values.coordinates?.latitude && formik.values.coordinates?.longitude) {
      return [formik.values.coordinates.latitude, formik.values.coordinates.longitude];
    }
    return defaultPosition;
  });

  const [selectedPoint, setSelectedPoint] = useState<SelectedLocation>({
    name: formik.values.landmark || selectedLocation?.name || 'Parvat Patiya',
    coordinates: formik.values.coordinates ||
      selectedLocation?.coordinates || {
        latitude: defaultPosition[0],
        longitude: defaultPosition[1],
      },
  });

  // Update position when formik coordinates change
  useEffect(() => {
    if (formik.values.coordinates?.latitude && formik.values.coordinates?.longitude) {
      setPosition([formik.values.coordinates.latitude, formik.values.coordinates.longitude]);
      setSelectedPoint({
        name: formik.values.landmark || 'Selected Location',
        coordinates: formik.values.coordinates,
      });
    }
  }, [formik.values.coordinates, formik.values.landmark]);

  // Custom marker icon
  const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Map Container */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          minHeight: '400px',
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          overflow: 'hidden',
          '& .leaflet-container': {
            height: '100%',
            width: '100%',
            borderRadius: 'inherit',
          },
        }}
      >
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
          attributionControl={false}
          dragging={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <Marker position={position} icon={customIcon}>
            <Popup>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  {selectedPoint.name}
                </Typography>
                <Typography variant="caption" display="block">
                  Lat: {position[0].toFixed(6)}
                </Typography>
                <Typography variant="caption" display="block">
                  Lng: {position[1].toFixed(6)}
                </Typography>
              </Box>
            </Popup>
          </Marker>

          <MapClickHandler onLocationSelect={onLocationSelect} formik={formik} />
        </MapContainer>
      </Box>
    </Card>
  );
};

export default StopLocationMap;
