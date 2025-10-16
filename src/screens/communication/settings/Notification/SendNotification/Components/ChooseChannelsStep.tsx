import type { FormikProps } from 'formik';

import React from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Grid, Checkbox, FormHelperText, FormControlLabel } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { useGetDeliveryChannelTypeOptionsQuery } from 'src/redux/communication/setting/deliveryChannelApi';

import type { INotificationSendSchema } from './type';
import type { IDeliveryChannel } from '../../../DeliveryChannelType/type';

const ChooseChannelsStep = ({ formik }: { formik: FormikProps<INotificationSendSchema> }) => {
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
    <SectionCard title="Select Channels">
      <Grid container spacing={2}>
        {deliveryChannelData?.map((channel: IDeliveryChannel) => {
          const isSelected = formik.values.channels?.includes(channel.deliveryChannel);
          return (
            <Grid size={{ sm: 3 }} key={channel.deliveryChannel}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleToggle(channel.deliveryChannel)}
                  />
                }
                label={channel.deliveryChannel}
              />
            </Grid>
          );
        })}
        {formik.errors.channels && (
          <FormHelperText
            error
            sx={{
              left: 0,
              fontSize: '10px !important',
              marginLeft: 0, // 🚀 removes default left space
            }}
          >
            {formik.errors.channels}
          </FormHelperText>
        )}
      </Grid>
    </SectionCard>
  );
};

export default ChooseChannelsStep;
