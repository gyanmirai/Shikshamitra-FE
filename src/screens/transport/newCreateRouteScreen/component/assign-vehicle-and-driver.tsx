import React, { useState } from 'react';

import { Box, Grid, TextField } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

const AssignVehicleAndDriver = () => {
    const [selectedVehicle, setSelectedVehicle] = useState<any>('');
    const [selectedDriver, setSelectedDriver] = useState<any>('');

    const handleChange = (value: string | string[], field: 'vehicle' | 'driver') => {
        const selectedValue = Array.isArray(value) ? value[0] : value;

        if (field === 'vehicle') {
            setSelectedVehicle(selectedValue);
        } else if (field === 'driver') {
            setSelectedDriver(selectedValue);
        }
    };

    return (
        <Grid container spacing={2} sx={{ mb: 4, mt: 5 }}>
            <Grid item xs={12} sm={4}>
                <TextField
                    size='small'
                    fullWidth
                    id="route"
                    name="routeName"
                    label="Route Name"
                // InputLabelProps={{
                //     style: {
                //         height: "100px",
                //     },
                // }}

                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <Box height="200px">
                    <CustomSelect
                        options={[
                            { value: 'bus1', label: 'Bus 1 - 30 Seater' },
                            { value: 'bus2', label: 'Bus 2 - 40 Seater' },
                            { value: 'van1', label: 'Van 1 - 10 Seater' },
                            { value: 'bus3', label: 'Bus 3 - 50 Seater' },
                        ]}
                        label="Assign Vehicle"
                        name="vehicle"
                        value={selectedVehicle}
                        // @ts-ignore
                        onChange={(value) => handleChange(value, 'vehicle')}
                    // formControlProps={{ fullWidth: true, sx: { height: "300px" } }}
                    // sx={{ height: "300px" }}

                    />
                </Box>

            </Grid>
            <Grid item xs={12} sm={4}>
                <CustomSelect
                    options={[
                        { value: 'driver1', label: 'John Doe - License No: ABC123' },
                        { value: 'driver2', label: 'Jane Smith - License No: XYZ456' },
                        { value: 'driver3', label: 'Mike Johnson - License No: DEF789' },
                        { value: 'driver4', label: 'Emily Davis - License No: GHI012' },
                    ]}
                    label="Assign Driver"
                    name="driver"
                    value={selectedDriver}
                    // @ts-ignore
                    onChange={(value) => handleChange(value, 'driver')}
                    formControlProps={{ fullWidth: true }}
                />
            </Grid>
        </Grid>
    );
};

export default AssignVehicleAndDriver;
