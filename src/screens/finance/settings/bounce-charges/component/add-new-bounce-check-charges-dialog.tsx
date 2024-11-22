import React, { useState } from 'react';

import { Box, Button, Slider, TextField, Typography, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

interface AddNewBounceCheckChargesDialogProps {
    dialogValue: boolean;
    data: any;
    onSave: (values: any) => void;
    onClose: () => void;
    isEdit: boolean;
    allData: any;
}

const AddNewBounceCheckChargesDialog: React.FC<AddNewBounceCheckChargesDialogProps> = ({
    data,
    allData,
    onClose,
    onSave,
    isEdit,
    dialogValue,
}) => {
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

    };

    const [range, setRange] = useState<number[]>([1000, 5000]);

    const handleChange = (event: Event, newValue: number | number[]) => {
        setRange(newValue as number[]);
    };

    const handleSave = () => {
        console.log('Selected Amount Range:', range);
    };
    return (
        <CustomDialog
            title={`${isEdit ? 'Edit' : 'Create New'} Bounce Check Charges`}
            open={dialogValue}
            handleClose={onClose}
        >
            <Box>
                <form onSubmit={handleSubmit}>
                    <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', }}>
                        <Box display="flex" flexDirection="column" gap={3}>
                            {/* First Row */}
                            <Box display="flex" flexDirection="row" gap={2}>
                                <CustomSelect
                                    fullWidth
                                    label="Bank Name"
                                    options={[]}
                                    value=""
                                    onChange={() => { }}
                                    sx={{
                                        minHeight: 40,
                                        '& .MuiOutlinedInput-root': {
                                            padding: '7px 14px',
                                        },
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    name="bounceReason"
                                    label="Bounce Reason"
                                    value=""
                                    onChange={() => { }}
                                    size="small"
                                />
                            </Box>

                            {/* Second Row */}
                            <Box display="flex" flexDirection="row" gap={2}>
                                <TextField
                                    fullWidth
                                    name="charges"
                                    label="Charges"
                                    value=""
                                    onChange={() => { }}
                                    type="number"
                                    size="small"
                                />
                                {/* <TextField
                                    fullWidth
                                    name="gstCharges"
                                    label="GST Charges"
                                    value=""
                                    onChange={() => { }}
                                    type="number"
                                    size="small"
                                /> */}
                            </Box>
                            <Box display="flex" flexDirection="column" gap={2} width="100%">
                                <Typography fontSize="15px">Select Amount Range</Typography>

                              
                                <Box width="90%">
                                    <Slider
                                        value={range}
                                        onChange={handleChange}
                                        valueLabelDisplay="auto"
                                        min={500}
                                        max={10000}
                                        step={100}
                                        marks={[
                                            { value: 500, label: '500' },
                                            { value: 2500, label: '2.5K' },
                                            { value: 5000, label: '5K' },
                                            { value: 7500, label: '7.5K' },
                                            { value: 10000, label: '10K' },
                                        ]}
                                        sx={{
                                            mx: 2, // Add horizontal margin to give some space on the sides
                                        }}
                                    />
                                </Box>

                                {/* Min and Max Labels */}
                                <Box display="flex" justifyContent="space-between" alignItems="center" mt={-2}>
                                    <Typography variant="body2">Min: ₹ {range[0]}</Typography>
                                    <Typography variant="body2">Max: ₹ {range[1]}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Scrollbar>

                    <DialogActions>
                        <Button type="submit" variant="contained" size="small">
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Box>
        </CustomDialog>
    );
};

export default AddNewBounceCheckChargesDialog;
