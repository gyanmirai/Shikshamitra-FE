'use client';

import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Iconify } from 'src/components/iconify';
import { alpha, lighten } from '@mui/material/styles';
import { Box, Fade, Stack, Button, Tooltip, Typography } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { useSlotForm } from './useSlotForm';
import FormFooter from './components/FormFooter';
import FormSkeleton from './components/FormSkeleton';
import SlotConfigurationAccordion from './components/SlotConfigurationAccordion';

import type { ICreateSlotsFormProps } from '../type';

const CreateSlotsForm: React.FC<ICreateSlotsFormProps> = ({
  handleClose,
  disabled,
  isEdit,
  data,
}) => {
  const {
    formik,
    allClass,
    isLectureSlotsLoading,
    isSubmitting,
    handleClassChange,
    handleAddSlotConfiguration,
    handleRemoveSlotConfiguration,
    handleTotalSlotsChange,
  } = useSlotForm({ isEdit, data, handleClose });

  if (isLectureSlotsLoading) {
    return <FormSkeleton />;
  }

  const slotConfigs = formik.values.slotConfigurations || [];
  const showRemove = slotConfigs.length > 1;
  const hasSlotConfigs = slotConfigs.length > 0;

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
              gap: 2.5,
            }}
          >
            {/* Slot Configurations Header */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              spacing={1.5}
              sx={{ mt: 0.5 }}
            >
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (theme) =>
                      alpha(
                        theme.palette.primary.main,
                        theme.palette.mode === 'dark' ? 0.22 : 0.12
                      ),
                    color: (theme) =>
                      theme.palette.mode === 'dark'
                        ? lighten(theme.palette.primary.main, 0.7)
                        : theme.palette.primary.main,
                  }}
                >
                  <Iconify icon="mdi:clock-time-four-outline" width={18} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                    Slot Configurations
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {hasSlotConfigs
                      ? `${slotConfigs.length} group${slotConfigs.length > 1 ? 's' : ''} configured`
                      : 'Add a group to start configuring slots'}
                  </Typography>
                </Box>
              </Stack>

              {!disabled && (
                <Tooltip title="Add new slot group" arrow>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddSlotConfiguration}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2,
                      boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                      transition: 'transform 150ms ease, box-shadow 200ms ease',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: (theme) =>
                          `0 6px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
                      },
                      '&:active': { transform: 'translateY(0)' },
                    }}
                  >
                    Add Slot Group
                  </Button>
                </Tooltip>
              )}
            </Stack>

            {/* Empty state */}
            {!hasSlotConfigs && (
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

            {slotConfigs.map((config: any, configIndex: number) => (
              <Fade key={config.id} in timeout={300 + configIndex * 60}>
                <Box>
                  <SlotConfigurationAccordion
                    config={config}
                    configIndex={configIndex}
                    formik={formik}
                    disabled={disabled}
                    isEdit={isEdit}
                    hasData={!!data}
                    canRemove={showRemove}
                    onRemove={() => handleRemoveSlotConfiguration(configIndex)}
                    onTotalSlotsChange={(value) => handleTotalSlotsChange(configIndex, value)}
                    classes={allClass}
                    className={formik.values.className}
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
          </Box>
        </Box>

        {!disabled && (
          <FormFooter
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
