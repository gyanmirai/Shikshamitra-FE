'use client';

import 'leaflet/dist/leaflet.css';

import type { LatLngExpression } from 'leaflet';

import L from 'leaflet';
import { useMapEvents } from 'react-leaflet';
import React, { useState, useEffect } from 'react'

import { Grid, Button, TextField, DialogActions } from '@mui/material';

import { CONFIG } from 'src/config-global';
import FormattedAmountInput from 'src/screens/finance/common/input-for-finance';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';


interface TransportAddingStopDialogProps {
    dialogValue: boolean;
    onClose: () => void;


}
const TransportAddingStopDialog: React.FC<TransportAddingStopDialogProps> = ({ dialogValue, onClose }) => {
    const [charges, setCharges] = useState('')
    const [busStops, setBusStops] = useState<any>();
    const [markers, setMarkers] = useState<{ lat: number; lng: number }[]>([]);
    const handleChargesChange = (formattedValue: string, numericValue: number) => {
        setCharges(formattedValue);
    };
    const position: LatLngExpression = [21.212907926175802, 72.85037234842194];

    const iconUrl = `${CONFIG.site.basePath}/assets/images/location/placeholder.png`;
    const icon = L.icon({
        iconUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    });

    const fetchCityName = async (lat: number, lng: number) => {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await response.json();
        console.log(data);
        return (
            data.display_name || data.address?.suburb || data.address?.neighbourhood || 'Unknown Location'
        );
    };

    const DetectClick: React.FC = () => {
        useMapEvents({
            // eslint-disable-next-line consistent-return
            click: async (e) => {
                const { lat, lng } = e.latlng;
                console.log(`Clicked at: ${lat}, ${lng}`);

                const locationName = await fetchCityName(lat, lng);
                if (true) {
                    const newStop = {
                        stopId: Math.random(),
                        stopName: locationName,
                    };

                    setBusStops(newStop);

                    setMarkers((prevMarkers) => [...prevMarkers, { lat, lng }]);
                    //   onChange([...busStops, newStop]);
                } else {
                    return alert('This stop is outside the defined route.');
                }
            },
        });
        return null;
    };

    useEffect(() => {
        console.log('Current bus stops:', busStops);
    }, [busStops]);
    const handleRemoveStop = (stopId: number) => {
        const updatedStops = busStops.filter((stop: any) => stop.stopId !== stopId);
        setBusStops(updatedStops);
        // onChange(updatedStops);
    };
    return (
        <CustomDialog maxWidth="sm" title="Add Stop" handleClose={onClose} open={dialogValue} >
            <Scrollbar sx={{ bgcolor: 'background.neutral', p: 3, height: "200px" }}>
                <Grid container spacing={2}>
                    {/* <Box height="250px" width="250px"> */}
                    {/* <MapContainer style={{ height: '100%', width: '100%' }} center={position} zoom={13} scrollWheelZoom={false} >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {markers.map((marker, index) => (
                                <Marker key={index} position={[marker.lat, marker.lng]} >
                                    <Popup>{`Stop: ${busStops[index]?.stopName || 'Unknown'}`}</Popup>
                                </Marker>
                            ))}

                            <DetectClick />
                        </MapContainer> */}
                    {/* </Box> */}
                    <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                        <TextField
                            size="small"
                            fullWidth
                            label="Stop Name"
                            name="stopName"
                        // value={formik.values.vehicleName}
                        // onChange={formik.handleChange}
                        // onBlur={formik.handleBlur}
                        // error={formik.touched.vehicleName && Boolean(formik.errors.vehicleName)}
                        // helperText={formik.touched.vehicleName && formik.errors.vehicleName}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                        <TextField
                            size="small"
                            fullWidth
                            label="Address Line 1"
                            name="stopName"
                        // value={formik.values.vehicleName}
                        // onChange={formik.handleChange}
                        // onBlur={formik.handleBlur}
                        // error={formik.touched.vehicleName && Boolean(formik.errors.vehicleName)}
                        // helperText={formik.touched.vehicleName && formik.errors.vehicleName}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                        <TextField
                            size="small"
                            fullWidth
                            label="Address Line 2"
                            name="stopName"
                        // value={formik.values.vehicleName}
                        // onChange={formik.handleChange}
                        // onBlur={formik.handleBlur}
                        // error={formik.touched.vehicleName && Boolean(formik.errors.vehicleName)}
                        // helperText={formik.touched.vehicleName && formik.errors.vehicleName}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                        <FormattedAmountInput
                            label="Charges"
                            value={charges}
                            onChange={handleChargesChange}
                        />
                    </Grid>
                </Grid >
            </Scrollbar>
            <DialogActions>
                <Button variant="contained" type="submit">
                    Save
                </Button>
            </DialogActions>
        </CustomDialog>
    )
}

export default TransportAddingStopDialog




