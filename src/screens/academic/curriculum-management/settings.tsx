import React from 'react';

import {
  Box,
  Grid,
  Stack,
  Button,
  Switch,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const Settings = () => {
  const modal = useBoolean();
  const uploadModal = useBoolean();
  const templateDialog = useBoolean();
  const gradeScalingModal = useBoolean();
  return (
    <Box>
      <Typography variant='h6' component="span">
        Curriculum Templates
      </Typography>
      <Box  sx={{ pl: '20px' , pt: "15px" }}>
        <CustomSelect
          label="Predefined templates"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 220 } }}
        />
        <Box sx={{ pl: '90px', pt: '15px', pb: '20px' }}>
        <Button size='small' variant="contained" onClick={templateDialog.onTrue}>
          Add New Template
        </Button>
      </Box>
      </Box>

      

     

      <Box sx={{ pr: '40px', pt: '10px', display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant='h6' component="span" >
        Subject Management
      </Typography>
        <Button size="small" variant="contained" onClick={() => {}}>
          Add New Subject
        </Button>
      </Box>

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
      {/* <Typography variant='h6' component="span" >
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
      <Typography variant='h6' component="span">Notification Section</Typography>
      <Typography variant='h6' component="span">
        Set Reminders
      </Typography>

      <FormControlLabel control={<Switch />} label="Set reminders for curriculum reviews" />
      <Box sx={{ pb: '20px', pt: '20px', width: '400px' }}>
        <TextField
          multiline
          rows={4}
          fullWidth
          placeholder="explaining when notifications will be triggered"
          name="description"
          label="explaining when notifications will be triggered"
          // value={formik.values.description}
          // onChange={formik.handleChange}
          size="small"
        />
      </Box>
      <FormControlLabel control={<Switch />} label="Notify teachers when curriculum is updated" />
      <Typography variant='h6' component="span">
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
      </Box> */}
        <Box sx={{ paddingTop: '15px', paddingBottom: '15px'  }}>
      <Typography variant='h6' component="span">
        Learning Goals
      </Typography>
      
      <Grid container spacing={2} sx={{ paddingBottom: '20px' , paddingTop: '15px'  }}>
        <Grid item xs={12} sm={6}>
          <CustomSelect
            label="Subject Name"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: '100%' } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomSelect
            label="Learning Goal"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: '100%' } }}
          />
        </Grid>
      </Grid>

      
      <Typography sx={{pt:"15px"}} variant='h6' component="span">
        Set Reminders
      </Typography>

      
      <Box sx={{ paddingBottom: '20px', paddingTop: '10px', width: '100%' }}>
        <TextField
          multiline
          rows={4}
          fullWidth
          placeholder="Explaining when notifications will be triggered"
          name="description"
          label="Explaining when notifications will be triggered"
          size="small"
        />
      </Box>
<Box display="flex" flexDirection="row" gap={3} pb="10px">
<FormControlLabel control={<Switch />} label="Set reminders for curriculum reviews" />
<FormControlLabel control={<Switch />} label="Notify teachers when curriculum is updated" />

</Box>
      
    
<Typography  variant='h6' component="span">
        Permission Connection
      </Typography>
      <Grid container spacing={2} sx={{ paddingBottom: '20px' , paddingTop: '15px' }}>
      
        <Grid item xs={12} sm={6}>
          <CustomSelect
            label="Edit Curriculum"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: '100%' } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomSelect
            label="Approved Curriculum Update"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: '100%' } }}
          />
        </Grid>
      </Grid>
    </Box>
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
      <Stack spacing={3}>
        <TextField
          fullWidth
          name="templateName"
          label="Template Name"
          onChange={() => {}}
          size="small"
        />
        <CustomSelect
          label="Grade"
          name="grade"
          options={[]}
          value=""
          formControlProps={{ fullWidth: true }}
          onChange={() => {}}
        />
        <CustomSelect
          label="Subjects"
          name="subjects"
          value=""
          options={[]}
          formControlProps={{ fullWidth: true }}
          onChange={() => {}}
        />
      </Stack>
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
