'use client';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
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
    <Scrollbar sx={{ p: 2, height: '100%' }}>
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
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" mb={3} gap={1.5}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.08),
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Iconify icon="mdi:file-document-outline" width={24} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {c.concessionType} Information
                  </Typography>
                </Box>

                <Grid container spacing={3} sx={{ mb: 2 }}>
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
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
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
                          id: 'view',
                          label: 'View',
                          isFilter: false,
                          isSort: false,
                          align: 'left',
                          minWidth: '80px',
                          render(value, row) {
                            return (
                              <IconButton
                                style={{
                                  textAlign: 'left',
                                  marginLeft: '0px',
                                  padding: '0px',
                                  justifyContent: 'flex-start',
                                  display: 'flex',
                                }}
                                disabled={row.status !== 'Uploaded'}
                                onClick={() => {}}
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
                          align: 'left',
                          minWidth: '80px',
                          render(value, row) {
                            return (
                              <IconButton
                                style={{
                                  textAlign: 'left',
                                  marginLeft: '0px',
                                  padding: '0px',
                                  justifyContent: 'flex-start',
                                  display: 'flex',
                                }}
                                disabled={row.status !== 'Uploaded'}
                                onClick={async () => {
                                  // TODO: Implement download functionality
                                  // Fetch document content using getStudentDocumentById
                                  // Create download link with base64 content
                                }}
                              >
                                <Iconify icon="material-symbols:download" width={20} height={20} />
                              </IconButton>
                            );
                          },
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

    <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, width: '100%' }}>
        <Button
          variant="soft"
          color="error"
          onClick={onReject}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          size="small"
        >
          Reject
        </Button>

        <Button
          variant="soft"
          color="success"
          onClick={onApprove}
          startIcon={<Iconify icon={GlobalIcons.tick} />}
          size="small"
        >
          Approve
        </Button>
      </Box>
    </DialogActions>
  </Box>
);

export default ViewConcessionRequest;
