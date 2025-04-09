'use client';

import React from 'react';

import { Box, Grid, Card, Alert, Button, MenuList, MenuItem, Typography } from '@mui/material';

import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const AfterPayrollComponent = () => (
  <>
    <CustomBreadcrumbs
      heading="Run Payroll"
      links={[{ name: 'HR/Staff' }, { name: 'Payroll' }, { name: 'Run Payroll' }]}
      sx={{ px: 1, mb: 2 }}
      description="Use this section to process monthly payroll for employees. Select the year, month, and organization to view and verify payroll details, generate reports, and perform actions like sending salary slips, downloading bank formats, and marking payments as completed."
    />
    <Card sx={{ p: 2 }}>
      <Typography variant="h6">Process Payroll For</Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2, alignItems: 'center' }}>
        <CustomSelect
          label="Year"
          options={[
            { value: '2024', label: '2024' },
            { value: '2023', label: '2023' },
            { value: '2022', label: '2022' },
          ]}
          onChange={() => {}}
          value=""
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
        <CustomSelect
          label="Month"
          options={[
            { value: 'jan', label: 'January' },
            { value: 'feb', label: 'February' },
            { value: 'mar', label: 'March' },
          ]}
          onChange={() => {}}
          value=""
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
        <CustomSelect
          label="Organization"
          options={[
            { value: 'primary', label: 'Primary' },
            { value: 'secondary', label: 'Secondary' },
          ]}
          onChange={() => {}}
          value=""
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />

        {/* Button aligned to the right */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" onClick={() => {}}>
            View Report
          </Button>
          <Button variant="contained" color="primary" onClick={() => {}}>
            View Payroll
          </Button>
          <ThreeDotsActions
            actions={({ popover }) => (
              <MenuList>
                <MenuItem
                  onClick={() => {
                    /* handleSendForReview */ popover.onClose();
                  }}
                >
                  Send for Review
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    /* handleSendSalarySlip */ popover.onClose();
                  }}
                >
                  Send Salary Slip to Employee
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    /* handleDownloadBankFormat */ popover.onClose();
                  }}
                >
                  Download Bank Format
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    /* handleRecordPayment */ popover.onClose();
                  }}
                >
                  Record Payment (Mark as Paid)
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    /* handleRegenerate */ popover.onClose();
                  }}
                >
                  Re-generate
                </MenuItem>
              </MenuList>
            )}
          />
        </Box>
      </Box>
      <Alert variant="outlined" severity="error">
        The Payroll is Overdue by 87 day(s). in case you have paid the employees already. Please
        mark payroll as paid and record the payments.
      </Alert>
    </Card>
    <Card sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6">Employee Paybles</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CustomizableTable
            isFilter={false}
            isShowedDense={false}
            isPagination={false}
            isSearch={false}
            tableId="employee-payble-id"
            columns={[
              {
                id: 'employeePayble',
                label: 'Employee Payble',
                align: 'left',
                render(value, row) {
                  if (!value || typeof value !== 'object') return null; // Ensure value is an object
                  return (
                    <Box sx={{ display: 'flex', mt: 1, gap: 6 }}>
                      {Object.entries(value).map(([key, val]) => (
                        <Box
                          key={key}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'left',
                          }}
                        >
                          <Typography variant="subtitle2">{key}</Typography>
                          <Typography variant="caption">{String(val)}</Typography>
                        </Box>
                      ))}
                    </Box>
                  );
                },
              },
            ]}
            data={[
              {
                employeePayble: {
                  BankTransfer: '680407.0',
                  Cheques: '0.0',
                  Cash: '680407.0',
                  Total: '680407.0',
                },
              },
            ]}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <CustomizableTable
            isFilter={false}
            isShowedDense={false}
            isPagination={false}
            isSearch={false}
            tableId="incomeTaxTDS-table-id"
            columns={[
              {
                id: 'incomeTaxTDS',
                label: 'Income Tax TDS',
                align: 'left',
                render(value, row) {
                  if (!value || typeof value !== 'object') return null; // Ensure value is an object
                  return (
                    <Box sx={{ display: 'flex', mt: 1, gap: 6 }}>
                      {Object.entries(value).map(([key, val]) => (
                        <Box
                          key={key}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'left',
                          }}
                        >
                          <Typography variant="subtitle2">{key}</Typography>
                          <Typography variant="caption">{String(val)}</Typography>
                        </Box>
                      ))}
                    </Box>
                  );
                },
              },
            ]}
            data={[
              {
                incomeTaxTDS: {
                  Payble: '$65',
                  Employees: '$40',
                },
              },
            ]}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <CustomizableTable
            isFilter={false}
            isShowedDense={false}
            isPagination={false}
            isSearch={false}
            tableId="PT-table-id"
            columns={[
              {
                id: 'PT',
                label: 'PT',
                align: 'left',
                render(value, row) {
                  if (!value || typeof value !== 'object') return null; // Ensure value is an object
                  return (
                    <Box sx={{ display: 'flex', mt: 1, gap: 6 }}>
                      {Object.entries(value).map(([key, val]) => (
                        <Box
                          key={key}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'left',
                          }}
                        >
                          <Typography variant="subtitle2">{key}</Typography>
                          <Typography variant="caption">{String(val)}</Typography>
                        </Box>
                      ))}
                    </Box>
                  );
                },
              },
            ]}
            data={[
              {
                PT: {
                  Payble: '$65',
                  Employees: '4',
                },
              },
            ]}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomizableTable
            isFilter={false}
            isShowedDense={false}
            isPagination={false}
            isSearch={false}
            tableId="pfDeduction-table-id"
            columns={[
              {
                id: 'pfDeduction',
                label: 'PF Deduction',
                align: 'left',
                render(value, row) {
                  if (!value || typeof value !== 'object') return null; // Ensure value is an object
                  return (
                    <Box sx={{ display: 'flex', mt: 1, gap: 6 }}>
                      {Object.entries(value).map(([key, val]) => (
                        <Box
                          key={key}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'left',
                          }}
                        >
                          <Typography variant="subtitle2">{key}</Typography>
                          <Typography variant="caption">{String(val)}</Typography>
                        </Box>
                      ))}
                    </Box>
                  );
                },
              },
            ]}
            data={[
              {
                pfDeduction: {
                  Employee: '$65',
                  Employer: '$40',
                  Total: '$98',
                },
              },
            ]}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomizableTable
            isFilter={false}
            isShowedDense={false}
            isPagination={false}
            isSearch={false}
            tableId="ESIC-table-id"
            columns={[
              {
                id: 'ESICDeduction',
                label: 'ESIC Deduction',
                align: 'left',
                render(value, row) {
                  if (!value || typeof value !== 'object') return null; // Ensure value is an object
                  return (
                    <Box sx={{ display: 'flex', mt: 1, gap: 6 }}>
                      {Object.entries(value).map(([key, val]) => (
                        <Box
                          key={key}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'left',
                          }}
                        >
                          <Typography variant="subtitle2">{key}</Typography>
                          <Typography variant="caption">{String(val)}</Typography>
                        </Box>
                      ))}
                    </Box>
                  );
                },
              },
            ]}
            data={[
              {
                ESICDeduction: {
                  Employee: '$65',
                  Employer: '$40',
                  Total: '$98',
                },
              },
            ]}
          />
        </Grid>
      </Grid>
    </Card>
  </>
);

export default AfterPayrollComponent;
