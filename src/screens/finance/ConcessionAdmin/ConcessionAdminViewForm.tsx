'use client';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { formatNumber } from 'src/utils/formate_number';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Grid,
  Card,
  Button,
  Tooltip,
  IconButton,
  Typography,
  CardContent,
  DialogActions,
} from '@mui/material';

import StudentInformationAccordion from './StucentConcessionCard';

import type { IViewConcessionRequestProps } from './type';

const ViewConcessionRequest: React.FC<IViewConcessionRequestProps> = ({
  student,
  onApprove,
  onReject,
  onMismatch,
  onClose,
}) => {
  console.log('student-----', student);
  return (
    <Box display="flex" flexDirection="column" gap={2} height="100%">
      <Scrollbar sx={{ p: 2, height: '100%' }}>
        <StudentInformationAccordion student={student} />
        {student?.concessions && student.concessions.length > 0 && (
          <>
            {student?.concessions.map((c, i) => (
              <Grid key={i} size={{ xs: 12 }}>
                <Card sx={{ boxShadow: 3, borderRadius: 2, mb: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" color="#00A76F" gutterBottom>
                      {c.concessionType} Information
                    </Typography>

                    <Grid container spacing={2}>
                      {/* Fee Heads */}
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Applicable Fee Heads
                        </Typography>
                        <Typography variant="body1">
                          {c.applicableFeeHeads?.length ? c.applicableFeeHeads.join(', ') : '-'}
                        </Typography>
                      </Grid>

                      {/* Amount */}
                      {c.amount && (
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography variant="body2" color="text.secondary">
                            Amount
                          </Typography>
                          <Typography variant="body1">{formatNumber(c.amount, 'INR')}</Typography>
                        </Grid>
                      )}

                      {/* Percentage */}
                      {c.percentage && (
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography variant="body2" color="text.secondary">
                            Percentage
                          </Typography>
                          <Typography variant="body1">{c.percentage}%</Typography>
                        </Grid>
                      )}
                    </Grid>

                    {/* Documents Table */}
                    {c.documents?.length > 0 && (
                      <CustomizableTable
                        tableId={`view-documents-${i}`}
                        columns={[
                          { id: 'name', label: 'Name' },
                          {
                            id: 'acceptedFormat',
                            label: 'Accepted Format',
                            align: 'left',
                            minWidth: 160,
                          },
                          {
                            id: 'status',
                            label: 'Status',
                            align: 'left',
                            isFilter: false,
                            isSort: false,
                            render: (value, row) => (
                              <Tooltip title={row.status}>
                                <Iconify
                                  icon={
                                    row.status === 'Uploaded'
                                      ? 'mdi:approve'
                                      : 'mage:file-cross-fill'
                                  }
                                  height={20}
                                  width={20}
                                  sx={{
                                    color: (theme) =>
                                      row.status === 'Uploaded'
                                        ? 'success.main'
                                        : theme.vars.palette.grey[500],
                                  }}
                                />
                              </Tooltip>
                            ),
                          },
                          {
                            id: 'view',
                            label: 'View',
                            isFilter: false,
                            isSort: false,
                            render: (value, row) => (
                              <IconButton
                                onClick={() =>
                                  row.file
                                    ? window.open(URL.createObjectURL(row.file), '_blank')
                                    : row.fileUrl
                                      ? window.open(row.fileUrl, '_blank')
                                      : null
                                }
                                disabled={!row.file && !row.fileUrl}
                              >
                                <Iconify icon="carbon:view-filled" />
                              </IconButton>
                            ),
                          },
                          {
                            id: 'download',
                            label: 'Download',
                            isFilter: false,
                            isSort: false,
                            render: (value, row) => (
                              <IconButton
                                onClick={() => {
                                  if (row.file) {
                                    const url = URL.createObjectURL(row.file);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = row.documentName;
                                    link.click();
                                  } else if (row.fileUrl) {
                                    const link = document.createElement('a');
                                    link.href = row.fileUrl;
                                    link.download = row.documentName;
                                    link.click();
                                  }
                                }}
                                disabled={!row.file && !row.fileUrl}
                              >
                                <Iconify icon="material-symbols:download" width={20} height={20} />
                              </IconButton>
                            ),
                          },
                        ]}
                        data={c.documents}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </>
        )}
      </Scrollbar>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, width: '100%' }}>
          <Button
            variant="soft"
            color="error"
            onClick={onReject}
            size="small"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Reject
          </Button>

          <Button
            variant="soft"
            color="success"
            onClick={onApprove}
            size="small"
            startIcon={<Iconify icon={GlobalIcons.tick} />}
          >
            Approve
          </Button>
        </Box>
      </DialogActions>
    </Box>
  );
};

export default ViewConcessionRequest;
