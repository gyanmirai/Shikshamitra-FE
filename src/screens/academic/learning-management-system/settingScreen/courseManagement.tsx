'use client';

import React, { useState } from 'react';

import {
  Box,
  Grid,
  List,
  Button,
  Switch,
  Tooltip,
  ListItem,
  Typography,
  ListItemText,
} from '@mui/material';

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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="h6">Course Templates</Typography>
              <Tooltip title="Add New Template">
                <Iconify
                  icon="mdi:plus"
                  sx={{
                    height: '22px',
                    width: '22px',
                    color: 'blue',
                    marginLeft: 38,
                    marginTop: 1,
                  }}
                />
              </Tooltip>
            </Box>
            <Scrollbar
              style={{ maxHeight: '170px', border: '1px solid #e0e0e0', borderRadius: '4px' }}
            >
              <List sx={{ '& .MuiListItem-root': { py: 0.5 }, px: 2, pb: 2 }}>
                {[
                  'Template 1',
                  'Template 2',
                  'Template 3',
                  'Template 4',
                  'Template 5',
                  'Template 6',
                ].map((template, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={template} />
                    <Tooltip title="Edit">
                      <Iconify
                        icon="solar:pen-bold"
                        sx={{ paddingRight: '8px', height: '20px', width: '20px', color: 'green' }}
                      />
                    </Tooltip>
                    <Tooltip title="Delete">
                      <Iconify
                        icon="solar:trash-bin-trash-bold"
                        sx={{ paddingRight: '4px', height: '20px', width: '20px', color: 'red' }}
                      />
                    </Tooltip>
                  </ListItem>
                ))}
              </List>
            </Scrollbar>
          </Box>
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
