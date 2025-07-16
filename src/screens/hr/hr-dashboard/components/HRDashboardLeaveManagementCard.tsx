import type { LabelColor } from 'src/components/label';

import PersonIcon from '@mui/icons-material/Person';
import { red, pink, blue } from '@mui/material/colors';
import { Box, Card, Stack, Avatar, Button, Divider, Typography } from '@mui/material';

import {
  EmployeeAttendanceStatus,
  EmployeeAttendanceStatusColor,
} from 'src/enums/employee-attendance-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';

const leaveTypes = [
  {
    label: 'Sick Leave',
    count: 12,
    percentage: '52.2%',
    color: pink[500],
  },
  {
    label: 'Casual Leave',
    count: 8,
    percentage: '34.2%',
    color: blue[500],
  },
  {
    label: 'Paid Leave',
    count: 8,
    percentage: '34.2%',
    color: red[200],
  },
];

const recentRequests = [
  {
    name: 'Kanwar Rajan',
    type: 'Sick Leave',
    days: '2 Days',
    status: EmployeeAttendanceStatus.HalfDayLeave, // 1
  },
  {
    name: 'Kumar Rajes',
    type: 'Sick Leave',
    days: '2 Days',
    status: EmployeeAttendanceStatus.Present, // 0
  },
  {
    name: 'Jinjala Dharmik',
    type: 'Casual Leave',
    days: '2 Days',
    status: EmployeeAttendanceStatus.All, // 3
  },
];
export default function LeaveManagementCard() {
  return (
    <Card sx={{ borderRadius: 3, p: 2, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          Leave Management
        </Typography>
        <Stack direction="row" spacing={1}>
          <Label color="warning" variant="soft">
            Pending : 5
          </Label>
          {/* <Chip label="Pending: 5" size="small" color="warning" /> */}
          <Label color="success" variant="soft">
            Approved : 12
          </Label>
        </Stack>
      </Box>

      {/* Leave Types */}
      <Box display="flex" justifyContent="space-between" mb={1}>
        {leaveTypes.map((type, i) => (
          <Box
            key={i}
            p={1}
            width={170}
            border="1px solid"
            borderColor="grey.400"
            borderRadius={1}
            bgcolor="grey.50"
            display="flex"
            gap={1.5}
            alignItems="center"
          >
            {/* <Box mt={1}> */}
            <SubjectColorIndicator color={type.color} />
            {/* </Box> */}
            <Box>
              <Typography variant="body2" color="text.secondary">
                {type.label}
              </Typography>
              <Typography variant="subtitle2" fontWeight={600}>
                {type.count}{' '}
                <Typography component="span" variant="caption" color="text.secondary">
                  ({type.percentage})
                </Typography>
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Typography variant="subtitle2" fontWeight={600} mb={1}>
        Recent Requests
      </Typography>

      {/* Recent Requests */}
      <Stack spacing={2}>
        {recentRequests.map((req, i) => (
          <Box key={i} display="flex" alignItems="center">
            <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
              <PersonIcon fontSize="small" />
            </Avatar>
            <Box flex={1}>
              <Typography variant="body2" fontWeight={500}>
                {req.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {req.type} • {req.days}
              </Typography>
            </Box>
            <Label color={EmployeeAttendanceStatusColor[req.status] as LabelColor} variant="soft">
              {EmployeeAttendanceStatus[req.status]}
            </Label>
          </Box>
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Box textAlign="right">
        <Button size="small" endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} />}>
          View All Requests
        </Button>
      </Box>
    </Card>
  );
}
