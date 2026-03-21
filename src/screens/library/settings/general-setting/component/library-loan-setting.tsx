import React from 'react';
import { Box, TextField } from '@mui/material';
import CustomizableTable from 'src/components/customizable-table';

const LibraryLoanSetting: React.FC = () => {
  const dummyData = [
    { role: 'Student', loanDuration: 14, maxBookAllowed: 3, lateReturnFine: 5 },
    { role: 'Teacher', loanDuration: 30, maxBookAllowed: 10, lateReturnFine: 2 },
    // { role: 'Librarian', loanDuration: 45, maxBookAllowed: 15, lateReturnFine: 0 },
  ];

  return (
    <Box sx={{ padding: 3 }}>
      <CustomizableTable
        tableId="library-loan-setting"
        isFilter={false}
        isShowedDense={false}
        isSearch={false}
        columns={[
          { id: 'role', label: 'Role' },
          {
            id: 'loanDuration',
            label: 'Loan Duration (days)',
            render: (value: number, row: any) => (
              <TextField
                name="loanDuration"
                type="number"
                value={value}
                onChange={(e) => {
                  row.loanDuration = e.target.value; // Add state update logic here
                }}
                variant="outlined"
                size="small"
                sx={{ width: '120px', margin: '0 auto' }}
              />
            ),
          },
          {
            id: 'maxBookAllowed',
            label: 'Max Books Allowed',
            render: (value: number, row: any) => (
              <TextField
                name="maxBookAllowed"
                type="number"
                value={value}
                onChange={(e) => {
                  row.maxBookAllowed = e.target.value; // Add state update logic here
                }}
                variant="outlined"
                size="small"
                sx={{ width: '120px', margin: '0 auto' }}
              />
            ),
          },
          {
            id: 'lateReturnFine',
            label: 'Late Return Fine (₹/day)',
            render: (value: number, row: any) => (
              <TextField
                name="lateReturnFine"
                type="number"
                value={value}
                onChange={(e) => {
                  row.lateReturnFine = e.target.value; // Add state update logic here
                }}
                variant="outlined"
                size="small"
                sx={{ width: '120px', margin: '0 auto' }}
              />
            ),
          },
        ]}
        data={dummyData}
        // sx={{
        //   '& .MuiTableCell-root': { padding: '8px', textAlign: 'center' },
        //   tableLayout: 'fixed',
        //   width: '100%',
        // }}
      />
    </Box>
  );
};

export default LibraryLoanSetting;
