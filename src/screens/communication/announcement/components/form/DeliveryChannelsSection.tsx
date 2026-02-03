import React, { memo } from 'react';
import { useFormikContext } from 'formik';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { Box, Grid, Checkbox, Typography, FormHelperText, FormControlLabel } from '@mui/material';

import type { ISchoolWiseAnnouncementFormValues } from '../../type';

const DeliveryChannelsSection = () => {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<ISchoolWiseAnnouncementFormValues>();

  const channels = ['In-App', 'Email', 'SMS', 'Whatsapp'];
  const labels: Record<string, string> = {
    'In-App': 'In-App',
    Email: 'Email',
    SMS: 'SMS',
    Whatsapp: 'Whatsapp',
  };

  const handleChannelChange = (type: string) => {
    const current = values.notification_preferences || [];
    if (current.includes(type)) {
      setFieldValue(
        'notification_preferences',
        current.filter((c: string) => c !== type)
      );
    } else {
      setFieldValue('notification_preferences', [...current, type]);
    }
  };

  return (
    <SectionCard title="Delivery Channels">
      <Grid size={{ xs: 12 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {channels.map((type) => (
            <FormControlLabel
              key={type}
              control={
                <Checkbox
                  checked={values.notification_preferences.includes(type)}
                  onChange={() => handleChannelChange(type)}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="body2">{labels[type]}</Typography>
                </Box>
              }
            />
          ))}
        </Box>
        {touched.notification_preferences && errors.notification_preferences && (
          <FormHelperText
            error
            sx={{
              fontSize: '10px !important',
              marginBottom: 0,
              position: 'none',
              marginLeft: ' 0px !important',
              bottom: 0,
            }}
          >
            {String(errors.notification_preferences)}
          </FormHelperText>
        )}
      </Grid>
    </SectionCard>
  );
};

/**
 * Memoization Justification:
 * Pure UI component relying on Formik context. Memo prevents re-renders from parent re-renders unrelated to form state.
 */
export default memo(DeliveryChannelsSection);
