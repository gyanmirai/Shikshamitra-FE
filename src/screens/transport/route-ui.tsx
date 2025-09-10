import React, { useState } from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {
  Box,
  List,
  Stack,
  Dialog,
  Button,
  Avatar,
  ListItem,
  Typography,
  DialogTitle,
  ListItemText,
  DialogContent,
} from '@mui/material';

interface Stop {
  id: string;
  name: string;
  details: string;
  students: Array<{ id: string; name: string }>;
}

interface RouteProps {
  vehicleName: string;
  stops: Stop[];
}

const RouteWithStops: React.FC<RouteProps> = ({ vehicleName, stops }) => {
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleMarkerClick = (stop: Stop) => {
    setSelectedStop(stop);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedStop(null);
  };

  const calculateWavePath = (stopCount: number): string => {
    const segmentWidth = 1000 / (stopCount - 1);
    let path = `M 50 150`;
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i < stopCount; i++) {
      const controlY = i % 2 === 0 ? 250 : 50;
      const endX = 50 + segmentWidth * i;
      path += ` Q ${50 + segmentWidth * (i - 0.5)} ${controlY}, ${endX} 150`;
    }
    return path;
  };

  const getStopCoordinates = (stopCount: number, index: number): { x: number; y: number } => {
    const segmentWidth = 1000 / (stopCount - 1);
    const x = 50 + segmentWidth * index;
    const y = 150 + (index % 2 === 0 ? -50 : 50); // Alternating wave points
    return { x, y };
  };

  return (
    <Box>
      {/* <Typography variant="h5" gutterBottom>
                Vehicle Route: {vehicleName}
            </Typography> */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '300px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* SVG Wave Line */}
        <svg width="100%" height="300px" viewBox="0 0 1050 300" xmlns="http://www.w3.org/2000/svg">
          <path d={calculateWavePath(stops.length)} fill="none" stroke="#1976d2" strokeWidth="3" />

          {/* Stop Markers */}
          {stops.map((stop, index) => {
            const { x, y } = getStopCoordinates(stops.length, index);
            return (
              <g key={stop.id} onClick={() => handleMarkerClick(stop)}>
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill="#1976d2"
                  stroke="#fff"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                />
                <text x={x} y={y - 15} textAnchor="middle" fontSize="12" fill="#555">
                  {stop.name}
                </text>
              </g>
            );
          })}
        </svg>
      </Box>

      {/* Dialog for Stop Details */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar>
              <LocationOnIcon />
            </Avatar>
            <Typography variant="h6">{selectedStop?.name}</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedStop ? (
            <>
              <Typography variant="body1" gutterBottom>
                {selectedStop.details}
              </Typography>
              <Typography variant="subtitle1">Assigned Students</Typography>
              {selectedStop.students.length > 0 ? (
                <List>
                  {selectedStop.students.map((student) => (
                    <ListItem key={student.id}>
                      <ListItemText primary={student.name} secondary={`ID: ${student.id}`} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography>No students assigned to this stop.</Typography>
              )}
            </>
          ) : (
            <Typography>No details available for this stop.</Typography>
          )}
        </DialogContent>
        <Button onClick={handleClose} sx={{ m: 2 }} variant="contained">
          Close
        </Button>
      </Dialog>
    </Box>
  );
};

export default RouteWithStops;

// import React, { useState } from "react";

// import LocationOnIcon from "@mui/icons-material/LocationOn";
// import {
//     Box,
//     List,
//     Stack,
//     Dialog,
//     Avatar,
//     Button,
//     ListItem,
//     Typography,
//     DialogTitle,
//     ListItemText,
//     DialogContent,
// } from "@mui/material";

// interface Stop {
//     id: string;
//     name: string;
//     details: string;
//     students: Array<{ id: string; name: string }>;
// }

// interface RouteWaveProps {
//     vehicleName: string;
//     stops: Stop[];
// }

// const RouteWave: React.FC<RouteWaveProps> = ({ vehicleName, stops }) => {
//     const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
//     const [dialogOpen, setDialogOpen] = useState(false);

//     const handleMarkerClick = (stop: Stop) => {
//         setSelectedStop(stop);
//         setDialogOpen(true);
//     };

//     const handleClose = () => {
//         setDialogOpen(false);
//         setSelectedStop(null);
//     };

//     const wavePoints = stops.length - 1;

//     return (
//         <Box sx={{ p: 3 }}>
//             {/* <Typography variant="h5" gutterBottom>
//                 Vehicle Route: {vehicleName}
//             </Typography> */}
//             <Box
//                 sx={{
//                     position: "relative",
//                     height: "300px",
//                     width: "100%",
//                     display: "flex",
//                     justifyContent: "center",
//                     alignItems: "center",
//                 }}
//             >
//                 <svg
//                     width="100%"
//                     height="300px"
//                     viewBox="0 0 1000 300"
//                     xmlns="http://www.w3.org/2000/svg"
//                 >
//                     {/* Wave Path */}
//                     <path
//                         d={`M 50 150 ${Array.from({ length: wavePoints })
//                             .map(
//                                 (_, i) =>
//                                     `Q ${150 + i * 200} ${i % 2 === 0 ? 50 : 250}, ${250 + i * 200
//                                     } 150`
//                             )
//                             .join(" ")}`}
//                         fill="none"
//                         stroke="#1976d2"
//                         strokeWidth="3"
//                     />

//                     {/* Markers */}
//                     {stops.map((stop, index) => {
//                         const x = 50 + index * (900 / (stops.length - 1));
//                         const y = 150 + (index % 2 === 0 ? -50 : 50);
//                         return (
//                             <g key={stop.id}>
//                                 <circle
//                                     cx={x}
//                                     cy={y}
//                                     r="10"
//                                     fill="#1976d2"
//                                     stroke="#fff"
//                                     strokeWidth="2"
//                                     onClick={() => handleMarkerClick(stop)}
//                                     style={{ cursor: "pointer" }}
//                                 />
//                                 <text
//                                     x={x}
//                                     y={y - 15}
//                                     textAnchor="middle"
//                                     fontSize="12"
//                                     fill="#555"
//                                 >
//                                     {stop.name}
//                                 </text>
//                             </g>
//                         );
//                     })}
//                 </svg>
//             </Box>

//             {/* Dialog for Stop Details */}
//             <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
//                 <DialogTitle>
//                     <Stack direction="row" spacing={2} alignItems="center">
//                         <Avatar>
//                             <LocationOnIcon />
//                         </Avatar>
//                         <Typography variant="h6">{selectedStop?.name}</Typography>
//                     </Stack>
//                 </DialogTitle>
//                 <DialogContent>
//                     {selectedStop ? (
//                         <>
//                             <Typography variant="body1" gutterBottom>
//                                 {selectedStop.details}
//                             </Typography>
//                             <Typography variant="subtitle1">Assigned Students</Typography>
//                             {selectedStop.students.length > 0 ? (
//                                 <List>
//                                     {selectedStop.students.map((student) => (
//                                         <ListItem key={student.id}>
//                                             <ListItemText
//                                                 primary={student.name}
//                                                 secondary={`ID: ${student.id}`}
//                                             />
//                                         </ListItem>
//                                     ))}
//                                 </List>
//                             ) : (
//                                 <Typography>No students assigned to this stop.</Typography>
//                             )}
//                         </>
//                     ) : (
//                         <Typography>No details available for this stop.</Typography>
//                     )}
//                 </DialogContent>
//                 <Button onClick={handleClose} sx={{ m: 2 }} variant="contained">
//                     Close
//                 </Button>
//             </Dialog>
//         </Box>
//     );
// };

// export default RouteWave;

// import React, { useState } from "react";

// import LocationOnIcon from '@mui/icons-material/LocationOn';
// import {
//     Box,
//     Card,
//     List,
//     Stack,
//     Avatar,
//     Divider,
//     ListItem,
//     Typography,
//     CardContent,
// } from "@mui/material";

// interface Stop {
//     id: string;
//     name: string;
//     details: string;
//     students: Array<{ id: string; name: string }>;
// }

// interface RouteUIProps {
//     vehicleName: string;
//     stops: Stop[];
// }

// const RouteUI: React.FC<RouteUIProps> = ({ vehicleName, stops }) => {
//     const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

//     const handleStopClick = (stop: Stop) => {
//         setSelectedStop(stop);
//     };

//     return (
//         <Box sx={{ p: 3 }}>
//             <Typography variant="h5" gutterBottom>
//                 Vehicle Route: {vehicleName}
//             </Typography>
//             <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
//                 {/* Route Visualization */}
//                 <Card sx={{ flex: 1 }}>
//                     <CardContent>
//                         <Typography variant="h6" gutterBottom>
//                             Route Map
//                         </Typography>
//                         <Divider sx={{ mb: 2 }} />
//                         <Box
//                             sx={{
//                                 position: "relative",
//                                 height: "400px",
//                                 width: "100%",
//                                 display: "flex",
//                                 justifyContent: "center",
//                                 alignItems: "center",
//                             }}
//                         >
//                             <svg
//                                 width="100%"
//                                 height="100%"
//                                 viewBox="0 0 600 400"
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 style={{ overflow: "visible" }}
//                             >
//                                 {/* Curved Path */}
//                                 <path
//                                     d="M 50 350 Q 300 50 550 350"
//                                     fill="transparent"
//                                     stroke="#1976d2"
//                                     strokeWidth="3"
//                                 />
//                                 {/* Markers for Stops */}
//                                 {stops.map((stop, index) => {
//                                     const x = 50 + (500 / (stops.length - 1)) * index;
//                                     const y = 350 - 300 * Math.sin((Math.PI * index) / (stops.length - 1));
//                                     return (
//                                         <g key={stop.id}>
//                                             <circle
//                                                 cx={x}
//                                                 cy={y}
//                                                 r="8"
//                                                 fill={selectedStop?.id === stop.id ? "#d32f2f" : "#1976d2"}
//                                                 onClick={() => handleStopClick(stop)}
//                                                 style={{ cursor: "pointer" }}
//                                             />
//                                             <text
//                                                 x={x}
//                                                 y={y - 15}
//                                                 textAnchor="middle"
//                                                 fontSize="10"
//                                                 fill="#555"
//                                             >
//                                                 {stop.name}
//                                             </text>
//                                         </g>
//                                     );
//                                 })}
//                             </svg>
//                         </Box>
//                     </CardContent>
//                 </Card>

//                 {/* Stop Details */}
//                 <Card sx={{ flex: 1 }}>
//                     <CardContent>
//                         {selectedStop ? (
//                             <>
//                                 <Stack direction="row" spacing={2} alignItems="center">
//                                     <Avatar>
//                                         <LocationOnIcon />
//                                     </Avatar>
//                                     <Typography variant="h6">{selectedStop.name}</Typography>
//                                 </Stack>
//                                 <Divider sx={{ my: 1 }} />
//                                 <Typography variant="body1">{selectedStop.details}</Typography>
//                                 <Typography variant="subtitle1" sx={{ mt: 2 }}>
//                                     Assigned Students
//                                 </Typography>
//                                 {selectedStop.students.length > 0 ? (
//                                     <List>
//                                         {selectedStop.students.map((student) => (
//                                             <ListItem key={student.id}>
//                                                 <Typography>
//                                                     {student.name} (ID: {student.id})
//                                                 </Typography>
//                                             </ListItem>
//                                         ))}
//                                     </List>
//                                 ) : (
//                                     <Typography>No students assigned to this stop.</Typography>
//                                 )}
//                             </>
//                         ) : (
//                             <Typography>Select a stop to see its details.</Typography>
//                         )}
//                     </CardContent>
//                 </Card>
//             </Stack>
//         </Box>
//     );
// };

// export default RouteUI;

// import React, { useState } from "react";

// import LocationOnIcon from '@mui/icons-material/LocationOn';
// import {
//     Box,
//     Card,
//     List,
//     Stack,
//     Avatar,
//     Divider,
//     ListItem,
//     Typography,
//     CardContent,
//     ListItemText,
//     ListItemButton,
// } from "@mui/material";

// interface Stop {
//     id: string;
//     name: string;
//     details: string;
//     students: Array<{ id: string; name: string }>;
// }

// interface RouteUIProps {
//     vehicleName: string;
//     stops: Stop[];
// }

// const RouteUI: React.FC<RouteUIProps> = ({ vehicleName, stops }) => {
//     const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

//     const handleStopClick = (stop: Stop) => {
//         setSelectedStop(stop);
//     };

//     return (
//         <Box sx={{ p: 3 }}>
//             {/* <Typography variant="h5" gutterBottom>
//                 Vehicle Route: {vehicleName}
//             </Typography> */}
//             <Stack direction="row" spacing={2}>
//                 {/* Stops List */}
//                 <Card sx={{ flex: 1 }}>
//                     <CardContent>
//                         <Typography variant="h6" gutterBottom>
//                             Route Stops
//                         </Typography>
//                         <Divider sx={{ my: 1 }} />
//                         <List>
//                             {stops.map((stop) => (
//                                 <ListItem key={stop.id} disablePadding>
//                                     <ListItemButton onClick={() => handleStopClick(stop)}>
//                                         <ListItemText
//                                             primary={stop.name}
//                                             secondary={`Stop ID: ${stop.id}`}
//                                         />
//                                         <Avatar>
//                                             <LocationOnIcon />
//                                         </Avatar>
//                                     </ListItemButton>
//                                 </ListItem>
//                             ))}
//                         </List>
//                     </CardContent>
//                 </Card>

//                 {/* Stop Details */}
//                 {selectedStop && (
//                     <Card sx={{ flex: 1 }}>
//                         <CardContent>
//                             <Stack direction="row" spacing={2} alignItems="center">
//                                 <Avatar>
//                                     <LocationOnIcon />
//                                 </Avatar>
//                                 <Typography variant="h6">{selectedStop.name}</Typography>
//                             </Stack>
//                             <Divider sx={{ my: 1 }} />
//                             <Typography variant="body1">{selectedStop.details}</Typography>
//                             <Typography variant="subtitle1" sx={{ mt: 2 }}>
//                                 Assigned Students
//                             </Typography>
//                             {selectedStop.students.length > 0 ? (
//                                 <List>
//                                     {selectedStop.students.map((student) => (
//                                         <ListItem key={student.id}>
//                                             <ListItemText
//                                                 primary={student.name}
//                                                 secondary={`ID: ${student.id}`}
//                                             />
//                                         </ListItem>
//                                     ))}
//                                 </List>
//                             ) : (
//                                 <Typography>No students assigned to this stop.</Typography>
//                             )}
//                         </CardContent>
//                     </Card>
//                 )}
//             </Stack>
//         </Box>
//     );
// };

// export default RouteUI;
