import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Paper, Stack, Divider, Typography } from '@mui/material';
import {
  Translate,
  AccountTree,
  ReceiptLong,
  CalendarToday,
  AccountBalance,
} from '@mui/icons-material';
import { InfoItem } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/viewHomeworkDetails';

import type { IFeeStructure } from '../../type';

const ViewBasicDetailsOfStructure = ({ feeStructure }: { feeStructure: IFeeStructure | null }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 1.5,
      mb: 1.5,
      borderRadius: 2,
      transition: 'box-shadow 0.2s ease',
      '&:hover': { boxShadow: 4 },
    }}
  >
    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
      <Stack direction="row" alignItems="center" gap={1}>
        <Iconify icon="solar:bill-list-bold-duotone" width={18} sx={{ color: 'primary.main' }} />
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>
            Fee Structure Information
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Basic details associated with this structure
          </Typography>
        </Box>
      </Stack>
      <Label variant="soft" color={feeStructure?.status === 1 ? 'success' : 'error'}>
        {feeStructure?.status === 1 ? 'Active' : 'Inactive'}
      </Label>
    </Stack>
    <Divider sx={{ mb: 2 }} />

    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
        <InfoItem icon={<AccountTree />} label="Fee Structure Name" value={feeStructure?.name} />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <InfoItem
          icon={<CalendarToday />}
          label="Academic Year"
          value={feeStructure?.academicYearName}
          iconColor="warning.main"
          iconBgColor={(theme) => varAlpha(theme.palette.warning.mainChannel, 0.08)}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <InfoItem
          icon={<AccountBalance />}
          label="Board"
          value={feeStructure?.boardName}
          iconColor="info.main"
          iconBgColor={(theme) => varAlpha(theme.palette.info.mainChannel, 0.08)}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <InfoItem
          icon={<Translate />}
          label="Medium"
          value={feeStructure?.mediumName}
          iconColor="secondary.main"
          iconBgColor={(theme) => varAlpha(theme.palette.secondary.mainChannel, 0.08)}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <InfoItem
          icon={<ReceiptLong />}
          label="Receipt Book"
          value={feeStructure?.receiptBookName}
          iconColor="success.main"
          iconBgColor={(theme) => varAlpha(theme.palette.success.mainChannel, 0.08)}
        />
      </Grid>
    </Grid>
  </Paper>
);

export default ViewBasicDetailsOfStructure;
