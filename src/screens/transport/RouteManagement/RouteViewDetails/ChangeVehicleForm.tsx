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
  const [availableVehicles] = useState<any>(vehicleManagementData?.availableVehiclesData);
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
            <Card
              sx={{
                p: 0,
                borderRadius: 2,
                boxShadow: theme.customShadows?.z1 || '0px 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: 4,
                  bgcolor: 'info.main',
                }}
              />
              <Box sx={{ p: 3, pl: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                  <Label
                    color="info"
                    variant="soft"
                    sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}
                  >
                    Current Assignment
                  </Label>
                </Box>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box
                        sx={{
                          mt: 0.5,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: varAlpha(theme.vars.palette.info.mainChannel, 0.08),
                          color: 'info.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 40,
                          height: 40,
                        }}
                      >
                        <Iconify icon="eva:pricetags-outline" width={24} />
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mb: 0.5, fontWeight: 600 }}
                        >
                          REGISTRATION NO.
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {currentVehicle.registrationNo}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box
                        sx={{
                          mt: 0.5,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: varAlpha(theme.vars.palette.warning.mainChannel, 0.08),
                          color: 'warning.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 40,
                          height: 40,
                        }}
                      >
                        <Iconify icon="mdi:steering" width={24} />
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mb: 0.5, fontWeight: 600 }}
                        >
                          MAKE & MODEL
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {currentVehicle.makeModel}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box
                        sx={{
                          mt: 0.5,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: varAlpha(theme.vars.palette.secondary.mainChannel, 0.08),
                          color: 'secondary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 40,
                          height: 40,
                        }}
                      >
                        <Iconify icon="mdi:bus-side" width={24} />
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mb: 0.5, fontWeight: 600 }}
                        >
                          VEHICLE TYPE
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {currentVehicle.vehicleType}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box
                        sx={{
                          mt: 0.5,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: varAlpha(theme.vars.palette.success.mainChannel, 0.08),
                          color: 'success.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 40,
                          height: 40,
                        }}
                      >
                        <Iconify icon="mdi:seat-passenger" width={24} />
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mb: 0.5, fontWeight: 600 }}
                        >
                          CAPACITY
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {currentVehicle.seatingCapacity} Seats
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          </Box>

          <Grid size={{ xs: 12 }} sx={{ mb: 4 }}>
            <ShakingTextField error={!!(formik.touched.reason && formik.errors.reason)}>
              <TextField
                fullWidth
                label="Reason for Change"
                name="reason"
                variant="outlined"
                multiline
                rows={3}
                value={formik.values.reason}
                onChange={(e) => {
                  formik.setFieldValue('reason', e.target.value);
                  formik.setFieldTouched('reason', true);
                }}
                error={formik.touched.reason && Boolean(formik.errors.reason)}
                helperText={formik.touched.reason && formik.errors.reason}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                  },
                }}
              />
            </ShakingTextField>
          </Grid>

          {/* Select New Vehicle Section */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700 }}>
              Select New Vehicle
            </Typography>

            {/* Search Field */}
            <Box sx={{ mb: 2.5 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search by registration number, model, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', mr: 1 }} />
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.neutral',
                    '& fieldset': { border: 'none' },
                    '&:hover fieldset': { border: 'none' },
                    '&.Mui-focused fieldset': { border: '1px solid', borderColor: 'primary.main' },
                  },
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
              <Scrollbar sx={{ maxHeight: 320, pr: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {filteredVehicles?.map((vehicle: any) => {
                    const isSelected = selectedVehicle === vehicle.id;
                    return (
                      <Card
                        key={vehicle.id}
                        elevation={0}
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          backgroundColor: isSelected
                            ? varAlpha(theme.vars.palette.primary.mainChannel, 0.04)
                            : 'background.paper',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            borderColor: isSelected ? 'primary.main' : 'text.disabled',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
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
                              checked={isSelected}
                              sx={{
                                p: 0.5,
                                color: 'text.disabled',
                                '&.Mui-checked': {
                                  color: 'primary.main',
                                },
                              }}
                            />
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {vehicle?.registrationNo}
                                </Typography>
                                <Box
                                  sx={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: '50%',
                                    bgcolor: 'text.disabled',
                                  }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                  {vehicle?.makeModel}
                                </Typography>
                              </Box>
                              <Typography
                                variant="caption"
                                color="text.disabled"
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                              >
                                <Iconify icon="mdi:bus-side" width={14} />
                                {vehicle?.type}
                                <Box component="span" sx={{ mx: 0.5 }}>
                                  •
                                </Box>
                                <Iconify icon="mdi:seat" width={14} />
                                {vehicle?.seatingCapacity} Seats
                              </Typography>
                            </Box>
                          </Box>

                          <Label
                            variant="soft"
                            color={getStatusColor(vehicle?.status) as any}
                            sx={{ textTransform: 'uppercase', height: 24, px: 1, fontWeight: 700 }}
                          >
                            {vehicle?.status}
                          </Label>
                        </Box>
                      </Card>
                    );
                  })}
                </Box>
              </Scrollbar>
            </RadioGroup>

            {filteredVehicles?.length === 0 && (
              <Box
                sx={{
                  py: 6,
                  textAlign: 'center',
                  bgcolor: 'background.neutral',
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'divider',
                }}
              >
                <Iconify
                  icon="eva:car-outline"
                  width={48}
                  sx={{ color: 'text.disabled', mb: 2, opacity: 0.5 }}
                />
                <Typography variant="subtitle2" color="text.secondary">
                  {searchQuery
                    ? 'No vehicles found matching your search'
                    : 'No active vehicles available'}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogScrollContent>

      {/* Sticky Action Buttons */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => onClose(null, false)}
          startIcon={<Iconify icon="eva:close-fill" />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={(e: any) => formik.handleSubmit(e)}
          disabled={!selectedVehicle}
          startIcon={<Iconify icon="eva:checkmark-fill" />}
          sx={{ px: 3 }}
        >
          Confirm Change
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ChangeVehicleForm;
