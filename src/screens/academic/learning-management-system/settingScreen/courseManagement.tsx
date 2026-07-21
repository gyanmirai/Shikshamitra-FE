'use client';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Grid, Card, Button, Switch, Typography } from '@mui/material';

const CourseManagementSetting = () => {
  const [isCourseVisible, setIsCourseVisible] = useState(false);
  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Course Management"
        description="Manage your course settings for the learning management system."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Learning Management System', href: '/academic/lmsDashboard/' },
          { name: 'Settings' },
          { name: 'Course Management' },
        ]}
      />
      <Box display="flex" gap={1} alignItems="center" justifyContent="flex-end">
        <Button variant="contained" size="small">
          Manage Archieved Courses
        </Button>
      </Box>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
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
                          // Edit action
                        }}
                      />
                      <Iconify
                        icon="mdi:delete"
                        sx={{ height: '18px', width: '18px', color: 'red', cursor: 'pointer' }}
                        onClick={() => {
                          // Delete action
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
                  // Add template action
                }}
              >
                Template
              </Button>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 1 }}>
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
