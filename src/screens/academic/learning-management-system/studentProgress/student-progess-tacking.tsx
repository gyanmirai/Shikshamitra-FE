'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import { Box, Grid } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import RenderTabs from './component/bottomRenderTabs';
import DetailedStudentView from './component/detailedStudentView';

const StudentProgressTracking = (props: TabComponentType) => {
  const dialog = useBoolean();
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Student Progress Tracking"
        links={[
          { name: 'Academics' },
          { name: 'Learning Management System' },
          { name: 'Student Progress Tracking' },
        ]}
        sx={{ mb: 2 }}
      />
      <Box display="flex" gap={2} mt={2}>
        <CustomSelect
          options={[]}
          value=""
          label="Class"
          onChange={() => {}}
          formControlProps={{ sx: { maxWidth: '150px', width: '100%' } }}
          size="small"
        />
        <CustomSelect
          options={[]}
          value=""
          label="Division"
          onChange={() => {}}
          formControlProps={{ sx: { maxWidth: '150px', width: '100%' } }}
          size="small"
        />
        <CustomSelect
          options={[]}
          value=""
          label="Student"
          onChange={() => {}}
          formControlProps={{ sx: { maxWidth: '150px', width: '100%' } }}
          size="small"
        />
      </Box>

      <Grid container mt={2}>
        <Grid size={12}>
          <Box sx={{ width: '100%', margin: 'auto' }}>
            <RenderTabs />
          </Box>
        </Grid>
      </Grid>

      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Detailed Student View">
        <DetailedStudentView />
      </CustomDialog>
    </Box>
  );
};

export default StudentProgressTracking;
