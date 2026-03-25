import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { Box, Card, Grid, Typography, CardContent } from '@mui/material';
import {
  Translate,
  AccountTree,
  ReceiptLong,
  CalendarToday,
  AccountBalance,
} from '@mui/icons-material';
import { InfoItem } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/viewHomeworkDetails';

import type { IFeeStructure } from '../../type';

const ViewBasicDetailsOfStructure = ({ feeStructure }: { feeStructure: IFeeStructure | null }) => {
  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1,
        borderRadius: 2,
        boxShadow: (theme) =>
          `0 0 2px 0 ${varAlpha(theme.palette.grey['500Channel'], 0.2)}, 0 12px 24px -4px ${varAlpha(theme.palette.grey['500Channel'], 0.12)}`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1,
          borderBottom: '1px dashed',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.02),
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            Fee Structure Information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Basic details associated with this structure
          </Typography>
        </Box>
        <Label variant="soft" color={feeStructure?.status === 1 ? 'success' : 'error'}>
          {feeStructure?.status === 1 ? 'Active' : 'Inactive'}
        </Label>
      </Box>

      <CardContent sx={{ p: 1 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
            <InfoItem
              icon={<AccountTree />}
              label="Fee Structure Name"
              value={feeStructure?.name}
            />
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
      </CardContent>
    </Card>
  );
};

export default ViewBasicDetailsOfStructure;
