import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import {
  Box,
  Card,
  Grid,
  Button,
  Switch,
  TextField,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

const Settings = (props: TabComponentType) => {
  const modal = useBoolean();
  const uploadModal = useBoolean();
  const templateDialog = useBoolean();
  const gradeScalingModal = useBoolean();
  return (
    <Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h6">General Settings</Typography>
        <Card sx={{ p: 2, mt: 1 }}>
          <Typography variant="h6" sx={{ pl: '20px' }}>
            Curriculum Templates
          </Typography>
          <Box sx={{ display: 'flex', pl: '20px', mt: 2, gap: 3 }}>
            <CustomSelect
              label="Predefined templates"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 220 } }}
            />
            <Button variant="contained" onClick={templateDialog.onTrue}>
              Add New Template
            </Button>
          </Box>
        </Card>
      </Box>

      {/* <Typography sx={{ fontSize: '24px', fontWeight: '600', pb: '20px' }}>
        Subject Management
      </Typography>

      <Box sx={{ pr: '40px', pt: '10px', display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={() => {}}>
          Add New Subject
        </Button>
      </Box> */}

      {/* <CustomizableTable
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
                        <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
                        Edit
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          uploadModal.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="solar:upload-bold" sx={{ height: '16px', width: '16px' }} />
                        Duplicate
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          gradeScalingModal.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="solar:upload-bold" sx={{ height: '16px', width: '16px' }} />
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
      /> */}
      {/* <Typography sx={{ fontSize: '24px', fontWeight: '600', pb: '20px', pt: '20px' }}>
        Learning Goals
      </Typography> */}
      {/* <Box sx={{ pl: '20px', pb: '20px' }}>
        <CustomSelect
          label="Subject Name"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 220 } }}
        />
      </Box> */}
      {/* <Box sx={{ pl: '20px', pb: '20px' }}>
        <CustomSelect
          label="Learning Goal"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 220 } }}
        />
      </Box> */}
      <Typography variant="h6">Notification Section</Typography>
      <Grid container spacing={2} mt={1}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Set Reminders</Typography>

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
            <FormControlLabel
              control={<Switch />}
              label="Notify teachers when curriculum is updated"
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Permission Connection</Typography>
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
          </Card>
        </Grid>
      </Grid>
      <CustomDialog
        title="Add New Template"
        open={templateDialog.value}
        handleClose={templateDialog.onFalse}
      >
        <AddTemplateForm />
      </CustomDialog>
    </Box>
  );
};
const AddTemplateForm = () => (
  <form>
    <Scrollbar sx={{ background: 'background.neutral', p: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            name="templateName"
            label="Template Name"
            onChange={() => {}}
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomSelect
            label="Grade"
            name="grade"
            options={[]}
            value=""
            formControlProps={{ fullWidth: true }}
            onChange={() => {}}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomSelect
            label="Subjects"
            name="subjects"
            value=""
            options={[]}
            formControlProps={{ fullWidth: true }}
            onChange={() => {}}
          />
        </Grid>
      </Grid>
    </Scrollbar>
    <DialogActions>
      <Button variant="contained" type="submit">
        Cancel
      </Button>
      <Button variant="contained" type="submit">
        Ok
      </Button>
    </DialogActions>
  </form>
);
export default Settings;
