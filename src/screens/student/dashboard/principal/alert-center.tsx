import { useTheme } from '@mui/material/styles';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Chart, useChart } from 'src/components/chart';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Card, Chip, Grid, Stack, Button, CardHeader, Typography } from '@mui/material';

import ClassDivisionFilter from './class-division-filter';

// ----------------------------------------------------------------------

const renderInfoTooltip = (title: string, tooltipText: string) => (
  <Stack direction="row" alignItems="center" spacing={1}>
    <Box component="span">{title}</Box>
    <CustomTooltip title={tooltipText} arrow placement="top">
      <Iconify
        icon="eva:info-outline"
        width={18}
        sx={{ color: 'text.disabled', cursor: 'pointer' }}
      />
    </CustomTooltip>
  </Stack>
);

type AlertType = 'absent' | 'academic' | 'finance' | 'doc' | 'health' | 'leave';

interface StudentDetail {
  id: string;
  name: string;
  class: string;
  reason?: string;
  date?: string;
  status?: string;
}

interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  count: number;
  severity: 'high' | 'medium';
  // details: string[]; // Replacing simple string array with structured data for table
  studentData: StudentDetail[];
}

const initialAlerts: AlertItem[] = [
  {
    id: '1',
    type: 'absent',
    title: 'Students absent > 3 consecutive days',
    count: 12,
    severity: 'high',
    studentData: [
      {
        id: 'S1',
        name: 'Amit Patel',
        class: '10A',
        reason: 'Viral Fever',
        date: '2023-10-25',
        status: 'Absent',
      },
      {
        id: 'S2',
        name: 'Sneha Gupta',
        class: '9B',
        reason: 'Family Function',
        date: '2023-10-24',
        status: 'Absent',
      },
      {
        id: 'S3',
        name: 'Rohan Kumar',
        class: '8C',
        reason: 'Unknown',
        date: '2023-10-26',
        status: 'Absent',
      },
    ],
  },
  {
    id: '2',
    type: 'academic',
    title: 'Students with failing grades',
    count: 8,
    severity: 'high',
    studentData: [
      { id: 'S4', name: 'Rahul Singh', class: '10A', reason: 'Maths (<35%)', status: 'Failing' },
      { id: 'S5', name: 'Priya Sharma', class: '9A', reason: 'Science (<35%)', status: 'Failing' },
    ],
  },
  {
    id: '3',
    type: 'finance',
    title: 'Fee dues pending > 30 days',
    count: 45,
    severity: 'medium',
    studentData: [
      { id: 'S6', name: 'Arjun Das', class: '10B', reason: 'Tuition Fee', status: 'Pending' },
      {
        id: 'S7',
        name: 'Vikram Malhotra',
        class: '8A',
        reason: 'Transport Fee',
        status: 'Pending',
      },
    ],
  },
  {
    id: '4',
    type: 'doc',
    title: 'Incomplete documentation',
    count: 5,
    severity: 'medium',
    studentData: [
      { id: 'S8', name: 'Kavita Roy', class: '1A', reason: 'Aadhar Missing', status: 'Incomplete' },
    ],
  },
  {
    id: '5',
    type: 'health',
    title: 'Health / Medical alerts',
    count: 2,
    severity: 'high',
    studentData: [
      { id: 'S9', name: 'Aarav Jain', class: '5B', reason: 'Severe Allergy', status: 'Critical' },
    ],
  },
  {
    id: '6',
    type: 'leave',
    title: 'Pending leave approvals',
    count: 7,
    severity: 'medium',
    studentData: [
      {
        id: 'S10',
        name: 'Meera Iyer',
        class: '12C',
        reason: 'Sick Leave',
        date: 'Today',
        status: 'Pending',
      },
    ],
  },
];

// ----------------------------------------------------------------------

const AlertItemRow = ({ alert, onView }: { alert: AlertItem; onView: () => void }) => {
  const getIcon = (type: AlertType) => {
    switch (type) {
      case 'absent':
        return 'mdi:account-alert';
      case 'academic':
        return 'mdi:alert-decagram';
      case 'finance':
        return 'mdi:cash-remove';
      case 'doc':
        return 'mdi:file-document-alert';
      case 'health':
        return 'mdi:medical-bag';
      case 'leave':
        return 'mdi:account-clock';
      default:
        return 'mdi:alert';
    }
  };

  const getColor = (severity: 'high' | 'medium') => (severity === 'high' ? 'error' : 'warning');

  return (
    <Box
      sx={{
        py: 1.5,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: (theme) => `1px dashed ${theme.palette.divider}`,
        '&:last-child': { borderBottom: 'none' },
        '&:hover': { bgcolor: 'background.neutral' },
        transition: 'background-color 0.2s',
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ flexGrow: 1, overflow: 'hidden' }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            display: 'flex',
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => theme.palette[getColor(alert.severity)].lighter,
            color: (theme) => theme.palette[getColor(alert.severity)].main,
          }}
        >
          <Iconify icon={getIcon(alert.type)} width={24} />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {alert.title}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {alert.severity === 'high' && <Iconify icon="mdi:fire" width={14} color="error.main" />}
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {alert.severity === 'high' ? 'High Priority' : 'Attention Required'} • {alert.count}{' '}
              cases
            </Typography>
          </Stack>
        </Box>
      </Stack>

      <Button
        size="small"
        variant="outlined"
        color="inherit"
        onClick={onView}
        endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
        sx={{ ml: 2, borderColor: 'transparent', bgcolor: 'action.hover' }}
      >
        View
      </Button>
    </Box>
  );
};

// ----------------------------------------------------------------------

const AlertCenter = () => {
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const theme = useTheme();

  const handleClose = () => {
    setSelectedAlert(null);
  };

  // Define columns for the CustomizableTable
  const TABLE_COLUMNS = useMemo(
    () => [
      { id: 'name', label: 'Student Name', isSort: true },
      { id: 'class', label: 'Class', isSort: true },
      { id: 'reason', label: 'Reason / Detail', isSort: true },
      {
        id: 'status',
        label: 'Status',
        sticky: true,
        isSort: true,
        render: (value: any, row: any) => (
          <Chip
            label={value}
            size="small"
            color={
              value === 'Absent' || value === 'Failing' || value === 'Critical'
                ? 'error'
                : 'warning'
            }
            variant="soft"
          />
        ),
      },
    ],
    []
  );

  // Enrollment Trends (Area Chart - Last 6 Months)
  const enrollmentOptions = useChart({
    tooltip: {
      x: { show: false },
      marker: { show: false },
    },
    xaxis: {
      categories: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
  });

  const enrollmentSeries = [{ name: 'New Enrollments', data: [12, 15, 10, 8, 5, 2] }];

  return (
    <>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
              },
            }}
          >
            <CardHeader
              title={
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box component="span">Alert Center</Box>

                    <CustomTooltip
                      title="Real-time alerts for attendance, academics, and administrative issues requiring immediate attention."
                      arrow
                      placement="top"
                    >
                      <Iconify
                        icon="eva:info-outline"
                        width={18}
                        sx={{ color: 'text.disabled', cursor: 'pointer' }}
                      />
                    </CustomTooltip>
                  </Stack>
                  <ClassDivisionFilter />
                </Box>
              }
              sx={{
                '& .MuiCardHeader-title': { typography: 'h6' },
                p: 2,
                pb: 1,
              }}
            />
            <Scrollbar sx={{ maxHeight: 308 }}>
              <Stack sx={{ pb: 1 }}>
                {initialAlerts.map((alert) => (
                  <AlertItemRow
                    key={alert.id}
                    alert={alert}
                    onView={() => setSelectedAlert(alert)}
                  />
                ))}
              </Stack>
            </Scrollbar>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {/* Enrollment Trends */}
          <Card
            sx={{
              height: 370,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
              },
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              {renderInfoTooltip(
                'Enrollment Trends (6M)',
                'Trends of new enrollments over the past 6 months.'
              )}
            </Typography>

            <Box sx={{ flexGrow: 1, minHeight: 120 }}>
              <Chart
                type="area"
                series={enrollmentSeries}
                options={enrollmentOptions}
                height="100%"
              />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog with CustomizableTable */}
      {selectedAlert && (
        <CustomDialog
          open={!!selectedAlert}
          handleClose={handleClose}
          title={selectedAlert.title}
          maxWidth="md"
        >
          <CustomizableTable
            tableId="alert_details_table"
            noDataText="No Alert Details Available"
            columns={TABLE_COLUMNS}
            data={selectedAlert.studentData}
            isSearch
            isPagination
            tableContainerProps={{ sx: { padding: 1 } }}
          />
        </CustomDialog>
      )}
    </>
  );
};

export default AlertCenter;
