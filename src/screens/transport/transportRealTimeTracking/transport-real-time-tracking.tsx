'use client';

import "leaflet/dist/leaflet.css";

import type { LatLngExpression } from 'leaflet';

import React from 'react';
import { Polyline, TileLayer, MapContainer } from 'react-leaflet';

import { Box, Typography } from "@mui/material";

const TransportRealTimeTrackingScreen = () => {
    const position: LatLngExpression = [21.149194021137408, 72.88653904334416]; // Coordinates for India
    const routeCoordinates: LatLngExpression[] = [
        [21.149194021137408, 72.88653904334416],
       [21.223153905773504, 72.99673141447806]
    ];

    return (
        <>
            <Box height="100vh">
                <MapContainer style={{ height: '100%', width: '100%' }} center={position} zoom={13} scrollWheelZoom={false}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {routeCoordinates.length > 1 && (
                        <Polyline positions={routeCoordinates} color='red' />
                    )}
                </MapContainer>
            </Box>
            <Typography>Hiren</Typography>
        </>
    );
};

export default TransportRealTimeTrackingScreen;
// 'use client';

// import "leaflet/dist/leaflet.css";
// import type { LatLngExpression } from 'leaflet';
// import React from 'react';
// import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
// import { Box, Typography } from "@mui/material";

// const TransportRealTimeTrackingScreen = () => {
//     const position: LatLngExpression = [21.149194021137408, 72.88653904334416]; // Coordinates for India
//     const routeCoordinates: LatLngExpression[] = [
//         [21.149194021137408, 72.88653904334416]
//         // Only one point here
//     ];

//     return (
//         <>
//             <Box height="100vh">
//                 <MapContainer style={{ height: '100%', width: '100%' }} center={position} zoom={13} scrollWheelZoom={false}>
//                     <TileLayer
//                         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                     />
//                     {routeCoordinates.length > 1 && (
//                         <Polyline positions={routeCoordinates} color='red' />
//                     )}
//                 </MapContainer>
//             </Box>
//             <Typography>Hiren</Typography>
//         </>
//     );
// };

// export default TransportRealTimeTrackingScreen;
