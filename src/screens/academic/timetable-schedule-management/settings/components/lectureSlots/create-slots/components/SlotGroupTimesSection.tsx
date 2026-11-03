import { useId } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Box, Typography } from '@mui/material';
import { FormSectionHeader } from 'src/components/form-section-card';

import SlotTimesTable from '../../slotTimesTable';
import SlotCounterControl from './SlotCounterControl';

import type { SlotConfigurationAccordionProps } from '../types';
import type { getSlotConfigurationErrors } from '../hooks/useSlotConfigurationErrors';

type Props = Pick<
  SlotConfigurationAccordionProps,
  | 'config'
  | 'configIndex'
  | 'formik'
  | 'disabled'
  | 'shiftStartTime'
  | 'shiftEndTime'
  | 'onTotalSlotsChange'
> & {
  classLabel: string;
  errors: ReturnType<typeof getSlotConfigurationErrors>;
};

export default function SlotGroupTimesSection({
  config,
  configIndex,
  formik,
  disabled,
  shiftStartTime,
  shiftEndTime,
  onTotalSlotsChange,
  classLabel,
  errors,
}: Props) {
  const errorId = useId();
  const prefix = `slotConfigurations[${configIndex}]`;
  return (
    <Box
      component="fieldset"
      // Let an invalid slot counter receive error focus before the schedule collection.
      name={errors.totalSlots ? undefined : `${prefix}.timeSlots`}
      tabIndex={-1}
      aria-label="Time slots"
      aria-describedby={errors.timeSlots ? errorId : undefined}
      sx={{
        m: 0,
        p: 0,
        border: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
      }}
    >
      <FormSectionHeader
        icon={GlobalIcons.clock}
        title="Time Slots"
        titleTypographyProps={{ fontWeight: 600 }}
        descriptionTooltip="Set the slots per day, then edit the start time, end time, and period or break type within the assigned shift."
        actionFullWidthOnMobile
        action={
          <SlotCounterControl
            fieldName={`${prefix}.totalSlots`}
            label={`${classLabel} slot group ${configIndex + 1}`}
            value={Number(config.totalSlots) || 0}
            disabled={disabled}
            error={errors.totalSlots}
            min={1}
            max={20}
            onChange={onTotalSlotsChange}
          />
        }
      />
      {errors.timeSlots && (
        <Typography data-slot-error id={errorId} variant="caption" color="error">
          {errors.timeSlots}
        </Typography>
      )}
      {config.timeSlots.length > 0 ? (
        <SlotTimesTable
          namePrefix={`${prefix}.timeSlots`}
          configId={config.id ?? configIndex}
          slots={config.timeSlots}
          disabled={disabled}
          errors={errors.slotErrors}
          minTime={shiftStartTime}
          maxTime={shiftEndTime}
          onChange={(value) => formik.setFieldValue(`${prefix}.timeSlots`, value)}
          onTouchField={(index, field) =>
            formik.setFieldTouched(`${prefix}.timeSlots[${index}].${field}`, true, false)
          }
        />
      ) : (
        <Typography variant="body2" color="text.secondary">
          Use Slots per day to add time slots.
        </Typography>
      )}
    </Box>
  );
}
