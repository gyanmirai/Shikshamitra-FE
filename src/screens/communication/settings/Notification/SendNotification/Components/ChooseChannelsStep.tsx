import type { FormikProps } from 'formik';

import React from 'react';
import { Grid, Button } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
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
            <Grid size={{ sm: 4 }} key={channel.deliveryChannel}>
              <Button
                variant={isSelected ? 'contained' : 'outlined'}
                onClick={() => handleToggle(channel.deliveryChannel)}
                sx={{
                  backgroundColor: isSelected ? 'primary.main' : 'transparent',
                  borderColor: isSelected ? 'primary.main' : channel.color,
                  color: isSelected ? '#fff' : channel.color,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: isSelected ? 'primary.main' : 'rgba(0,0,0,0.05)',
                  },
                  width: 300,
                }}
              >
                {channel.deliveryChannel}
              </Button>
            </Grid>
          );
        })}
      </Grid>
    </SectionCard>
  );
};

export default ChooseChannelsStep;
