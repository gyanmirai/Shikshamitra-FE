import React from "react";
import * as Yup from "yup";
import { useFormik } from "formik";

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
import CustomDialog from 'src/components/customDialog'

interface DriverFormDialogProps {
    driver: any,
    dialogValue: boolean,
    onClose: () => void,
    isEdit: boolean,


}

const DriverFormDialog: React.FC<DriverFormDialogProps> = ({ driver, onClose, isEdit, dialogValue }) => {
    // Form validation schema
    const validationSchema = Yup.object({
        name: Yup.string().required("Name is required"),
        emergencyContact: Yup.string()
            .matches(/^\d{10}$/, "Must be a valid 10-digit number")
            .required("Emergency contact is required"),
        bloodGroup: Yup.string().required("Blood group is required"),
        address: Yup.string().required("Address is required"),
        aadharCard: Yup.string().matches(/^\d{4}-\d{4}-\d{4}$/, "Format: XXXX-XXXX-XXXX"),
        licenseNumber: Yup.string().required("License number is required"),
        route: Yup.string(),
        vehicle: Yup.string(),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            name: "",
            emergencyContact: "",
            bloodGroup: "",
            address: "",
            aadharCard: "",
            licenseNumber: "",
            route: "",
            vehicle: "",
        },
        validationSchema,
        onSubmit: (values) => {

        },
    });

    return (
        <CustomDialog maxWidth="sm" title="Add Driver" handleClose={onClose} open={dialogValue}  >
            <Box>

                <form onSubmit={formik.handleSubmit}>
                    <Scrollbar sx={{ bgcolor: 'background.neutral', p: 3, height: "500px" }}>
                        <Grid container spacing={2}>
                            {/* Name */}
                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Name"
                                    name="name"
                                // value={formik.values.name}
                                // onChange={formik.handleChange}
                                // onBlur={formik.handleBlur}
                                // error={formik.touched.name && Boolean(formik.errors.name)}
                                // helperText={formik.touched.name && formik.errors.name}
                                />
                            </Grid>


                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Age"
                                    name="age"
                                // value={formik.values.vehicle}
                                // onChange={formik.handleChange}
                                // onBlur={formik.handleBlur}
                                // error={formik.touched.vehicle && Boolean(formik.errors.vehicle)}
                                // helperText={formik.touched.vehicle && formik.errors.vehicle}
                                />
                            </Grid>

                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Contact"
                                    name="Contact"
                                // value={formik.values.vehicle}
                                // onChange={formik.handleChange}
                                // onBlur={formik.handleBlur}
                                // error={formik.touched.vehicle && Boolean(formik.errors.vehicle)}
                                // helperText={formik.touched.vehicle && formik.errors.vehicle}
                                />
                            </Grid>






                            {/* Blood Group */}
                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Blood Group"
                                    name="bloodGroup"
                                // value={formik.values.bloodGroup}
                                // onChange={formik.handleChange}
                                // onBlur={formik.handleBlur}
                                // error={
                                //     formik.touched.bloodGroup &&
                                //     Boolean(formik.errors.bloodGroup)
                                // }
                                // helperText={
                                //     formik.touched.bloodGroup &&
                                //     formik.errors.bloodGroup
                                // }
                                />
                            </Grid>
                            {/* Address */}

                            {/* Aadhar Card */}
                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Aadhar Card (XXXX-XXXX-XXXX)"
                                // name="aadharCard"
                                // value={formik.values.aadharCard}
                                // onChange={formik.handleChange}
                                // onBlur={formik.handleBlur}
                                // error={formik.touched.aadharCard && Boolean(formik.errors.aadharCard)}
                                // helperText={formik.touched.aadharCard && formik.errors.aadharCard}
                                />
                            </Grid>
                            {/* License Number */}
                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="License Number"
                                // name="licenseNumber"
                                // value={formik.values.licenseNumber}
                                // onChange={formik.handleChange}
                                // onBlur={formik.handleBlur}
                                // error={
                                //     formik.touched.licenseNumber &&
                                //     Boolean(formik.errors.licenseNumber)
                                // }
                                // helperText={
                                //     formik.touched.licenseNumber &&
                                //     formik.errors.licenseNumber
                                // }
                                />
                            </Grid>

                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Address Line 1"
                                // name="address"
                                // value={formik.values.address}
                                // onChange={formik.handleChange}
                                // onBlur={formik.handleBlur}
                                // error={formik.touched.address && Boolean(formik.errors.address)}
                                // helperText={formik.touched.address && formik.errors.address}
                                />
                            </Grid>

                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Address Line 2"
                                // name="address"
                                // value={formik.values.address}
                                // onChange={formik.handleChange}
                                // onBlur={formik.handleBlur}
                                // error={formik.touched.address && Boolean(formik.errors.address)}
                                // helperText={formik.touched.address && formik.errors.address}
                                />
                            </Grid>
                            {/* Route */}
                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Route Assigned"
                                // name="route"
                                // value={formik.values.route}
                                // onChange={formik.handleChange}
                                // onBlur={formik.handleBlur}
                                // error={formik.touched.route && Boolean(formik.errors.route)}
                                // helperText={formik.touched.route && formik.errors.route}
                                />
                            </Grid>
                            {/* Vehicle */}
                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Vehicle Assigned"
                                // name="vehicle"
                                // value={formik.values.vehicle}
                                // onChange={formik.handleChange}
                                // onBlur={formik.handleBlur}
                                // error={formik.touched.vehicle && Boolean(formik.errors.vehicle)}
                                // helperText={formik.touched.vehicle && formik.errors.vehicle}
                                />
                            </Grid>

                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Emergency Contact Name"
                                    name=""
                                // value={formik.values.vehicle}
                                // onChange={formik.handleChange}
                                // onBlur={formik.handleBlur}
                                // error={formik.touched.vehicle && Boolean(formik.errors.vehicle)}
                                // helperText={formik.touched.vehicle && formik.errors.vehicle}
                                />
                            </Grid>

                            {/* Emergency Contact */}
                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Emergency Contact"
                                // name="emergencyContact"
                                // value={formik.values.emergencyContact}
                                // onChange={formik.handleChange}
                                // onBlur={formik.handleBlur}
                                // error={
                                //     formik.touched.emergencyContact &&
                                //     Boolean(formik.errors.emergencyContact)
                                // }
                                // helperText={
                                //     formik.touched.emergencyContact &&
                                //     formik.errors.emergencyContact
                                // }
                                />
                            </Grid>

                            <Grid item xs={12} md={6} sx={{ pb: "10px" }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="Relation With Driver"
                                    name=""
                                // value={formik.values.vehicle}
                                // onChange={formik.handleChange}
                                // onBlur={formik.handleBlur}
                                // error={formik.touched.vehicle && Boolean(formik.errors.vehicle)}
                                // helperText={formik.touched.vehicle && formik.errors.vehicle}
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
                                            <Typography variant="body2">Drag Your Aadhar</Typography>
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
                                            <Typography variant="body2">Drag Your License</Typography>
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
                                            <Typography variant="body2">Drag Your Photo</Typography>
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

                        <Button
                            variant="contained"
                        >
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Box>


        </CustomDialog>
    );
};

export default DriverFormDialog;
