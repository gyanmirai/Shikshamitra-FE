import React, { useState } from 'react';
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd';

import {
    Box,
    Table,
    Paper,
    TableRow,
    TableBody,
    TableCell,
    TableHead,
    TextField,
    IconButton,
    Typography,
    TableContainer,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';

const ManageStopsWithRiders = () => {
    const availableStops = [
        { value: 'Madhuram Circle', label: 'Madhuram Circle' },
        { value: 'Navjeevan Circle', label: 'Navjeevan Circle' },
        { value: 'Laxmi Nagar', label: 'Laxmi Nagar' },
        { value: 'Ashirvad Nagar', label: 'Ashirvad Nagar' },
    ];

    const studentList = [
        { value: 'student1', label: 'John Doe' },
        { value: 'student2', label: 'Jane Smith' },
        { value: 'student3', label: 'Mike Johnson' },
        { value: 'student4', label: 'Emily Davis' },
    ];

    const [stops, setStops] = useState<
        { id: string; name: string; pickup: string; dropoff: string; riders: string[] }[]
    >([]);
    const [selectedStops, setSelectedStops] = useState<string[]>([]);

    const handleAddStops = (selected: string[]) => {
        const newStops = selected
            .filter((stop) => !stops.find((existing) => existing.name === stop))
            .map((stop) => ({
                id: `${stop}-${Date.now()}`,
                name: stop,
                pickup: '08:00',
                dropoff: '15:30',
                riders: [],
            }));
        const updatedStops = stops.filter((stop) => selected.includes(stop.name));
        setStops([...updatedStops, ...newStops]);
        setSelectedStops(selected);
    };

    const handleInputChange = (id: string, field: 'pickup' | 'dropoff', value: string) => {
        setStops((prev) =>
            prev.map((stop) => (stop.id === id ? { ...stop, [field]: value } : stop))
        );
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;
        const reorderedStops = Array.from(stops);
        const [removed] = reorderedStops.splice(result.source.index, 1);
        reorderedStops.splice(result.destination.index, 0, removed);
        setStops(reorderedStops);
    };

    const handleAssignRiders = (id: string, assignedRiders: string[]) => {
        setStops((prev) =>
            prev.map((stop) => (stop.id === id ? { ...stop, riders: assignedRiders } : stop))
        );
    };

    return (
        <Box>
            {/* Multi-Select Dropdown for Stops */}
            <CustomSelect
                multiple
                options={availableStops}
                label="Select Stops"
                name="stops"
                value={selectedStops}
                onChange={(value: string[]) => handleAddStops(value)}
                formControlProps={{ sx: { maxWidth: 400, width: '100%' } }}
            />

            {/* Draggable Table */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ width: '50px' }} />
                                <TableCell sx={{ width: '55%', fontWeight: 'bold' }}>Stop Name</TableCell>
                                <TableCell sx={{ width: '15%', fontWeight: 'bold' }}>Pickup Time</TableCell>
                                <TableCell sx={{ width: '15%', fontWeight: 'bold' }}>Dropoff Time</TableCell>
                                {/* <TableCell sx={{ fontWeight: 'bold' }}>Assigned Riders</TableCell> */}
                            </TableRow>
                        </TableHead>
                        <Droppable droppableId="stops">
                            {(provided) => (
                                <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                                    {stops.map((stop, index) => (
                                        <Draggable key={stop.id} draggableId={stop.id} index={index}>
                                            {(provided2, snapshot) => (
                                                <TableRow
                                                    ref={provided2.innerRef}
                                                    {...provided2.draggableProps}
                                                    sx={{
                                                        '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.03)' },
                                                        ...(snapshot.isDragging && {
                                                            backgroundColor: 'rgba(63, 81, 181, 0.08) !important',
                                                            '& td': { borderBottom: 'none' },
                                                        }),
                                                    }}
                                                >
                                                    {/* Drag Handle */}
                                                    <TableCell {...provided2.dragHandleProps} sx={{ width: '50px' }}>
                                                        <IconButton size="small" sx={{ cursor: 'grab' }}>
                                                            <Iconify icon="mdi:drag" />
                                                        </IconButton>
                                                    </TableCell>

                                                    {/* Stop Name */}
                                                    <TableCell>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                fontWeight: index === 0 || index === stops.length - 1 ? 'bold' : 'normal',
                                                            }}
                                                        >
                                                            {stop.name}{' '}
                                                            {index === 0 ? '(Start Point)' : index === stops.length - 1 ? '(End Point)' : ''}
                                                        </Typography>
                                                    </TableCell>

                                                    {/* Pickup Time */}
                                                    <TableCell>
                                                        <TextField
                                                            type="time"
                                                            size="small"
                                                            value={stop.pickup}
                                                            onChange={(e) => handleInputChange(stop.id, 'pickup', e.target.value)}
                                                            InputLabelProps={{ shrink: true }}
                                                            sx={{ width: '100%' }}
                                                        />
                                                    </TableCell>

                                                    {/* Dropoff Time */}
                                                    <TableCell>
                                                        <TextField
                                                            type="time"
                                                            size="small"
                                                            value={stop.dropoff}
                                                            onChange={(e) => handleInputChange(stop.id, 'dropoff', e.target.value)}
                                                            InputLabelProps={{ shrink: true }}
                                                            sx={{ width: '100%' }}
                                                        />
                                                    </TableCell>

                                                    {/* Assigned Riders */}
                                                    {/* <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                           
                                                            <CustomSelect
                                                                multiple
                                                                options={studentList}
                                                                label="Assign Riders"
                                                                name={`riders-${stop.id}`}
                                                                value={stop.riders}
                                                                onChange={(value: string[]) => handleAssignRiders(stop.id, value)}
                                                                formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
                                                            />
                                                        </Box>
                                                    </TableCell> */}
                                                </TableRow>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </TableBody>
                            )}
                        </Droppable>
                    </Table>
                </TableContainer>
            </DragDropContext>
        </Box>
    );
};

export default ManageStopsWithRiders;



// import React, { useState } from 'react';
// import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd';

// import {
//     Box,
//     Table,
//     Paper,
//     TableRow,
//     TableBody,
//     TableCell,
//     TableHead,
//     TextField,
//     IconButton,
//     Typography,
//     TableContainer,
// } from '@mui/material';

// import { Iconify } from 'src/components/iconify';
// import CustomSelect from 'src/components/custom-select';

// const EditableStopTable = () => {
//     const availableStops = [
//         { value: 'Madhuram Circle', label: 'Madhuram Circle' },
//         { value: 'Navjeevan Circle', label: 'Navjeevan Circle' },
//         { value: 'Laxmi Nagar', label: 'Laxmi Nagar' },
//         { value: 'Ashirvad Nagar', label: 'Ashirvad Nagar' },
//     ];

//     const [stops, setStops] = useState<{ id: string; name: string; pickup: string; dropoff: string }[]>([]);
//     const [selectedStops, setSelectedStops] = useState<string[]>([]);

//     const handleAddStops = (selected: string[]) => {
//         const newStops = selected
//             .filter((stop) => !stops.find((existing) => existing.name === stop))
//             .map((stop) => ({
//                 id: `${stop}-${Date.now()}`,
//                 name: stop,
//                 pickup: '08:00',
//                 dropoff: '15:30',
//             }));
//         const updatedStops = stops.filter((stop) => selected.includes(stop.name));
//         setStops([...updatedStops, ...newStops]);
//         setSelectedStops(selected);
//     };

//     const handleInputChange = (id: string, field: 'pickup' | 'dropoff', value: string) => {
//         setStops((prev) =>
//             prev.map((stop) => (stop.id === id ? { ...stop, [field]: value } : stop))
//         );
//     };

//     const handleDragEnd = (result: any) => {
//         if (!result.destination) return;
//         const reorderedStops = Array.from(stops);
//         const [removed] = reorderedStops.splice(result.source.index, 1);
//         reorderedStops.splice(result.destination.index, 0, removed);
//         setStops(reorderedStops);
//     };

//     return (
//         <Box>
//             {/* Multi-Select Dropdown */}
//             <CustomSelect
//                 multiple
//                 options={availableStops}
//                 label="Select Stops"
//                 name="stops"
//                 value={selectedStops}
//                 onChange={(value: string[]) => handleAddStops(value)}
//                 formControlProps={{ sx: { maxWidth: 400, width: '100%' } }}
//             />

//             {/* Draggable Table */}
//             <DragDropContext onDragEnd={handleDragEnd}>
//                 <TableContainer component={Paper} sx={{ mt: 2 }}>
//                     <Table>
//                         <TableHead>
//                             <TableRow>
//                                 <TableCell sx={{ width: '50px' }} />
//                                 <TableCell sx={{ width: '40%', fontWeight: 'bold' }}>Stop Name</TableCell>
//                                 <TableCell sx={{ width: '20%', fontWeight: 'bold' }}>Pickup Time</TableCell>
//                                 <TableCell sx={{ width: '20%', fontWeight: 'bold' }}>Dropoff Time</TableCell>
//                                 <TableCell sx={{ width: '20%', fontWeight: 'bold' }}>Assigned Rider</TableCell>
//                             </TableRow>
//                         </TableHead>
//                         <Droppable droppableId="stops">
//                             {(provided) => (
//                                 <TableBody {...provided.droppableProps} ref={provided.innerRef}>
//                                     {stops.map((stop, index) => (
//                                         <Draggable key={stop.id} draggableId={stop.id} index={index}>
//                                             {(provided2, snapshot) => (
//                                                 <TableRow
//                                                     ref={provided2.innerRef}
//                                                     {...provided2.draggableProps}
//                                                     sx={{
//                                                         '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.03)' },
//                                                         ...(snapshot.isDragging && {
//                                                             backgroundColor: 'rgba(63, 81, 181, 0.08) !important',
//                                                             '& td': { borderBottom: 'none' },
//                                                         }),
//                                                     }}
//                                                 >
//                                                     {/* Drag Handle */}
//                                                     <TableCell {...provided2.dragHandleProps} sx={{ width: '50px' }}>
//                                                         {index !== 0 && index !== stops.length - 1 ? (
//                                                             <IconButton size="small" sx={{ cursor: 'grab' }}>
//                                                                 <Iconify icon="mdi:drag" />
//                                                             </IconButton>
//                                                         ) : null}
//                                                     </TableCell>

//                                                     {/* Stop Name with Start/End Labels */}
//                                                     <TableCell>
//                                                         <Typography
//                                                             variant="body1"
//                                                             sx={{
//                                                                 fontWeight: index === 0 || index === stops.length - 1 ? 'bold' : 'normal',
//                                                             }}
//                                                         >
//                                                             {stop.name}{' '}
//                                                             {index === 0 ? '(Start Point)' : index === stops.length - 1 ? '(End Point)' : ''}
//                                                         </Typography>
//                                                     </TableCell>

//                                                     {/* Editable Pickup Time */}
//                                                     <TableCell>
//                                                         <TextField
//                                                             type="time"
//                                                             size="small"
//                                                             value={stop.pickup}
//                                                             onChange={(e) => handleInputChange(stop.id, 'pickup', e.target.value)}
//                                                             InputLabelProps={{ shrink: true }}
//                                                             sx={{ width: '100%' }}
//                                                             disabled={index === stops.length - 1} // Optional: Disable for End Point
//                                                         />
//                                                     </TableCell>

//                                                     {/* Editable Dropoff Time */}
//                                                     <TableCell>
//                                                         <TextField
//                                                             type="time"
//                                                             size="small"
//                                                             value={stop.dropoff}
//                                                             onChange={(e) => handleInputChange(stop.id, 'dropoff', e.target.value)}
//                                                             InputLabelProps={{ shrink: true }}
//                                                             sx={{ width: '100%' }}
//                                                             disabled={index === 0} // Optional: Disable for Start Point
//                                                         />
//                                                     </TableCell>
//                                                     <TableCell>
//                                                         <CustomSelect
//                                                             multiple
//                                                             options={[
//                                                                 { value: 'bus1', label: 'Ramesh' },
//                                                                 { value: 'bus2', label: 'Jayesh' },
//                                                                 { value: 'van1', label: 'Student' },

//                                                             ]}
//                                                             label="Assign Student"
//                                                             name="student"
//                                                             value={[]}
//                                                             onChange={(value) => console.log("value", value)}
//                                                             formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
//                                                         /></TableCell>
//                                                 </TableRow>
//                                             )}
//                                         </Draggable>
//                                     ))}
//                                     {provided.placeholder}
//                                 </TableBody>
//                             )}
//                         </Droppable>
//                     </Table>
//                 </TableContainer>
//             </DragDropContext>
//         </Box>
//     );
// };

// export default EditableStopTable;



