import React from 'react';

import {
  Card,
  Grid,
  Table,
  Paper,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  Typography,
  CardContent,
  TableContainer,
} from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar/scrollbar';

const PayrollOverviewTeacherDashboard = () => {
  const earnings = [
    { name: 'Basic Salary', amount: '₹50,000' },
    { name: 'House Rent Allowance', amount: '₹10,000' },
    { name: 'Transport Allowance', amount: '₹5,000' },
    { name: 'Basic Salary', amount: '₹50,000' },
    { name: 'House Rent Allowance', amount: '₹10,000' },
    { name: 'Transport Allowance', amount: '₹5,000' },
  ];

  const deductions = [
    { name: 'Income Tax', amount: '₹5,000' },
    { name: 'Provident Fund', amount: '₹3,000' },
    { name: 'Health Insurance', amount: '₹2,000' },
  ];

  const netSalary = 55000;

  return (
    <Card sx={{ boxShadow: 3, height: '500px' }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Grid container spacing={3}>
          {/* Earnings on the Left */}
          <Grid item xs={6}>
            <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
              Earnings
            </Typography>
            <TableContainer component={Paper}>
              <Scrollbar sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                <Table aria-label="earnings table">
                  <TableBody>
                    {earnings.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">{item.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          </Grid>

          {/* Deductions on the Right */}
          <Grid item xs={6}>
            <Typography variant="h6" color="error" fontWeight="bold" gutterBottom>
              Deductions
            </Typography>
            <TableContainer component={Paper}>
              <Scrollbar sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                <Table aria-label="deductions table">
                  <TableBody>
                    {deductions.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">{item.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          </Grid>
        </Grid>

        {/* Divider for Clean Separation */}
        <Divider sx={{ my: 2 }} />

        {/* Net Salary Section */}
        <Grid container justifyContent="flex-end" alignItems="center" spacing={2}>
          <Grid item>
            <Typography variant="h6" fontWeight="bold">
              Net Salary:
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="h5" color="green" fontWeight="bold">
              ₹{netSalary}
            </Typography>
          </Grid>
        </Grid>

        {/* Amount in Words Section */}
        {/* <Grid container justifyContent="flex-end" mt={2}>
                    <Grid item>
                        <Typography variant="body1" fontStyle="italic">
                            ({numberToWords(netSalary)} only)
                        </Typography>
                    </Grid>
                </Grid> */}
      </CardContent>
    </Card>
  );
};

export default PayrollOverviewTeacherDashboard;
