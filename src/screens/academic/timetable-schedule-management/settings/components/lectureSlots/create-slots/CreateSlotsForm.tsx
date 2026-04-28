'use client';

import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, lighten } from '@mui/material/styles';
import { Box, Fade, Stack, Button, Tooltip, Typography } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { useSlotForm } from './useSlotForm';
import FormFooter from './components/FormFooter';
import FormSkeleton from './components/FormSkeleton';
import GeneralInfoSection from './components/GeneralInfoSection';
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
    handleAddSlotConfiguration,
    handleRemoveSlotConfiguration,
    handleTotalSlotsChange,
    handleToggleAccordion,
  } = useSlotForm({ isEdit, data, handleClose });

  if (isLectureSlotsLoading) {
    return <FormSkeleton />;
  }

  const slotConfigs = formik.values.slotConfigurations || [];
  const showRemove = slotConfigs.length > 1;
  const hasSlotConfigs = slotConfigs.length > 0;

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Scrollbar
        sx={{
          overflowY: 'auto',
          overflowX: 'hidden',
          height: '100%',
        }}
      >
        <Box
          sx={{
            flex: 1,
            // overflowY: 'auto',
            // overflowX: 'hidden',
            px: { xs: 2, sm: 3 },
            pt: 2,
            pb: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            // height: 'calc(100vh - 200px)',
            position: 'relative',
            // Smoother native scrollbar
            // scrollbarWidth: 'thin',
            // '&::-webkit-scrollbar': { width: 8 },
            // '&::-webkit-scrollbar-thumb': {
            //   backgroundColor: (theme) => alpha(theme.palette.text.primary, 0.15),
            //   borderRadius: 8,
            // },
            // '&::-webkit-scrollbar-thumb:hover': {
            //   backgroundColor: (theme) => alpha(theme.palette.text.primary, 0.25),
            // },
          }}
        >
          {/* General Information Card */}
          <Fade in timeout={350}>
            <Box
              sx={{
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                p: { xs: 2, sm: 2.5 },
                bgcolor: 'background.paper',
                backgroundImage: (theme) =>
                  `linear-gradient(180deg, ${alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === 'dark' ? 0.08 : 0.04
                  )} 0%, ${alpha(theme.palette.background.paper, 0)} 70%)`,
                transition: 'box-shadow 200ms ease, border-color 200ms ease',
                '&:hover': {
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                  boxShadow: (theme) =>
                    `0 4px 18px ${alpha(
                      theme.palette.primary.main,
                      theme.palette.mode === 'dark' ? 0.18 : 0.08
                    )}`,
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.25} mb={2}>
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
                  <Iconify icon="mdi:information-outline" width={18} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                    General Information
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Set the class and base hours for this timetable.
                  </Typography>
                </Box>
              </Stack>

              <GeneralInfoSection
                classes={allClass}
                className={formik.values.className}
                schoolHours={formik.values.schoolHours}
                previousClassSlots={formik.values.previousClassSlots}
                classNameError={
                  formik.touched.className && typeof formik.errors.className === 'string'
                    ? formik.errors.className
                    : undefined
                }
                schoolHoursError={
                  formik.touched.schoolHours && typeof formik.errors.schoolHours === 'string'
                    ? formik.errors.schoolHours
                    : undefined
                }
                previousClassError={
                  formik.touched.previousClassSlots &&
                  typeof formik.errors.previousClassSlots === 'string'
                    ? formik.errors.previousClassSlots
                    : undefined
                }
                disabled={disabled}
                isEdit={isEdit}
                hasData={!!data}
                onChangeClassName={(val) => formik.setFieldValue('className', val)}
                onChangePreviousClassSlots={(val) =>
                  formik.setFieldValue('previousClassSlots', val)
                }
                onChangeSchoolHours={formik.handleChange}
              />
            </Box>
          </Fade>

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
                    alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.12),
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
                      boxShadow: (theme) => `0 6px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
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
                  onToggle={() => handleToggleAccordion(configIndex)}
                  onRemove={() => handleRemoveSlotConfiguration(configIndex)}
                  onTotalSlotsChange={(value) => handleTotalSlotsChange(configIndex, value)}
                />
              </Box>
            </Fade>
          ))}
        </Box>
      </Scrollbar>

      {!disabled && (
        <FormFooter
          isEdit={isEdit}
          loading={isSubmitting}
          onCancel={() => handleClose?.(null, false)}
          onSubmit={() => formik.handleSubmit()}
        />
      )}
    </BackPopUpChecked>
  );
};

export default CreateSlotsForm;
