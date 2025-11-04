import { useFormik } from 'formik';
import React, { useState } from 'react';
import { Search } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetAvailableVehiclesQuery } from 'src/redux/transport/vehicle-management/route-management-api';
import {
  Box,
  Card,
  Chip,
  Radio,
  Button,
  TextField,
  Typography,
  RadioGroup,
  DialogActions,
  InputAdornment,
} from '@mui/material';

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
  const { data: availableVehicles } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAvailableVehiclesQuery,
  });

  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const formik = useFormik({
    initialValues: {
      selectedVehicle: '',
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
            <Typography variant="h6" gutterBottom color="primary.main">
              Current Vehicle
            </Typography>

            <Card sx={{ p: 2, backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Registration No.
                  </Typography>
                  <Typography variant="body1" fontWeight="500" gutterBottom>
                    {currentVehicle.registrationNo}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                    Make & Model
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {currentVehicle.makeModel}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Vehicle Type
                  </Typography>
                  <Typography variant="body1" fontWeight="500" gutterBottom>
                    {currentVehicle.vehicleType}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                    Seating Capacity
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {currentVehicle.seatingCapacity}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>

          {/* Select New Vehicle Section */}
          <Box>
            <Typography variant="h6" gutterBottom color="primary.main">
              Select New Vehicle
            </Typography>

            {/* Search Field */}
            <Box sx={{ mb: 3 }}>
              <TextField
                placeholder="Search by reg no or..."
                size="small"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
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
              {filteredVehicles?.map((vehicle: any) => (
                <Card
                  key={vehicle.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    border:
                      selectedVehicle === vehicle.id ? '2px solid #4caf50' : '1px solid #e0e0e0',
                    backgroundColor: selectedVehicle === vehicle.id ? '#f1f8e9' : 'white',
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
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Radio
                        value={vehicle.id}
                        size="small"
                        sx={{
                          color: selectedVehicle === vehicle.id ? '#4caf50' : 'default',
                          '&.Mui-checked': {
                            color: '#4caf50',
                          },
                        }}
                      />
                      <Box>
                        <Typography variant="body1" fontWeight="600" gutterBottom>
                          {vehicle?.registrationNo}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {vehicle?.makeModel}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Type: {vehicle?.type} | Seats: {vehicle?.seatingCapacity}
                        </Typography>
                      </Box>
                    </Box>

                    <Chip
                      label={vehicle?.status}
                      size="small"
                      color={getStatusColor(vehicle?.status) as any}
                      variant="outlined"
                    />
                  </Box>
                </Card>
              ))}
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
          borderTop: '1px solid #e0e0e0',
          backgroundColor: 'white',
          position: 'sticky',
          bottom: 0,

          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
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
