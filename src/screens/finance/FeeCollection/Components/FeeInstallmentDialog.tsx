import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Close } from '@mui/icons-material';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Scrollbar } from 'src/components/scrollbar';
import {
  FeeCollectionStatusType,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';
import {
  Box,
  Card,
  Paper,
  Table,
  Dialog,
  Divider,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
  Typography,
  TableContainer,
} from '@mui/material';

const FeeInstallmentDialog = ({ open, onClose, selectedTerm }: any) => {
  const theme = useTheme();

  return (
    <Dialog open={open.value} onClose={onClose} fullWidth maxWidth="md">
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" py={1.5} px={2}>
        <Typography variant="h5">{selectedTerm?.name} Installment</Typography>

        <IconButton aria-label="close" onClick={onClose}>
          <Close />
        </IconButton>
      </Box>

      <Divider />

      {/* Content */}
      <Scrollbar sx={{ height: '500px', p: 2 }}>
        <Card
          sx={{
            borderRadius: 1,
            boxShadow: 'var(--shadows-4)',
            bgcolor: theme.vars.palette.background.paper,
            height: '100%',
            p: 1.5,
            mb: 2,
          }}
        >
          <Typography variant="h6" color="primary.main" mb={1}>
            Fee Head Breakdown
          </Typography>

          {/* Fee Heads */}
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Fee Head</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Pending</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Paid</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {selectedTerm?.feeHeads?.map((head: any) => {
                  const isPaid = head.status === 0 || head.paid >= head.total;

                  return (
                    <TableRow key={head.name}>
                      <TableCell>{head.name}</TableCell>
                      <TableCell>{head.category}</TableCell>
                      <TableCell>₹ {(head.total - head.paid).toLocaleString()}</TableCell>
                      <TableCell>₹ {head.paid?.toLocaleString()}</TableCell>

                      <TableCell>
                        <Label
                          color={
                            FeeCollectionStatusTypeColors[
                              head.status as FeeCollectionStatusType
                            ] as LabelColor
                          }
                        >
                          {FeeCollectionStatusType[head.status as FeeCollectionStatusType]}
                        </Label>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
        {/* Charges */}
        {(selectedTerm?.charges ?? []).length > 0 && (
          <Card
            sx={{
              borderRadius: 1,
              boxShadow: 'var(--shadows-4)',
              bgcolor: theme.vars.palette.background.paper,
              height: '100%',
              p: 1.5,
            }}
          >
            <Typography variant="h6" color="primary.main" mt={2} mb={1}>
              Charges
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Charge</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Pending</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Paid</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {selectedTerm?.charges?.map((ch: any) => {
                    const pendingAmount = ch.total - ch.paid;

                    return (
                      <TableRow key={ch.id}>
                        <TableCell>{ch.name}</TableCell>

                        <TableCell>{ch.dueDate}</TableCell>

                        <TableCell>₹ {pendingAmount.toLocaleString()}</TableCell>

                        <TableCell>₹ {ch.paid.toLocaleString()}</TableCell>

                        <TableCell>
                          <Label
                            color={
                              FeeCollectionStatusTypeColors[
                                ch.status as FeeCollectionStatusType
                              ] as LabelColor
                            }
                          >
                            {FeeCollectionStatusType[ch.status as FeeCollectionStatusType]}
                          </Label>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
      </Scrollbar>
    </Dialog>
  );
};

export default FeeInstallmentDialog;
