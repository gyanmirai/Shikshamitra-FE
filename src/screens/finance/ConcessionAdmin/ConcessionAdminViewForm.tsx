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
}) => (
  <Box display="flex" flexDirection="column" gap={2} height="100%">
    <Scrollbar sx={{ p: 3, height: '100%' }}>
      <StudentInformationAccordion student={student} />
      {student?.concessions && student.concessions.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {student.concessions.slice(0, 1).map((c, i) => (
            <Card
              key={i}
              sx={{
                borderRadius: 2,
                boxShadow: (theme) => theme.customShadows?.card ?? 3,
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'primary.main',
                    mb: 3,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Iconify icon="mdi:file-document-outline" width={24} />
                  {c.concessionType} Information
                </Typography>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {/* Fee Heads */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1.5,
                        bgcolor: (theme) => theme.vars.palette.background.neutral,
                        height: '100%',
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Applicable Fee Heads
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {c.applicableFeeHeads?.length ? (
                          c.applicableFeeHeads.map((head, idx) => (
                            <Box
                              key={idx}
                              component="span"
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor: 'background.paper',
                                border: 1,
                                borderColor: 'divider',
                                typography: 'body2',
                                fontWeight: 'medium',
                              }}
                            >
                              {head}
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2">-</Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>

                  {/* Amount / Percentage */}
                  {(c.amount || c.percentage) && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 1.5,
                          bgcolor: (theme) => theme.vars.palette.background.neutral,
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {c.amount && (
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Amount
                            </Typography>
                            <Typography variant="h5" color="success.main">
                              {formatNumber(c.amount, 'INR')}
                            </Typography>
                          </Box>
                        )}

                        {c.percentage && (
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Percentage
                            </Typography>
                            <Typography variant="h5" color="info.main">
                              {c.percentage}%
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  )}
                </Grid>

                {/* Documents Table */}
                {c.documents?.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                      Attached Documents
                    </Typography>
                    <CustomizableTable
                      tableId={`view-documents-${i}`}
                      columns={[
                        {
                          id: 'name',
                          label: 'Document Name',
                          render: (value, row) => (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Iconify
                                icon="mdi:file-document"
                                width={24}
                                sx={{ color: 'text.disabled' }}
                              />
                              <Typography variant="body2" fontWeight="medium">
                                {row.documentName || '-'}
                              </Typography>
                            </Box>
                          ),
                        },
                        {
                          id: 'acceptedFormat',
                          label: 'Format',
                          align: 'left',
                          minWidth: 120,
                          render: (value, row) => (
                            <Box
                              component="span"
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 0.75,
                                bgcolor: (theme) => theme.vars.palette.action.hover,
                                typography: 'caption',
                                fontWeight: 'bold',
                              }}
                            >
                              {row.acceptedFormat || '-'}
                            </Box>
                          ),
                        },
                        {
                          id: 'status',
                          label: 'Status',
                          align: 'left',
                          isFilter: false,
                          isSort: false,
                          render: (value, row) => (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                color: row.status === 'Uploaded' ? 'success.main' : 'text.disabled',
                              }}
                            >
                              <Iconify
                                icon={
                                  row.status === 'Uploaded'
                                    ? 'eva:checkmark-circle-2-fill'
                                    : 'eva:alert-circle-fill'
                                }
                                width={18}
                              />
                              <Typography variant="body2">{row.status || 'Pending'}</Typography>
                            </Box>
                          ),
                        },
                        {
                          id: 'actions',
                          label: 'Actions',
                          align: 'right',
                          isFilter: false,
                          isSort: false,
                          render: (value, row) => (
                            <Box display="flex" justifyContent="flex-end" gap={1}>
                              <Tooltip title="View Document">
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      row.file
                                        ? window.open(URL.createObjectURL(row.file), '_blank')
                                        : row.fileUrl
                                          ? window.open(row.fileUrl, '_blank')
                                          : null
                                    }
                                    disabled={!row.file && !row.fileUrl}
                                    sx={{
                                      color: 'info.main',
                                      bgcolor: (theme) =>
                                        theme.vars.palette.info.mainChannel &&
                                        `rgba(${theme.vars.palette.info.mainChannel} / 0.08)`,
                                      '&:hover': {
                                        bgcolor: (theme) =>
                                          theme.vars.palette.info.mainChannel &&
                                          `rgba(${theme.vars.palette.info.mainChannel} / 0.16)`,
                                      },
                                    }}
                                  >
                                    <Iconify icon="carbon:view-filled" width={18} />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              <Tooltip title="Download">
                                <span>
                                  <IconButton
                                    size="small"
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
                                    sx={{
                                      color: 'primary.main',
                                      bgcolor: (theme) =>
                                        theme.vars.palette.primary.mainChannel &&
                                        `rgba(${theme.vars.palette.primary.mainChannel} / 0.08)`,
                                      '&:hover': {
                                        bgcolor: (theme) =>
                                          theme.vars.palette.primary.mainChannel &&
                                          `rgba(${theme.vars.palette.primary.mainChannel} / 0.16)`,
                                      },
                                    }}
                                  >
                                    <Iconify icon="eva:download-fill" width={18} />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Box>
                          ),
                        },
                      ]}
                      data={c.documents}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Scrollbar>

    <DialogActions
      sx={{
        p: 2.5,
        borderTop: (theme) => `1px dashed ${theme.palette.divider}`,
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, width: '100%' }}>
        <Button
          variant="soft"
          color="error"
          onClick={onReject}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          sx={{ px: 2 }}
        >
          Reject
        </Button>

        <Button
          variant="contained"
          color="success"
          onClick={onApprove}
          startIcon={<Iconify icon={GlobalIcons.tick} />}
          sx={{
            px: 2,
            boxShadow: (theme) => theme.customShadows?.success,
          }}
        >
          Approve
        </Button>
      </Box>
    </DialogActions>
  </Box>
);

export default ViewConcessionRequest;
