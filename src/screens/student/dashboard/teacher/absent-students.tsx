import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizable-table/types';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizable-table';
import {
  Box,
  Card,
  Stack,
  Avatar,
  Tooltip,
  CardHeader,
  Typography,
  IconButton,
} from '@mui/material';

// ----------------------------------------------------------------------

const absentStudents = [
  {
    id: 1,
    name: 'Kavita Roy',
    reason: 'Uninformed',
    status: 'uninformed', // Red
    attendance: 82,
    trend: [1, 1, 1, 0, 0], // 1 = Present, 0 = Absent
    avatarUrl: '',
    class: '5-A',
  },
  {
    id: 2,
    name: 'Manoj Kumar',
    reason: 'Sick Leave',
    status: 'approved', // Green
    attendance: 90,
    trend: [1, 1, 0, 1, 0],
    avatarUrl: '',
    class: '5-A',
  },
  {
    id: 3,
    name: 'Sina Khan',
    reason: 'Family Function',
    status: 'approved',
    attendance: 88,
    trend: [1, 0, 1, 1, 0],
    avatarUrl: '',
    class: '5-A',
  },
];

const MiniTrend = ({ data }: { data: number[] }) => (
  <Stack direction="row" spacing={0.5} alignItems="center">
    {data.map((val, index) => (
      <Tooltip key={index} title={val === 1 ? 'Present' : 'Absent'} arrow placement="top">
        <Box
          sx={{
            width: 4,
            height: 16,
            borderRadius: 1,
            bgcolor: val === 1 ? 'success.main' : 'error.main',
          }}
        />
      </Tooltip>
    ))}
  </Stack>
);

const AbsentStudents = () => {
  // Class & Division state (same pattern as SubjectPassFailChart)
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  useEffect(() => {
    const currentClass = allClass.find((org: Standards) => org?.id === classes);
    setAllDivision(currentClass?.divisions || []);
    setDivision(currentClass?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Student',
        render: (value, row) => (
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar src={row.avatarUrl} alt={row.name} sx={{ width: 40, height: 40 }} />
            <Box>
              <Typography variant="subtitle2" noWrap>
                {row.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 13 }}>
                {row.class} • {row.attendance}% Attendance
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        id: 'reason',
        label: 'Reason',
        render: (value, row) => (
          <Label
            variant="soft"
            color={
              row.status === 'approved'
                ? 'success'
                : row.status === 'uninformed'
                  ? 'error'
                  : 'warning'
            }
          >
            {row.reason}
          </Label>
        ),
      },
      {
        id: 'trend',
        label: 'Last 5 Days',
        render: (value, row) => (
          <Stack spacing={0.5} alignItems="flex-start">
            <MiniTrend data={row.trend} />
          </Stack>
        ),
      },
      {
        id: 'action',
        label: 'Action',
        sticky: true,
        render: (value, row) => (
          <Tooltip title="Call Parent">
            <IconButton size="small" sx={{ color: 'primary.main', bgcolor: 'primary.lighter' }}>
              <Iconify icon="mdi:phone" width={18} />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    []
  );

  return (
    <Card
      sx={{
        mb: 1,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[8],
          transition: 'all 0.3s ease-in-out',
        },
      }}
    >
      <CardHeader
        sx={{ ml: -1, mt: -1 }}
        title="Absent Students Today"
        subheader="3 Students Absent"
        action={
          <Box sx={{ display: 'flex', gap: 2, mr: 1 }}>
            <CustomSelect
              options={allClass}
              label="Class"
              value={classes}
              onChange={(val) => setClasses(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: '90px' } }}
            />
            <CustomSelect
              options={allDivision}
              label="Division"
              value={division}
              onChange={(val) => setDivision(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: '90px' } }}
              disabled={!classes}
            />
          </Box>
        }
      />
      <Box sx={{ p: 1 }}>
        <CustomizableTable
          tableId="absent-students-table"
          noDataText="No absent students today"
          columns={columns}
          data={absentStudents}
          isPagination={false}
          isFilter={false}
          isShowedDense={false}
        />
      </Box>
    </Card>
  );
};

export default AbsentStudents;
