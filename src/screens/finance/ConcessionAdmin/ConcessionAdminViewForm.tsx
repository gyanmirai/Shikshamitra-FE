'use client';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Grid,
  Button,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  DialogActions,
} from '@mui/material';

import type { IViewConcessionRequestProps } from './type';

const ViewConcessionRequest: React.FC<IViewConcessionRequestProps> = ({
  student,
  documents,
  onApprove,
  onReject,
  onMismatch,
  onClose,
}) => (
  <>
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

      {/* 🔹 Concession Type */}
      <TextField
        select
        fullWidth
        label="Concession Type"
        size="small"
        disabled
        value="Sibling Discount"
        sx={{ mb: 2 }}
      >
        <MenuItem value="Sibling Discount">Sibling Discount</MenuItem>
        <MenuItem value="Full">Full Concession</MenuItem>
        <MenuItem value="Partial">Partial Concession</MenuItem>
        <MenuItem value="Scholarship">Scholarship</MenuItem>
      </TextField>

      {/* 🔹 Documents Table (using your CustomizableTable) */}
      <CustomizableTable
        tableId="concession-documents"
        columns={[
          { id: 'name', label: 'Name', align: 'left' },
          { id: 'type', label: 'Type', align: 'left' },
          {
            id: 'status',
            label: 'Status',
            align: 'left',
            render: (_value, row) => (
              <Typography sx={{ color: row.status === 'Uploaded' ? 'success.main' : 'grey.500' }}>
                {row.status}
              </Typography>
            ),
          },
          {
            id: 'upload',
            label: 'Upload',
            align: 'left',
            render: (value, row) => (
              <IconButton component="label">
                <input hidden type="file" />
                <Iconify icon="ci:file-upload" />
              </IconButton>
            ),
          },
          {
            id: 'view',
            label: 'View',
            align: 'left',
            render: (value, row) =>
              row.file && (
                <IconButton onClick={() => window.open(URL.createObjectURL(row.file), '_blank')}>
                  <Iconify icon="carbon:view-filled" />
                </IconButton>
              ),
          },
          {
            id: 'download',
            label: 'Download',
            align: 'left',
            render: (value, row) =>
              row.file && (
                <IconButton
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
        data={documents || []}
      />
    </DialogScrollContent>
    <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 4 }}>
          <Button variant="outlined" color="warning" onClick={onMismatch} size="small">
            Document Mismatch
          </Button>
        </Grid>

        <Grid size={{ xs: 6, md: 4 }}>
          <Button
            variant="contained"
            color="error"
            onClick={onReject}
            size="small"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Reject
          </Button>
        </Grid>

        <Grid size={{ xs: 6, md: 4 }}>
          <Button
            variant="contained"
            color="success"
            onClick={onApprove}
            size="small"
            startIcon={<Iconify icon={GlobalIcons.submit} />}
          >
            Approve
          </Button>
        </Grid>
      </Grid>
    </DialogActions>
  </>
);

export default ViewConcessionRequest;
