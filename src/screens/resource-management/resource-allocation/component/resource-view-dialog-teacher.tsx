import React from 'react';
import dayjs from 'dayjs';
import { Box, Grid, Typography } from '@mui/material';

import type { IResourceViewDialogTeacherProps } from '../resource-allocation-interface';

const ResourceViewDialogTeacher: React.FC<IResourceViewDialogTeacherProps> = ({ data }) => (
  <Box sx={{ px: 2, py: 1 }}>
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }} display="flex" flexDirection="row" gap={1}>
        <Typography fontWeight="bold">Resource Name:</Typography>
        <Typography>{data.resourceName || '-'}</Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }} display="flex" flexDirection="row" gap={1}>
        <Typography fontWeight="bold">Quantity:</Typography>
        <Typography>{data.quantity || '-'}</Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }} display="flex" flexDirection="row" gap={1}>
        <Typography fontWeight="bold">Allocation Target:</Typography>
        <Typography>{data.allocationTarget || '-'}</Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }} display="flex" flexDirection="row" gap={1}>
        <Typography fontWeight="bold">Assigned To:</Typography>
        <Typography>{data.assignedTo || '-'}</Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }} display="flex" flexDirection="row" gap={1}>
        <Typography fontWeight="bold">Allocation Date:</Typography>
        <Typography>
          {data.allocationDate ? dayjs(data.allocationDate).format('DD/MM/YYYY') : '-'}
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }} display="flex" flexDirection="row" gap={1}>
        <Typography fontWeight="bold">Expected Return Date:</Typography>
        <Typography>
          {data.expectedReturnDate ? dayjs(data.expectedReturnDate).format('DD/MM/YYYY') : '-'}
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }} display="flex" flexDirection="row" gap={1}>
        <Typography fontWeight="bold">Purpose:</Typography>
        <Typography>{data.purposeOfAllocation || '-'}</Typography>
      </Grid>
    </Grid>
  </Box>
);

export default ResourceViewDialogTeacher;
