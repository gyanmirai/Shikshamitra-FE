// 'use client';

// import 'leaflet/dist/leaflet.css';

// import type { LatLngExpression } from 'leaflet';

// import L from 'leaflet';
// import React, { useState } from 'react';
// import { Marker, useMap, TileLayer, MapContainer, useMapEvents } from 'react-leaflet';

// import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

// import { CONFIG } from 'src/config-global';

// import { Scrollbar } from 'src/components/scrollbar';
// import CustomDialog from 'src/components/customDialog';

// const nominatim_Base_Url = "https://nominatim.openstreetmap.org/search?";
// // const params = {
// //     q:"",
// //     format:"json",
// //     addressdetails:"addressdetails",
// // }

// interface TransportAddingStopDialogProps {
//     dialogValue: boolean;
//     onClose: () => void;

// }
// const TransportAddingStopDialog: React.FC<TransportAddingStopDialogProps> = ({ dialogValue, onClose }) => {
//     const [searchInput, setSearchInput] = useState('');
//     const [searchResults, setSearchResults] = useState<any>([]);
//     const [selectedLocation, setSelectedLocation] = useState<any>([21.212907926175802, 72.85037234842194]);
//     const [charges, setCharges] = useState('')
//     const [busStops, setBusStops] = useState<any>();
//     const [markers, setMarkers] = useState<{ lat: any; lng: any }[]>([]);
//     const handleChargesChange = (formattedValue: string, numericValue: number) => {
//         setCharges(formattedValue);
//     };
//     const position: LatLngExpression = [21.212907926175802, 72.85037234842194];

//     const iconUrl = `${CONFIG.site.basePath}/assets/images/location/placeholder.png`;
//     const icon = L.icon({
//         iconUrl,
//         iconSize: [25, 41],
//         iconAnchor: [12, 41],
//     });

//     const fetchCityName = async (lat: number, lng: number) => {
//         const response = await fetch(
//             `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
//         );
//         const data = await response.json();
//         console.log(data);
//         return (
//             data.display_name || data.address?.suburb || data.address?.neighbourhood || 'Unknown Location'
//         );
//     };
//     const handleSearch = async (query: any) => {

//     };
//     const DetectClick: React.FC = () => {
//         useMapEvents({
//             // eslint-disable-next-line consistent-return
//             click: async (e) => {
//                 const { lat, lng } = e.latlng;
//                 console.log(`Clicked at: ${lat}, ${lng}`);

//                 const locationName = await fetchCityName(lat, lng);
//                 if (true) {
//                     const newStop = {
//                         stopId: Math.random(),
//                         stopName: locationName,
//                     };

//                     setBusStops(newStop);

//                     setMarkers((prevMarkers) => [...prevMarkers, { lat, lng }]);
//                     //   onChange([...busStops, newStop]);
//                 } else {
//                     return alert('This stop is outside the defined route.');
//                 }
//             },
//         });
//         return null;
//     };

//     const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });

//     interface RecentViewProps {
//         lat: any;
//         lng: any;
//     }

//     const RecenterView: React.FC<RecentViewProps> = ({ lat, lng }) => {
//         const map = useMap();

//         if (lat !== undefined && lng !== undefined) {
//             map.setView([lat, lng], 13);
//         }

//         return null;
//     };

//     // useEffect(() => {
//     //     console.log('Current bus stops:', busStops);
//     // }, [busStop]);

//     const handleRemoveStop = (stopId: number) => {
//         const updatedStops = busStops.filter((stop: any) => stop.stopId !== stopId);
//         setBusStops(updatedStops);
//         // onChange(updatedStops);
//     };
//     return (
//         <CustomDialog maxWidth="xl" title="Add Stop" handleClose={onClose} open={dialogValue} >
//             <Scrollbar sx={{ bgcolor: 'background.neutral', p: 3, height: "600px" }}>
//                 <Box display="flex" flexDirection="row" marginTop="30px">

//                     <TextField
//                         size="small"
//                         fullWidth
//                         label="Search Location"
//                         value={searchInput}
//                         onChange={(e) => setSearchInput(e.target.value)}

//                     />
//                     {/* Additional fields for stop details */}

//                     <Button onClick={() => {
//                         const params: any = {
//                             q: searchInput,
//                             format: "json",
//                             addressdetails: 1,
//                             polygon_geojson: 0,

//                         }
//                         const queryString = new URLSearchParams(params).toString();
//                         const requestOption: any = {
//                             method: "GET",
//                             redirect: "follow",

//                         }
//                         fetch(`${nominatim_Base_Url}${queryString}`, requestOption).then((response) => response.json()).then((result) => setSearchResults(result)).catch((e) => console.log(e))
//                     }} variant='contained'>Search</Button>

//                 </Box>
//                 <Box sx={{ mt: 2, maxHeight: 300, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 1, p: 1 }}>
//                     {searchResults.length > 0 ? (
//                         searchResults.map((result: any, index: any) => (
//                             <Box
//                                 key={index}
//                                 sx={{
//                                     p: 1,
//                                     mb: 1,
//                                     cursor: 'pointer',
//                                     border: '1px solid #ccc',
//                                     borderRadius: 1,
//                                     "&:hover": { backgroundColor: '#f0f0f0' },
//                                 }}
//                                 onClick={() => {
//                                     const lat = parseFloat(result.lat);
//                                     const lng = parseFloat(result.lon);
//                                     setMarkers((prevMarkers) => [...prevMarkers, { lat: parseFloat(result.lat), lng: parseFloat(result.lon) }],); setSelectedLocation({ lat, lng });;
//                                 }}
//                             >
//                                 <Typography variant="body2" >{result.display_name}</Typography>
//                                 <Typography variant="caption" color="text.secondary">
//                                     {`Lat: ${result.lat}, Lon: ${result.lon}`}
//                                 </Typography>
//                             </Box>
//                         ))
//                     ) : (
//                         <Typography variant="body2" color="text.secondary">
//                             No results found. Please search for a location.
//                         </Typography>
//                     )}
//                 </Box>
//                 <Grid container spacing={2}>

//                     <Grid item xs={12} md={12}>
//                         <Box width="1100px" height='500px'>
//                             <MapContainer style={{ height: '100%', width: '100%' }} center={position} zoom={13} scrollWheelZoom={false}>
//                                 <TileLayer
//                                     attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                                 />
//                                 {markers.map((marker, index) => (
//                                     <Marker key={index} position={[marker.lat, marker.lng]} icon={icon}>
//                                         {/* <Popup>{`Stop: ${busStops[index]?.stopName || 'Unknown'}`}</Popup> */}
//                                     </Marker>
//                                 ))}

//                                 <DetectClick />
//                                 {mapCenter.lat && mapCenter.lng && <RecenterView lat={mapCenter.lat} lng={mapCenter.lng} />}
//                             </MapContainer>
//                         </Box>

//                     </Grid>

//                 </Grid>
//             </Scrollbar>
//             <DialogActions>
//                 <Button variant="contained" type="submit">
//                     Save
//                 </Button>
//             </DialogActions>
//         </CustomDialog>
//     )
// }

// export default TransportAddingStopDialog

//  {/* <Grid item xs={12} md={6}>
//                         <Grid container spacing={2}>
//                             <Grid item xs={12} md={6} sx={{ pb: '10px' }}>
//                                 <TextField
//                                     size="small"
//                                     fullWidth
//                                     label="Stop Name"
//                                     name="stopName"
//                                 // value={formik.values.vehicleName}
//                                 // onChange={formik.handleChange}
//                                 // onBlur={formik.handleBlur}
//                                 // error={formik.touched.vehicleName && Boolean(formik.errors.vehicleName)}
//                                 // helperText={formik.touched.vehicleName && formik.errors.vehicleName}
//                                 />
//                             </Grid>
//                             <Grid item xs={12} md={6} sx={{ pb: '10px' }}>
//                                 <TextField
//                                     size="small"
//                                     fullWidth
//                                     label="Address Line 1"
//                                     name="stopName"
//                                 // value={formik.values.vehicleName}
//                                 // onChange={formik.handleChange}
//                                 // onBlur={formik.handleBlur}
//                                 // error={formik.touched.vehicleName && Boolean(formik.errors.vehicleName)}
//                                 // helperText={formik.touched.vehicleName && formik.errors.vehicleName}
//                                 />
//                             </Grid>
//                             <Grid item xs={12} md={6} sx={{ pb: '10px' }}>
//                                 <TextField
//                                     size="small"
//                                     fullWidth
//                                     label="Address Line 2"
//                                     name="stopName"
//                                 // value={formik.values.vehicleName}
//                                 // onChange={formik.handleChange}
//                                 // onBlur={formik.handleBlur}
//                                 // error={formik.touched.vehicleName && Boolean(formik.errors.vehicleName)}
//                                 // helperText={formik.touched.vehicleName && formik.errors.vehicleName}
//                                 />
//                             </Grid>
//                             <Grid item xs={12} md={6} sx={{ pb: '10px' }}>
//                                 <FormattedAmountInput
//                                     label="Charges"
//                                     value={charges}
//                                     onChange={handleChargesChange}
//                                 />
//                             </Grid>
//                         </Grid>
//                     </Grid> */}
