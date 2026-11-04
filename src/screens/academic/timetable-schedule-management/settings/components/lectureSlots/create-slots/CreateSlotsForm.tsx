'use client';

import React from 'react';
import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { useFormikErrorFocus } from 'src/hooks/use-formik-error-focus';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useAcademicSetupStandard,
  useAcademicSetupFormState,
  useAcademicSetupEmbedding,
} from 'src/screens/academic/setup/embedding';

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
  onStateChange,
}) => {
  const { embedded } = useAcademicSetupEmbedding();
  const slotForm = useSlotForm({ isEdit, data, handleClose });
  const {
    formik,
    canConfigureSlots,
    isClassTimingLoading,
    isLectureSlotsLoading,
    isSubmitting,
    handleAddSlotConfiguration,
  } = slotForm;
  useAcademicSetupFormState(
    { dirty: formik.dirty, busy: isSubmitting || formik.isSubmitting },
    onStateChange
  );
  useAcademicSetupStandard(formik.values.className);
  useFormikErrorFocus(formik);

  if (isLectureSlotsLoading) {
    return <FormSkeleton />;
  }

  const slotConfigs = formik.values.slotConfigurations || [];
  const busy = isSubmitting || formik.isSubmitting;
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box
        component="form"
        noValidate
        onSubmit={formik.handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: embedded ? '0 0 auto' : '0 1 auto',
          maxHeight: embedded ? undefined : '100%',
          minHeight: 0,
          position: 'relative',
          overflow: embedded ? 'visible' : 'hidden',
          '& [data-slot-error], & .MuiFormHelperText-root.Mui-error, & .MuiFormLabel-root.Mui-error':
            (theme) => ({
              color: theme.vars.palette.error.dark,
              ...theme.applyStyles('dark', { color: theme.vars.palette.error.light }),
            }),
        }}
      >
        <FormBusyRegion busy={busy} label="Saving lecture slots" showOverlay={false} fillContent>
          <Box
            data-testid="lecture-slot-form-body"
            sx={{
              minHeight: 0,
              flex: '0 1 auto',
              overflowY: embedded ? 'visible' : 'auto',
              overflowX: embedded ? 'visible' : 'hidden',
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
                pb: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
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
        </FormBusyRegion>

        {!disabled && (
          <FormFooter
            disabled={isClassTimingLoading}
            isEdit={isEdit}
            loading={busy}
            onCancel={() => handleClose?.(null, false)}
            onSubmit={() => formik.handleSubmit()}
          />
        )}
      </Box>
    </BackPopUpChecked>
  );
};

export default CreateSlotsForm;
