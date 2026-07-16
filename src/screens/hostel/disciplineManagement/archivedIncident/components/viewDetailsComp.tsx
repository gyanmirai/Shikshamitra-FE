'use client';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CustomSelect from 'src/components/custom-select';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Button,
  Checkbox,
  TextField,
  Typography,
  FormControl,
  Autocomplete,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { getTakeActionInitialValues } from '../../logDisciplinaryIncident/components/takeActionInitialValues';

import type { ITakeActionFormProps } from '../../logDisciplinaryIncident/type';

const ViewDetailsComp: React.FC<ITakeActionFormProps> = ({ open, onClose, editData }) => {
  // Initialize formik form handling with validation and submission logic
  const formik = useFormik({
    initialValues: getTakeActionInitialValues(editData),
    // Handle form submission
    onSubmit: (values, formikHelpers) => {},
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit}>
        <Box display="flex" flexDirection="column" gap={1}>
          <Scrollbar sx={{ p: 2, maxHeight: '70vh', overflowY: 'auto' }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomSelect
                  size="small"
                  label="Hostel Name"
                  name="hostelName"
                  fullWidth
                  disabled
                  value={formik.values.hostelName}
                  onChange={(val) => formik.setFieldValue('hostelName', val)}
                  options={[]}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <Autocomplete
                    multiple
                    id="students-select"
                    disabled
                    options={[
                      { label: 'Student 1', value: 'STU001' },
                      { label: 'Student 2', value: 'STU002' },
                      { label: 'Student 3', value: 'STU003' },
                      { label: 'Student 4', value: 'STU004' },
                      { label: 'Student 5', value: 'STU005' },
                      { label: 'Student 6', value: 'STU006' },
                      { label: 'Student 7', value: 'STU007' },
                      { label: 'Student 8', value: 'STU008' },
                      { label: 'Student 9', value: 'STU009' },
                      { label: 'Student 10', value: 'STU010' },
                    ]}
                    disableCloseOnSelect
                    getOptionLabel={(option) => option.label}
                    renderOption={(props, option, { selected }) => {
                      const { key, ...optionProps } = props;
                      return (
                        <li key={key} {...optionProps}>
                          <Checkbox
                            icon={<CheckBoxOutlineBlankIcon />}
                            checkedIcon={<CheckBoxIcon />}
                            style={{ marginRight: 8 }}
                            checked={selected}
                          />
                          {option.value}
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Students"
                        placeholder="Select students"
                        size="small"
                      />
                    )}
                  />
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Incident Date"
                  format="DD-MM-YYYY"
                  disabled
                  value={formik.values.incidentDate}
                  onChange={(val) => formik.setFieldValue('incidentDate', val)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TimePicker
                  label="Incident Time"
                  format="HH:mm"
                  disabled
                  value={formik.values.incidentTime}
                  onChange={(val) => formik.setFieldValue('incidentTime', val)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CustomSelect
                  size="small"
                  label="Incident Type"
                  name="incidentType"
                  fullWidth
                  disabled
                  value={formik.values.incidentType}
                  onChange={(val) => formik.setFieldValue('incidentType', val)}
                  options={[]}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Editor
                  value={formik.values.description}
                  onChange={(value) => formik.setFieldValue('description', value)}
                  editable={false}
                  placeholder="Incident Description"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <UploadBox
                  onDrop={() => {}}
                  disabled={!formik.values.actionName}
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
                      <Typography variant="body2">Drag Attachment</Typography>
                    </Box>
                  }
                  sx={{ py: 2.5, width: '100%', height: 'auto', borderRadius: 1.5 }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="h6">Taken Action</Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box display="flex" flexDirection="row" gap={1}>
                  {['Warning', 'Parent Meeting', 'Fine', 'Suspension', 'Community Service'].map(
                    (label) => (
                      <FormControlLabel
                        key={label}
                        control={
                          <Checkbox
                            checked={formik.values.actionName === label}
                            onChange={() => formik.setFieldValue('actionName', label)}
                            disabled
                          />
                        }
                        label={label}
                      />
                    )
                  )}
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Editor
                  value={formik.values.note}
                  onChange={(value) => formik.setFieldValue('note', value)}
                  editable={false}
                  placeholder="Notes"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box display="flex" flexDirection="row" gap={1}>
                  {['Student', 'Parent', 'Warden'].map((label) => (
                    <FormControlLabel
                      key={label}
                      control={
                        <Checkbox
                          checked={formik.values.notification === label}
                          onChange={() => formik.setFieldValue('notification', label)}
                          disabled
                        />
                      }
                      label={label}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Scrollbar>

          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={onClose}
              variant="outlined"
            >
              Cancel
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default ViewDetailsComp;
