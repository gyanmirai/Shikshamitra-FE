import { useFormik } from 'formik';
import React, { useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import capitalizeWords from 'src/utils/capitalizeText';
import CustomDialog from 'src/components/custom-dialog';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import {
  Box,
  Grid,
  Radio,
  Switch,
  TextField,
  Typography,
  RadioGroup,
  FormControl,
  Autocomplete,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import {
  availableGrades,
  pickupPointsList,
  assignedRoutesList,
} from '../data/assigned-route-dialog-data';

import type {
  IFormikValue,
  ITransportRouteAssignedDialogProps,
} from '../member-transport-interface';

// Props Interface

// Main Component
const TransportRouteAssignedDialog: React.FC<ITransportRouteAssignedDialogProps> = ({
  dialogValue,
  data,
  onSave,
  onClose,
  isEdit,
  allData,
  isStaff,
  clickFromTable,
}) => {
  const [showExistingEntryMessage] = useState<boolean>(false);
  const [userType, setUserType] = useState<string>('student');
  const [dropoffPoint, setDifferentDropOffPoint] = useState<boolean>(false);

  // Formik Setup
  const formik = useFormik<IFormikValue>({
    initialValues: {
      id: isEdit ? data.id : Math.random(),
      name: isEdit ? (data.name ?? '') : '',
      grade: isEdit ? (data.grade ?? '') : '',
      assignedRoute: isEdit ? (data.assignedRoute ?? '') : '',
      pickupPoint: isEdit ? (data.pickupPoint ?? '') : '',
      dropoffPoint: isEdit ? (data.dropoffPoint ?? '') : '',
      differentDropOffPoint: false,
      others: '',
      messageSentToStudent: '',
    },
    onSubmit: (values) => {
      onSave(values);
    },
  });

  // Handlers
  const handleGradeChange = (e: any) => {
    formik.setFieldValue('grade', e);
    formik.setFieldValue('name', '');
  };

  // const selectedGradeObj = availableGrades.find((g) => g.grade === formik.values.grade);

  return (
    <CustomDialog maxWidth="md" title="Assigned Route" open={dialogValue} handleClose={onClose}>
      <Box>
        {showExistingEntryMessage && (
          <Typography component="span" fontSize="14" color="red">
            This Entry Already Exists
          </Typography>
        )}
      </Box>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 3, height: '450px' }}>
        <Box display="flex" alignItems="center">
          {!clickFromTable && (
            <FormControl>
              {/* <FormLabel id="user-type-label">Select User Type</FormLabel> */}
              <RadioGroup
                row
                aria-labelledby="user-type-label"
                name="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
              >
                <FormControlLabel value="staff" control={<Radio />} label="Employee" />
                <FormControlLabel value="student" control={<Radio />} label="Student" />
              </RadioGroup>
            </FormControl>
          )}
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={dropoffPoint}
                onChange={() => {
                  setDifferentDropOffPoint(!dropoffPoint);
                }}
              />
            }
            label="Different Dropoff Point"
          />
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2} sx={{ mt: '5px' }}>
            {/* Row 1 */}
            {userType === 'student' && isStaff === false && (
              <Grid size={6}>
                <CustomSelect
                  disabled={isEdit}
                  label="Standard"
                  options={availableGrades.map((g) => ({ label: g.grade, value: g.grade }))}
                  value={formik.values.grade}
                  onChange={handleGradeChange}
                  formControlProps={{ fullWidth: true }}
                />
              </Grid>
            )}
            {userType === 'student' && isStaff === false && (
              <Grid size={6}>
                <CustomSelect
                  disabled={isEdit}
                  label="Division"
                  options={availableGrades.map((g) => ({ label: g.grade, value: g.grade }))}
                  value={formik.values.grade}
                  onChange={handleGradeChange}
                  formControlProps={{ fullWidth: true }}
                />
              </Grid>
            )}

            {/* Row 2 */}
            {(userType === 'staff' || isStaff) && (
              <Grid size={6}>
                <Autocomplete
                  loading={false}
                  noOptionsText="No Employee Found"
                  fullWidth
                  options={[]}
                  getOptionLabel={(option: any) => option?.firstName || ''}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Employee Number"
                      placeholder="Search Employee Number"
                      fullWidth
                    />
                  )}
                  renderOption={(prop: any, option: any) => (
                    <li {...prop} key={option.id}>
                      {option.firstName}
                    </li>
                  )}
                />
              </Grid>
            )}
            {userType === 'student' && isStaff === false && (
              <Grid size={6}>
                <Autocomplete
                  loading={false}
                  noOptionsText="No Student Found"
                  fullWidth
                  options={[]}
                  getOptionLabel={(option: any) => option?.firstName || ''}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Gr Number"
                      placeholder="Search Gr Number"
                      fullWidth
                    />
                  )}
                  renderOption={(prop: any, option: any) => (
                    <li {...prop} key={option.id}>
                      {option.firstName}
                    </li>
                  )}
                />
              </Grid>
            )}

            {/* <Grid size={{ xs: 12, md: 6 }}>
                <TextField
  
                  name="Preferable Route"
                  label="Preferable Route"
                  value=''
                  onChange={() => { }}
                  size="small"
                  fullWidth
                />
  
              </Grid> */}

            {/* Row 3 */}

            {!dropoffPoint && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name="Prefrable Pickup/Dropoff Point"
                  label="Prefrable Pickup/Dropoff Point"
                  value=""
                  onChange={() => {}}
                  size="small"
                  fullWidth
                />
              </Grid>
            )}

            {dropoffPoint && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name="Prefrable Pickup Point"
                  label="Prefrable Pickup Point"
                  value=""
                  onChange={() => {}}
                  size="small"
                  fullWidth
                />
              </Grid>
            )}
            {dropoffPoint && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name="Prefrable Dropoff Point"
                  label="Prefrable Dropoff Point"
                  value=""
                  onChange={() => {}}
                  size="small"
                  fullWidth
                />
              </Grid>
            )}
            {dropoffPoint && (
              <Grid size={6}>
                <CustomSelect
                  label="Assigned Pickup"
                  options={pickupPointsList}
                  value={formik.values.pickupPoint}
                  onChange={(e) => formik.setFieldValue('pickupPoint', e)}
                  formControlProps={{ fullWidth: true }}
                />
              </Grid>
            )}
            {dropoffPoint && (
              <Grid size={6}>
                <CustomSelect
                  label="Assigned DropOff"
                  options={pickupPointsList}
                  value={formik.values.pickupPoint}
                  onChange={(e) => formik.setFieldValue('pickupPoint', e)}
                  formControlProps={{ fullWidth: true }}
                />
              </Grid>
            )}
            {!dropoffPoint && (
              <Grid size={6}>
                <CustomSelect
                  label="Assigned Pickup/Dropoff Point"
                  options={pickupPointsList}
                  value={formik.values.pickupPoint}
                  onChange={(e) => formik.setFieldValue('pickupPoint', e)}
                  formControlProps={{ fullWidth: true }}
                />
              </Grid>
            )}

            <Grid size={6}>
              <CustomSelect
                label="Assigned Route"
                options={assignedRoutesList}
                value={formik.values.assignedRoute}
                onChange={(e: any) => formik.setFieldValue('assignedRoute', e)}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>

            <Grid size={6}>
              <CustomSelect
                label="Select Vehicle"
                options={assignedRoutesList}
                value={formik.values.assignedRoute}
                onChange={(e: any) => formik.setFieldValue('assignedRoute', e)}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <CustomSelect
                label="Select Reason"
                options={[
                  { name: 'Route Not in Service', key: 'route_not_in_service' },
                  { name: 'Vehicle at Full Capacity', key: 'vehicle_full_capacity' },
                  { name: 'Stop Not in Service', key: 'stop_not_in_service' },
                ]}
                value=""
                labelKey="name"
                valueKey="key"
                onChange={(val) => {}}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                multiline
                rows={3}
                name="notes"
                label="Others"
                value={formik.values.others}
                onChange={(e) => {
                  formik.setFieldValue('others', capitalizeWords(e.target.value));
                }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid size={12}>
              <TextField
                multiline
                rows={3}
                name="notified message"
                label="Message Sent to Student"
                value={formik.values.messageSentToStudent}
                onChange={(e) => {
                  formik.setFieldValue('messageSentToStudent', capitalizeWords(e.target.value));
                }}
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>
        </form>
      </Scrollbar>
      <DialogActions>
        <SubmitButton onClick={() => {}} />
      </DialogActions>
    </CustomDialog>
  );
};

export default TransportRouteAssignedDialog;
