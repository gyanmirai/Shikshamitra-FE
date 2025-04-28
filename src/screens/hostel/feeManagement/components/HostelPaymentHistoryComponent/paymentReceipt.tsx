import React from 'react';

import { Box, Grid, Button, Divider, Typography } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';
import { formatNumber } from 'src/utils/formate_number';
import { numberToWords } from 'src/utils/numberToWords';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomizableTable from 'src/components/customizabaleTable';

const PaymentReceipt = () => (
  <Box>
    <Scrollbar sx={{ height: '450px' }}>
      <Grid container spacing={2} mb={2} justifyContent="flex-start">
        <Grid item xs={12} md={12}>
          <Box
            sx={{
              p: 1.5,
              textAlign: 'center',
              height: '100%',
            }}
          >
            <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 5 }}>
              Hostel Fees
            </Typography>

            {/* Preview content */}
            <Box sx={{ mb: 1 }}>
              <Grid
                container
                sx={{ fontSize: '1rem', alignItems: 'flex-start', justifyContent: 'space-between' }}
              >
                <Grid item xs={5}>
                  <Box display="flex" flexDirection="column" alignItems="flex-start">
                    <Typography variant="body2" noWrap>
                      <strong> From:</strong>
                    </Typography>
                    <Typography variant="body2" noWrap>
                      Deep Darshan Vidhya Sankool
                    </Typography>
                    <Typography variant="body2" noWrap>
                      Dindoli - 560078
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={5}>
                  <Box display="flex" flexDirection="column" alignItems="flex-start">
                    <Typography variant="body2" noWrap>
                      <strong> To:</strong>
                    </Typography>
                    <Typography variant="body2" noWrap>
                      <strong>Name : </strong> Vishal Patel
                    </Typography>
                    <Typography variant="body2" noWrap>
                      <strong>Class : </strong> 10-A
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ mb: 1 }} />
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              pb="10px"
              sx={{ fontSize: '1rem' }}
            >
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">
                  <strong>Payment Mode : </strong> Payment Gateway
                </Typography>
                <Typography variant="body2">
                  <strong>Bank : </strong> Paytm
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">
                  <strong>Ref : </strong> 09788nhgh679jlk
                </Typography>
                <Typography variant="body2">
                  <strong>Date : </strong> 06/08/2025
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 1 }} />

            <CustomizableTable
              tableId="receipt-table"
              isSearch={false}
              isFilter={false}
              isPagination={false}
              isShowedDense={false}
              columns={[
                { id: 'feeHead', label: 'Fee Head', isFilter: false, isSort: false },
                { id: 'feeHeadMonth', label: 'Paid For', isFilter: false, isSort: false },
                { id: 'amount', label: 'Amount', isFilter: false, isSort: false },
              ]}
              data={[
                { feeHead: 'Hostel Rent', amount: 1000, feeHeadMonth: 'March' },
                { feeHead: 'Hostel Mess', amount: 800, feeHeadMonth: 'March' },
              ]}
            />
            <Box mt={7} display="flex" justifyContent="space-between" sx={{ fontSize: '0.875rem' }}>
              <Box>
                <Typography>
                  <strong>Pending Fees:</strong> {formatNumber(900, 'INR')}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography>
                  <strong>Total:</strong> {formatNumber(900, 'INR')}
                </Typography>
                <Typography sx={{ pb: '10px' }}>
                  (In Words: {numberToWords(900)} Rupees Only)
                </Typography>
                <Typography>_________________________</Typography>
                <Typography>Receiver Sign</Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Scrollbar>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        p: 2,
        width: '100%',
      }}
    >
      <Button startIcon={<Iconify icon={GlobalIcons.download} />} variant="contained">
        Download
      </Button>
    </Box>
  </Box>
);

export default PaymentReceipt;
