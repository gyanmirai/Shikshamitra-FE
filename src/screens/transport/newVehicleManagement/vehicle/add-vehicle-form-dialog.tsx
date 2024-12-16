import React from "react";
import dayjs from "dayjs";
import * as Yup from "yup";
import { useFormik } from "formik";

import { DatePicker } from "@mui/x-date-pickers";
import {
    Box,
    Grid,
    Button,
    TextField,
    Typography,
    DialogActions,
} from "@mui/material";

import { Iconify } from "src/components/iconify";
import { UploadBox } from "src/components/upload";
import { Scrollbar } from "src/components/scrollbar";
import CustomDialog from 'src/components/customDialog';
import CustomSelect from "src/components/custom-select";

interface VehicleFormDialogProps {
    vehicle: any;
    dialogValue: boolean;
    onClose: () => void;
    isEdit: boolean;
}

const VehicleFormDialog: React.FC<VehicleFormDialogProps> = ({ vehicle, onClose, isEdit, dialogValue }) => {
    // Form validation schema
    const validationSchema = Yup.object({
        vehicleName: Yup.string().required("Vehicle name is required"),
        registrationNumber: Yup.string().required("Registration number is required"),
        vehicleType: Yup.string().required("Vehicle type is required"),
        manufacturer: Yup.string().required("Manufacturer is required"),
        seatingCapacity: Yup.number().required("Seating capacity is required").min(1, "Must be at least 1"),
        insurancePolicyNumber: Yup.string().required("Insurance policy number is required"),
        insuranceExpiryDate: Yup.date().required("Insurance expiry date is required"),
        dailyInspectionChecklist: Yup.string().required("Inspection checklist is required"),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            vehicleName: "",
            registrationNumber: "",
            vehicleType: "",
            manufacturer: "",
            seatingCapacity: "",
            insurancePolicyNumber: "",
            insuranceExpiryDate: dayjs(),
            dailyInspectionChecklist: "",
        },
        validationSchema,
        onSubmit: (values) => {
            console.log("Form values:", values);
        },
    });

    return (
        <CustomDialog maxWidth="sm" title={isEdit ? "Edit Vehicle" : "Add Vehicle"} handleClose={onClose} open={dialogValue}>
            <Box>
                <form onSubmit={formik.handleSubmit}>
                    <Scrollbar sx={{ bgcolor: 'background.neutral', p: 3, height: "500px" }}>
                        <Grid container spacing={2}>
                            {/* Vehicle Name */}
                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Vehicle Name"
                                    name="vehicleName"
                                    value={formik.values.vehicleName}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.vehicleName && Boolean(formik.errors.vehicleName)}
                                    helperText={formik.touched.vehicleName && formik.errors.vehicleName}
                                />
                            </Grid>

                            {/* Registration Number */}
                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Registration Number"
                                    name="registrationNumber"
                                    value={formik.values.registrationNumber}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.registrationNumber && Boolean(formik.errors.registrationNumber)}
                                    helperText={formik.touched.registrationNumber && formik.errors.registrationNumber}
                                />
                            </Grid>

                            {/* Vehicle Type */}
                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Vehicle Type"
                                    name="vehicleType"
                                    value={formik.values.vehicleType}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.vehicleType && Boolean(formik.errors.vehicleType)}
                                    helperText={formik.touched.vehicleType && formik.errors.vehicleType}
                                />
                            </Grid>

                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Fuel Type"
                                    name="fuelType"
                                // value={formik.values.insurancePolicyNumber}
                                // onChange={formik.handleChange}
                                // onBlur={formik.handleBlur}
                                // error={formik.touched.insurancePolicyNumber && Boolean(formik.errors.insurancePolicyNumber)}
                                // helperText={formik.touched.insurancePolicyNumber && formik.errors.insurancePolicyNumber}
                                />
                            </Grid>


                            {/* Manufacturer */}
                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Manufacturer"
                                    name="manufacturer"
                                    value={formik.values.manufacturer}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.manufacturer && Boolean(formik.errors.manufacturer)}
                                    helperText={formik.touched.manufacturer && formik.errors.manufacturer}
                                />
                            </Grid>

                            {/* Seating Capacity */}
                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Seating Capacity"
                                    name="seatingCapacity"
                                    type="number"
                                    value={formik.values.seatingCapacity}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.seatingCapacity && Boolean(formik.errors.seatingCapacity)}
                                    helperText={formik.touched.seatingCapacity && formik.errors.seatingCapacity}
                                />
                            </Grid>

                            {/* Insurance Policy Number */}
                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Insurance Policy Number"
                                    name="insurancePolicyNumber"
                                    value={formik.values.insurancePolicyNumber}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.insurancePolicyNumber && Boolean(formik.errors.insurancePolicyNumber)}
                                    helperText={formik.touched.insurancePolicyNumber && formik.errors.insurancePolicyNumber}
                                />
                            </Grid>

                            {/* Insurance Expiry Date */}
                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <DatePicker
                                    label="Insurance Expiry Date"
                                    name="insuranceExpiryDate"
                                    value={formik.values.insuranceExpiryDate}
                                    format="DD/MM/YYYY"
                                    onChange={() => { }}
                                    slotProps={{
                                        textField: {
                                            size: 'small',
                                            fullWidth: true,
                                            //                         error={ formik.touched.insuranceExpiryDate && Boolean(formik.errors.insuranceExpiryDate) }
                                            //   helperText={ formik.touched.insuranceExpiryDate && formik.errors.insuranceExpiryDate }
                                        },
                                    }}
                                />
                                {/* <TextField
                                    size="small"
                                    fullWidth
                                    label="Insurance Expiry Date"
                                    name="insuranceExpiryDate"
                                    type="date"
                                    value={formik.values.insuranceExpiryDate}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.insuranceExpiryDate && Boolean(formik.errors.insuranceExpiryDate)}
                                    helperText={formik.touched.insuranceExpiryDate && formik.errors.insuranceExpiryDate}
                                    InputLabelProps={{ shrink: true }}
                                /> */}
                            </Grid>

                            {/* Daily Inspection Checklist */}
                            {/* <Grid item xs={12} sx={{ pb: "10px" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Daily Inspection Checklist"
                                    name="dailyInspectionChecklist"
                                    multiline
                                    rows={3}
                                    value={formik.values.dailyInspectionChecklist}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.dailyInspectionChecklist && Boolean(formik.errors.dailyInspectionChecklist)}
                                    helperText={formik.touched.dailyInspectionChecklist && formik.errors.dailyInspectionChecklist}
                                />
                            </Grid> */}

                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <CustomSelect
                                    options={[]}
                                    label="Assigned Driver"
                                    value=''
                                    onChange={(e) => {
                                        const value = Math.min(100, Math.max(0, Number(e)));
                                        formik.setFieldValue('discountPercantage', value);
                                    }}
                                    formControlProps={{ sx: { minWidth: 275 } }}
                                    placeholder="No categories available"
                                />
                            </Grid>
                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <CustomSelect
                                    options={[]}
                                    label="Assigned Route"
                                    value=''
                                    onChange={(e) => {
                                        const value = Math.min(100, Math.max(0, Number(e)));
                                        formik.setFieldValue('discountPercantage', value);
                                    }}
                                    formControlProps={{ sx: { minWidth: 275 } }}
                                    placeholder="No categories available"
                                />
                            </Grid>

                            {/* Uploads */}
                            <Grid item xs={12} sx={{ pb: "10px" }}>
                                <UploadBox
                                    onDrop={() => { }}
                                    placeholder={
                                        <Box
                                            sx={{
                                                gap: 0.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: 'text.disabled',
                                                flexDirection: 'column',
                                            }}
                                        >
                                            <Iconify icon="eva:cloud-upload-fill" width={40} />
                                            <Typography variant="body2">Upload Vehicle Document</Typography>
                                        </Box>
                                    }
                                    sx={{
                                        py: 2.5,
                                        width: '100%',
                                        height: 'auto',
                                        borderRadius: 1.5,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sx={{ pb: "10px" }}>
                                <UploadBox
                                    onDrop={() => { }}
                                    placeholder={
                                        <Box
                                            sx={{
                                                gap: 0.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: 'text.disabled',
                                                flexDirection: 'column',
                                            }}
                                        >
                                            <Iconify icon="eva:cloud-upload-fill" width={40} />
                                            <Typography variant="body2">Upload Insurance Document</Typography>
                                        </Box>
                                    }
                                    sx={{
                                        py: 2.5,
                                        width: '100%',
                                        height: 'auto',
                                        borderRadius: 1.5,
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Scrollbar>
                    <DialogActions>
                        <Button variant="contained" type="submit">
                            {isEdit ? "Update" : "Save"}
                        </Button>
                    </DialogActions>
                </form>
            </Box>
        </CustomDialog>
    );
};

export default VehicleFormDialog;
