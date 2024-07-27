'use client';

import React from 'react';

import {
  Box,
  Paper,
  Table,
  Switch,
  TableRow,
  TableCell,
  TextField,
  TableHead,
  TableBody,
  Autocomplete,
  TableContainer,
} from '@mui/material';

const options = ['Admin', 'Teacher', 'Parent', 'Student', 'Security'];
const userOptions = ['Parth', 'Jeet', 'Jignesh'];
const Permission = () => {
  const [value, setValue] = React.useState<string | null>(options[0]);
  const [user, setUser] = React.useState<string | null>(userOptions[0]);
  const [inputValue, setInputValue] = React.useState('');

  return (
    <Box>
      <Box display="flex" gap={2}>
        <Autocomplete
          value={value}
          onChange={(event: any, newValue: string | null) => {
            setValue(newValue);
          }}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          id="controllable-states-demo"
          options={options}
          sx={{ width: 300 }}
          size="small"
          renderInput={(params) => <TextField {...params} size="small" label="Select role" />}
        />
        <Autocomplete
          value={user}
          onChange={(event: any, newValue: string | null) => {
            setUser(newValue);
          }}
          // inputValue={inputValue}
          // onInputChange={(event, newInputValue) => {
          //   setInputValue(newInputValue);
          // }}
          id="controllable-states-demo"
          options={userOptions}
          sx={{ width: 300 }}
          size="small"
          renderInput={(params) => (
            <TextField {...params} size="small" label="Select User/Employee" />
          )}
        />
      </Box>
      <br />

      <TableContainer component={Paper} sx={{ '& *': { fontSize: '12px' } }}>
        <Table stickyHeader aria-label="sticky table" size="small">
          <TableHead>
            <TableRow>
              <TableCell>Module</TableCell>
              <TableCell>Sub Module</TableCell>
              <TableCell>View</TableCell>
              <TableCell>Edit</TableCell>
              <TableCell>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>dashboard</TableCell>
              <TableCell>dashboard</TableCell>
              <TableCell>
                <Switch defaultChecked size="small" />
              </TableCell>
              <TableCell>
                <Switch defaultChecked size="small" />
              </TableCell>
              <TableCell>
                <Switch defaultChecked size="small" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell rowSpan={2}>security</TableCell>
              <TableCell>role</TableCell>
              <TableCell>
                <Switch defaultChecked size="small" />
              </TableCell>
              <TableCell>
                <Switch defaultChecked size="small" />
              </TableCell>
              <TableCell>
                <Switch defaultChecked size="small" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>permission</TableCell>
              <TableCell>
                <Switch defaultChecked size="small" />
              </TableCell>
              <TableCell>
                <Switch defaultChecked size="small" />
              </TableCell>
              <TableCell>
                <Switch defaultChecked size="small" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Permission;
