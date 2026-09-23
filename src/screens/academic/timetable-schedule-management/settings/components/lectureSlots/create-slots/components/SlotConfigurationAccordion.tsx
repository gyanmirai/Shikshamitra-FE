import type { FormikProps } from 'formik';
import type { Dayjs } from 'dayjs';
import type { Standards } from 'src/types/school';

import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import DeleteIcon from '@mui/icons-material/Delete';
import { alpha, lighten } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShakingTextField from 'src/components/shaking-text-field';
import {
  Box,
  Chip,
  Grid,
  Stack,
  Tooltip,
  Divider,
  Accordion,
  Typography,
  IconButton,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { getDayLabel } from '../utils/dayMarks';
import SlotTimesTable from '../../slotTimesTable';
import ActiveDaysSlider from './ActiveDaysSlider';
import SlotCounterControl from './SlotCounterControl';

export interface ISlotConfig {
  id: React.Key | null | undefined;
  expanded?: boolean;
  totalSlots: unknown;
  weekRange: number[];
  timeSlots: any[];
}

interface ISlotConfigurationAccordionProps {
  config: ISlotConfig;
  configIndex: number;
  formik: FormikProps<any>;
  disabled?: boolean;
  isEdit?: boolean;
  hasData?: boolean;
  canRemove: boolean;
  onRemove: () => void;
  onTotalSlotsChange: (value: number) => void;
  // New props for class selection
  classes: Standards[];
  className: string;
  canConfigureSlots: boolean;
  classShiftMessage: string;
  shiftStartTime: Dayjs | null;
  shiftEndTime: Dayjs | null;
  classNameError?: string;
  onClassChange: (val: string) => void;
  isFirstGroup: boolean;
}

const SlotConfigurationAccordion: React.FC<ISlotConfigurationAccordionProps> = ({
  config,
  configIndex,
  formik,
  disabled,
  isEdit,
  hasData,
  canRemove,
  onRemove,
  onTotalSlotsChange,
  classes,
  className,
  canConfigureSlots,
  classShiftMessage,
  shiftStartTime,
  shiftEndTime,
  classNameError,
  onClassChange,
  isFirstGroup,
}) => {
  // Keep expanded state local — never in formik — so toggling doesn't re-render the whole form
  const [expanded, setExpanded] = useState<boolean>(config.expanded ?? true);
  const configErrors = formik.errors.slotConfigurations;
  const configErr =
    Array.isArray(configErrors) &&
    configErrors[configIndex] &&
    typeof configErrors[configIndex] === 'object'
      ? (configErrors[configIndex] as any)
      : null;

  const configTouched = (formik.touched as any).slotConfigurations?.[configIndex];

  // Class selected check for enabling slot controls
  const isClassSelected = Boolean(className);
  const slotControlsDisabled = disabled || !isClassSelected || !canConfigureSlots;
  const lockedByEdit = disabled || (isEdit && !!hasData);

  // Week range error
  const weekRangeError = useMemo(() => {
    if (!formik.submitCount && !configTouched?.weekRange) return undefined;
    return configErr && typeof configErr.weekRange === 'string' ? configErr.weekRange : undefined;
  }, [formik.submitCount, configTouched, configErr]);

  // Total slots field error (touched-aware)
  const totalSlotsError = useMemo(() => {
    if (!configTouched?.totalSlots) return undefined;
    return configErr && typeof configErr.totalSlots === 'string' ? configErr.totalSlots : undefined;
  }, [configTouched, configErr]);

  // Array-level timeSlots error string (only when totalSlots field is valid, after submit)
  const timeSlotsArrayError = useMemo(() => {
    if (!formik.submitCount) return undefined;
    if (!configErr) return undefined;
    if (configErr.totalSlots) return undefined;
    return typeof configErr.timeSlots === 'string' ? configErr.timeSlots : undefined;
  }, [formik.submitCount, configErr]);

  // Per-slot error summary messages
  const perSlotMessages = useMemo<string[]>(() => {
    if (!formik.submitCount) return [];
    if (!configErr || !Array.isArray(configErr.timeSlots)) return [];
    const messages: string[] = [];
    configErr.timeSlots.forEach((slotErr: any, idx: number) => {
      if (!slotErr || typeof slotErr !== 'object') return;
      if (slotErr.startTime) messages.push(`Slot ${idx + 1}: ${slotErr.startTime}`);
      if (slotErr.endTime) messages.push(`Slot ${idx + 1}: ${slotErr.endTime}`);
      if (slotErr.slotType) messages.push(`Slot ${idx + 1}: ${slotErr.slotType}`);
    });
    return messages;
  }, [formik.submitCount, configErr]);

  // Map of per-slot errors for SlotTimesTable
  const slotErrorsMap = useMemo(() => {
    if (!configErr || !Array.isArray(configErr.timeSlots)) return undefined;
    const map: Record<number, { startTime?: string; endTime?: string; slotType?: string }> = {};
    configErr.timeSlots.forEach((slotErr: any, idx: number) => {
      if (!slotErr || typeof slotErr !== 'object') return;
      map[idx] = {
        startTime: typeof slotErr.startTime === 'string' ? slotErr.startTime : undefined,
        endTime: typeof slotErr.endTime === 'string' ? slotErr.endTime : undefined,
        slotType: typeof slotErr.slotType === 'string' ? slotErr.slotType : undefined,
      };
    });
    return map;
  }, [configErr]);

  const hasError = Boolean(
    weekRangeError || totalSlotsError || timeSlotsArrayError || perSlotMessages.length
  );

  // Build high-contrast chip styles for both light and dark mode.
  const chipSx = (paletteColor: 'primary' | 'info' | 'success') => ({
    height: 26,
    fontWeight: 600,
    fontSize: 12,
    bgcolor: (theme: any) => alpha(theme.palette[paletteColor].main, 0.1),

    color: (theme: any) => `${theme.palette[paletteColor].main} !important`,

    border: (theme: any) =>
      `1px solid ${alpha(
        theme.palette[paletteColor].main,
        theme.vars.palette.mode === 'dark' ? 0.45 : 0.2
      )}`,
    '& .MuiChip-label': { px: 1 },
    '& .MuiChip-icon': {
      color: (theme: any) => theme.palette[paletteColor].main,
    },
    '&:hover': {
      bgcolor: (theme: any) => alpha(theme.palette[paletteColor].main, 0.15),
      borderColor: (theme: any) => alpha(theme.palette[paletteColor].main, 0.45),
    },
  });

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded((prev) => !prev)}
      disableGutters
      TransitionProps={{ mountOnEnter: true }}
      sx={{
        boxShadow: 'none',
        borderRadius: '14px !important',
        overflow: 'hidden',
        '&:before': { display: 'none' },
        border: '1px solid',
        borderColor: hasError ? (theme) => alpha(theme.palette.error.main, 0.5) : 'divider',
        bgcolor: 'background.paper',
        transition: 'border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease',
        '&:hover': {
          borderColor: hasError
            ? (theme) => theme.palette.error.main
            : (theme) => alpha(theme.palette.primary.main, 0.4),
          boxShadow: (theme) =>
            `0 4px 16px ${alpha(
              hasError ? theme.palette.error.main : theme.palette.primary.main,
              0.1
            )}`,
        },
        '&.Mui-expanded': {
          boxShadow: (theme) => `0 6px 22px ${alpha(theme.palette.primary.main, 0.1)}`,
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          px: 2,
          minHeight: 64,
          '& .MuiAccordionSummary-content': {
            my: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            gap: 1,
          },
          '& .MuiAccordionSummary-expandIconWrapper': {
            transition: 'transform 250ms ease',
          },
          background: (theme) =>
            expanded
              ? `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(
                  theme.palette.primary.main,
                  0
                )} 100%)`
              : 'transparent',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ flexWrap: 'wrap', width: '100%', rowGap: 1 }}
        >
          {/* Group number badge */}
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              color: (theme) =>
                theme.palette.mode === 'dark'
                  ? lighten(theme.palette.primary.main, 0.7)
                  : theme.palette.primary.main,
              bgcolor: (theme) =>
                alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.12),
              border: (theme) =>
                `1px solid ${alpha(
                  theme.palette.primary.main,
                  theme.palette.mode === 'dark' ? 0.5 : 0.25
                )}`,
            }}
          >
            {configIndex + 1}
          </Box>

          {!expanded ? (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ flexWrap: 'wrap', flex: 1, rowGap: 1 }}
            >
              <Chip
                size="small"
                variant="soft"
                icon={<Iconify icon="mdi:clock-outline" width={14} />}
                label={`Total Slots: ${String(config.totalSlots || 0)}`}
                color="primary"
                // sx={chipSx('info')}
              />

              {Array.isArray(config.weekRange) && config.weekRange.length === 2 && (
                <Chip
                  size="small"
                  variant="soft"
                  icon={<Iconify icon="mdi:calendar-week" width={14} />}
                  color="info"
                  label={`${getDayLabel(config.weekRange[0])} – ${getDayLabel(config.weekRange[1])}`}
                  // sx={chipSx('info')}
                />
              )}

              {config.timeSlots?.length > 0 && (
                <Chip
                  size="small"
                  variant="soft"
                  icon={<Iconify icon="mdi:clock-time-four-outline" width={14} />}
                  label={`${dayjs(config.timeSlots[0].startTime).format('hh:mm A')} – ${dayjs(
                    config.timeSlots[config.timeSlots.length - 1].endTime
                  ).format('hh:mm A')}`}
                  color="warning"
                />
              )}
              {hasError && (
                <Chip
                  size="small"
                  icon={<Iconify icon="mdi:alert-circle-outline" width={14} />}
                  label="Needs attention"
                  color="error"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Stack>
          ) : (
            <Typography variant="subtitle2" fontWeight={700} color="text.primary">
              Slot Group #{configIndex + 1}
            </Typography>
          )}
        </Stack>

        {canRemove && !disabled && (
          <Tooltip title="Remove this group" arrow>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              sx={{
                color: 'text.secondary',
                transition: 'color 150ms ease, background-color 150ms ease',
                '&:hover': {
                  color: 'error.main',
                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 1.5, px: { xs: 1.5, sm: 2 }, pb: 2 }}>
        <Box width="100%">
          {/* Class Selection & Active Days Slider Side by Side */}
          {(() => {
            const totalSlotsNode = (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Total Slots
                </Typography>
                <SlotCounterControl
                  value={Number(config.totalSlots) || 0}
                  disabled={slotControlsDisabled}
                  error={totalSlotsError}
                  min={1}
                  max={20}
                  onChange={onTotalSlotsChange}
                />
              </Stack>
            );

            return isFirstGroup ? (
              <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 3.5, lg: 3 }}>
                  <ShakingTextField error={Boolean(classNameError)}>
                    <CustomSelect
                      options={classes}
                      value={className}
                      onChange={(val) => onClassChange(val as string)}
                      label="Class *"
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ fullWidth: true }}
                      error={Boolean(classNameError)}
                      helperText={classNameError}
                      disabled={lockedByEdit}
                    />
                  </ShakingTextField>
                  {isClassSelected && !canConfigureSlots && (
                    <Typography
                      variant="caption"
                      color="warning.main"
                      sx={{ mt: 1, display: 'block' }}
                    >
                      {classShiftMessage}
                    </Typography>
                  )}
                </Grid>

                <Grid size={{ xs: 12, md: 8.5, lg: 9 }}>
                  <ActiveDaysSlider
                    value={config.weekRange}
                    disabled={slotControlsDisabled}
                    error={weekRangeError}
                    rightElement={totalSlotsNode}
                    onChange={(next) =>
                      formik.setFieldValue(`slotConfigurations[${configIndex}].weekRange`, next)
                    }
                    onBlur={() =>
                      formik.setFieldTouched(
                        `slotConfigurations[${configIndex}].weekRange`,
                        true,
                        false
                      )
                    }
                  />
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ mb: 2 }}>
                <ActiveDaysSlider
                  value={config.weekRange}
                  disabled={slotControlsDisabled}
                  error={weekRangeError}
                  rightElement={totalSlotsNode}
                  onChange={(next) =>
                    formik.setFieldValue(`slotConfigurations[${configIndex}].weekRange`, next)
                  }
                  onBlur={() =>
                    formik.setFieldTouched(
                      `slotConfigurations[${configIndex}].weekRange`,
                      true,
                      false
                    )
                  }
                />
              </Box>
            );
          })()}
          {timeSlotsArrayError && (
            <Typography
              variant="caption"
              color="error"
              sx={{ mt: 1, display: 'block', textAlign: 'right' }}
            >
              {timeSlotsArrayError}
            </Typography>
          )}

          {/* Slot Times Table */}
          {config.timeSlots && config.timeSlots.length > 0 && (
            <Box sx={{ mt: 2.5 }}>
              <Divider sx={{ mb: 1.5 }} />
              <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (theme) =>
                      alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.1),
                  }}
                >
                  <Iconify icon="mdi:table-clock" width={16} sx={{ color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="primary.main" fontWeight={700}>
                    Slot Times
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Start · End · Duration · Type for each slot
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={`${config.timeSlots.length} slot${config.timeSlots.length !== 1 ? 's' : ''}`}
                  variant="soft"
                  color="primary"
                  sx={{ ml: 'auto !important', height: 22, fontSize: '0.7rem', fontWeight: 700 }}
                />
              </Stack>

              {perSlotMessages.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  {perSlotMessages.map((msg, i) => (
                    <Typography key={i} variant="caption" color="error" display="block">
                      {msg}
                    </Typography>
                  ))}
                </Box>
              )}

              <SlotTimesTable
                configId={config.id ?? configIndex}
                slots={config.timeSlots as any}
                disabled={slotControlsDisabled}
                errors={slotErrorsMap}
                minTime={shiftStartTime}
                maxTime={shiftEndTime}
                onChange={(next) =>
                  formik.setFieldValue(`slotConfigurations[${configIndex}].timeSlots`, next)
                }
                onTouchField={(slotIndex, field) =>
                  formik.setFieldTouched(
                    `slotConfigurations[${configIndex}].timeSlots[${slotIndex}].${field}`,
                    true,
                    false
                  )
                }
              />
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default SlotConfigurationAccordion;
