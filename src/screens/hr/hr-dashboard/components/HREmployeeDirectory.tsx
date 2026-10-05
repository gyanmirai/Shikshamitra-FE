import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Box,
  Card,
  Chip,
  Table,
  Stack,
  Avatar,
  Button,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  TableContainer,
  InputAdornment,
} from '@mui/material';

const employees = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Science Teacher',
    department: 'Science',
    attendance: 'Present',
    salary: 'Paid',
    avatar: '',
  },
  {
    id: 2,
    name: 'Kunal Patel',
    role: 'Admin Staff',
    department: 'Admin',
    attendance: 'Absent',
    salary: 'Pending',
    avatar: '',
  },
  {
    id: 3,
    name: 'Anjali Sen',
    role: 'English Teacher',
    department: 'English',
    attendance: 'Leave',
    salary: 'Paid',
    avatar: '',
  },
];

const HREmployeeDirectory = () => {
  const [filterRole, setFilterRole] = useState('Teaching');
  const [filterDept, setFilterDept] = useState('Department');
  const [filterStatus, setFilterStatus] = useState('Status');

  return (
    <Card>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h6">Staff Directory</Typography>

        <Stack direction="row" spacing={2} sx={{ flexGrow: 1, justifyContent: 'flex-end' }}>
          <TextField
            select
            size="small"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            sx={{ width: 150 }}
          >
            <MenuItem value="Teaching">Teaching</MenuItem>
            <MenuItem value="Non-Teaching">Non-Teaching</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            sx={{ width: 150 }}
          >
            <MenuItem value="Department">Department</MenuItem>
            <MenuItem value="Science">Science</MenuItem>
            <MenuItem value="Maths">Maths</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ width: 120 }}
          >
            <MenuItem value="Status">Status</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>

          <TextField
            placeholder="Search..."
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Photo</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Attendance</TableCell>
              <TableCell>Salary</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Avatar src={row.avatar} alt={row.name} />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2">{row.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.role}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{row.department}</TableCell>
                <TableCell>
                  <Chip
                    label={row.attendance}
                    color={
                      row.attendance === 'Present'
                        ? 'success'
                        : row.attendance === 'Absent'
                          ? 'error'
                          : 'warning'
                    }
                    size="small"
                    variant="soft"
                  />
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color={row.salary === 'Paid' ? 'success.main' : 'warning.main'}
                    fontWeight="bold"
                  >
                    {row.salary}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Button size="small" endIcon={<KeyboardArrowRightIcon />} color="inherit">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default HREmployeeDirectory;
