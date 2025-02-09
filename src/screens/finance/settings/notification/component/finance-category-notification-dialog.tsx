import { useFormik } from 'formik';
import React, { useState } from 'react';

import {
  Tab,
  Box,
  Grid,
  Tabs,
  Paper,
  Button,
  Checkbox,
  FormGroup,
  Typography,
  FormControl,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import NotificationForm from 'src/components/notification-form';

interface FinanceCategoryNotificationDialogProps {
  open: boolean;
  onClose: () => void;
  selectedCategory: any;
}

const roles = ['Teacher', 'Parent']; // Define roles

// Template messages
const templateMessages: Record<string, string> = {
  overdue1: 'Reminder: Your payment is overdue. Please clear it as soon as possible.',
  overdue2: 'Urgent: Your overdue payment has exceeded 15 days. Immediate action required.',
  overdue3: 'Final Notice: Your account will be penalized due to overdue payment.',
};

const FinanceCategoryNotificationDialog: React.FC<FinanceCategoryNotificationDialogProps> = ({
  open,
  onClose,
  selectedCategory,
}) => {
  const [activeTab, setActiveTab] = useState(0); // Track active tab index

  const formik = useFormik<any>({
    initialValues: {
      notifications: roles.reduce(
        (acc, role) => {
          acc[role] = {
            template: '',
            notificationModes: {
              email: false,
              sms: false,
              whatsapp: false,
            },
          };
          return acc;
        },
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
      onClose(); // Close dialog after submitting
    },
  });

  return (
    <CustomDialog
      title={`Set Auto Notification for ${selectedCategory}`}
      open={open}
      handleClose={onClose}
      maxWidth="lg"
    >
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {/* Tabs for Roles */}
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            {roles.map((role, index) => (
              <Tab key={role} label={role} value={index} />
            ))}
          </Tabs>

          <Scrollbar sx={{ p: 0, height: '500px' }}>
            {/* Tab Content */}
            <Box pt={4}>
              {roles.map((role, index) => (
                <Box key={role} hidden={activeTab !== index}>
                  <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={3}>
                      {/* Template Selection */}
                      <Grid item md={6}>
                        <CustomSelect
                          label="Select Template"
                          options={[
                            { label: 'Overdue 1', value: 'overdue1' },
                            { label: 'Overdue 2', value: 'overdue2' },
                            { label: 'Overdue 3', value: 'overdue3' },
                          ]}
                          value={formik.values.notifications[role].template}
                          onChange={(val) =>
                            formik.setFieldValue(`notifications.${role}.template`, val)
                          }
                          formControlProps={{ fullWidth: true }}
                        />
                      </Grid>
                      <Grid item md={6}>
                        <FormControl component="fieldset">
                          <FormGroup row>
                            {['email', 'sms', 'whatsapp'].map((mode) => (
                              <FormControlLabel
                                key={mode}
                                control={
                                  <Checkbox
                                    checked={
                                      formik.values.notifications[role].notificationModes[mode]
                                    }
                                    onChange={(e) =>
                                      formik.setFieldValue(
                                        `notifications.${role}.notificationModes.${mode}`,
                                        e.target.checked
                                      )
                                    }
                                  />
                                }
                                label={mode.toUpperCase()}
                              />
                            ))}
                          </FormGroup>
                        </FormControl>
                      </Grid>

                      {/* Notification Mode Selection */}

                      <Grid item xs={10}>
                        <NotificationForm />
                      </Grid>

                      {/* Template Message Display */}
                      <Grid item xs={12}>
                        {formik.values.notifications[role].template && (
                          <Paper
                            sx={{
                              mt: 1,
                              p: 2,
                              backgroundColor: '#f9f9f9',
                              height: 100, // Fixed height
                              width: '100%', // Adjust to parent width
                              overflowY: 'auto', // Enable scrollbar if content overflows
                              border: '1px solid #ddd', // Optional: Adds a border for clarity
                              borderRadius: '4px',
                            }}
                          >
                            <Typography variant="body2">
                              {templateMessages[formik.values.notifications[role].template]}
                            </Typography>
                          </Paper>
                        )}
                      </Grid>
                    </Grid>
                  </form>
                </Box>
              ))}
            </Box>
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

export default FinanceCategoryNotificationDialog;
