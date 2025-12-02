'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Card,
  Grid,
  Alert,
  Button,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  FormControl,
} from '@mui/material';

import VerifyPayrollComponent from './component/verifyPayrollComponent';

const RunPayroll = () => {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Dayjs | null>(null);
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const [organization, setOrganization] = useState<null | string>(null);

  // const organizationValue = medium?.educationMediumStages?.find(
  //   (org: any) => org?.id === organization
  // );
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {open ? (
        <>
          <CustomBreadcrumbs
            heading="Run Payroll"
            links={[
              { name: 'HR/Staff' },
              { name: 'Payroll Management' },
              { name: 'Verify Payroll' },
            ]}
            sx={{ mb: 2 }}
            action={
              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
                onClick={() => {
                  setOpen(false);
                }}
              >
                Back
              </Button>
            }
          />
          <Card sx={{ height: '100%' }}>
            <VerifyPayrollComponent
              // onSubmit={handleSubmit}
              onClose={() => {
                setOpen(false);
              }}
            />
          </Card>
        </>
      ) : (
        <>
          <CustomBreadcrumbs
            heading="Run Payroll"
            links={[{ name: 'HR/Staff' }, { name: 'Payroll' }, { name: 'Run Payroll' }]}
            sx={{ mb: 2 }}
            description="Run payroll by selecting a date and organization, and verify details before processing."
          />
          {/* <StepsForPayroll /> */}

          <Card sx={{ p: 2 }}>
            <Typography variant="h6">Process Payroll For</Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2, alignItems: 'center' }}>
              <DatePicker
                label="Select Month *"
                views={['month']}
                format="MMMM"
                value={month}
                onChange={(newValue) => setMonth(newValue)}
                slotProps={{ textField: { size: 'small' } }}
                sx={{ width: '100%', maxWidth: '200px' }}
              />
              <FormControl sx={{ width: '100%', maxWidth: '200px' }}>
                <InputLabel id="Roles-select-label" size="small">
                  Organization *
                </InputLabel>
                <Select
                  labelId="Roles-select-label"
                  id="Roles-select"
                  value={organization}
                  label="Organization *"
                  name="organization"
                  size="small"
                  onChange={(e) => setOrganization(e.target.value)}
                >
                  {medium?.educationMediumStages.length ? (
                    medium?.educationMediumStages?.map((org: any) => (
                      <MenuItem key={org.id} value={org.id}>
                        {org.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="">
                      <em>No Organization Found</em>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>

              {/* Button aligned to the right */}
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="uiw:pay" />}
                  disabled={!month || !organization}
                  onClick={() => {
                    setOpen(true);
                  }}
                  size="small"
                  sx={{ px: '32px' }}
                >
                  Run Payroll
                </Button>
              </Box>
            </Box>
            <Alert variant="outlined" severity="warning">
              Please ensure all payroll data is accurate and verified before proceeding. Once
              payroll is processed, any modifications may require additional steps.
            </Alert>
          </Card>
          <Card sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6">Employee Payable</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomizableTable
                  isFilter={false}
                  isShowedDense={false}
                  isPagination={false}
                  isSearch={false}
                  tableId="employee-payble-id"
                  noDataText={<>No Employee Payble found</>}
                  columns={[
                    {
                      id: 'employeePayble',
                      label: 'Employee Payble',
                      align: 'left',
                      isFilter: false,
                      isSort: false,
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
                        BankTransfer: '₹68,0407.0',
                        Cheques: '₹0.0',
                        Cash: '₹68,0407.0',
                        Total: '₹68,0407.0',
                      },
                    },
                  ]}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CustomizableTable
                  noDataText={<>No PF Deduction found</>}
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
                      isFilter: false,
                      isSort: false,
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
                        Employee: '₹65',
                        Employer: '₹40',
                        Total: '₹98',
                      },
                    },
                  ]}
                />
              </Grid>
            </Grid>
          </Card>
        </>
      )}

      {/* <CustomDialog
        maxWidth="lg"
        open={open}
        handleClose={() => setOpen(false)}
        title={
          <Box display="flex" alignItems="center" gap={1}>
            Run Payroll
            <Typography fontSize={14} color="text.secondary" component="span">
              ( {` Month :- ₹{month?.format('MMMM')}, Organization :- ₹{organizationValue?.name}`}
              ){' '}
            </Typography>
          </Box>
        }
      >
        <VerifyPayrollComponent
          // onSubmit={handleSubmit}
          onClose={() => {
            setOpen(false);
          }}
        />
      </CustomDialog> */}
    </Box>
  );
};

export default RunPayroll;
