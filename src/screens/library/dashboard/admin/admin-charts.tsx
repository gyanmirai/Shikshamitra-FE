import type { IColumn } from 'src/components/customizabaleTable/types';
import type { LibraryDashboardOverview } from 'src/redux/library/library-adapters';

import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import React, { useState, useCallback } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import { Chart, useChart, ChartSelect } from 'src/components/chart';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Grid, Link, Card, Stack, Typography, CardHeader, IconButton } from '@mui/material';

// Mock data for Admin-specific charts
const mockCategoryDistribution = {
  series: [450, 280, 520, 350, 180],
  categories: ['Fiction', 'Non-Fiction', 'Textbooks', 'Reference', 'Magazines'],
};

// Mock member borrowing data for each book
const mockMemberBorrowingData: Record<string, any[]> = {
  'The Great Gatsby': [
    {
      memberName: 'Rahul Sharma',
      memberId: 'LIB001',
      bookTitle: 'The Great Gatsby',
      issueDate: '2024-02-01',
      returnDate: '2024-02-15',
      status: 'Returned',
    },
    {
      memberName: 'Priya Patel',
      memberId: 'LIB002',
      bookTitle: 'The Great Gatsby',
      issueDate: '2024-02-05',
      returnDate: '2024-02-19',
      status: 'Returned',
    },
    {
      memberName: 'Amit Kumar',
      memberId: 'LIB003',
      bookTitle: 'The Great Gatsby',
      issueDate: '2024-02-10',
      returnDate: '2024-02-24',
      status: 'Returned',
    },
    {
      memberName: 'Sneha Reddy',
      memberId: 'LIB004',
      bookTitle: 'The Great Gatsby',
      issueDate: '2024-02-12',
      returnDate: '-',
      status: 'Issued',
    },
    {
      memberName: 'Vikram Singh',
      memberId: 'LIB005',
      bookTitle: 'The Great Gatsby',
      issueDate: '2024-02-14',
      returnDate: '-',
      status: 'Issued',
    },
  ],
  'Clean Code': [
    {
      memberName: 'Ananya Desai',
      memberId: 'LIB006',
      bookTitle: 'Clean Code',
      issueDate: '2024-01-28',
      returnDate: '2024-02-11',
      status: 'Returned',
    },
    {
      memberName: 'Rohan Gupta',
      memberId: 'LIB007',
      bookTitle: 'Clean Code',
      issueDate: '2024-02-03',
      returnDate: '2024-02-17',
      status: 'Returned',
    },
    {
      memberName: 'Kavya Iyer',
      memberId: 'LIB008',
      bookTitle: 'Clean Code',
      issueDate: '2024-02-08',
      returnDate: '-',
      status: 'Issued',
    },
    {
      memberName: 'Arjun Mehta',
      memberId: 'LIB009',
      bookTitle: 'Clean Code',
      issueDate: '2024-02-11',
      returnDate: '-',
      status: 'Issued',
    },
  ],
  'Brief History of Time': [
    {
      memberName: 'Divya Nair',
      memberId: 'LIB010',
      bookTitle: 'Brief History of Time',
      issueDate: '2024-01-25',
      returnDate: '2024-02-08',
      status: 'Returned',
    },
    {
      memberName: 'Karan Joshi',
      memberId: 'LIB011',
      bookTitle: 'Brief History of Time',
      issueDate: '2024-02-01',
      returnDate: '2024-02-15',
      status: 'Returned',
    },
    {
      memberName: 'Pooja Verma',
      memberId: 'LIB012',
      bookTitle: 'Brief History of Time',
      issueDate: '2024-02-06',
      returnDate: '-',
      status: 'Issued',
    },
  ],
  'The Alchemist': [
    {
      memberName: 'Sanjay Rao',
      memberId: 'LIB013',
      bookTitle: 'The Alchemist',
      issueDate: '2024-01-30',
      returnDate: '2024-02-13',
      status: 'Returned',
    },
    {
      memberName: 'Neha Kapoor',
      memberId: 'LIB014',
      bookTitle: 'The Alchemist',
      issueDate: '2024-02-04',
      returnDate: '2024-02-18',
      status: 'Returned',
    },
    {
      memberName: 'Aditya Pillai',
      memberId: 'LIB015',
      bookTitle: 'The Alchemist',
      issueDate: '2024-02-09',
      returnDate: '-',
      status: 'Issued',
    },
    {
      memberName: 'Riya Bansal',
      memberId: 'LIB016',
      bookTitle: 'The Alchemist',
      issueDate: '2024-02-13',
      returnDate: '-',
      status: 'Issued',
    },
  ],
  'Python Basics': [
    {
      memberName: 'Manish Agarwal',
      memberId: 'LIB017',
      bookTitle: 'Python Basics',
      issueDate: '2024-02-02',
      returnDate: '2024-02-16',
      status: 'Returned',
    },
    {
      memberName: 'Shreya Malhotra',
      memberId: 'LIB018',
      bookTitle: 'Python Basics',
      issueDate: '2024-02-07',
      returnDate: '-',
      status: 'Issued',
    },
    {
      memberName: 'Varun Saxena',
      memberId: 'LIB019',
      bookTitle: 'Python Basics',
      issueDate: '2024-02-10',
      returnDate: '-',
      status: 'Issued',
    },
  ],
};

const mockInventoryInsights = {
  topIssued: [
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', count: 45, trend: 'up' },
    { title: 'Clean Code', author: 'Robert C. Martin', count: 38, trend: 'up' },
    { title: 'Brief History of Time', author: 'Stephen Hawking', count: 32, trend: 'down' },
    { title: 'The Alchemist', author: 'Paulo Coelho', count: 28, trend: 'up' },
    { title: 'Python Basics', author: 'H. Harris', count: 25, trend: 'down' },
  ],
  lowUtilization: [
    {
      title: 'Advanced Fortran',
      author: 'B. Metcalfe',
      lastIssued: '0 issues in 6 months',
      utilization: '2%',
    },
    {
      title: 'Cobol Programming',
      author: 'G. Hopper',
      lastIssued: '1 year ago',
      utilization: '5%',
    },
    { title: '2005 Periodicals', author: 'Archive', lastIssued: '6 months ago', utilization: '8%' },
  ],
};

const mockMemberActivity = {
  series: [
    {
      name: '2023',
      data: [
        {
          name: 'Books Issued',
          data: [120, 150, 180, 210, 195, 225, 240, 230, 215, 200, 185, 220],
        },
      ],
    },
    {
      name: '2024',
      data: [
        {
          name: 'Books Issued',
          data: [135, 165, 195, 225, 210, 245, 260, 250, 235, 220, 205, 240],
        },
      ],
    },
  ],
  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

// Mock data from Librarian
const mockWeeklyCirculation = {
  series: [
    {
      name: 'This Week',
      data: [
        { name: 'Issued', data: [45, 58, 52, 41, 68, 35, 42] },
        { name: 'Returned', data: [38, 42, 45, 39, 44, 38, 40] },
      ],
    },
    {
      name: 'This Month',
      data: [
        {
          name: 'Issued',
          data: [210, 245, 195, 220, 235, 260, 215, 240, 225, 250, 230, 210],
        },
        {
          name: 'Returned',
          data: [180, 210, 175, 190, 205, 230, 195, 215, 200, 225, 205, 190],
        },
      ],
    },
  ],
  weekCategories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  monthCategories: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
};

const mockSectionBooks = {
  series: [
    {
      name: 'Section A',
      data: [
        { name: 'Shelf 1', data: [85], capacity: 100 },
        { name: 'Shelf 2', data: [42], capacity: 100 },
        { name: 'Shelf 3', data: [75], capacity: 100 },
        { name: 'Shelf 4', data: [20], capacity: 100 },
        { name: 'Shelf 5', data: [95], capacity: 100 },
      ],
    },
    {
      name: 'Section B',
      data: [
        { name: 'Shelf 1', data: [60], capacity: 100 },
        { name: 'Shelf 2', data: [50], capacity: 100 },
        { name: 'Shelf 3', data: [30], capacity: 100 },
        { name: 'Shelf 4', data: [80], capacity: 100 },
        { name: 'Shelf 5', data: [70], capacity: 100 },
      ],
    },
  ],
};

// Top Book Categories Chart (Progress Bar Style)
export const CategoryDistributionChart = ({
  overview,
}: {
  overview?: LibraryDashboardOverview;
}) => {
  const theme = useTheme();

  const categorySource = overview?.categoryDistribution?.length
    ? overview.categoryDistribution.map((item: any) => ({
        category: item.categoryName,
        count: item.copyCount,
      }))
    : [];

  const sortedData = categorySource.sort((a: any, b: any) => b.count - a.count);

  const totalBooks = sortedData.reduce((sum: number, item: any) => sum + item.count, 0);

  // Insights summary
  const largestCategory = sortedData[0] || { category: 'No category', count: 0 };
  const smallestCategory = sortedData[sortedData.length - 1] || {
    category: 'No category',
    count: 0,
  };
  const totalCategories = sortedData.length;

  return (
    <Card
      sx={{
        height: '100%',
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <CardHeader
        title="Top Book Categories"
        subheader="Distribution by inventory count"
        sx={{ mt: -1, ml: -1 }}
      />

      {sortedData.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No category inventory available.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Insight Summary */}
          <Box
            sx={{
              mx: 1,
              mb: 1,
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 4 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Largest Category
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {largestCategory.category}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {fNumber(largestCategory.count)} books
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Smallest Category
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {smallestCategory.category}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {fNumber(smallestCategory.count)} books
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Total Categories
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {totalCategories}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {fNumber(totalBooks)} books total
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          {/* Progress Bar List */}
          <Box sx={{ px: 1, pb: 1 }}>
            <Stack spacing={2.5}>
              {sortedData.map((item: any, index: number) => {
                const percentage = totalBooks ? Math.round((item.count / totalBooks) * 100) : 0;
                const isTop = index === 0;

                return (
                  <Box
                    key={item.category}
                    sx={{
                      position: 'relative',
                      transition: theme.transitions.create(['transform', 'box-shadow']),
                      '&:hover': {
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    {/* Category Name and Value Row */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isTop ? 700 : 600,
                          color: isTop ? 'text.primary' : 'text.secondary',
                        }}
                      >
                        {item.category}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                        }}
                      >
                        {fNumber(item.count)}{' '}
                        <Box
                          component="span"
                          sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem' }}
                        >
                          ({percentage}%)
                        </Box>
                      </Typography>
                    </Stack>

                    {/* Progress Bar */}
                    <Box
                      sx={{
                        position: 'relative',
                        height: 10,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.grey[500], 0.08),
                        overflow: 'hidden',
                        cursor: 'pointer',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          height: '100%',
                          width: `${percentage}%`,
                          bgcolor: isTop
                            ? theme.palette.primary.main
                            : alpha(theme.palette.primary.main, 0.7),
                          borderRadius: 1.5,
                          transition: theme.transitions.create(['width', 'background-color'], {
                            duration: 800,
                            easing: 'ease-out',
                          }),
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(90deg, transparent, ${alpha(
                              theme.palette.common.white,
                              0.2
                            )}, transparent)`,
                            animation: 'shimmer 2s infinite',
                          },
                          '@keyframes shimmer': {
                            '0%': { transform: 'translateX(-100%)' },
                            '100%': { transform: 'translateX(100%)' },
                          },
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Legend */}
          <Box
            sx={{
              mx: 3,
              mb: 3,
              pt: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: 0.75,
                  bgcolor: theme.palette.primary.main,
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Largest category
              </Typography>
              <Box sx={{ mx: 2 }}>|</Box>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: 0.75,
                  bgcolor: alpha(theme.palette.primary.main, 0.7),
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Other categories
              </Typography>
            </Stack>
          </Box>
        </>
      )}
    </Card>
  );
};

// Inventory Intelligence (New Section)
const InventoryInsightItem = ({
  title,
  subtitle,
  info,
  status,
  icon,
  trend,
  actionLabel,
  onClick,
}: {
  title: string;
  subtitle: string;
  info: string;
  status: 'info' | 'error' | 'warning';
  icon: string;
  trend?: 'up' | 'down';
  actionLabel: string;
  onClick?: () => void;
}) => {
  const theme = useTheme();

  const getStatusIcon = (s: string) => {
    if (s === 'error') return 'solar:danger-circle-linear';
    if (s === 'warning') return 'solar:clock-circle-linear';
    return 'solar:check-circle-linear';
  };

  const statusColor = theme.palette[status].main;

  return (
    <Box
      sx={{
        mb: 1,
        p: 1,
        borderRadius: 1,
        position: 'relative',
        border: `1px solid ${alpha(statusColor, 0.1)}`,
        borderLeft: `4px solid ${statusColor}`,
        transition: theme.transitions.create(['background-color', 'transform']),
        '&:hover': {
          bgcolor: alpha(statusColor, 0.08),
          transform: 'translateX(4px)',
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify icon={icon} width={24} />
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700 }}>
              {info}
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
            <Iconify icon={getStatusIcon(status)} width={16} sx={{ color: statusColor }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {subtitle}
            </Typography>
          </Stack>

          {actionLabel && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
              <Link
                variant="caption"
                onClick={onClick}
                sx={{
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: 'primary.main',
                  '&:hover': { opacity: 0.8 },
                }}
              >
                {actionLabel}
              </Link>
              {trend && (
                <Iconify
                  icon={trend === 'up' ? 'solar:trending-up-linear' : 'solar:trending-down-linear'}
                  width={14}
                  sx={{ color: trend === 'up' ? 'success.main' : 'error.main' }}
                />
              )}
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export const InventoryIntelligence = ({ overview }: { overview?: LibraryDashboardOverview }) => {
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<string>('');
  const topIssuedBooks = (overview?.popularBooks || []).map((book: any) => ({
    title: book.title,
    author: book.author,
    count: book.issueCount,
  }));
  const lowUtilizationSections = (overview?.sectionInventory || [])
    .filter((section: any) => section.copyCount > 0 && section.utilizationRate <= 10)
    .map((section: any) => ({
      title: section.sectionName,
      utilization: `${Math.round(section.utilizationRate)}% utilization`,
      info: `${section.copyCount} copies`,
    }));

  // Define table columns for member borrowing data
  const memberColumns: IColumn[] = [
    {
      id: 'memberName',
      label: 'Member Name',
      minWidth: 150,
      isSort: true,
      filterType: 'string',
    },
    {
      id: 'memberId',
      label: 'Member ID',
      minWidth: 120,
      isSort: true,
      filterType: 'string',
    },
    {
      id: 'bookTitle',
      label: 'Book Title',
      minWidth: 180,
      isSort: true,
      filterType: 'string',
    },
    {
      id: 'issueDate',
      label: 'Issue Date',
      minWidth: 120,
      isSort: true,
      filterType: 'date',
    },
    {
      id: 'returnDate',
      label: 'Return Date',
      minWidth: 120,
      isSort: true,
      filterType: 'date',
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      isSort: true,
      filterType: 'enum',
      enumOptions: [
        { label: 'Issued', value: 'Issued' },
        { label: 'Returned', value: 'Returned' },
      ],
      render: (value: string) => (
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            display: 'inline-block',
            bgcolor:
              value === 'Issued'
                ? alpha(theme.palette.info.main, 0.12)
                : alpha(theme.palette.success.main, 0.12),
            color: value === 'Issued' ? theme.palette.info.dark : theme.palette.success.dark,
            fontWeight: 700,
            fontSize: '0.75rem',
          }}
        >
          {value}
        </Box>
      ),
    },
  ];

  const handleViewDetails = (bookTitle: string) => {
    setSelectedBook(bookTitle);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedBook('');
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <CardHeader
          title={
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="h6">Inventory Intelligence</Typography>
              <CustomTooltip
                title="Insights on most issued books and slow-moving inventory"
                placement="top"
              >
                <IconButton size="small" sx={{ p: 0 }}>
                  <Iconify
                    icon="solar:info-circle-linear"
                    width={18}
                    sx={{ color: 'text.disabled' }}
                  />
                </IconButton>
              </CustomTooltip>
            </Stack>
          }
          subheader="Usage analytics & procurement insights"
          sx={{ mb: 1, mt: -1, ml: -1 }}
        />

        <Box sx={{ p: 1, pb: 2 }}>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Iconify icon="solar:star-linear" width={20} sx={{ color: 'primary.main' }} />
                <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.disabled' }}>
                  High Demand Books
                </Typography>
              </Stack>

              <Scrollbar sx={{ height: 400, pr: 1 }}>
                <Stack spacing={0}>
                  {topIssuedBooks.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                      No circulation demand data yet.
                    </Typography>
                  ) : (
                    topIssuedBooks.map((book: any) => (
                      <InventoryInsightItem
                        key={book.title}
                        title={book.title}
                        subtitle={`by ${book.author}`}
                        info={`${book.count} issues`}
                        status="info"
                        icon="solar:book-2-linear"
                        actionLabel=""
                        onClick={() => handleViewDetails(book.title)}
                      />
                    ))
                  )}
                </Stack>
              </Scrollbar>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Iconify
                  icon="solar:shield-warning-linear"
                  width={20}
                  sx={{ color: 'warning.main' }}
                />
                <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.disabled' }}>
                  Low Utilization / Dead Stock
                </Typography>
              </Stack>

              <Scrollbar sx={{ height: 400, pr: 1 }}>
                <Stack spacing={0}>
                  {lowUtilizationSections.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                      No low-utilization sections found.
                    </Typography>
                  ) : (
                    lowUtilizationSections.map((section: any) => (
                      <InventoryInsightItem
                        key={section.title}
                        title={section.title}
                        subtitle={section.utilization}
                        info={section.info}
                        status="warning"
                        icon="solar:shield-warning-linear"
                        actionLabel=""
                      />
                    ))
                  )}
                </Stack>
              </Scrollbar>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Member Borrowing Details Dialog */}
      <CustomDialog
        open={dialogOpen}
        handleClose={handleCloseDialog}
        title={`Member Borrowing Details - ${selectedBook}`}
        maxWidth="lg"
        hasForm={false}
      >
        <DialogScrollContent>
          <CustomizableTable
            columns={memberColumns}
            data={mockMemberBorrowingData[selectedBook] || []}
            tableId="member-borrowing-table"
            isPagination
            isSearch
            isFilter
          />
        </DialogScrollContent>
      </CustomDialog>
    </>
  );
};

// Member Activity Trend Chart
export const MemberActivityChart = ({ overview }: { overview?: LibraryDashboardOverview }) => {
  const theme = useTheme();
  const memberActivityData = overview?.weeklyCirculation?.length
    ? {
        series: [
          {
            name: 'Current Week',
            data: [
              {
                name: 'Books Issued',
                data: overview.weeklyCirculation.map((point: any) => point.issued),
              },
            ],
          },
        ],
        categories: overview.weeklyCirculation.map((point: any) => point.label),
      }
    : {
        series: [
          {
            name: 'Current Week',
            data: [{ name: 'Books Issued', data: [0, 0, 0, 0, 0, 0, 0] }],
          },
        ],
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      };
  const [selectedYear, setSelectedYear] = useState(memberActivityData.series[0].name);

  const chartColors = [theme.palette.primary.main];

  const currentYearData = memberActivityData.series.find((y) => y.name === selectedYear);

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: {
      categories: memberActivityData.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    stroke: { width: 3, curve: 'smooth' },
    markers: { size: 4, strokeColors: theme.palette.background.paper, strokeWidth: 2 },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => `${fNumber(value)} books`,
      },
    },
    yaxis: {
      title: { text: undefined }, // Clean look
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
    },
  });

  const handleChangeYear = useCallback((newValue: string) => {
    setSelectedYear(newValue);
  }, []);

  return (
    <Card
      sx={{
        height: '100%',
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <CardHeader
        sx={{ mt: -1, ml: -1 }}
        title="Member Activity Trend"
        subheader="Books issued over time"
        action={
          <ChartSelect
            options={memberActivityData.series.map((item) => item.name)}
            value={selectedYear}
            onChange={handleChangeYear}
          />
        }
      />
      <Chart
        type="line"
        series={currentYearData?.data}
        options={chartOptions}
        height={340}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
};

// Weekly Circulation Chart
export const WeeklyCirculationChart = ({ overview }: { overview?: LibraryDashboardOverview }) => {
  const theme = useTheme();
  const [selectedRange, setSelectedRange] = useState('This Week');
  const weeklyPoints = overview?.weeklyCirculation?.length
    ? overview.weeklyCirculation
    : [
        { label: 'Mon', issued: 0, returned: 0 },
        { label: 'Tue', issued: 0, returned: 0 },
        { label: 'Wed', issued: 0, returned: 0 },
        { label: 'Thu', issued: 0, returned: 0 },
        { label: 'Fri', issued: 0, returned: 0 },
        { label: 'Sat', issued: 0, returned: 0 },
        { label: 'Sun', issued: 0, returned: 0 },
      ];
  const weeklyCirculation = {
    series: [
      {
        name: 'This Week',
        data: [
          { name: 'Issued', data: weeklyPoints.map((point: any) => point.issued) },
          { name: 'Returned', data: weeklyPoints.map((point: any) => point.returned) },
        ],
      },
    ],
    categories: weeklyPoints.map((point: any) => point.label),
  };
  const netCirculation =
    (overview?.circulation.issuesThisWeek || 0) - (overview?.circulation.returnsThisWeek || 0);

  // Restore vibrant colors
  const chartColors = [theme.palette.primary.main, theme.palette.info.main];

  const currentData = weeklyCirculation.series.find((w) => w.name === selectedRange);

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: {
      categories: weeklyCirculation.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    stroke: { width: 3, curve: 'smooth' },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.1, opacityTo: 0.05 } },
    legend: { position: 'top', horizontalAlign: 'right' },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => `${fNumber(value)} transactions`,
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

  const handleChangeRange = useCallback((newValue: string) => {
    setSelectedRange(newValue);
  }, []);

  return (
    <Card
      sx={{
        height: '100%',
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: -1, mt: -1 }}>
            <Typography variant="h6">Circulation Overview</Typography>
            <CustomTooltip
              title="Track book issuance and returns over weekly or monthly periods"
              placement="top"
            >
              <IconButton size="small" sx={{ p: 0 }}>
                <Iconify
                  icon="solar:info-circle-linear"
                  width={18}
                  sx={{ color: 'text.disabled' }}
                />
              </IconButton>
            </CustomTooltip>
          </Stack>
        }
        subheader={`Net circulation: ${netCirculation >= 0 ? '+' : ''}${netCirculation}`}
        action={
          <ChartSelect
            options={weeklyCirculation.series.map((item) => item.name)}
            value={selectedRange}
            onChange={handleChangeRange}
          />
        }
      />
      <Box sx={{ mt: 3, mx: 3 }} dir="ltr">
        <Chart type="area" series={currentData?.data} options={chartOptions} height={345} />
      </Box>
    </Card>
  );
};

// Section-wise Book Count Chart (Shelf Health)
export const SectionBooksChart = ({ overview }: { overview?: LibraryDashboardOverview }) => {
  const theme = useTheme();
  const sectionBooks = overview?.sectionInventory?.length
    ? {
        series: [
          {
            name: 'All Sections',
            data: overview.sectionInventory.map((section: any) => ({
              name: section.sectionName,
              data: [Math.round(section.utilizationRate)],
              capacity: 100,
            })),
          },
        ],
      }
    : {
        series: [
          {
            name: 'All Sections',
            data: [{ name: 'No inventory', data: [0], capacity: 100 }],
          },
        ],
      };
  const [selectedSection, setSelectedSection] = useState(sectionBooks.series[0].name);

  const currentSectionData = sectionBooks.series.find((s) => s.name === selectedSection);

  const categories = currentSectionData?.data.map((item: any) => item.name) || [];
  const seriesData = currentSectionData?.data.map((item: any) => item.data[0]) || [];

  const chartOptions = useChart({
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: theme.palette.text.secondary, fontWeight: 500 } },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: '40%',
        distributed: true,
      },
    } as any,
    colors: seriesData.map((val: number) => {
      // Functional color only: Error for > 85%, else Neutral/Gray
      if (val > 85) return theme.palette.error.main;
      if (val > 60) return theme.palette.warning.main;
      return theme.palette.primary.main;
    }),
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}%`,
      style: { fontSize: '10px' },
    },
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (value: number) => `${value}% Capacity Used`,
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
    },
    yaxis: {
      max: 100,
      labels: { style: { colors: theme.palette.text.secondary } },
    },
  });

  const handleChangeSection = useCallback((newValue: string) => {
    setSelectedSection(newValue);
  }, []);

  return (
    <Card
      sx={{
        height: '100%',
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: -1, mt: -1 }}>
            <Typography variant="h6">Shelf Health Monitoring</Typography>
            <CustomTooltip
              title="Monitor shelf capacity and utilization across sections"
              placement="top"
            >
              <IconButton size="small" sx={{ p: 0 }}>
                <Iconify
                  icon="solar:info-circle-linear"
                  width={18}
                  sx={{ color: 'text.disabled' }}
                />
              </IconButton>
            </CustomTooltip>
          </Stack>
        }
        subheader="Capacity utilization per shelf"
        action={
          <ChartSelect
            options={sectionBooks.series.map((item) => item.name)}
            value={selectedSection}
            onChange={handleChangeSection}
          />
        }
      />
      <Chart
        type="bar"
        series={[{ name: 'Utilization', data: seriesData }]}
        options={chartOptions}
        height={340}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
};

// Main Admin Charts Component
const AdminCharts = () => (
  <Grid container spacing={3}>
    <Grid size={{ xs: 12, md: 8 }}>
      <WeeklyCirculationChart />
    </Grid>

    <Grid size={{ xs: 12, md: 4 }}>
      <MemberActivityChart />
    </Grid>

    <Grid size={{ xs: 12, md: 6 }}>
      <CategoryDistributionChart />
    </Grid>

    <Grid size={{ xs: 12, md: 6 }}>
      <SectionBooksChart />
    </Grid>
  </Grid>
);

export default AdminCharts;
