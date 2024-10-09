import React from 'react';

import {
  Box,
  Button,
  Switch,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const Settings = () => {
  const modal = useBoolean();
  const uploadModal = useBoolean();
  const gradeScalingModal = useBoolean();
  return (
    <Box>
      <Typography sx={{ fontSize: '24px', fontWeight: '600' }}>General Settings</Typography>
      <Typography sx={{ fontSize: '24px', fontWeight: '600', pl: '20px', pb: '20px' }}>
        Curriculum Templates
      </Typography>
      <Box sx={{ pl: '20px' }}>
        <CustomSelect
          label="Predefined templates"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 220 } }}
        />
      </Box>

      <Box sx={{ pl: '90px', pt: '10px', pb: '20px' }}>
        <Button variant="contained" onClick={() => {}}>
          Add New Template
        </Button>
      </Box>

      <Typography sx={{ fontSize: '24px', fontWeight: '600', pb: '20px' }}>
        Subject Management
      </Typography>

      <Box sx={{ pr: '40px', pt: '10px', display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={() => {}}>
          Add New Subject
        </Button>
      </Box>

      <CustomizableTable
        columns={[
          { id: 'curriculumname', label: 'Curriculum Name' },
          { id: 'gradelevel', label: 'Grade Level' },
          { id: 'subject', label: 'Subjects' },
          { id: 'lastupdated', label: 'Last Updated' },
          { id: 'status', label: 'Status' },
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
                        {/* <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} /> */}
                        Edit
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          uploadModal.onTrue();
                          popover.onClose();
                        }}
                      >
                        {/* <Iconify icon="solar:upload-bold" sx={{ height: '16px', width: '16px' }} /> */}
                        Duplicate
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          gradeScalingModal.onTrue();
                          popover.onClose();
                        }}
                      >
                        {/* <Iconify icon="solar:upload-bold" sx={{ height: '16px', width: '16px' }} /> */}
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
      <Typography sx={{ fontSize: '24px', fontWeight: '600', pb: '20px', pt: '20px' }}>
        Learning Goals
      </Typography>
      <Box sx={{ pl: '20px', pb: '20px' }}>
        <CustomSelect
          label="Subject Name"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 220 } }}
        />
      </Box>
      <Box sx={{ pl: '20px', pb: '20px' }}>
        <CustomSelect
          label="Learning Goal"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 220 } }}
        />
      </Box>
      <Typography sx={{ fontSize: '24px', fontWeight: '600' }}>Notification Section</Typography>
      <Typography sx={{ fontSize: '24px', fontWeight: '600', pl: '20px', pb: '20px' }}>
        Set Reminders
      </Typography>

      <FormControlLabel control={<Switch />} label="Set reminders for curriculum reviews" />
      <Box sx={{ pb: '20px', pt: '20px', width: '400px' }}>
        <TextField
          multiline
          rows={4}
          fullWidth
          placeholder="explaining when notifications will be triggered (e.g., 2 weeks before review date)"
          name="description"
          label="explaining when notifications will be triggered (e.g., 2 weeks before review date)"
          // value={formik.values.description}
          // onChange={formik.handleChange}
          size="small"
        />
      </Box>
      <FormControlLabel control={<Switch />} label="Notify teachers when curriculum is updated" />
      <Typography sx={{ fontSize: '24px', fontWeight: '600', pb: '20px' }}>
        Permission Connection
      </Typography>
      <Box sx={{ pl: '20px', pb: '20px' }}>
        <CustomSelect
          label="Edit Curriculum"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 220 } }}
        />
      </Box>
      <Box sx={{ pl: '20px', pb: '20px' }}>
        <CustomSelect
          label="Approved Curriculum Update"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 220 } }}
        />
      </Box>
    </Box>
  );
};

export default Settings;
