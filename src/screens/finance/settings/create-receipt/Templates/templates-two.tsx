import React from 'react';

import { Box, Grid, Divider, Typography } from '@mui/material';

import { numberToWords } from 'src/utils/numberToWords';
import { formatNumber } from 'src/utils/formate_number';

import ReceiptTable from 'src/screens/finance/viewReceipt/receipt-table';

import { Image } from 'src/components/image';

const TemplateTwo = () => (
  <Grid container spacing={2} mb={3} justifyContent="flex-start">
    {/* Template Card in 1 column for small view */}
    <Grid item xs={4} sx={{ maxWidth: '300px', height: '500px' }}>
      <Box
        sx={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          p: 1.5,
          textAlign: 'center',
          height: '100%',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
          },
        }}
      >
        <Typography variant="subtitle2" noWrap sx={{ fontSize: '0.9rem', mb: 2 }}>
          Template 2
        </Typography>
        <Box pb="10px" display="flex" justifyContent="center" alignItems="center">
          <Image
            src="/assets/ddvs-blank-and-white.jpeg"
            alt="Template 2"
            style={{
              width: '200px', // Set desired width
              height: 'auto', // Maintain aspect ratio
              objectFit: 'contain', // Adjust how the image is scaled
              borderRadius: '8px', // Optional: Add rounded corners
            }}
          />
        </Box>
        <Divider />
        <Box display="flex" flexDirection="row" gap={3} justifyContent="center" alignItems="center">
          <Typography sx={{ fontSize: '10px' }}>Dealdva Road, Dindoli Surat-394210</Typography>
          <Typography sx={{ fontSize: '10px' }}>Mo: 98250 33150</Typography>
        </Box>
        <Divider />
        <Box display="flex" flexDirection="row" justifyContent="space-between" pt="10px">
          <Box display="flex" flexDirection="column" alignItems="flex-start">
            <Typography sx={{ fontSize: '10px' }}>
              <strong>Org</strong> : DDVS - EM - PRE-PRIMARY
            </Typography>
            <Typography sx={{ fontSize: '10px' }}>
              <strong>No. </strong>: 1219
            </Typography>
            <Typography sx={{ fontSize: '10px' }}>
              <strong> Name </strong>: BHANDARI FERI Year AKSHAYKUMAR
            </Typography>
            <Typography sx={{ fontSize: '10px' }}>
              <strong> Class</strong> : 10-A
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="flex-start">
            <Typography sx={{ fontSize: '10px' }}>
              <strong>Date</strong> : 29/08/2025
            </Typography>
            <Typography sx={{ fontSize: '10px' }}>
              <strong>Year</strong> :2024-2025
            </Typography>
            <Typography sx={{ fontSize: '10px' }}>
              <strong>Roll No</strong> : 98
            </Typography>
          </Box>
        </Box>
        <Box pt="10px" />
        <ReceiptTable
          columns={[
            { id: 'feeHead', label: 'Fee Head' },
            { id: 'feeHeadMonth', label: 'Paid For' },
            { id: 'amount', label: 'Amount' },
          ]}
          data={[
            { feeHead: 'Library Fee', amount: 1000, feeHeadMonth: 'March' },
            { feeHead: 'Sports Fee', amount: 800, feeHeadMonth: 'March' },
          ]}
        />
        <Box pt="10px" />
        <Box display="flex" justifyContent="space-between" flexDirection="row">
          <Typography sx={{ fontSize: '10px', fontWeight: '500' }}>
            {' '}
            {numberToWords(900)} Rupees Only
          </Typography>
          <Typography sx={{ fontSize: '10px' }}>{formatNumber(4200, 'INR')}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" flexDirection="row">
          <Box
            pt="10px"
            display="flex"
            flexDirection="column"
            justifyContent="flex-start"
            alignItems="flex-start"
          >
            <Typography sx={{ fontSize: '10px' }}>
              Pay Type : <strong>Payment Gateway</strong>
            </Typography>
            <Typography sx={{ fontSize: '10px' }}>
              Ref. No : <strong>2837000000899</strong>
            </Typography>
            <Typography sx={{ fontSize: '10px' }}>
              Dt : <strong>29/05/2023</strong>
            </Typography>
            <Typography sx={{ fontSize: '10px' }}>
              Bank : <strong>Paytm</strong>
            </Typography>
          </Box>
          <Box>
            <Box pb="50px" />
            <Typography fontSize="10px">Receiver Sign</Typography>
          </Box>
        </Box>
      </Box>
    </Grid>
  </Grid>
);

export default TemplateTwo;
