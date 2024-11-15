'use client';

import 'leaflet/dist/leaflet.css';

import type { LatLngExpression } from 'leaflet';

import L from 'leaflet';
import React, { useState, useEffect } from 'react';
import { Popup, Marker, Polyline, TileLayer, MapContainer } from 'react-leaflet';

import { Box, Typography } from '@mui/material';

import { CONFIG } from 'src/config-global';

const TransportRealTimeTrackingScreen = () => {
  const position: LatLngExpression = [21.149194021137408, 72.88653904334416];
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  const start: LatLngExpression = [21.233659274910956, 72.862602819098];
  const end: LatLngExpression = [21.14843573826047, 72.88572990744605];

  const waypoint: LatLngExpression[] = [
    [21.200659, 72.870602],
    [21.180435, 72.880729],
  ];

  const getRouteCoordinates = async (startPoint: any, endPoint: any, waypoints: any) => {
    // Create a string of all coordinates for the route, including start, waypoints, and end
    const coordinates = [start, ...waypoints, end]
      .map((coord) => `${coord[1]},${coord[0]}`)
      .join(';');

    console.log('coordinates', coordinates);

    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordinates}?geometries=geojson`
    );
    const data = await response.json();
    return data.routes[0].geometry.coordinates.map((coord: any) => [coord[1], coord[0]]);
  };

  useEffect(() => {
    const fetchRoute = async () => {
      const coordinates = await getRouteCoordinates(start, end, waypoint);
      console.log('Fetched coordinates :', coordinates);
      setRouteCoordinates(coordinates);
    };

    fetchRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Box height="100vh">
        <MapContainer
          style={{ height: '100%', width: '100%' }}
          center={position}
          zoom={13}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker
            position={start}
            icon={L.icon({
              iconUrl: `${CONFIG.site.basePath}/assets/images/location/placeholder.png`,
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })}
          >
            <Popup>Start Point</Popup>
          </Marker>

          <Marker
            position={end}
            icon={L.icon({
              iconUrl: `${CONFIG.site.basePath}/assets/images/location/placeholder.png`,
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })}
          >
            <Popup>End Point</Popup>
          </Marker>

          {waypoint.map((point: any, index: any) => (
            <Marker
              key={index}
              position={point}
              icon={L.icon({
                iconUrl: `${CONFIG.site.basePath}/assets/images/location/placeholder.png`,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
              })}
            >
              <Popup>Waypoint {index + 1}</Popup>
            </Marker>
          ))}
          {routeCoordinates.length > 0 && <Polyline positions={routeCoordinates} color="red" />}
        </MapContainer>
      </Box>
      <Typography>Hiren</Typography>
    </>
  );
};

export default TransportRealTimeTrackingScreen;
