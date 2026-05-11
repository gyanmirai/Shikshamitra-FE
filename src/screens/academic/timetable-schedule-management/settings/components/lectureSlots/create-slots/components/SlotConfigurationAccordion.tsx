import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import DeleteIcon from '@mui/icons-material/Delete';
import { alpha, lighten } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Chip,
  Grid,
  Stack,
  Switch,
  Tooltip,
  Divider,
  Accordion,
  Typography,
  IconButton,
  FormControlLabel,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { getDayLabel } from '../utils/dayMarks';
import TotalSlotsInput from './TotalSlotsInput';
import SlotTimesTable from '../../slotTimesTable';
import ActiveDaysSlider from './ActiveDaysSlider';

interface ISlotConfig {
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
  onToggle: () => void;
  onRemove: () => void;
  onTotalSlotsChange: (value: string) => void;
}

const SlotConfigurationAccordion: React.FC<ISlotConfigurationAccordionProps> = ({
  config,
  configIndex,
  formik,
  disabled,
  isEdit,
  hasData,
  canRemove,
  onToggle,
  onRemove,
  onTotalSlotsChange,
}) => {
  // UI-only: Dense mode indicator (back-to-back slots without gaps)
  // Cascade logic already runs natively; this toggle reflects that behavior visually.
  const [isDense, setIsDense] = useState(true);
  const configErrors = formik.errors.slotConfigurations;
  const configErr =
    Array.isArray(configErrors) &&
    configErrors[configIndex] &&
    typeof configErrors[configIndex] === 'object'
      ? (configErrors[configIndex] as any)
      : null;

  const configTouched = (formik.touched as any).slotConfigurations?.[configIndex];

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
    });
    return messages;
  }, [formik.submitCount, configErr]);

  // Map of per-slot errors for SlotTimesTable
  const slotErrorsMap = useMemo(() => {
    if (!configErr || !Array.isArray(configErr.timeSlots)) return undefined;
    const map: Record<number, { startTime?: string; endTime?: string }> = {};
    configErr.timeSlots.forEach((slotErr: any, idx: number) => {
      if (!slotErr || typeof slotErr !== 'object') return;
      map[idx] = {
        startTime: typeof slotErr.startTime === 'string' ? slotErr.startTime : undefined,
        endTime: typeof slotErr.endTime === 'string' ? slotErr.endTime : undefined,
      };
    });
    return map;
  }, [configErr]);

  const totalSlotsValue = config.totalSlots != null ? String(config.totalSlots) : '';

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
      expanded={config.expanded}
      onChange={onToggle}
      disableGutters
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
            gap: 2,
          },
          '& .MuiAccordionSummary-expandIconWrapper': {
            transition: 'transform 250ms ease',
          },
          background: (theme) =>
            config.expanded
              ? `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(
                  theme.palette.primary.main,
                  0
                )} 100%)`
              : 'transparent',
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
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

          {!config.expanded ? (
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

              {isDense && (
                <Chip
                  size="small"
                  variant="soft"
                  icon={<Iconify icon="mdi:layers-triple-outline" width={14} />}
                  label="Dense"
                  color="secondary"
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

      <AccordionDetails sx={{ pt: 1, px: { xs: 1.5, sm: 2 }, pb: 2 }}>
        <Box width="100%">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 5 }}>
              <ActiveDaysSlider
                value={config.weekRange}
                disabled={disabled}
                error={weekRangeError}
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

            <Grid size={{ xs: 12, md: 3.5 }}>
              <TotalSlotsInput
                value={totalSlotsValue}
                disabled={disabled || (isEdit && !!hasData)}
                error={totalSlotsError}
                arrayError={timeSlotsArrayError}
                onChange={onTotalSlotsChange}
              />
            </Grid>

            {/* Dense Mode toggle — UI-only; cascade behavior runs natively */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Tooltip
                title="When enabled, each slot starts immediately where the previous one ends (no gaps). This is the default scheduling behavior."
                arrow
                placement="top"
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: isDense
                      ? (theme) => alpha(theme.palette.secondary.main, 0.35)
                      : 'divider',
                    bgcolor: (theme) =>
                      isDense
                        ? alpha(
                            theme.palette.secondary.main,
                            theme.palette.mode === 'dark' ? 0.12 : 0.06
                          )
                        : 'transparent',
                    transition: 'all 150ms ease',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={isDense}
                        onChange={(e) => !disabled && setIsDense(e.target.checked)}
                        color="secondary"
                        inputProps={{ 'aria-label': 'Dense mode toggle' }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                          Dense Mode
                        </Typography>
                        <Typography variant="caption" color="text.secondary" lineHeight={1.3}>
                          Back-to-back slots without gaps
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, gap: 1 }}
                  />
                </Box>
              </Tooltip>
            </Grid>

            {config.timeSlots && config.timeSlots.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1.5 }} />

                {/* Slot Times header */}
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
                        alpha(
                          theme.palette.primary.main,
                          theme.palette.mode === 'dark' ? 0.22 : 0.1
                        ),
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
                  disabled={disabled}
                  isEdit={isEdit}
                  errors={slotErrorsMap}
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
              </Grid>
            )}
          </Grid>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default SlotConfigurationAccordion;
