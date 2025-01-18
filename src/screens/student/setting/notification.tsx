import React from 'react';
import { useFormik } from 'formik';

import { Add, Save } from '@mui/icons-material';
import {
  Box,
  Card,
  Stack,
  Button,
  Switch,
  FormGroup,
  TextField,
  CardHeader,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Editor } from 'src/components/editor';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';

const Notification = () => {
  const dialog = useBoolean();

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" py={2}>
        <Button startIcon={<Save />} variant="contained">
          Save
        </Button>
      </Box>
      <Card sx={{ p: 2 }}>
        <FormGroup>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Enable Email Notifications"
          />
          <FormControlLabel control={<Switch />} label="Enable SMS Notifications" />
        </FormGroup>
      </Card>

      <Card sx={{ my: 2, p: 1 }}>
        <CardHeader
          title="Notification Templates"
          action={
            <Button variant="contained" startIcon={<Add />} onClick={dialog.onTrue}>
              Create Template
            </Button>
          }
        />
        <CustomizableTable
          tableId="notification-template-table"
          columns={[
            { id: 'title', label: 'Title' },
            { id: 'template', label: 'Template' },
          ]}
          data={[]}
        />
      </Card>
      <CustomDialog title="Notification Template" open={dialog.value} handleClose={dialog.onFalse}>
        <NotificationTemplateForm handleClose={dialog.onFalse} />
      </CustomDialog>
    </Box>
  );
};

export default Notification;

const NotificationTemplateForm = ({ handleClose }: any) => {
  const { values, handleChange, setFieldValue, handleSubmit } = useFormik({
    initialValues: {
      title: '',
      description: '',
    },

    onSubmit: () => {},
  });
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={values.title}
            onChange={handleChange}
          />
          <Editor
            onChange={(value) => {
              setFieldValue('description', value);
            }}
            value={values.description}
            placeholder="Notification Format"
            sx={{ height: '100%' }}
            slotProps={{
              wrap: {
                height: '100%',
              },
            }}
          />
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => {}}>
          Save
        </Button>
      </DialogActions>
    </Box>
  );
};
