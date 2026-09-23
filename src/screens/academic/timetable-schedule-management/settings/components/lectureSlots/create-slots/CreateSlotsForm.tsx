'use client';

import React from 'react';
import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { useSlotForm } from './useSlotForm';
import FormFooter from './components/FormFooter';
import FormSkeleton from './components/FormSkeleton';
import SlotConfigurationsBody from './components/SlotConfigurationsBody';
import SlotConfigurationsHeader from './components/SlotConfigurationsHeader';

import type { ICreateSlotsFormProps } from '../type';

const CreateSlotsForm: React.FC<ICreateSlotsFormProps> = ({
  handleClose,
  disabled,
  isEdit,
  data,
}) => {
  const slotForm = useSlotForm({ isEdit, data, handleClose });
  const {
    formik,
    canConfigureSlots,
    isClassTimingLoading,
    isLectureSlotsLoading,
    isSubmitting,
    handleAddSlotConfiguration,
  } = slotForm;

  if (isLectureSlotsLoading) {
    return <FormSkeleton />;
  }

  const slotConfigs = formik.values.slotConfigurations || [];
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarGutter: 'stable',
            scrollbarWidth: 'thin',
            scrollbarColor: (theme) => `${alpha(theme.palette.text.primary, 0.2)} transparent`,
            '&::-webkit-scrollbar': { width: 5 },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: (theme) => alpha(theme.palette.text.primary, 0.2),
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: (theme) => alpha(theme.palette.text.primary, 0.35),
            },
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              pt: 2,
              pb: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <SlotConfigurationsHeader
              canAdd={canConfigureSlots}
              disabled={disabled}
              groupCount={slotConfigs.length}
              isLoading={isClassTimingLoading}
              onAdd={handleAddSlotConfiguration}
            />
            <SlotConfigurationsBody
              data={data}
              disabled={disabled}
              isEdit={isEdit}
              slotForm={slotForm}
            />
          </Box>
        </Box>

        {!disabled && (
          <FormFooter
            disabled={isClassTimingLoading}
            isEdit={isEdit}
            loading={isSubmitting}
            onCancel={() => handleClose?.(null, false)}
            onSubmit={() => formik.handleSubmit()}
          />
        )}
      </Box>
    </BackPopUpChecked>
  );
};

export default CreateSlotsForm;
