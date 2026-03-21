import type { IColumn } from 'src/components/customizable-table/types';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizable-table';
import {
  Box,
  Card,
  Menu,
  Stack,
  Tooltip,
  MenuItem,
  Typography,
  LinearProgress,
} from '@mui/material';

// ----------------------------------------------------------------------

type ClassData = {
  id: string;
  className: string;
  division: string;
  totalStudents: number;
  boys: number;
  girls: number;
  classTeacher: string;
  attendance: number;
  chapterCompleted: number;
  totalChapters: number;
  feesCollected: number;
  capacity: number;
  currentStrength: number;
  healthScore: number;
};

const MOCK_DATA: ClassData[] = [
  {
    id: '1',
    className: 'Class 1',
    division: 'A',
    totalStudents: 45,
    boys: 25,
    girls: 20,
    classTeacher: 'Mrs. Sharma',
    attendance: 88,
    chapterCompleted: 12,
    totalChapters: 15,
    feesCollected: 75,
    capacity: 50,
    currentStrength: 45,
    healthScore: 92,
  },
  {
    id: '2',
    className: 'Class 2',
    division: 'B',
    totalStudents: 52,
    boys: 30,
    girls: 22,
    classTeacher: 'Mr. Verma',
    attendance: 72,
    chapterCompleted: 8,
    totalChapters: 15,
    feesCollected: 40,
    capacity: 50,
    currentStrength: 52,
    healthScore: 58,
  },
  {
    id: '3',
    className: 'Class 3',
    division: 'A',
    totalStudents: 48,
    boys: 24,
    girls: 24,
    classTeacher: 'Ms. Gupta',
    attendance: 95,
    chapterCompleted: 14,
    totalChapters: 15,
    feesCollected: 90,
    capacity: 50,
    currentStrength: 48,
    healthScore: 95,
  },
  {
    id: '4',
    className: 'Class 4',
    division: 'C',
    totalStudents: 30,
    boys: 15,
    girls: 15,
    classTeacher: 'Mrs. Patil',
    attendance: 65,
    chapterCompleted: 5,
    totalChapters: 15,
    feesCollected: 20,
    capacity: 45,
    currentStrength: 30,
    healthScore: 45,
  },
  {
    id: '5',
    className: 'Class 5',
    division: 'A',
    totalStudents: 42,
    boys: 20,
    girls: 22,
    classTeacher: 'Mr. Khan',
    attendance: 82,
    chapterCompleted: 10,
    totalChapters: 15,
    feesCollected: 60,
    capacity: 45,
    currentStrength: 42,
    healthScore: 78,
  },
];

interface ClassOverviewTableProps {
  onRowClick?: (row: ClassData) => void;
}

export default function ClassOverviewTable({ onRowClick }: ClassOverviewTableProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  const getCapacityColor = (current: number, capacity: number): 'error' | 'warning' | 'success' => {
    const percentage = (current / capacity) * 100;
    if (percentage > 100) return 'error';
    if (percentage >= 90) return 'warning';
    return 'success';
  };

  const columns: IColumn[] = [
    {
      id: 'className',
      label: 'Class',
      align: 'left',
      sticky: true,
      render: (value: any, row: any) => (
        <Box>
          <Typography variant="subtitle2">
            {value}/{row.division}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'totalStudents',
      label: 'Students',
      align: 'left',
      render: (value: any, row: any) => (
        <Tooltip title={`Boys: ${row.boys} | Girls: ${row.girls}`}>
          <Typography variant="body2" sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
            {value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      id: 'classTeacher',
      label: 'Class Teacher',
      render: (value: string) => <Typography variant="body2">{value}</Typography>,
    },
    {
      id: 'attendance',
      label: 'Attendance',
      align: 'left',
      minWidth: 150,
      render: (value: number) => (
        <Box sx={{ width: '100%' }}>
          <Stack direction="row" alignItems="left" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography variant="caption">{value}%</Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={value}
            color={value < 75 ? 'error' : 'success'}
            sx={{ height: 6, borderRadius: 1 }}
          />
        </Box>
      ),
    },
    {
      id: 'chapterCompleted',
      label: 'Chapter Progress',
      align: 'left',
      minWidth: 150,
      render: (_: any, row: any) => {
        const progress = (row.chapterCompleted / row.totalChapters) * 100;
        return (
          <Box sx={{ width: '100%' }}>
            <Stack
              direction="row"
              alignItems="left"
              justifyContent="space-between"
              sx={{ mb: 0.5 }}
            >
              <Typography variant="caption">
                {row.chapterCompleted}/{row.totalChapters}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progress}
              color="info"
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Box>
        );
      },
    },
    {
      id: 'feesCollected',
      label: 'Fee Status',
      align: 'left',
      render: (value: number) => (
        <Label color={value === 100 ? 'success' : value > 50 ? 'warning' : 'error'}>
          {value}% Paid
        </Label>
      ),
    },
    {
      id: 'capacity',
      label: 'Capacity',
      align: 'left',
      minWidth: 150,
      render: (_: any, row: any) => {
        const percentage = (row.currentStrength / row.capacity) * 100;
        const color = getCapacityColor(row.currentStrength, row.capacity);
        return (
          <Box sx={{ width: '100%' }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 0.5 }}
            >
              <Typography variant="caption">
                {row.currentStrength}/{row.capacity}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={percentage > 100 ? 100 : percentage}
              color={color}
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Box>
        );
      },
    },
  ];

  return (
    <Card sx={{ p: 1.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
        Class Overview Table
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Manage your classes and track student attendance
      </Typography>
      <CustomizableTable
        tableId="class-overview-table"
        columns={columns}
        data={MOCK_DATA}
        isLoading={false}
        isPagination
        isSearch
        isFilter
        tableContainerProps={{ sx: { maxHeight: 500 } }}
        handleRowClick={(row) => onRowClick && onRowClick(row as ClassData)}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleCloseMenu}>
          <Iconify icon="eva:eye-fill" sx={{ mr: 2 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleCloseMenu}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit Class
        </MenuItem>
        <MenuItem onClick={handleCloseMenu}>
          <Iconify icon="material-symbols:person-add-rounded" sx={{ mr: 2 }} />
          Assign Teacher
        </MenuItem>
      </Menu>
    </Card>
  );
}
