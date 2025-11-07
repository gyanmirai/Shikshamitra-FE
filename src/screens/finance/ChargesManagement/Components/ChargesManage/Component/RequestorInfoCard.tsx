import React from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Card, Grid, Paper, Typography, CardContent } from '@mui/material';

import type { RequestorInfoProps } from './type';

const RequestorInfoCard: React.FC<RequestorInfoProps> = ({ charge }) => (
  <Box sx={{ p: 2 }}>
    <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" color="#00A76F" gutterBottom>
          Requestor Information
        </Typography>

        {/* First Row - Basic Info */}
        <Grid container spacing={1}>
          {/* Name */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {charge?.requestorName || 'Dharmik Jinjala'}
            </Typography>
          </Grid>

          {/* Department */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Department
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {charge?.department || 'Science'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Requested On
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {charge?.requestedOn || '20-08-2025'}
            </Typography>
          </Grid>
          {/* Affected Students */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Affected Students
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                borderRadius: 2,
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f9fafb',
              }}
            >
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Class
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {charge?.class || '10'}
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Division
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {charge?.divisions?.join(', ') || 'A, B'}
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Students
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {charge?.students || '70'}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Requested On */}
        </Grid>

        {/* Affected Students Table Section */}
      </CardContent>
    </Card>
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" color="#00A76F" gutterBottom>
        Affected Students
      </Typography>

      <CustomizableTable
        tableId="affected-students"
        noDataText="No students found"
        columns={[
          { id: 'name', label: 'Name', align: 'left', sticky: true },
          { id: 'class', label: 'Class', align: 'left' },
          { id: 'division', label: 'Division', align: 'left' },
          {
            id: 'rollNo',
            label: 'Roll No.',
            align: 'left',
            filterType: 'number',
            minWidth: 100,
          },
          { id: 'grNo', label: 'GR No.', align: 'left', minWidth: 100 },
        ]}
        data={
          charge?.studentList?.map((student, index) => ({
            name: student.name,
            class: charge?.class || '10',
            division: student.division,
            rollNo: student.rollNo || String(index + 1).padStart(2, '0'),
            grNo: student.grNo || `GR${String(index + 1).padStart(3, '0')}`,
          })) || [
            {
              name: 'Dharmik Jinjala',
              class: '10',
              division: 'A',
              rollNo: '01',
              grNo: 'GR001',
            },
            { name: 'Prerna Atre', class: '10', division: 'B', rollNo: '05', grNo: 'GR002' },
            { name: 'Mayur Solanki', class: '10', division: 'C', rollNo: '08', grNo: 'GR003' },
          ]
        }
      />
    </Box>
  </Box>
);

export default RequestorInfoCard;
