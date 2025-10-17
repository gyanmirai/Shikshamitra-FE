import React, { useState, useEffect } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetStopBasedFeeDataQuery } from 'src/redux/transport/vehicle-management/vehicleSettingsApi';
import {
  Box,
  Select,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
} from '@mui/material';

const StopBasedModel = () => {
  const { data: stopBasedFeeData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStopBasedFeeDataQuery,
  });
  const [tableData, setTableData] = useState<any[]>([]);

  const frequencyOptions = ['Daily', 'Monthly', 'Quarterly', 'Yearly'];

  // Update tableData when stopBasedFeeData is loaded
  useEffect(() => {
    if (stopBasedFeeData) {
      setTableData([...stopBasedFeeData]);
    }
  }, [stopBasedFeeData]);

  const handleFeeAmountChange = (value: string, index: number) => {
    const updatedData = [...tableData];
    updatedData[index].feeAmount = Number(value.replace(/[₹,\s]/g, ''));
    setTableData(updatedData);
  };

  const handleFrequencyChange = (value: string, index: number) => {
    const updatedData = [...tableData];
    updatedData[index].frequency = value;
    setTableData(updatedData);
  };

  return (
    <Box p={3}>
      <Typography variant="h6" color="primary" gutterBottom>
        Configure Stop-Based Model
      </Typography>

      <Box mt={3}>
        <CustomizableTable
          tableId="stopBasedFeeTable"
          noDataText="No Stop Data Found"
          isLoading={isLoading}
          columns={[
            {
              id: 'stopName',
              label: 'Stop Name',
            },
            {
              id: 'kilometers',
              label: 'Kilometers',
            },
            {
              id: 'landmark',
              label: 'Landmark',
            },
            {
              id: 'assignedStudents',
              label: 'Assigned Students',
            },
            {
              id: 'feeAmount',
              label: 'Fee Amount',
              isSort: false,
              isFilter: false,
              render: (value, row: any) => (
                <TextField
                  value={`₹ ${row.feeAmount}`}
                  onChange={(e) => handleFeeAmountChange(e.target.value, tableData.indexOf(row))}
                  size="small"
                  label="Amount (₹) *"
                  sx={{
                    maxWidth: '150px',
                  }}
                />
              ),
            },
            {
              id: 'frequency',
              label: 'Frequency',
              isSort: false,
              isFilter: false,
              render: (value, row: any) => (
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Frequency *</InputLabel>
                  <Select
                    value={row.frequency}
                    label="Frequency *"
                    onChange={(e) => handleFrequencyChange(e.target.value, tableData.indexOf(row))}
                  >
                    {frequencyOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ),
            },
          ]}
          data={tableData}
        />
      </Box>
    </Box>
  );
};

export default StopBasedModel;
