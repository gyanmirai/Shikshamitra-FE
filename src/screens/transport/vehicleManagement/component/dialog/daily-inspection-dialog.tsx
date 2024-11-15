import { useFormik } from 'formik';
import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Radio, Table, Button, TableRow, TextField, TableCell, TableBody, TableHead, Typography, RadioGroup, FormControl, DialogActions, FormControlLabel } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';


const inspectionItems = [
    {
        id: 1,
        name: "Fluids",
        details: ["Radiator", "Oil", "Transmission", "Brake", "Steering", "Wiper"],
        isCheck: false,
        actionRequired: "",
    },
    {
        id: 2,
        name: "Lights",
        details: ["Headlight", "Driving", "Tail", "Signal", "Hazard"],
        isCheck: false,
        actionRequired: "",
    },
    {
        id: 3,
        name: "Tires",
        details: ["Pressure", "Tread", "Wheel Nuts", "Spare"],
        isCheck: false,
        actionRequired: "",
    },
    {
        id: 4,
        name: "Brakes",
        details: ["Function", "Emergency", "Warnings"],
        isCheck: false,
        actionRequired: "",
    },
    {
        id: 5,
        name: "Electrical",
        details: ["Battery", "Gauges", "Warnings"],
        isCheck: false,
        actionRequired: "",
    },
    {
        id: 6,
        name: "Defrost/Heater",
        details: ["Functioning", "Windows Clear"],
        isCheck: false,
        actionRequired: "",
    },
    {
        id: 7,
        name: "Exhausts",
        details: ["Noise", "Secure", "Leaks"],
        isCheck: false,
        actionRequired: "",
    },
    {
        id: 8,
        name: "Safety",
        details: ["Seatbelts", "First Aid Kit", "Fire Extinguisher"],
        isCheck: false,
        actionRequired: "Check inspection date",
    },
    {
        id: 9,
        name: "Accessories",
        details: ["Wipers", "Horn", "Mirrors", "Cab Clean"],
        isCheck: false,
        actionRequired: "",
    },
    {
        id: 10,
        name: "Windshield",
        details: ["Clean", "No Chips or Cracks"],
        isCheck: false,
        actionRequired: "",
    },
    {
        id: 11,
        name: "PPE",
        details: ["Hardhat", "Safety Glasses", "Gloves", "Footwear"],
        isCheck: false,
        actionRequired: "",
    },
    {
        id: 12,
        name: "Tools",
        details: ["Condition", "Inspected"],
        isCheck: false,
        actionRequired: "",
    },
    {
        id: 13,
        name: "Emergency Items",
        details: ["Bucket Evac", "Beacon", "Signs", "Cones", "Other"],
        isCheck: false,
        actionRequired: "",
    },
];

interface TransportDailyVehicleDialogProps {
    dialogValue: boolean;
    data: any;
    onSave: (values: any) => void;
    onClose: () => void;
    isEdit: boolean;
    allData: any;
}

interface FormikValue {
    division: string;
    fleet: string;
    vehicleNumber: string;
    vehicleDriver: string;
    vehicleCrew: string;
    vehiclePlateNumber: string;
    mileage: string;
    vehicleMakeAndModel: string;
    firstName: string;
    lastName: string;
    firstNameOfDivisionManager: string;
    lastNameOfDivisionManager: string;
    mviDate: Date | null;
    dateInspected: Date | null;
    insuranceRenewalDate: Date | null;
    lastDateOilChanged: Date | null;
    registrationRenewalDate: Date | null;
    id: number;

}

const TransportDailyVehicleDialog: React.FC<TransportDailyVehicleDialogProps> = ({
    dialogValue,
    data,
    onSave,
    onClose,
    isEdit,
    allData,
}) => {
    const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);
    console.log('data', allData);
    console.log('seldata', data);

    const formik = useFormik<FormikValue>({
        initialValues: {
            division: isEdit ? data.division ?? '' : '',
            fleet: isEdit ? data.fleet ?? '' : '',
            vehicleNumber: isEdit ? data.vehicleNumber ?? '' : '',
            vehicleDriver: isEdit ? data.vehicleDriver ?? '' : '',
            vehicleCrew: isEdit ? data.vehicleCrew ?? '' : '',
            vehiclePlateNumber: isEdit ? data.vehiclePlateNumber ?? '' : '',
            mileage: isEdit ? data.mileage ?? '' : '',
            vehicleMakeAndModel: isEdit ? data.vehicleMakeAndModel ?? '' : '',
            firstName: isEdit ? data.firstName ?? '' : '',
            lastName: isEdit ? data.lastName ?? '' : '',
            firstNameOfDivisionManager: isEdit ? data.firstName ?? '' : '',
            lastNameOfDivisionManager: isEdit ? data.lastName ?? '' : '',
            mviDate: isEdit ? data.mviDate ?? null : null,
            dateInspected: isEdit ? data.dateInspected ?? null : null,
            insuranceRenewalDate: isEdit ? data.insuranceRenewalDate ?? null : null,
            lastDateOilChanged: isEdit ? data.lastDateOilChanged ?? null : null,
            registrationRenewalDate: isEdit ? data.registrationRenewalDate ?? null : null,
            id: isEdit ? data.id ?? Math.floor(Math.random() * 1000000000) : Math.floor(Math.random() * 1000000000),
        },
        onSubmit: (values) => {
            // Handle form submission
        },
    });

    return (
        <CustomDialog
            maxWidth="lg"
            title="Daily Inspection"
            open={dialogValue}
            handleClose={onClose}

        >
            {/* <Box px="20px">
        {showExistingEntryMessage ? (
          <Typography component="span" fontSize="14" color="red">
            This Vehicle Already Exists
          </Typography>
        ) : (
          <Box height="25px" />
        )}
      </Box> */}
            <Scrollbar>
                <Box px="15px">
                    <form onSubmit={formik.handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item md={6}>
                                <Box mb={2}>
                                    <TextField
                                        disabled={isEdit}
                                        name="division"
                                        label="Division"
                                        value={formik.values.division}
                                        onChange={formik.handleChange}
                                        size="small"
                                        fullWidth
                                    />
                                </Box>
                                <Box mb={2}>
                                    <TextField
                                        disabled={isEdit}
                                        name="fleet"
                                        label="Fleet#"
                                        value={formik.values.fleet}
                                        onChange={formik.handleChange}
                                        size="small"
                                        fullWidth
                                    />
                                </Box>
                                <Box mb={2}>
                                    <DatePicker
                                        label="MVI Date"
                                        slotProps={{
                                            textField: {
                                                sx: { width: '100%', maxWidth: '200px' },
                                                size: 'small',
                                            },
                                        }}
                                    />
                                </Box>
                                <Box mb={2}>
                                    <TextField
                                        disabled={isEdit}
                                        name="vehicleDriver"
                                        label="Vehicle Driver"
                                        value={formik.values.vehicleDriver}
                                        onChange={formik.handleChange}
                                        size="small"
                                        fullWidth
                                    />
                                </Box>
                                <Box mb={2}>
                                    <TextField
                                        disabled={isEdit}
                                        name="vehicleCrew"
                                        label="Vehicle Crew"
                                        value={formik.values.vehicleCrew}
                                        onChange={formik.handleChange}
                                        size="small"
                                        fullWidth
                                    />
                                </Box>
                                <Box mb={2}>
                                    <DatePicker
                                        label="Date Inspected"
                                        slotProps={{
                                            textField: {
                                                sx: { width: '100%', maxWidth: '200px' },
                                                size: 'small',
                                            },
                                        }}
                                    />
                                </Box>
                                <Box mb={2}>
                                    <DatePicker
                                        label="Insurance Renewal Date"
                                        slotProps={{
                                            textField: {
                                                sx: { width: '100%', maxWidth: '200px' },
                                                size: 'small',
                                            },
                                        }}
                                    />
                                </Box>
                                <Box mb={2}>
                                    <DatePicker
                                        label="Last Date Oil Changed"
                                        slotProps={{
                                            textField: {
                                                sx: { width: '100%', maxWidth: '200px' },
                                                size: 'small',
                                            },
                                        }}
                                    />
                                </Box>
                            </Grid>
                            {/* <Grid item md={4}/> */}
                            <Grid item md={6}>
                                <Box mb={2}>
                                    <TextField
                                        disabled={isEdit}
                                        name="vehiclePlateNumber"
                                        label="Vehicle Plate #"
                                        value={formik.values.vehiclePlateNumber}
                                        onChange={formik.handleChange}
                                        size="small"
                                        fullWidth
                                    />
                                </Box>
                                <Box mb={2}>
                                    <TextField
                                        disabled={isEdit}
                                        name="mileage"
                                        label="Mileage"
                                        value={formik.values.mileage}
                                        onChange={formik.handleChange}
                                        size="small"
                                        fullWidth
                                    />
                                </Box>
                                <Box mb={2}>
                                    <TextField
                                        disabled={isEdit}
                                        name="vehicleMakeAndModel"
                                        label="Vehicle Make and Model"
                                        value={formik.values.vehicleMakeAndModel}
                                        onChange={formik.handleChange}
                                        size="small"
                                        fullWidth
                                    />
                                </Box>
                                <Typography>Inspected by</Typography>
                                <Grid item md={12}>
                                    <Grid container spacing={2}> {/* Use a container for proper spacing */}
                                        <Grid item md={6}>
                                            <Box mb={2}>
                                                <TextField
                                                    disabled={isEdit}
                                                    name="firstName"
                                                    label="First Name"
                                                    value={formik.values.firstName}
                                                    onChange={formik.handleChange}
                                                    size="small"
                                                    fullWidth
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid item md={6}>
                                            <Box mb={2}>
                                                <TextField
                                                    disabled={isEdit}
                                                    name="lastName"
                                                    label="Last Name"
                                                    value={formik.values.lastName}
                                                    onChange={formik.handleChange}
                                                    size="small"
                                                    fullWidth
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <Typography>Division Manager</Typography>
                                <Grid item md={12}>
                                    <Grid container spacing={2}> {/* Use a container for proper spacing */}
                                        <Grid item md={6}>
                                            <Box mb={2}>
                                                <TextField
                                                    disabled={isEdit}
                                                    name="firstNameOfDivisionManager"
                                                    label="First Name"
                                                    value={formik.values.firstNameOfDivisionManager}
                                                    onChange={formik.handleChange}
                                                    size="small"
                                                    fullWidth
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid item md={6}>
                                            <Box mb={2}>
                                                <TextField
                                                    disabled={isEdit}
                                                    name="lastNameOfDivisionManager"
                                                    label="Last Name"
                                                    value={formik.values.lastNameOfDivisionManager}
                                                    onChange={formik.handleChange}
                                                    size="small"
                                                    fullWidth
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <DatePicker
                                    label="Registration Renewal Date"
                                    slotProps={{
                                        textField: {
                                            sx: { width: '100%', maxWidth: '200px' },
                                            size: 'small',
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Typography sx={{ pb:"12px"}} variant="h6">Item Checklist</Typography>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Item Name</TableCell>
                                    <TableCell>Is Check</TableCell>
                                    <TableCell>Is Not Check</TableCell>
                                    <TableCell>N/A</TableCell>
                                    <TableCell>Action Required</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {inspectionItems.map((item) => (
                                    <TableRow key={item.id}>
                                        {/* Item Name */}
                                        <TableCell>
                                            {`${item.name} - ${item.details.join(', ')}`}
                                        </TableCell>

                                        {/* Is Check Radio Button */}
                                        <TableCell>
                                            <FormControl>
                                                <RadioGroup
                                                    row
                                                    name={`isCheck-${item.id}`}
                                                    value={item.isCheck ? 'checked' : ''}
                                                    onChange={() => {
                                                        item.isCheck = true;
                                                        item.actionRequired = ""; // reset action required if checked
                                                    }}
                                                >
                                                    <FormControlLabel
                                                        value="checked"
                                                        control={<Radio />}
                                                        label="Is Check"
                                                    />
                                                </RadioGroup>
                                            </FormControl>
                                        </TableCell>

                                        {/* Is Not Check Radio Button */}
                                        <TableCell>
                                            <FormControl>
                                                <RadioGroup
                                                    row
                                                    name={`isNotCheck-${item.id}`}
                                                    value={item.isCheck === false ? 'unchecked' : ''}
                                                    onChange={() => {
                                                        item.isCheck = false;
                                                        item.actionRequired = ""; // reset action required if unchecked
                                                    }}
                                                >
                                                    <FormControlLabel
                                                        value="unchecked"
                                                        control={<Radio />}
                                                        label="Is Not Check"
                                                    />
                                                </RadioGroup>
                                            </FormControl>
                                        </TableCell>

                                        {/* N/A Radio Button */}
                                        <TableCell>
                                            <FormControl>
                                                <RadioGroup
                                                    row
                                                    name={`na-${item.id}`}
                                                    value={item.isCheck === null ? 'na' : ''}
                                                    onChange={() => {
                                                        item.isCheck = false
                                                        item.actionRequired = "";
                                                    }}
                                                >
                                                    <FormControlLabel
                                                        value="na"
                                                        control={<Radio />}
                                                        label="N/A"
                                                    />
                                                </RadioGroup>
                                            </FormControl>
                                        </TableCell>

                                        {/* Action Required Input Field */}
                                        <TableCell>
                                            <TextField
                                                label="Action Required"
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                                value={item.actionRequired}
                                                onChange={(e) => {
                                                    item.actionRequired = e.target.value;
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Typography sx={{ pb:"12px"}} variant="h6">Other</Typography>
                        <TextField
                            multiline
                            rows={4}
                            label="Type here...."
                            variant="outlined"
                            size="small"
                            fullWidth
                            value=""
                            onChange={(e) => {

                            }}
                        />
                        {/* <ImageUploadAndMarker /> */}
                        <Typography sx={{pt:"15px", pb:"12px"}} variant="h6">Notes</Typography>
                        <TextField
                            multiline
                            rows={4}
                            label="Type here...."
                            variant="outlined"
                            size="small"
                            fullWidth
                            value=""
                            onChange={(e) => {

                            }}
                        />


                        <DialogActions>
                            <Button onClick={onClose} variant="contained" size="small">
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" size="small">
                                Save
                            </Button>
                        </DialogActions>
                    </form>
                </Box>
            </Scrollbar>
        </CustomDialog>
    );
};

export default TransportDailyVehicleDialog;
