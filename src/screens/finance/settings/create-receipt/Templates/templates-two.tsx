import React from 'react';
import { Image } from 'src/components/image';
import { numberToWords } from 'src/utils/numberToWords';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Grid, Radio, Divider, Typography } from '@mui/material';
import ReceiptTable from 'src/screens/finance/viewReceipt/receipt-table';

interface TemplateTwoProps {
  selectedTemplate: string;
  onSelectTemplate: (templateName: string) => void;
}

const TemplateTwo: React.FC<TemplateTwoProps> = ({ selectedTemplate, onSelectTemplate }) => (
  <Grid container spacing={2} mb={3} justifyContent="flex-start">
    <Grid size={{ xs: 12, md: 12 }}>
      <Box
        sx={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          p: 1.5,
          textAlign: 'center',
          height: '100%',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          position: 'relative',
          '&:hover': {
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
          },
        }}
      >
        {/* Radio Button */}
        <Radio
          checked={selectedTemplate === 'TemplateTwo'}
          onChange={() => onSelectTemplate('TemplateTwo')}
          color="primary"
          sx={{ position: 'absolute', top: 8, right: 8 }}
        />

        {/* Title */}
        <Typography variant="subtitle2" noWrap sx={{ fontSize: '0.9rem', mb: 2 }}>
          Template 2
        </Typography>

        {/* Image Section */}
        <Box pb={1} display="flex" justifyContent="center" alignItems="center">
          <Image
            src="/assets/ddvs-blank-and-white.jpeg"
            alt="Template 2"
            style={{
              width: '200px',
              height: 'auto',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        </Box>

        <Divider />

        {/* Organization Info */}
        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          gap={3}
          justifyContent="center"
          alignItems="center"
          mt={1}
          mb={1}
        >
          <Typography sx={{ fontSize: '10px' }}>Dealdva Road, Dindoli Surat-394210</Typography>
          <Typography sx={{ fontSize: '10px' }}>Mo: 98250 33150</Typography>
        </Box>

        <Divider />

        {/* Payment & Student Info */}
        <Grid container spacing={2} mt={1}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box display="flex" flexDirection="column" alignItems="flex-start" gap={0.5}>
              <Typography sx={{ fontSize: '10px' }}>
                <strong>Org:</strong> DDVS - EM - PRE-PRIMARY
              </Typography>
              <Typography sx={{ fontSize: '10px' }}>
                <strong>No.:</strong> 1219
              </Typography>
              <Typography sx={{ fontSize: '10px' }}>
                <strong>Name:</strong> BHANDARI FERI AKSHAYKUMAR
              </Typography>
              <Typography sx={{ fontSize: '10px' }}>
                <strong>Class:</strong> 10-A
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box display="flex" flexDirection="column" alignItems="flex-start" gap={0.5}>
              <Typography sx={{ fontSize: '10px' }}>
                <strong>Date:</strong> 29/08/2025
              </Typography>
              <Typography sx={{ fontSize: '10px' }}>
                <strong>Year:</strong> 2024-2025
              </Typography>
              <Typography sx={{ fontSize: '10px' }}>
                <strong>Roll No:</strong> 98
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Receipt Table */}
        <Box pt={1}>
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
        </Box>

        {/* Totals */}
        <Box
          pt={1}
          display="flex"
          justifyContent="space-between"
          flexDirection={{ xs: 'column', md: 'row' }}
        >
          <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
            {numberToWords(900)} Rupees Only
          </Typography>
          <Typography sx={{ fontSize: '10px' }}>{formatNumber(4200, 'INR')}</Typography>
        </Box>

        {/* Payment Info & Signature */}
        <Box
          display="flex"
          justifyContent="space-between"
          flexDirection={{ xs: 'column', md: 'row' }}
          mt={1}
        >
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Typography sx={{ fontSize: '10px' }}>
              Pay Type: <strong>Payment Gateway</strong>
            </Typography>
            <Typography sx={{ fontSize: '10px' }}>
              Ref. No: <strong>2837000000899</strong>
            </Typography>
            <Typography sx={{ fontSize: '10px' }}>
              Dt: <strong>29/05/2023</strong>
            </Typography>
            <Typography sx={{ fontSize: '10px' }}>
              Bank: <strong>Paytm</strong>
            </Typography>
          </Box>
          <Box mt={{ xs: 2, md: 0 }} display="flex" justifyContent="flex-end">
            <Typography sx={{ fontSize: '10px' }}>Receiver Sign</Typography>
          </Box>
        </Box>
      </Box>
    </Grid>
  </Grid>
);

export default TemplateTwo;
