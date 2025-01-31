'use client';

import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Grid, Card, Button, Switch, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';

const CourseManagementSetting = () => {
  const [isCourseVisible, setIsCourseVisible] = useState(false);
  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box display="flex" gap={2} alignItems="center" justifyContent="flex-end">
        <Button variant="contained" size="small">
          Manage Archieved Courses
        </Button>
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Box sx={{ typography: 'subtitle1' }}>Template</Box>

            <Scrollbar sx={{ mt: 1.5, height: '180px' }}>
              <Box
                component="ul"
                sx={{
                  listStyle: 'none',
                  padding: 0,
                }}
              >
                {[
                  'Template 1',
                  'Template 2',
                  'Template 3',
                  'Template 4',
                  'Template 5',
                  'Template 6',
                ].map((template, index) => (
                  <Box
                    key={index}
                    component="li"
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                      p: 1,
                      m: 0.5,
                      borderRadius: '15px',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {template}
                      </Typography>
                    </Box>
                    <Box>
                      <Iconify
                        icon="solar:pen-bold"
                        sx={{ height: '18px', width: '18px', mr: 2, cursor: 'pointer' }}
                        onClick={() => {
                          // setSelectedHomeworkType(category);
                          // setIsEdit(true);
                          // homeworkDialog.onTrue();
                        }}
                      />
                      <Iconify
                        icon="mdi:delete"
                        sx={{ height: '18px', width: '18px', color: 'red', cursor: 'pointer' }}
                        onClick={() => {
                          // setSelectedHomeworkType(category);
                          // deleteConfirmDialog.onTrue();
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Scrollbar>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                startIcon={<Add />}
                size="small"
                variant="contained"
                onClick={() => {
                  // homeworkDialog.onTrue();
                  // setIsEdit(false);
                  // setSelectedHomeworkType(null);
                }}
              >
                Template
              </Button>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Switch
                checked={isCourseVisible}
                onChange={(e) => setIsCourseVisible(e.target.checked)}
              />
              <Typography>Course Visibility</Typography>
            </Box>
            {isCourseVisible && (
              <CustomSelect
                options={[
                  { value: 'allStudents', label: 'All Students' },
                  { value: 'specificGrades', label: 'Specific Grades' },
                  { value: 'customGroup', label: 'Custom Group' },
                ]}
                value=""
                label="Course Visibility"
                onChange={() => {}}
                formControlProps={{ sx: { maxWidth: '300px', width: '100%', marginTop: '5px' } }}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CourseManagementSetting;
