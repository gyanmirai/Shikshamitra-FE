import type { FormikProps } from 'formik';

import React from 'react';
import { Box } from '@mui/system';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { Grid, Chip, Checkbox, Typography, FormHelperText, FormControlLabel } from '@mui/material';
import { useGetDeliveryChannelTypeOptionsQuery } from 'src/redux/communication/setting/deliveryChannelApi';

import type { INotificationSendSchema } from './type';

const ChooseChannelsStep = ({ formik }: { formik: FormikProps<INotificationSendSchema> }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: deliveryChannelData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDeliveryChannelTypeOptionsQuery,
  });
  const handleToggle = (channel: string) => {
    const currentChannels = formik.values.channels || [];
    if (currentChannels.includes(channel)) {
      formik.setFieldValue(
        'channels',
        currentChannels.filter((c: string) => c !== channel)
      );
    } else {
      formik.setFieldValue('channels', [...currentChannels, channel]);
    }
  };

  return (
    <>
      <SectionCard title="Selected Members">
        <Grid size={{ xs: 12 }}>
          <Typography>
            {formik.values.members.filter((member: any) => member.isSelect).length > 0
              ? (() => {
                  const selectedMembers = formik.values.members
                    .filter((member: any) => member.isSelect)
                    .map((member: any) => member.name);
                  const count = selectedMembers.length;
                  if (count > 5) {
                    return (
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 0.5,
                          flexWrap: 'wrap',
                          verticalAlign: 'middle',
                        }}
                      >
                        {selectedMembers.slice(0, 5).map((org: string) => (
                          <Chip key={org} label={org} size="small" variant="outlined" />
                        ))}
                        <Typography component="span" sx={{ ml: 0.5 }}>
                          +{count - 5}...
                        </Typography>
                      </Box>
                    );
                  }
                  return (
                    <Box
                      sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', verticalAlign: 'middle' }}
                    >
                      {selectedMembers.map((org: string) => (
                        <Chip key={org} label={org} size="small" variant="outlined" />
                      ))}
                    </Box>
                  );
                })()
              : 'Please select members to send notifications'}
          </Typography>
        </Grid>
      </SectionCard>
      <SectionCard title="Select Channels">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {['Email', 'SMS', 'Push Notification']?.map((channel: string) => {
              const isSelected = formik.values.channels?.includes(channel);
              return (
                <FormControlLabel
                  key={channel}
                  control={<Checkbox checked={isSelected} onChange={() => handleToggle(channel)} />}
                  label={<Typography sx={{ whiteSpace: 'nowrap' }}>{channel}</Typography>}
                />
              );
            })}
            {formik.errors.channels && (
              <FormHelperText
                error
                sx={{
                  fontSize: '11px !important',
                  marginBottom: 0,
                  position: 'none',
                  marginLeft: ' 0px !important',
                  bottom: 0,
                }}
              >
                {formik.errors.channels}
              </FormHelperText>
            )}
          </Box>
        </Box>
      </SectionCard>
    </>
  );
};

export default ChooseChannelsStep;
