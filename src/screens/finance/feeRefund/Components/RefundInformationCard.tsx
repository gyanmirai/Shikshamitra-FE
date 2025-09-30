import React from 'react';
import { Box, Grid, Typography } from '@mui/material';

import type { IStudentFeeData } from '../type';

const RefundInfo: React.FC<{ refund: IStudentFeeData }> = ({ refund }) => (
  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}>
    {/* Heading */}
    <Typography variant="h6" mb={2} color="primary.main">
      Refund Information
    </Typography>

    <Grid container spacing={2}>
      {/* Paid Terms */}
      <Grid size={6}>
        <Typography color="text.secondary">Refund Terms</Typography>
        {refund?.paidTerms && refund.paidTerms.length > 0 ? (
          <Box mt={1} display="flex">
            <Typography variant="body2" fontWeight="300">
              {refund.paidTerms.map((term, idx) => (
                <React.Fragment key={`term-${idx}`}>
                  {term}
                  {refund?.paidTerms && idx < refund.paidTerms.length - 1 ? ', ' : ''}
                </React.Fragment>
              ))}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body1" fontWeight="600">
            —
          </Typography>
        )}
      </Grid>

      {/* Applicable Fee Heads */}
      <Grid size={6}>
        <Typography color="text.secondary">Applicable Fee Heads</Typography>
        {refund?.applicableFeeHeads && refund.applicableFeeHeads.length > 0 ? (
          <Box mt={1} display="flex">
            <Typography variant="body2" fontWeight="300">
              {refund.applicableFeeHeads.map((head, idx) => (
                <React.Fragment key={`head-${idx}`}>
                  {head.feeHead}
                  {refund?.applicableFeeHeads && idx < refund.applicableFeeHeads.length - 1
                    ? ', '
                    : ''}
                </React.Fragment>
              ))}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body1" fontWeight="600">
            —
          </Typography>
        )}
      </Grid>
    </Grid>
  </Box>
);

export default RefundInfo;
