import React from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Select,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  InputAdornment,
} from '@mui/material';

const StopBasedModel = ({ formik }: { formik: any }) => {
  const frequencyOptions = ['Daily', 'Monthly', 'Quarterly', 'Yearly'];

  const handleFeeAmountChange = (value: string, rowId: string) => {
    const index = formik.values.stops.findIndex((item: any) => item.id === rowId);
    if (index !== -1) {
      const numericValue = Number(value.replace(/[^\d]/g, ''));
      formik.setFieldValue(`stops.${index}.feeAmount`, numericValue);
    }
  };

  const handleFrequencyChange = (value: string, rowId: string) => {
    const index = formik.values.stops.findIndex((item: any) => item.id === rowId);
    if (index !== -1) {
      formik.setFieldValue(`stops.${index}.frequency`, value);
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h6" color="primary" gutterBottom>
        Configure Stop-Based Model
      </Typography>

      <Box mt={2}>
        <CustomizableTable
          tableId="stopBasedFeeTable"
          noDataText="No Stop Data Found"
          columns={[
            { id: 'stopName', label: 'Stop Name' },
            { id: 'kilometers', label: 'Kilometers' },
            { id: 'landmark', label: 'Landmark' },
            { id: 'assignedStudents', label: 'Assigned Students' },
            {
              id: 'feeAmount',
              label: 'Fee Amount',
              isSort: false,
              isFilter: false,
              render: (value, row) => {
                const index = formik.values.stops.findIndex((item: any) => item.id === row.id);
                return (
                  <TextField
                    value={formik.values.stops?.[index]?.feeAmount || ''}
                    onChange={(e) => handleFeeAmountChange(e.target.value, row.id)}
                    size="small"
                    label="Amount"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    sx={{ maxWidth: '150px' }}
                  />
                );
              },
            },
            {
              id: 'frequency',
              label: 'Frequency',
              isSort: false,
              isFilter: false,
              render: (value, row) => {
                const index = formik.values.stops.findIndex((item: any) => item.id === row.id);
                return (
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Frequency *</InputLabel>
                    <Select
                      value={formik.values.stops?.[index]?.frequency || ''}
                      label="Frequency *"
                      onChange={(e) => handleFrequencyChange(e.target.value, row.id)}
                    >
                      {frequencyOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                );
              },
            },
          ]}
          data={formik.values.stops || []}
        />
      </Box>
    </Box>
  );
};

export default StopBasedModel;
