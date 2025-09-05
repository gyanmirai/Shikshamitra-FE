'use client';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { DialogScrollContent } from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Button,
  Tooltip,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  DialogActions,
} from '@mui/material';

import type { IConcessionDocument, IConcessionFormProps, IConcessionFormValues } from '../type';

// 🔹 Validation Schema
const concessionValidation = Yup.object().shape({
  concessionType: Yup.string().required('Concession type is required'),
  reason: Yup.string().required('Reason is required'),
});

// 🔹 Mapping concession type → required documents
const concessionDocumentsMap: Record<string, IConcessionDocument[]> = {
  Full: [
    { id: 1, name: 'Adhar Card', acceptedFormat: 'jpeg, png', status: 'Pending' },
    { id: 2, name: 'Income Certificate', acceptedFormat: 'PDF', status: 'Pending' },
  ],
  Partial: [
    { id: 1, name: 'Adhar Card', acceptedFormat: 'jpeg, png', status: 'Pending' },
    { id: 2, name: 'Father Pan Card', acceptedFormat: 'jpeg, png', status: 'Pending' },
  ],
  Scholarship: [
    { id: 1, name: 'Adhar Card', acceptedFormat: 'jpeg, png', status: 'Pending' },
    { id: 2, name: 'Income Certificate', acceptedFormat: 'PDF', status: 'Pending' },
    { id: 3, name: 'Caste Certificate', acceptedFormat: 'jpeg, png, pdf', status: 'Pending' },
  ],
};

const ConcessionRequestForm: React.FC<IConcessionFormProps> = ({
  open,
  onClose,
  student,
  editData,
}) => {
  const formik = useFormik<IConcessionFormValues>({
    initialValues: editData || {
      studentName: '',
      concessionType: '',
      reason: '',
      documents: [],
    },
    validationSchema: concessionValidation,
    onSubmit: (values) => {
      shikshaMitraToast.success({ message: 'Concession request submitted successfully' });
      onClose(values, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Typography>
                <b>Student Name :</b> {student?.studentName}
              </Typography>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography>
                <b>Roll No. :</b> {student?.rollNo}
              </Typography>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography>
                <b>Sibling :</b> {student?.sibling}
              </Typography>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography>
                <b>Contact No. :</b> {student?.contactNo}
              </Typography>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography>
                <b>Class/Division :</b> {student?.classDivision}
              </Typography>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography>
                <b>GR No. :</b> {student?.grNo}
              </Typography>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography>
                <b>Parent Name :</b> {student?.parentName}
              </Typography>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography>
                <b>Email :</b> {student?.email}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <TextField
          select
          fullWidth
          label="Concession Type *"
          name="concessionType"
          size="small"
          value={formik.values.concessionType}
          onChange={(e) => {
            const selected = e.target.value;
            formik.setFieldValue('concessionType', selected);
            // load docs based on type
            formik.setFieldValue('documents', concessionDocumentsMap[selected] || []);
          }}
          error={formik.touched.concessionType && Boolean(formik.errors.concessionType)}
          helperText={formik.touched.concessionType && formik.errors.concessionType}
          sx={{ mb: 2 }}
        >
          <MenuItem value="Full">Full Concession</MenuItem>
          <MenuItem value="Partial">Partial Concession</MenuItem>
          <MenuItem value="Scholarship">Scholarship</MenuItem>
        </TextField>

        <TextField
          fullWidth
          label="Reason of Concession Request *"
          name="reason"
          size="small"
          multiline
          rows={3}
          value={formik.values.reason}
          onChange={formik.handleChange}
          error={formik.touched.reason && Boolean(formik.errors.reason)}
          helperText={formik.touched.reason && formik.errors.reason}
          sx={{ mb: 2 }}
        />

        {formik.values.concessionType && (
          <CustomizableTable
            tableId="documents"
            columns={[
              { id: 'name', label: 'Name' },
              { id: 'acceptedFormat', label: 'Accepted Format', align: 'left' },
              {
                id: 'status',
                label: 'Status',
                isSort: false,
                align: 'left',
                isFilter: false,
                render: (value, row) => (
                  <Tooltip title={row.status}>
                    <Iconify
                      icon={row.status === 'Uploaded' ? 'mdi:approve' : 'mage:file-cross-fill'}
                      height={20}
                      width={20}
                      sx={{
                        color: (theme) =>
                          row.status === 'Uploaded' ? 'success.main' : theme.palette.grey[500],
                        cursor: 'pointer',
                      }}
                    />
                  </Tooltip>
                ),
              },
              {
                id: 'upload',
                label: 'Upload',
                isFilter: false,
                isSort: false,
                align: 'left',
                render: (value, row) => (
                  <IconButton
                    component="label"
                    sx={{
                      textAlign: 'left',
                      marginLeft: '0px',
                      padding: '0px',
                      justifyContent: 'flex-start',
                      display: 'flex',
                    }}
                  >
                    <input
                      type="file"
                      hidden
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0];
                        if (file) {
                          formik.setFieldValue(
                            'documents',
                            formik.values.documents.map((d) =>
                              d.id === row.id ? { ...d, file, status: 'Uploaded' } : d
                            )
                          );
                        }
                      }}
                    />
                    <Iconify icon="ci:file-upload" />
                  </IconButton>
                ),
              },
              {
                id: 'view',
                label: 'View',
                isFilter: false,
                align: 'left',
                isSort: false,
                render: (value, row) =>
                  row.file && (
                    <IconButton
                      style={{
                        textAlign: 'left',
                        marginLeft: '0px',
                        padding: '0px',
                        justifyContent: 'flex-start',
                        display: 'flex',
                      }}
                      onClick={() => window.open(URL.createObjectURL(row.file), '_blank')}
                    >
                      <Iconify icon="carbon:view-filled" />
                    </IconButton>
                  ),
              },
              {
                id: 'download',
                label: 'Download',
                isFilter: false,
                align: 'left',
                isSort: false,
                render: (value, row) =>
                  row.file && (
                    <IconButton
                      style={{
                        textAlign: 'left',
                        marginLeft: '0px',
                        padding: '0px',
                        justifyContent: 'flex-start',
                        display: 'flex',
                      }}
                      onClick={() => {
                        const url = URL.createObjectURL(row.file);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = row.name;
                        link.click();
                      }}
                    >
                      <Iconify icon="material-symbols:download" width={20} height={20} />
                    </IconButton>
                  ),
              },
            ]}
            data={formik.values.documents}
          />
        )}
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          onClick={() => onClose(null, false)}
          variant="outlined"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ConcessionRequestForm;
