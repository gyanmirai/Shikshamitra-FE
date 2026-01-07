import { useFormik } from 'formik';
import React, { useState } from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Card,
  Radio,
  Button,
  TextField,
  Typography,
  RadioGroup,
  DialogActions,
} from '@mui/material';

import vehicleManagementData from '../../../../json/transport/transportModuleData.json';

// import { useGetAvailableVehiclesQuery } from 'src/redux/transport/vehicle-management/route-management-api';

interface ChangeVehicleFormProps {
  onClose: (e: any, isSubmit: boolean) => void;
}

// Mock current vehicle data
const currentVehicle = {
  registrationNo: 'DL1CA-1234',
  vehicleType: 'Bus',
  makeModel: 'Tata Starbus LP',
  seatingCapacity: 45,
};

const ChangeVehicleForm: React.FC<ChangeVehicleFormProps> = ({ onClose }) => {
  const [availableVehicles, setAvailableVehicles] = useState<any>(
    vehicleManagementData?.availableVehiclesData
  );
  // const { data: availableVehicles } = useQueryAndMutation({
  //   type: 'query',
  //   currentQueryAndMutation: useGetAvailableVehiclesQuery,
  // });

  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const theme = useTheme();
  const formik = useFormik({
    initialValues: {
      selectedVehicle: '',
      reason: '',
    },
    onSubmit: (values) => {
      if (selectedVehicle) {
        const selectedVehicleData = availableVehicles.find((v: any) => v.id === selectedVehicle);
        shikshaMitraToast.success({
          message: `Vehicle changed to ${selectedVehicleData?.registrationNo} successfully!`,
        });
      }
      onClose(null, true);
    },
  });

  // Filter vehicles: only show Active vehicles and apply search filter
  const filteredVehicles = availableVehicles?.filter((vehicle: any) => {
    // First filter: only Active vehicles
    if (vehicle.status.toLowerCase() !== 'active') return false;

    // Second filter: search query
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      vehicle.registrationNo.toLowerCase().includes(query) ||
      vehicle.makeModel.toLowerCase().includes(query) ||
      vehicle.type.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      {/* Scrollable Content */}
      <DialogScrollContent>
        <Box sx={{ p: 1, minWidth: 600 }}>
          {/* Current Vehicle Section */}
          <Box sx={{ mb: 4 }}>
            <Card sx={{ p: 2, border: '1px solid #e9ecef' }}>
              <Typography variant="h6" gutterBottom color="primary.main">
                Current Vehicle
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Registration No.
                  </Typography>
                  <Typography variant="body1" fontWeight="500" gutterBottom>
                    {currentVehicle.registrationNo}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Make & Model
                  </Typography>
                  <Typography variant="body1" fontWeight="500" gutterBottom>
                    {currentVehicle.makeModel}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Vehicle Type
                  </Typography>
                  <Typography variant="body1" fontWeight="500" gutterBottom>
                    {currentVehicle.vehicleType}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Seating Capacity
                  </Typography>
                  <Typography variant="body1" fontWeight="500" gutterBottom>
                    {currentVehicle.seatingCapacity}
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          </Box>
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.reason && formik.errors.reason)}>
              <TextField
                fullWidth
                label="Reason"
                name="reason"
                size="small"
                multiline
                rows={3}
                value={formik.values.reason}
                onChange={(e) => {
                  formik.setFieldValue('reason', e.target.value);
                  formik.setFieldTouched('reason', true);
                }}
                error={formik.touched.reason && Boolean(formik.errors.reason)}
                helperText={formik.touched.reason && formik.errors.reason}
              />
            </ShakingTextField>
          </Grid>

          {/* Select New Vehicle Section */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom color="primary.main">
              Select New Vehicle
            </Typography>

            {/* Search Field */}
            <Box sx={{ mb: 3 }}>
              <TextField
                size="small"
                fullWidth
                label="Search by Reg no."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Box>

            {/* Vehicle Selection Cards */}
            <RadioGroup
              value={selectedVehicle}
              onChange={(e) => {
                setSelectedVehicle(e.target.value);
                formik.setFieldValue('selectedVehicle', e.target.value);
              }}
            >
              <Scrollbar sx={{ height: '150px' }}>
                {filteredVehicles?.map((vehicle: any) => (
                  <Card
                    key={vehicle.id}
                    sx={{
                      p: 1,
                      mb: 2,
                      border: selectedVehicle === vehicle.id ? '2px solid' : '1px solid',
                      borderColor: selectedVehicle === vehicle.id ? 'primary.main' : 'grey.300',
                      backgroundColor:
                        selectedVehicle === vehicle.id
                          ? varAlpha(theme.vars.palette.primary.mainChannel, 0.08)
                          : 'background.paper',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: '#4caf50',
                      },
                    }}
                    onClick={() => {
                      setSelectedVehicle(vehicle.id);
                      formik.setFieldValue('selectedVehicle', vehicle.id);
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Radio
                          value={vehicle.id}
                          size="small"
                          sx={{
                            color:
                              selectedVehicle === vehicle.id
                                ? varAlpha(theme.vars.palette.primary.mainChannel, 0.04)
                                : 'default',
                            '&.Mui-checked': {
                              color: 'success.main',
                            },
                          }}
                        />
                        <Box display="flex" gap={2}>
                          <Typography variant="body1" fontWeight="600">
                            {vehicle?.registrationNo}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {vehicle?.makeModel}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Type : {vehicle?.type} | Seats : {vehicle?.seatingCapacity}
                          </Typography>
                        </Box>
                      </Box>

                      <Label variant="soft" color={getStatusColor(vehicle?.status) as any}>
                        {vehicle?.status}
                      </Label>
                    </Box>
                  </Card>
                ))}
              </Scrollbar>
            </RadioGroup>

            {filteredVehicles?.length === 0 && (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                {searchQuery
                  ? 'No active vehicles found matching your search criteria'
                  : 'No active vehicles available'}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogScrollContent>

      {/* Sticky Action Buttons */}
      <DialogActions
        sx={{
          bottom: 0,
        }}
      >
        <Button
          variant="outlined"
          onClick={() => onClose(null, false)}
          size="small"
          startIcon={<Iconify icon="material-symbols:close" />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={(e: any) => formik.handleSubmit(e)}
          disabled={!selectedVehicle}
          size="small"
          startIcon={<Iconify icon="material-symbols:check" />}
        >
          Change Vehicle
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ChangeVehicleForm;
