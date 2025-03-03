import type { Dayjs } from 'dayjs';

import { useFormik } from 'formik';
import React, { useState } from 'react';

import { TimePicker } from '@mui/x-date-pickers';
import {
  Tab,
  Grid,
  Tabs,
  Switch,
  Button,
  TextField,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

interface FinanceNotificationDialogForPendingFeeProps {
  open: boolean;
  onClose: () => void;
  selectedCategory: string;
}

const roles = ['Teacher', 'Student'];

const templateMessages: Record<string, string> = {
  pending1: 'Friendly Reminder: Your upcoming fee is due soon. Kindly make the payment.',
  pending2: 'Attention: Your pending fee is due in a few days. Please ensure timely payment.',
  pending3: 'Important: Your fee payment deadline is approaching. Please clear it soon.',
};

const FinanceNotificationDialogForPendingFee: React.FC<
  FinanceNotificationDialogForPendingFeeProps
> = ({ open, onClose, selectedCategory }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [triggerType, setTriggerType] = useState('X days before due');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [recurrence, setRecurrence] = useState(false);
  const [repeatDays, setRepeatDays] = useState(1);
  const [generateAt, setGenerateAt] = useState<Dayjs | null>(null);

  const formik = useFormik({
    initialValues: {
      notifications: roles.reduce(
        (acc, role) => ({
          ...acc,
          [role]: {
            template: '',
            notificationModes: {
              email: false,
              sms: false,
              whatsapp: false,
            },
          },
        }),
        {} as Record<
          string,
          {
            template: string;
            notificationModes: { email: boolean; sms: boolean; whatsapp: boolean };
          }
        >
      ),
    },
    onSubmit: (values) => {
      console.log('Submitted values:', values);
      onClose();
    },
  });

  return (
    <CustomDialog
      title="Automatic Rule for Pending Fee Alert"
      open={open}
      handleClose={onClose}
      maxWidth="lg"
    >
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            {roles.map((role, index) => (
              <Tab key={role} label={role} value={index} />
            ))}
          </Tabs>

          <Scrollbar sx={{ p: 0, height: '500px' }}>
            <Grid container spacing={2} pt={3}>
              <Grid item lg={6}>
                <CustomSelect
                  label="Select Rule"
                  options={[{ label: 'X days before the due date', value: 'X days before due' }]}
                  value={triggerType}
                  onChange={(e: any) => setTriggerType(e)}
                />
              </Grid>

              {triggerType === 'X days before due' && (
                <Grid item lg={6}>
                  <TextField
                    size="small"
                    label="Enter the day(s) before due"
                    type="number"
                    fullWidth
                    onChange={(e) => setRepeatDays(parseInt(e.target.value, 10) || 1)}
                  />
                </Grid>
              )}

              <Grid item lg={6}>
                <CustomSelect
                  multiple
                  label="Select Recipient"
                  options={[
                    { label: '1', value: '1' },
                    { label: '2', value: '2' },
                  ]}
                  value={[]}
                  onChange={(e: any) => console.log(e)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TimePicker
                  label="Send Notification At"
                  format="HH:mm"
                  value={generateAt}
                  onChange={(newValue) => setGenerateAt(newValue)}
                  views={['hours', 'minutes']}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>

              <Grid item lg={12}>
                <CustomSelect
                  label="Select Template"
                  options={Object.keys(templateMessages).map((key) => ({
                    label: templateMessages[key],
                    value: key,
                  }))}
                  value={selectedTemplate}
                  onChange={(e: any) => setSelectedTemplate(e)}
                />
              </Grid>

              {selectedTemplate && (
                <Grid item lg={12}>
                  <TextField
                    multiline
                    rows={3}
                    size="small"
                    label="Notification Preview"
                    value={templateMessages[selectedTemplate]}
                    fullWidth
                    disabled
                  />
                </Grid>
              )}

              <Grid item lg={6}>
                <FormControlLabel
                  control={
                    <Switch checked={recurrence} onChange={() => setRecurrence(!recurrence)} />
                  }
                  label="Enable Recurrence"
                />
              </Grid>

              {recurrence && (
                <Grid item lg={6}>
                  <TextField
                    size="small"
                    label="Repeat Every (Days)"
                    type="number"
                    fullWidth
                    value={repeatDays}
                    onChange={(e) => setRepeatDays(parseInt(e.target.value, 10) || 1)}
                  />
                </Grid>
              )}
            </Grid>
          </Scrollbar>
        </DialogContent>
        <DialogActions>
          <Button type="submit" variant="outlined" size="small">
            Save
          </Button>
        </DialogActions>
      </form>
    </CustomDialog>
  );
};

export default FinanceNotificationDialogForPendingFee;
