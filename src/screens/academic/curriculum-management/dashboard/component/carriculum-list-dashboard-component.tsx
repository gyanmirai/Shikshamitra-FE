import React from 'react';

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Box, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const CarriculumListDashboardComponent = () => {
  const modal = useBoolean();
  const uploadModal = useBoolean();
  const gradeScalingModal = useBoolean();
  return (
    <Box>
      <Typography sx={{ pb: '20px', pt: '20px' }}>Carriculum OverView</Typography>
      <Grid2 display="flex" flexDirection="row" gap={2}>
        <Grid2 lg={4}>
          <CustomSelect
            label="Subject"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 120 } }}
          />
        </Grid2>
        <Grid2 lg={4}>
          <CustomSelect
            label="Grade level"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 120 } }}
          />
        </Grid2>
        <Grid2 lg={4}>
          <CustomSelect
            label="Status"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 120 } }}
          />
        </Grid2>
      </Grid2>

      <CustomizableTable
        columns={[
          { id: 'curriculumname', label: 'Curriculum Name' },
          { id: 'gradelevel', label: 'Grade Level' },
          { id: 'subject', label: 'Subjects' },
          { id: 'lastupdated', label: 'Last Updated' },
          {
            id: 'status',
            label: 'Status',
            render(value, row) {
              return (
                <Label
                  variant="soft"
                  color={
                    value === 'Archived'
                      ? 'warning'
                      : value === 'Pending'
                        ? 'error'
                        : value === 'Active'
                          ? 'success'
                          : 'default'
                  }
                >
                  {value}
                </Label>
              );
            },
          },
          {
            id: 'action',
            label: 'Action',
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={({ popover }: any) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          modal.onTrue();
                          popover.onClose();
                        }}
                      >
                         <Iconify icon="solar:pen-bold" />
                        Edit
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          uploadModal.onTrue();
                          popover.onClose();
                        }}
                      >
                           <Iconify icon="solar:pen-bold" />
                        Duplicate
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          gradeScalingModal.onTrue();
                          popover.onClose();
                        }}
                      >
                          <Iconify icon="solar:pen-bold" />
                        Archived
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={[
          {
            curriculumname: 'curriculum1',
            gradelevel: 'Numbers',
            subject: 'Plants',
            lastupdated: 'Alphabets',
            status: 'Archived',
          },
          {
            curriculumname: 'curriculum2',

            gradelevel: 'Numbers',
            subject: 'Plants',
            lastupdated: 'Alphabets',
            status: 'Draft',
          },
          {
            curriculumname: 'curriculum3',

            gradelevel: 'Numbers',
            subject: 'Plants',
            lastupdated: 'Alphabets',
            status: 'Pending',
          },
          {
            curriculumname: 'curriculum4',

            gradelevel: 'Numbers',
            subject: 'Plants',
            lastupdated: 'Alphabets',
            status: 'Active',
          },
        ]}
      />
    </Box>
  );
};

export default CarriculumListDashboardComponent;
