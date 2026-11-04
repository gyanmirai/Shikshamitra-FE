import CustomSelect from 'src/components/custom-select';
import { Box, Divider, Typography } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import ActiveDaysSlider from './ActiveDaysSlider';
import SlotGroupTimesSection from './SlotGroupTimesSection';

import type { SlotConfigurationAccordionProps } from '../types';
import type { getSlotConfigurationErrors } from '../hooks/useSlotConfigurationErrors';

type Props = SlotConfigurationAccordionProps & {
  errors: ReturnType<typeof getSlotConfigurationErrors>;
};

export default function SlotGroupFields(props: Props) {
  const {
    config,
    configIndex,
    formik,
    disabled,
    isEdit,
    hasData,
    classes,
    className,
    canConfigureSlots,
    classShiftMessage,
    classNameError,
    onClassChange,
    isFirstGroup,
    errors,
  } = props;
  const controlsDisabled = disabled || !className || !canConfigureSlots;
  const classLabel = classes.find((item) => item.id === className)?.name || 'Selected class';
  const prefix = `slotConfigurations[${configIndex}]`;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      {isFirstGroup && (
        <Box sx={{ width: 1, maxWidth: 360 }}>
          <ShakingTextField error={Boolean(classNameError)}>
            <CustomSelect
              options={classes}
              value={className}
              label="Class"
              required
              name="className"
              labelKey="name"
              valueKey="id"
              formControlProps={{ fullWidth: true }}
              error={Boolean(classNameError)}
              helperText={classNameError}
              disabled={disabled || (isEdit && hasData)}
              onChange={(value) => onClassChange(value as string)}
              onBlur={() => formik.setFieldTouched('className', true)}
            />
          </ShakingTextField>
          {className && !canConfigureSlots && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {classShiftMessage}
            </Typography>
          )}
        </Box>
      )}
      <ActiveDaysSlider
        fieldName={`${prefix}.weekRange`}
        value={config.weekRange}
        disabled={controlsDisabled}
        error={errors.weekRange}
        onChange={(value) => formik.setFieldValue(`${prefix}.weekRange`, value)}
        onBlur={() => formik.setFieldTouched(`${prefix}.weekRange`, true, false)}
      />
      <Divider />
      <SlotGroupTimesSection {...props} disabled={controlsDisabled} classLabel={classLabel} />
    </Box>
  );
}
