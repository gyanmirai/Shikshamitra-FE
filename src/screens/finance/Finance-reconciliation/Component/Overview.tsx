import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Card, Grid, Button, Typography, LinearProgress } from '@mui/material';
import {
  useGetMonthsQuery,
  useGetOverviewDataQuery,
  useGetSummaryCardsQuery,
} from 'src/redux/finance/reconciliation';

const Overview = () => {
  const [selectedMonth, setSelectedMonth] = useState('November 2024');

  // Fetch reconciliation data using individual hooks
  const { data: overviewData, isLoading: overviewLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetOverviewDataQuery,
  });

  const { data: months, isLoading: monthsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetMonthsQuery,
  });

  const { data: summaryCards, isLoading: summaryLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSummaryCardsQuery,
  });

  const isLoading = overviewLoading || monthsLoading || summaryLoading;

  const handleRefreshData = async () => {};

  return isLoading || !overviewData || !months || !summaryCards ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
      <Box className="loader" height={24} />
    </Box>
  ) : (
    <Box>
      {/* Header Section with Month Selector and Refresh Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <CustomSelect
            value={selectedMonth}
            onChange={(val) => setSelectedMonth(val as string)}
            options={months || []}
            label="Month"
            labelKey="label"
            valueKey="value"
            size="small"
            formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
          />

          <Button
            variant="outlined"
            size="medium"
            startIcon={<Iconify icon="material-symbols:refresh" />}
            onClick={handleRefreshData}
            sx={{
              width: '150px',
              minWidth: '200px',

              borderColor: '#E0E0E0',
              color: 'text.primary',
              '&:hover': {
                borderColor: '#BDBDBD',
                backgroundColor: '#F5F5F5',
              },
            }}
          >
            Refresh Data
          </Button>
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            backgroundColor: '#F5F5F5',
            px: 2,
            py: 1,
            borderRadius: '8px',
          }}
        >
          Last updated: {overviewData.lastUpdated}
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryCards.map((card: any, index: number) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              sx={{
                p: 3,
                height: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid #F0F0F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
              }}
            >
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
              >
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: card.iconColor }}>
                    {card.value.toLocaleString()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    marginTop: 1,
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    backgroundColor: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon={card.icon} width={24} sx={{ color: card.iconColor }} />
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Reconciliation Progress Section */}
      <Card
        sx={{
          p: 4,
          border: '1px solid #F0F0F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontWeight: 600,
            color: '#00C853',
          }}
        >
          Reconciliation Progress
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Overall Progress
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2196F3' }}>
              {overviewData.overallProgress}%
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={overviewData.overallProgress}
            sx={{
              height: 12,
              borderRadius: 6,
              backgroundColor: '#F5F5F5',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#000',
                borderRadius: 6,
              },
            }}
          />
        </Box>

        {/* Progress Breakdown */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#4CAF50', mb: 0.5 }}>
              {overviewData.matches}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Matches
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#FF5722', mb: 0.5 }}>
              {overviewData.unmatched}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Unmatched
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#FFC107', mb: 0.5 }}>
              {overviewData.discrepancies}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Discrepancies
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default Overview;
