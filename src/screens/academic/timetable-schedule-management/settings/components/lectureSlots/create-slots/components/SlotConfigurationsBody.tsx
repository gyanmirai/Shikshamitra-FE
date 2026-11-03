'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';

import CapacitySummary from './CapacitySummary';
import ClassTimingStatus from './ClassTimingStatus';
import SlotConfigurationAccordion from './SlotConfigurationAccordion';

import type { useSlotForm } from '../useSlotForm';
import type { ISlotConfig } from './SlotConfigurationAccordion';

interface SlotConfigurationsBodyProps {
  data?: unknown;
  disabled?: boolean;
  isEdit?: boolean;
  slotForm: ReturnType<typeof useSlotForm>;
}

export default function SlotConfigurationsBody({
  data,
  disabled,
  isEdit,
  slotForm,
}: SlotConfigurationsBodyProps) {
  const {
    formik,
    allClass,
    canConfigureSlots,
    classShiftMessage,
    selectedClassShift,
    isClassTimingLoading,
    handleClassChange,
    handleRemoveSlotConfiguration,
    handleTotalSlotsChange,
  } = slotForm;
  const slotConfigs = (formik.values.slotConfigurations || []) as ISlotConfig[];

  return (
    <>
      <ClassTimingStatus
        isLoading={isClassTimingLoading}
        message={classShiftMessage}
        shift={selectedClassShift}
      />

      {slotConfigs.length > 0 && (
        <CapacitySummary isLoading={isClassTimingLoading} slotConfigurations={slotConfigs} />
      )}

      {slotConfigs.length === 0 && (
        <Box
          sx={{
            borderRadius: 2.5,
            border: '1px dashed',
            borderColor: 'divider',
            p: 4,
            textAlign: 'center',
            bgcolor: 'background.neutral',
          }}
        >
          <Iconify icon={GlobalIcons.clock} width={42} sx={{ color: 'text.disabled', mb: 1 }} />
          <Typography variant="subtitle2" color="text.primary" fontWeight={600}>
            No slot groups yet
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Select a class with an assigned shift to configure active days and time slots.
          </Typography>
        </Box>
      )}

      {slotConfigs.map((config, configIndex) => (
        <Box key={config.id}>
          <SlotConfigurationAccordion
            config={config}
            configIndex={configIndex}
            formik={formik}
            disabled={disabled}
            isEdit={isEdit}
            hasData={Boolean(data)}
            canRemove={slotConfigs.length > 1}
            onRemove={() => handleRemoveSlotConfiguration(configIndex)}
            onTotalSlotsChange={(value) => handleTotalSlotsChange(configIndex, value)}
            classes={allClass}
            className={formik.values.className}
            canConfigureSlots={canConfigureSlots}
            classShiftMessage={classShiftMessage}
            shiftStartTime={selectedClassShift?.start ?? null}
            shiftEndTime={selectedClassShift?.end ?? null}
            classNameError={
              (formik.touched.className || formik.submitCount > 0) &&
              typeof formik.errors.className === 'string'
                ? formik.errors.className
                : undefined
            }
            onClassChange={handleClassChange}
            isFirstGroup={configIndex === 0}
          />
        </Box>
      ))}
    </>
  );
}
