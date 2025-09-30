'use client';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { DialogScrollContent } from 'src/components/customDialog';
import { Box, Grid, Button, Tooltip, Typography, IconButton, DialogActions } from '@mui/material';

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
          <Grid size={{ xs: 4 }}>
            <Typography color="text.secondary">Concession Name</Typography>
            <Typography sx={{ fontWeight: 300 }} variant="body2">
              {student?.concession?.concessionName}
            </Typography>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Typography color="text.secondary">Concession Type</Typography>
            <Typography sx={{ fontWeight: 300 }} variant="body2">
              {student?.concession?.concessionType}
            </Typography>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Typography color="text.secondary">Student Name </Typography>
            <Typography sx={{ fontWeight: 300 }} variant="body2">
              {student?.studentName}
            </Typography>
          </Grid>

          <Grid size={{ xs: 4 }}>
            <Typography color="text.secondary">Roll No. </Typography>
            <Typography sx={{ fontWeight: 300 }} variant="body2">
              {student?.rollNo}
            </Typography>
          </Grid>

          <Grid size={{ xs: 4 }}>
            <Typography color="text.secondary">Contact No. </Typography>
            <Typography sx={{ fontWeight: 300 }} variant="body2">
              {student?.contactNo}
            </Typography>
          </Grid>

          <Grid size={{ xs: 4 }}>
            <Typography color="text.secondary">Class/Division </Typography>
            <Typography sx={{ fontWeight: 300 }} variant="body2">
              {student?.classDivision}
            </Typography>
          </Grid>

          <Grid size={{ xs: 4 }}>
            <Typography color="text.secondary">GR No. </Typography>
            <Typography sx={{ fontWeight: 300 }} variant="body2">
              {student?.grNo}
            </Typography>
          </Grid>

          <Grid size={{ xs: 4 }}>
            <Typography color="text.secondary">Parent Name </Typography>
            <Typography sx={{ fontWeight: 300 }} variant="body2">
              {student?.parentName}
            </Typography>
          </Grid>

          {student?.concession?.concessionType === 'percentage' &&
          student?.concession?.percentage !== undefined ? (
            <Grid size={{ xs: 4 }}>
              <Typography color="text.secondary">Percentage</Typography>
              <Typography sx={{ fontWeight: 300 }} variant="body2">
                {student.concession.percentage}%
              </Typography>
            </Grid>
          ) : (
            <Grid size={{ xs: 4 }}>
              <Typography color="text.secondary">Amount</Typography>
              <Typography sx={{ fontWeight: 300 }} variant="body2">
                {student.concession?.amount}
              </Typography>
            </Grid>
          )}
          <Grid size={{ xs: 4 }}>
            <Typography color="text.secondary">Email </Typography>
            <Typography sx={{ fontWeight: 300 }} variant="body2">
              {student?.email}
            </Typography>
          </Grid>
          <Grid size={{ xs: 8 }}>
            <Typography color="text.secondary">Applicable Fee Heads </Typography>
            <Typography sx={{ fontWeight: 300 }} variant="body2">
              {' '}
              {Array.isArray(student.applicableFeeHeads)
                ? student.applicableFeeHeads.join(', ')
                : student.applicableFeeHeads || '-'}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* 🔹 Documents Table (using your CustomizableTable) */}
      <CustomizableTable
        tableId="concession-documents"
        noDataText={<>No document data available.</>}
        columns={[
          { id: 'name', label: 'Name', align: 'left' },
          { id: 'type', label: 'Type', align: 'left' },
          {
            id: 'status',
            label: 'Status',
            minWidth: '80px',
            align: 'left',
            isFilter: false,
            render(value, row) {
              return (
                <Tooltip title={row.status}>
                  <Iconify
                    icon={row.status === 'Uploaded' ? 'mdi:approve' : 'mage:file-cross-fill'}
                    height={20}
                    width={20}
                    sx={{
                      color: (theme) =>
                        row.status === 'Uploaded' ? 'success.main' : theme.vars.palette.grey[500],
                      cursor: 'pointer',
                    }}
                  />
                </Tooltip>
              );
            },
          },
          {
            id: 'upload',
            label: 'Upload',
            isFilter: false,

            minWidth: '80px',
            align: 'left',
            isSort: false,
            render(value, row) {
              return (
                <IconButton
                  component="label"
                  disabled
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.2s ease',
                    '&:hover': { backgroundColor: '#e0e0e0' },
                    p: 0,
                    minWidth: 0,
                  }}
                >
                  <input
                    hidden
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Handle file upload logic here
                        console.log('File uploaded:', file);
                      }
                    }}
                  />
                  <Iconify icon="ci:file-upload" />
                </IconButton>
              );
            },
          },
          {
            id: 'view',
            label: 'View',
            isFilter: false,
            isSort: false,
            minWidth: '6vw',
            align: 'left',
            render(value, row) {
              return (
                <IconButton
                  style={{
                    textAlign: 'left',
                    marginLeft: '0px',
                    justifyContent: 'flex-start',
                    display: 'flex',
                  }}
                  disabled={row.status !== 'Uploaded'}
                  onClick={() => {
                    if (row.file) {
                      window.open(URL.createObjectURL(row.file), '_blank');
                    }
                  }}
                >
                  <Iconify icon="carbon:view-filled" />
                </IconButton>
              );
            },
          },
          {
            id: 'download',
            label: 'Download',
            isFilter: false,
            isSort: false,
            minWidth: '6vw',
            align: 'left',
            render(value, row) {
              return (
                <IconButton
                  style={{
                    textAlign: 'left',
                    marginLeft: '0px',
                    justifyContent: 'flex-start',
                    display: 'flex',
                  }}
                  disabled={row.status !== 'Uploaded'}
                  onClick={() => {
                    if (row.file) {
                      const url = URL.createObjectURL(row.file);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = row.name;
                      link.click();
                    }
                  }}
                >
                  <Iconify icon={GlobalIcons.download} />
                </IconButton>
              );
            },
          },
        ]}
        data={documents || []}
      />
    </DialogScrollContent>
    <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, width: '100%' }}>
        <Button
          variant="contained"
          color="error"
          onClick={onReject}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Reject
        </Button>

        <Button
          variant="contained"
          color="success"
          onClick={onApprove}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.tick} />}
        >
          Approve
        </Button>
      </Box>
    </DialogActions>
  </>
);

export default ViewConcessionRequest;
