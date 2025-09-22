'use client';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DialogScrollContent } from 'src/components/customDialog';
import { Box, Grid, Chip, Button, Typography, DialogActions } from '@mui/material';

interface IBudgetApprovalProps {
  budget: any;
  onApprove: () => void;
  onReject: () => void;
}

const BudgetApproval: React.FC<IBudgetApprovalProps> = ({ budget, onApprove, onReject }) => {
  const statusMap: Record<number, { label: string; color: 'warning' | 'success' | 'error' }> = {
    0: { label: 'Pending', color: 'warning' },
    1: { label: 'Approved', color: 'success' },
    2: { label: 'Rejected', color: 'error' },
  };

  return (
    <>
      <DialogScrollContent>
        {/* 🔹 Header */}
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}>
          <Typography variant="h6">{budget?.budgetTitle}</Typography>
          <Typography color="text.secondary">{budget?.description}</Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 6 }}>
              <Typography color="text.secondary">Total Allocated</Typography>
              <Typography sx={{ fontWeight: 600, color: 'green' }}>
                ₹ {budget?.totalBudgetAmount?.toLocaleString('en-IN')}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography color="text.secondary">Time Period</Typography>
              <Typography sx={{ fontWeight: 500 }}>
                {budget?.startDate} to {budget?.endDate}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography color="text.secondary">Status</Typography>
              <Chip
                label={statusMap[budget?.status]?.label || 'Unknown'}
                color={statusMap[budget?.status]?.color || 'default'}
                size="small"
              />
            </Grid>
          </Grid>
        </Box>

        {/* 🔹 Category Breakdown */}
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>Category Breakdown</Typography>
          {budget?.subCategories?.map((item: any, index: number) => (
            <Grid
              key={index}
              container
              alignItems="center"
              justifyContent="space-between"
              sx={{
                py: 1,
                borderBottom:
                  index < (budget?.subCategories?.length ?? 0) - 1 ? '1px solid #eee' : 'none',
              }}
            >
              <Grid size={{ xs: 6 }}>
                <Typography>{item?.subCategory}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }} textAlign="right">
                <Typography sx={{ fontWeight: 500 }}>
                  ₹ {item?.amount?.toLocaleString('en-IN')}
                </Typography>
              </Grid>
            </Grid>
          ))}
        </Box>

        {/* 🔹 Departments */}
        {budget?.departments?.length > 0 && (
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>Departments</Typography>
            <Typography>{budget?.departments?.join(', ')}</Typography>
          </Box>
        )}

        {/* 🔹 Budget Controls */}
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>Budget Controls</Typography>
          <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="mdi:alert" color="orange" /> Threshold Alert: {budget?.spendingThreshold}
            %
          </Typography>
        </Box>
      </DialogScrollContent>

      {/* 🔹 Actions */}
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, width: '100%' }}>
          <Button
            variant="contained"
            color="error"
            onClick={onReject}
            size="small"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Reject
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={onApprove}
            size="small"
            startIcon={<Iconify icon={GlobalIcons.submit} />}
          >
            Approve
          </Button>
        </Box>
      </DialogActions>
    </>
  );
};

export default BudgetApproval;
