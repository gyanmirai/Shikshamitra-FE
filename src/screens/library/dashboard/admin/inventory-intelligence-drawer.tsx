import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Card, Stack, Drawer, Divider, Typography, IconButton } from '@mui/material';

interface InventoryIntelligenceDrawerProps {
  open: boolean;
  onClose: () => void;
}

// Mock data for the drawer
const mockDetailedInventory = {
  kpis: {
    totalCategories: { value: 5, change: '+2%' },
    highDemand: { value: 12, change: '+15%' },
    lowUtilization: { value: 8, change: '-5%' },
    deadStock: { value: '12%', change: '-3%' },
  },
  highDemandBooks: [
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      issues: 45,
      trend: 'up',
      recommendation: 'Add 3 copies',
    },
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      issues: 38,
      trend: 'up',
      recommendation: 'Add 2 copies',
    },
    {
      title: 'Brief History of Time',
      author: 'Stephen Hawking',
      issues: 32,
      trend: 'down',
      recommendation: 'Monitor demand',
    },
    {
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      issues: 28,
      trend: 'up',
      recommendation: 'Add 2 copies',
    },
    {
      title: 'Python Basics',
      author: 'H. Harris',
      issues: 25,
      trend: 'down',
      recommendation: 'Maintain stock',
    },
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      issues: 23,
      trend: 'up',
      recommendation: 'Add 1 copy',
    },
    {
      title: '1984',
      author: 'George Orwell',
      issues: 21,
      trend: 'up',
      recommendation: 'Add 2 copies',
    },
  ],
  lowUtilization: [
    {
      title: 'Advanced Fortran',
      author: 'B. Metcalfe',
      lastIssued: '6 months ago',
      utilization: '2%',
      recommendation: 'Consider removal',
    },
    {
      title: 'Cobol Programming',
      author: 'G. Hopper',
      lastIssued: '1 year ago',
      utilization: '5%',
      recommendation: 'Archive',
    },
    {
      title: '2005 Periodicals',
      author: 'Archive',
      lastIssued: '8 months ago',
      utilization: '8%',
      recommendation: 'Archive',
    },
    {
      title: 'Old Encyclopedia Set',
      author: 'Various',
      lastIssued: '10 months ago',
      utilization: '3%',
      recommendation: 'Remove',
    },
    {
      title: 'Outdated Tech Manual',
      author: 'J. Smith',
      lastIssued: '7 months ago',
      utilization: '4%',
      recommendation: 'Remove',
    },
  ],
  categoryPerformance: {
    categories: ['Fiction', 'Non-Fiction', 'Textbooks', 'Reference', 'Magazines'],
    issues: [450, 380, 520, 250, 120],
    utilization: [85, 72, 95, 45, 28],
  },
  procurementRecommendations: [
    { category: 'Textbooks', action: 'Increase stock by 15%', priority: 'high', budget: '₹25,000' },
    { category: 'Fiction', action: 'Add popular titles', priority: 'medium', budget: '₹15,000' },
    {
      category: 'Reference',
      action: 'Update outdated materials',
      priority: 'low',
      budget: '₹10,000',
    },
  ],
};

const InventoryIntelligenceDrawer = ({ open, onClose }: InventoryIntelligenceDrawerProps) => {
  const theme = useTheme();
  const [dateRange, setDateRange] = useState('last-30-days');
  const [category, setCategory] = useState('all');
  const [utilization, setUtilization] = useState('all');
  const [sortBy, setSortBy] = useState('most-issued');

  // Options for filters
  const dateRangeOptions = [
    { label: 'Last 7 Days', value: 'last-7-days' },
    { label: 'Last 30 Days', value: 'last-30-days' },
    { label: 'Last 90 Days', value: 'last-90-days' },
    { label: 'Last Year', value: 'last-year' },
  ];

  const categoryOptions = [
    { label: 'All Categories', value: 'all' },
    { label: 'Fiction', value: 'fiction' },
    { label: 'Non-Fiction', value: 'non-fiction' },
    { label: 'Textbooks', value: 'textbooks' },
    { label: 'Reference', value: 'reference' },
    { label: 'Magazines', value: 'magazines' },
  ];

  const utilizationOptions = [
    { label: 'All', value: 'all' },
    { label: 'High (>70%)', value: 'high' },
    { label: 'Medium (30-70%)', value: 'medium' },
    { label: 'Low (<30%)', value: 'low' },
    { label: 'Dead Stock', value: 'dead-stock' },
  ];

  const sortOptions = [
    { label: 'Most Issued', value: 'most-issued' },
    { label: 'Least Issued', value: 'least-issued' },
    { label: 'Alphabetical', value: 'alphabetical' },
    { label: 'Newest First', value: 'newest' },
  ];

  // Handler functions for CustomSelect onChange
  const handleDateRangeChange = (value: string | number | string[] | number[]) => {
    setDateRange(value as string);
  };

  const handleCategoryChange = (value: string | number | string[] | number[]) => {
    setCategory(value as string);
  };

  const handleUtilizationChange = (value: string | number | string[] | number[]) => {
    setUtilization(value as string);
  };

  const handleSortByChange = (value: string | number | string[] | number[]) => {
    setSortBy(value as string);
  };

  // Chart options for category performance
  const categoryChartOptions = useChart({
    colors: [theme.palette.primary.main],
    xaxis: {
      categories: mockDetailedInventory.categoryPerformance.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: '50%',
      },
    } as any,
    dataLabels: {
      enabled: true,
      formatter: (val: number) => fNumber(val),
      style: { fontSize: '11px', fontWeight: 600 },
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${fNumber(value)} issues`,
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
    },
    yaxis: {
      labels: { style: { colors: theme.palette.text.secondary } },
    },
  });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: '60%', md: '50%' },
          maxWidth: '1200px',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2, py: 2.5 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Inventory Intelligence
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mt: 0.5 }}>
              Detailed usage & procurement analytics
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ mt: -0.5 }}>
            <Iconify icon="carbon:close" width={24} />
          </IconButton>
        </Stack>
      </Box>

      <Divider />

      {/* Filter Section */}
      <Box
        sx={{
          px: 1,
          py: 2,
          bgcolor: (t) => alpha(t.palette.grey[500], 0.04),
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomSelect
              label="Date Range"
              name="dateRange"
              size="small"
              options={dateRangeOptions}
              labelKey="label"
              valueKey="value"
              value={dateRange}
              onChange={handleDateRangeChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomSelect
              label="Category"
              name="category"
              size="small"
              options={categoryOptions}
              labelKey="label"
              valueKey="value"
              value={category}
              onChange={handleCategoryChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomSelect
              label="Utilization"
              name="utilization"
              size="small"
              options={utilizationOptions}
              labelKey="label"
              valueKey="value"
              value={utilization}
              onChange={handleUtilizationChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomSelect
              label="Sort By"
              name="sortBy"
              size="small"
              options={sortOptions}
              labelKey="label"
              valueKey="value"
              value={sortBy}
              onChange={handleSortByChange}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Scrollable Content */}
      <Scrollbar sx={{ flexGrow: 1 }}>
        <Box sx={{ p: 1 }}>
          {/* KPI Summary Row */}
          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  p: 2,
                  boxShadow: 'none',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  Total Categories
                </Typography>
                <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {mockDetailedInventory.kpis.totalCategories.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'success.main',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <Iconify icon="solar:arrow-up-linear" width={14} />
                    {mockDetailedInventory.kpis.totalCategories.change}
                  </Typography>
                </Stack>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  p: 2,
                  boxShadow: 'none',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  High Demand Count
                </Typography>
                <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {mockDetailedInventory.kpis.highDemand.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'success.main',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <Iconify icon="solar:arrow-up-linear" width={14} />
                    {mockDetailedInventory.kpis.highDemand.change}
                  </Typography>
                </Stack>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  p: 2,
                  boxShadow: 'none',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  Low Utilization Count
                </Typography>
                <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {mockDetailedInventory.kpis.lowUtilization.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'success.main',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <Iconify icon="solar:arrow-down-linear" width={14} />
                    {mockDetailedInventory.kpis.lowUtilization.change}
                  </Typography>
                </Stack>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  p: 2,
                  boxShadow: 'none',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  Dead Stock %
                </Typography>
                <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {mockDetailedInventory.kpis.deadStock.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'success.main',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <Iconify icon="solar:arrow-down-linear" width={14} />
                    {mockDetailedInventory.kpis.deadStock.change}
                  </Typography>
                </Stack>
              </Card>
            </Grid>
          </Grid>

          {/* High Demand Books Section */}
          <Card
            sx={{
              mb: 3,
              boxShadow: 'none',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:star-linear" width={20} sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  High Demand Books
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Sorted by issue count
              </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              <Stack spacing={1.5}>
                {mockDetailedInventory.highDemandBooks.map((book, index) => (
                  <Box
                    key={book.title}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                      transition: theme.transitions.create(['background-color', 'transform']),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {index + 1}. {book.title}
                          </Typography>
                          <Iconify
                            icon={
                              book.trend === 'up'
                                ? 'solar:trending-up-linear'
                                : 'solar:trending-down-linear'
                            }
                            width={16}
                            sx={{ color: book.trend === 'up' ? 'success.main' : 'error.main' }}
                          />
                        </Stack>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', fontWeight: 600 }}
                        >
                          by {book.author}
                        </Typography>
                      </Box>
                      <Stack alignItems="flex-end" spacing={0.5}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {book.issues}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.disabled', fontWeight: 600 }}
                        >
                          issues
                        </Typography>
                      </Stack>
                    </Stack>
                    <Box
                      sx={{
                        mt: 1,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.success.main, 0.08),
                        display: 'inline-block',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'success.dark', fontWeight: 700 }}>
                        📦 {book.recommendation}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Card>

          {/* Low Utilization / Dead Stock Section */}
          <Card
            sx={{
              mb: 3,
              boxShadow: 'none',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify
                  icon="solar:shield-warning-linear"
                  width={20}
                  sx={{ color: 'warning.main' }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Low Utilization / Dead Stock
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Books with minimal usage
              </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              <Stack spacing={1.5}>
                {mockDetailedInventory.lowUtilization.map((book) => (
                  <Box
                    key={book.title}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                      borderLeft: `4px solid ${theme.palette.error.main}`,
                      transition: theme.transitions.create(['background-color', 'transform']),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.error.main, 0.04),
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {book.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', fontWeight: 600 }}
                        >
                          by {book.author}
                        </Typography>
                      </Box>
                      <Stack alignItems="flex-end" spacing={0.5}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>
                          {book.utilization}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.disabled', fontWeight: 600 }}
                        >
                          utilization
                        </Typography>
                      </Stack>
                    </Stack>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', fontWeight: 600, mt: 1, display: 'block' }}
                    >
                      Last issued: {book.lastIssued}
                    </Typography>
                    <Box
                      sx={{
                        mt: 1,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.error.main, 0.08),
                        display: 'inline-block',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'error.dark', fontWeight: 700 }}>
                        ⚠️ {book.recommendation}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Card>

          {/* Category Performance Breakdown */}
          <Card
            sx={{
              mb: 3,
              boxShadow: 'none',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:chart-2-linear" width={20} sx={{ color: 'info.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Category Performance Breakdown
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Issues by category
              </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              <Chart
                type="bar"
                series={[
                  { name: 'Issues', data: mockDetailedInventory.categoryPerformance.issues },
                ]}
                options={categoryChartOptions}
                height={280}
              />
            </Box>
          </Card>

          {/* Procurement Recommendations */}
          <Card
            sx={{
              boxShadow: 'none',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:lightbulb-linear" width={20} sx={{ color: 'warning.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Procurement Recommendations
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ p: 2 }}>
              <Stack spacing={1.5}>
                {mockDetailedInventory.procurementRecommendations.map((rec) => {
                  const priorityColor =
                    rec.priority === 'high'
                      ? theme.palette.error.main
                      : rec.priority === 'medium'
                        ? theme.palette.warning.main
                        : theme.palette.info.main;

                  return (
                    <Box
                      key={rec.category}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        border: `1px solid ${alpha(priorityColor, 0.2)}`,
                        borderLeft: `4px solid ${priorityColor}`,
                        transition: theme.transitions.create(['background-color', 'transform']),
                        '&:hover': {
                          bgcolor: alpha(priorityColor, 0.04),
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {rec.category}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: 'text.secondary', fontWeight: 600, mt: 0.5 }}
                          >
                            {rec.action}
                          </Typography>
                        </Box>
                        <Stack alignItems="flex-end" spacing={0.5}>
                          <Box
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              bgcolor: alpha(priorityColor, 0.12),
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: priorityColor,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                              }}
                            >
                              {rec.priority}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: 'text.primary' }}
                          >
                            {rec.budget}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Card>
        </Box>
      </Scrollbar>
    </Drawer>
  );
};

export default InventoryIntelligenceDrawer;
