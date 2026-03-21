import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Button, TextField, Autocomplete, DialogActions } from '@mui/material';

import { getStudentRoomAssignInitialValues } from './initialValues';
import { studentRoomAssignValidationSchema } from './validationSchema';

import type { IStudentRoomAssignProps } from '../type';

const StudentRoomAssign: React.FC<IStudentRoomAssignProps> = ({
  open,
  onClose,
  selectedStudent,
}) => {
  const formik = useFormik({
    initialValues: getStudentRoomAssignInitialValues(selectedStudent),
    validationSchema: studentRoomAssignValidationSchema,
    onSubmit: (values) => {
      // handle submit logic
    },
  });
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.roomType && formik.errors.roomType) || false}
                >
                  <Autocomplete
                    options={[
                      { id: '1', name: 'Single Room' },
                      { id: '2', name: 'Double Room' },
                      { id: '3', name: 'Triple Room' },
                    ]}
                    getOptionLabel={(option) => option.name || ''}
                    onChange={(_, value) => {
                      formik.setFieldValue('roomType', value?.name || '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Room Type"
                        name="roomType"
                        variant="outlined"
                        fullWidth
                        size="small"
                        error={!!(formik.touched.roomType && formik.errors.roomType) || false}
                        helperText={
                          formik.touched.roomType && formik.errors.roomType
                            ? formik.errors.roomType
                            : ''
                        }
                      />
                    )}
                    sx={{ maxWidth: '200px', width: '100%' }}
                  />{' '}
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.roomName && formik.errors.roomName) || false}
                >
                  <Autocomplete
                    options={[
                      { id: '1', name: 'Room 101' },
                      { id: '2', name: 'Room 102' },
                      { id: '3', name: 'Room 103' },
                      { id: '4', name: 'Room 201' },
                      { id: '5', name: 'Room 202' },
                    ]}
                    getOptionLabel={(option) => option.name || ''}
                    onChange={(_, value) => {
                      formik.setFieldValue('roomName', value?.name || '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Room Name"
                        name="roomName"
                        variant="outlined"
                        fullWidth
                        size="small"
                        error={!!(formik.touched.roomName && formik.errors.roomName) || false}
                        helperText={
                          formik.touched.roomName && formik.errors.roomName
                            ? formik.errors.roomName
                            : ''
                        }
                      />
                    )}
                    sx={{ maxWidth: '200px', width: '100%' }}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.bedNumber && formik.errors.bedNumber) || false}
                >
                  <Autocomplete
                    options={[
                      { id: 'B1', name: 'Bed 1' },
                      { id: 'B2', name: 'Bed 2' },
                      { id: 'B3', name: 'Bed 3' },
                      { id: 'B4', name: 'Bed 4' },
                    ]}
                    getOptionLabel={(option) => option.name || ''}
                    onChange={(_, value) => {
                      formik.setFieldValue('bedNumber', value?.name || '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Bed Number"
                        name="bedNumber"
                        variant="outlined"
                        fullWidth
                        size="small"
                        error={!!(formik.touched.bedNumber && formik.errors.bedNumber) || false}
                        helperText={
                          formik.touched.bedNumber && formik.errors.bedNumber
                            ? formik.errors.bedNumber
                            : ''
                        }
                      />
                    )}
                    sx={{ maxWidth: '200px', width: '100%' }}
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
          </Scrollbar>

          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => {
                onClose(null, false);
              }}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Iconify icon={GlobalIcons.submit} />}
            >
              Reassign
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default StudentRoomAssign;
