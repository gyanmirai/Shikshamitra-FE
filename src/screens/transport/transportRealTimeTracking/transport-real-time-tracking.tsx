'use client'

import type { LatLngExpression } from 'leaflet';

import React from 'react';
import { Popup, Marker, TileLayer, MapContainer } from 'react-leaflet';

const TransportRealTimeTrackingScreen = () => {
    const position: LatLngExpression = [21.149194021137408, 72.88653904334416]; // Coordinates for India

    return (
        <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100vh', width: '100%' }}>
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
    );
};

export default TransportRealTimeTrackingScreen;
