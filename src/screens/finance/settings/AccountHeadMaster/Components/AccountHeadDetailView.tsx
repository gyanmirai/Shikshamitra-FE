import React from 'react';
import { Box, Card, Typography, CardContent } from '@mui/material';

import { IAccountHead } from './type';

interface Props {
  accountHead: IAccountHead;
}

export default function AccountHeadDetailView({ accountHead }: Props) {
  return (
    <Box>
      <Typography variant="h6" mb={2}>
        Account Head Details
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="subtitle1">
            {accountHead.headName} ({accountHead.headCode})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Type: {accountHead.headType}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nature: {accountHead.nature}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={2}>
            Running Balance: ₹{accountHead.runningBalance?.toLocaleString('en-IN') || '0'}
          </Typography>
          <Box mt={4}>
            <Typography variant="body2" fontStyle="italic">
              Detailed ledger view and charting to be implemented.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
