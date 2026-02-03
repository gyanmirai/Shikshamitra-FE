'use client';

import type { FormikProps } from 'formik';

import { Box } from '@mui/system';
import React, { useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Checkbox, Typography, FormHelperText, FormControlLabel } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { useGetDeliveryChannelTypeOptionsQuery } from 'src/redux/communication/setting/deliveryChannelApi';

import SelectedMembersSummary from './SelectedMembersSummary';

import type { INotificationSendSchema } from './type';
import type { IDeliveryChannel } from '../../../DeliveryChannelType/type';

/**
 * Component: ChooseChannelsStep
 * Responsibilities:
 * - Rendering the selected members summary
 * - Fetching and displaying available delivery channels
 * - Handling channel toggle logic with memoization
 */
const ChooseChannelsStep = ({ formik }: { formik: FormikProps<INotificationSendSchema> }) => {
  const { data: deliveryChannelData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDeliveryChannelTypeOptionsQuery,
  });

  /**
   * Memoization Justification:
   * Event handler for toggling channels.
   * Prevents re-renders of the channel selection list when the parent component updates.
   */
  const handleToggle = useCallback(
    (channel: string) => {
      const currentChannels = formik.values.channels || [];
      if (currentChannels.includes(channel)) {
        formik.setFieldValue(
          'channels',
          currentChannels.filter((c: string) => c !== channel)
        );
      } else {
        formik.setFieldValue('channels', [...currentChannels, channel]);
      }
    },
    [formik]
  );

  return (
    <>
      <SelectedMembersSummary formik={formik} />

      <SectionCard title="Select Channels">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {deliveryChannelData?.map((channel: IDeliveryChannel) => {
              const isSelected = formik.values.channels?.includes(channel.deliveryChannel);
              return (
                <FormControlLabel
                  key={channel.deliveryChannel}
                  control={
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleToggle(channel.deliveryChannel)}
                    />
                  }
                  label={
                    <Typography sx={{ whiteSpace: 'nowrap' }}>{channel.deliveryChannel}</Typography>
                  }
                />
              );
            })}
          </Box>
          {formik.errors.channels && (
            <FormHelperText
              error
              sx={{
                fontSize: '11px !important',
                marginLeft: '0px !important',
              }}
            >
              {formik.errors.channels}
            </FormHelperText>
          )}
        </Box>
      </SectionCard>
    </>
  );
};

export default ChooseChannelsStep;
