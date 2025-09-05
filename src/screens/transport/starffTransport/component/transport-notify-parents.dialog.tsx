import React from 'react';
import { useFormik } from 'formik';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import {
  Box,
  Radio,
  Button,
  TextField,
  Typography,
  RadioGroup,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

interface TransportNotifyParentsDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;

  allData: any;
}

interface FormikValue {
  name: string;
  messageField: string;
  notificationType: string;
}

const TransportNotifyParentsDialog: React.FC<TransportNotifyParentsDialogProps> = ({
  dialogValue,
  onSave,
  onClose,
  data,
  allData,
}) => {
  const formik = useFormik<FormikValue>({
    initialValues: {
      messageField: '',
      name: data.name,
      notificationType: 'email',
    },
    onSubmit: (values) => {
      console.log('Form Submitted', values);
    },
  });
  return (
    <CustomDialog title="Notify Parent/Staff" open={dialogValue} handleClose={onClose}>
      <Scrollbar>
        <Box px="15px">
          <form onSubmit={formik.handleSubmit}>
            <Box pt="10px" display="flex" flexDirection="column" gap={3}>
              <TextField
                name="name"
                label="Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                size="small"
              />
              <TextField
                multiline
                rows={4}
                name="messageField"
                label="Message Field"
                type="number"
                value={formik.values.messageField}
                onChange={formik.handleChange}
                size="small"
              />
            </Box>
            <Box py="15px">
              <Typography variant="subtitle1">Notification Method</Typography>

              <RadioGroup
                row
                value={formik.values.notificationType}
                onChange={(e) => formik.setFieldValue('notificationType', e.target.value)}
              >
                <FormControlLabel value="email" control={<Radio />} label="Email" />
                <FormControlLabel value="sms" control={<Radio />} label="SMS" />
              </RadioGroup>
            </Box>
            <DialogActions>
              <Button type="submit" variant="contained" size="small">
                Send Notification
              </Button>
            </DialogActions>
          </form>
        </Box>
      </Scrollbar>
    </CustomDialog>
  );
};

export default TransportNotifyParentsDialog;
