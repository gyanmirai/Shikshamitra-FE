'use client';

import 'leaflet/dist/leaflet.css';

import type { LatLngExpression } from 'leaflet';

import L from 'leaflet';
import React, { useState, useEffect } from 'react';
import { Popup, Marker, Polyline, TileLayer, MapContainer } from 'react-leaflet';

import { Box } from '@mui/material';

import { CONFIG } from 'src/config-global';

interface TransportMapProps {
  start: [number, number];
  end: [number, number];
  waypoints: [number, number][];
}

const TransportMap: React.FC<TransportMapProps> = ({ start, end, waypoints }) => {
  const [routeCoordinates, setRouteCoordinates] = useState<LatLngExpression[]>([]);
  console.log('final screen waypoinyts', waypoints);
  // const flattenedStops = waypoints.flat();
  // console.log("final screen flatwaypoinyts",flattenedStops)
  const getRouteCoordinates = async (
    startPoint: [number, number],
    endPoint: [number, number],
    routeWaypoints: any
  ) => {
    const coordinates = [startPoint, ...routeWaypoints, endPoint]
      .map((coord) => `${coord[1]},${coord[0]}`)
      .join(';');

    console.log('final screen', coordinates);
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordinates}?geometries=geojson`
    );
    const data = await response.json();

    // Return coordinates as a mapped array
    return data.routes[0].geometry.coordinates.map((coord: [number, number]) => [
      coord[1],
      coord[0],
    ]);
  };

  useEffect(() => {
    const fetchRoute = async () => {
      const coordinates = await getRouteCoordinates(start, end, waypoints);
      console.log('Fetched coordinates:', coordinates);
      setRouteCoordinates(coordinates);
    };

    fetchRoute();
  }, [start, end, waypoints]);

  const iconUrl = `${CONFIG.site.basePath}/assets/images/location/placeholder.png`;
  const icon = L.icon({
    iconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
  console.log('start', start);
  return (
    <Box height="100vh" width="100vw">
      <MapContainer
        style={{ height: '100%', width: '100%' }}
        center={start}
        zoom={12}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={start} icon={icon}>
          <Popup>Start Point</Popup>
        </Marker>
        <Marker position={end} icon={icon}>
          <Popup>End Point</Popup>
        </Marker>
        {waypoints.map((point, index) => (
          <Marker key={index} position={point} icon={icon}>
            <Popup>Waypoint {index + 1}</Popup>
          </Marker>
        ))}
        {/* Only render polyline if there are coordinates */}
        {routeCoordinates.length > 0 && <Polyline positions={routeCoordinates} color="red" />}
      </MapContainer>
      <Box pb="20px" />
    </Box>
  );
};

export default TransportMap;
