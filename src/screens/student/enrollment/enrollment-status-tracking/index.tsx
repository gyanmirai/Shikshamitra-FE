'use client';

import { Box, Typography, Breadcrumbs, CircularProgress } from '@mui/material';

import CustomizableTable from 'src/components/customizabaleTable';
import { Separator, CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { BreadcrumbsLink } from 'src/components/custom-breadcrumbs/breadcrumb-link';

const EnrollmentStatusTrackingScreen = () => (
  <Box>
    <CustomBreadcrumbs
      heading="Enrollment Status Tracking"
      links={[
        { name: 'Student' },
        { name: 'Student Enrollment' },
        { name: 'Enrollment Status Tracking' },
      ]}
      sx={{ px: 1, mb: 2 }}
    />
    <CustomizableTable
      tableId="enrollment-status-tracking"
      searchFieldProps={{
        placeholder: 'Search by name, organization, medium, class...',
        label: 'Search by name, organization, medium, class...',
        sx: {
          maxWidth: '400px',
          width: '100%',
        },
      }}
      columns={[
        { id: 'name', label: 'Name' },
        { id: 'organization', label: 'Organization' },
        { id: 'medium', label: 'Medium ' },
        { id: 'class', label: 'Class ' },
        {
          id: 'progress',
          label: 'Progress',
          render(value, row) {
            return (
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress variant="determinate" value={value} />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                    {value}%
                  </Typography>
                </Box>
              </Box>
            );
          },
        },
        {
          id: 'remainingSteps',
          label: 'Remaining Steps',
          render(value, row) {
            return (
              <Breadcrumbs separator={<Separator />}>
                {[
                  { name: 'Inquiry', isDone: true },
                  { name: 'Registration', isDone: true },
                  { name: 'Admission', isDone: false },
                  { name: 'Enrolled', isDone: false },
                ].map((link, index) => (
                  <BreadcrumbsLink
                    key={link.name ?? index}
                    link={link}
                    activeLast={undefined}
                    disabled={false}
                    sx={{ color: link.isDone ? 'success.main' : 'error.main' }}
                  />
                ))}
              </Breadcrumbs>
            );
          },
        },
      ]}
      data={[
        {
          name: 'John Doe',
          organization: 'Primary',
          medium: 'English',
          class: '10th',
          progress: 75,
        },
        {
          name: 'Jane Smith',
          organization: 'H-Primary',
          medium: 'Spanish',
          class: '8th',
          progress: 50,
        },
        {
          name: 'Mike Johnson',
          organization: 'Primary',
          medium: 'French',
          class: '12th',
          progress: 90,
        },
      ]}
    />{' '}
  </Box>
);

export default EnrollmentStatusTrackingScreen;
