'use client';

import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Fade, Typography } from '@mui/material';

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
        <Fade in timeout={300}>
          <Box
            sx={{
              borderRadius: 2.5,
              border: '1px dashed',
              borderColor: 'divider',
              p: 4,
              textAlign: 'center',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <Iconify
              icon="mdi:calendar-clock-outline"
              width={42}
              sx={{ color: 'text.disabled', mb: 1 }}
            />
            <Typography variant="subtitle2" color="text.primary" fontWeight={600}>
              No slot groups yet
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Click &quot;Add Slot Group&quot; to define active days and time slots.
            </Typography>
          </Box>
        </Fade>
      )}

      {slotConfigs.map((config, configIndex) => (
        <Fade key={config.id} in timeout={300 + configIndex * 60}>
          <Box>
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
                formik.touched.className && typeof formik.errors.className === 'string'
                  ? formik.errors.className
                  : undefined
              }
              onClassChange={handleClassChange}
              isFirstGroup={configIndex === 0}
            />
          </Box>
        </Fade>
      ))}
    </>
  );
}
