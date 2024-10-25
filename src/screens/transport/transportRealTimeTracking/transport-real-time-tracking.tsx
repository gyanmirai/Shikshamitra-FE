'use client'

import "leaflet/dist/leaflet.css";

import type { LatLngExpression } from 'leaflet';

import React from 'react';
import { Popup, Marker, TileLayer, MapContainer } from 'react-leaflet';

import { Box, Typography } from "@mui/material";

const TransportRealTimeTrackingScreen = () => {
    const position: LatLngExpression = [21.149194021137408, 72.88653904334416]; // Coordinates for India

    return (
        <>
        <Box height="250px" width="250px">
         <MapContainer style={{ height: '100%', width: '100%' }} center={position} zoom={13} scrollWheelZoom={false} >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
                <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
            </Marker>
        </MapContainer>
       </Box>
       <Typography>Hiren</Typography>
        </>
       
    );
};

export default TransportRealTimeTrackingScreen;
