import React, { useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Paper, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import responseSurveyData from 'src/json/communication/feedback/responseSurveyData.json';

export const ResponseComponent = () => {
  // State to store and manage response table data
  const [tableData, setTableData] = useState<any>(responseSurveyData);
  return (
    <CustomizableTable
      tableId="response-table"
      columns={[
        {
          id: 'responsendedName',
          label: 'Respodent Name',
          children(row) {
            return (
              <>
                {row.response.length > 0 && (
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Scrollbar sx={{ height: '200px' }}>
                      {row.response.map((val: any, index: any) => (
                        <React.Fragment key={index}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Paper elevation={4} sx={{ p: 2, width: '100%', mt: 1 }}>
                              <Typography variant="body1">Question: {val.question}</Typography>
                              <Typography variant="body2">Answer: {val.answer}</Typography>
                            </Paper>
                          </Box>
                        </React.Fragment>
                      ))}
                    </Scrollbar>
                  </Box>
                )}
              </>
            );
          },
        },
        {
          id: 'role',
          label: 'Role',
        },
        {
          id: 'responsendedEmail',
          label: 'Email',
        },
      ]}
      data={tableData}
    />
  );
};
