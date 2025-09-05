'use client';

import 'leaflet/dist/leaflet.css';

import type { LatLngExpression } from 'leaflet';

import L from 'leaflet';
import React, { useState } from 'react';
import { CONFIG } from 'src/config-global';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import SubmitButton from 'src/components/submit-button';
import { Popup, useMap, Marker, TileLayer, MapContainer, useMapEvents } from 'react-leaflet';
import {
  Box,
  Grid,
  Button,
  TextField,
  Typography,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import type { ITransportAddingStopDialogProps } from '../settings-interface';

const nominatimBaseUrl = 'https://nominatim.openstreetmap.org/search?';

const TransportAddingStopDialog: React.FC<ITransportAddingStopDialogProps> = ({
  dialogValue,
  onClose,
  sendToParent,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [markers, setMarkers] = useState<
    { lat: number; lng: number; stopName: string; charge: number | null }[]
  >([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number }>({
    lat: 21.2129,
    lng: 72.8504,
  });
  const [noDataMessage, setNoDataMessage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const position: LatLngExpression = [21.2129, 72.8504];

  const icon = L.icon({
    iconUrl: `${CONFIG.site.basePath}/assets/images/location/placeholder.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const fetchCityName = async (lat: number, lng: number) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await response.json();
    return data.display_name || 'Unknown Location';
  };

  const handleSearch = () => {
    setLoading(true);

    const params: any = {
      q: searchInput,
      format: 'json',
      addressdetails: 1,
      polygon_geojson: 0,
    };

    const queryString = new URLSearchParams(params).toString();

    fetch(`${nominatimBaseUrl}${queryString}`)
      .then((response) => response.json())
      .then((results) => setSearchResults(results))
      .catch((error) => console.error('Search error:', error))
      .finally(() => {
        setLoading(false);
        if (searchResults.length < 1) {
          setNoDataMessage(true);
        }
      });
  };

  const DetectClick: React.FC = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        const stopName = await fetchCityName(lat, lng);

        setMarkers((prevMarkers) => [...prevMarkers, { lat, lng, stopName, charge: null }]);
      },
    });
    return null;
  };

  const RecenterView: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
    const map = useMap();
    if (lat && lng) {
      map.setView([lat, lng], 13);
    }
    return null;
  };

  const handleMarkerDragEnd = async (e: any, index: number) => {
    const { lat, lng } = e.target.getLatLng();
    const stopName = await fetchCityName(lat, lng);

    setMarkers((prevMarkers) => {
      const updatedMarkers = [...prevMarkers];
      updatedMarkers[index] = { lat, lng, stopName, charge: null };
      return updatedMarkers;
    });

    console.log('markers', markers);
    // sendToParent(markers);
  };

  const handleDeleteStop = (index: number) => {
    setMarkers((prevMarkers) => prevMarkers.filter((_, i) => i !== index));
  };

  const handleNameChange = (index: number, newName: string) => {
    setMarkers((prevMarkers) => {
      const updatedMarkers = [...prevMarkers];
      updatedMarkers[index].stopName = newName;
      return updatedMarkers;
    });
  };

  const handleChargeChange = (index: number, newCharge: any) => {
    setMarkers((prevMarkers) => {
      const updatedMarkers = [...prevMarkers];
      updatedMarkers[index].charge = newCharge;
      return updatedMarkers;
    });
  };

  return (
    <CustomDialog fullScreen title="Add Stop" handleClose={onClose} open={dialogValue}>
      <Scrollbar sx={{ bgcolor: 'background.neutral', pl: 3, height: '500px' }}>
        {/* Search Section */}

        <Grid container sx={{ mt: 0 }} gap={1}>
          <Grid size={3}>
            <Box display="flex" flexDirection="row" marginTop="30px" gap={2} alignItems="center">
              <TextField
                size="small"
                fullWidth
                label="Search Location"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Button size="small" onClick={handleSearch} variant="contained">
                Search
              </Button>
            </Box>

            {/* Search Results Section */}
            <Scrollbar sx={{ overflowY: 'auto', overflowX: 'hidden', height: '250px', pt: '10px' }}>
              {loading === true ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100px',
                  }}
                >
                  <CircularProgress size={20} />
                </Box>
              ) : searchResults.length > 0 ? (
                searchResults.map((result: any, index: number) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1,
                      mb: 1,
                      cursor: 'pointer',
                      border: '1px solid #ccc',
                      borderRadius: 1,
                      '&:hover': { backgroundColor: '#f0f0f0' },
                    }}
                    onClick={() => {
                      const lat = parseFloat(result.lat);
                      const lng = parseFloat(result.lon);
                      const stopName = result.display_name;

                      setMarkers((prevMarkers) => [
                        ...prevMarkers,
                        { lat, lng, stopName, charge: 0 },
                      ]);
                      setSelectedLocation({ lat, lng });
                    }}
                  >
                    <Typography variant="body2">{result.display_name}</Typography>
                    {/* Uncomment below if needed */}
                    {/* <Typography variant="caption" color="text.secondary">
                {`Lat: ${result.lat}, Lon: ${result.lon}`}
            </Typography> */}
                  </Box>
                ))
              ) : noDataMessage ? (
                <Typography variant="body2" color="text.secondary">
                  No results found.
                </Typography>
              ) : (
                <Box />
              )}
            </Scrollbar>

            {/* List of Added Stops Section */}
            <Typography variant="body1" sx={{ pb: '10px', fontWeight: 'bold' }}>
              Added Stop
            </Typography>
            {/* <Box sx={{ mt: 2, maxHeight: 300, border: '1px solid #ddd', borderRadius: 1, p: 1 }}> */}
            <Scrollbar sx={{ overflowY: 'auto', overflowX: 'hidden', height: '400px', pt: '10px' }}>
              {/* {markers.length > 0 && <Typography variant="body1" sx={{ pb: "10px", fontWeight: "bold" }}>
                                Added Stop
                            </Typography>} */}
              {markers.length > 0 ? (
                markers.map((marker, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1,
                      mb: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid #ccc',
                      borderRadius: 1,
                      '&:hover': { backgroundColor: '#f0f0f0' },
                    }}
                  >
                    <Box>
                      <Typography variant="body2">{marker.stopName}</Typography>
                      {/* <Typography variant="caption" color="text.secondary">
                                                {`Lat: ${marker.lat}, Lon: ${marker.lng}`}
                                            </Typography> */}
                    </Box>
                    <Iconify
                      onClick={() => handleDeleteStop(index)}
                      icon="mynaui:trash"
                      color="red"
                    />
                    {/* 
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            onClick={() => handleDeleteStop(index)}
                                        >
                                            Remove
                                        </Button> */}
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No stops added yet. Add a marker to see it here.
                </Typography>
              )}
            </Scrollbar>
            {/* </Box> */}
          </Grid>

          {/* Map Section */}

          <Grid size={8}>
            <Box width="110%" height="600px">
              <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {markers.map((marker, index) => (
                  <Marker
                    key={index}
                    position={[marker.lat, marker.lng]}
                    icon={icon}
                    draggable
                    eventHandlers={{
                      dragend: (e) => handleMarkerDragEnd(e, index),
                    }}
                  >
                    {/* <Popup>
                      {marker.stopName} <br /> Drag to reposition.
                    </Popup> */}
                    <Popup>
                      <Typography variant="body2">{marker.stopName}</Typography>
                      <TextField
                        label="Name"
                        value={marker.stopName}
                        onChange={(e) => handleNameChange(index, e.target.value)}
                        size="small"
                        sx={{ pb: '20px' }}
                      />
                      <TextField
                        label="₹ Charges/Monthly"
                        value={marker.charge}
                        onChange={(e) => handleChargeChange(index, e.target.value)}
                        size="small"
                        sx={{ pr: '20px', pb: '20px' }}
                      />
                      {/* <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteStop(index)}>
                        Remove
                      </Button> */}
                    </Popup>
                  </Marker>
                ))}

                <DetectClick />
                {selectedLocation.lat && selectedLocation.lng && (
                  <RecenterView lat={selectedLocation.lat} lng={selectedLocation.lng} />
                )}
              </MapContainer>
            </Box>
          </Grid>
        </Grid>
      </Scrollbar>

      <DialogActions>
        <SubmitButton onClick={() => {}} />
      </DialogActions>
    </CustomDialog>
  );
};

export default TransportAddingStopDialog;
