import dayjs from 'dayjs';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useId, useState, useEffect } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import {
  Box,
  Stack,
  Tooltip,
  Accordion,
  Typography,
  IconButton,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import SlotGroupFields from './SlotGroupFields';
import { getActiveDaysLabel } from '../utils/dayMarks';
import { getSlotConfigurationErrors } from '../hooks/useSlotConfigurationErrors';

import type { SlotConfigurationAccordionProps } from '../types';

export type { ISlotConfig, SlotConfigurationAccordionProps } from '../types';

export default function SlotConfigurationAccordion(props: SlotConfigurationAccordionProps) {
  const { config, configIndex, formik, canRemove, disabled, onRemove } = props;
  const [expanded, setExpanded] = useState(config.expanded ?? true);
  const summaryId = useId();
  const errors = getSlotConfigurationErrors(formik, configIndex, config.timeSlots.length);
  useEffect(() => {
    if (formik.submitCount > 0 && errors.hasError) setExpanded(true);
  }, [formik.submitCount, errors.hasError]);
  const title = `Slot Group #${configIndex + 1}`;
  const firstTime = config.timeSlots[0]?.startTime;
  const lastTime = config.timeSlots.at(-1)?.endTime;
  const times =
    firstTime && lastTime
      ? `${dayjs(firstTime).format('hh:mm A')} – ${dayjs(lastTime).format('hh:mm A')}`
      : '';
  return (
    <Box sx={{ position: 'relative', minWidth: 0 }}>
      <Accordion
        expanded={expanded}
        onChange={() => setExpanded((value) => !value)}
        disableGutters
        sx={{
          boxShadow: 'none',
          border: 1,
          borderColor: errors.hasError ? 'error.main' : 'divider',
          borderRadius: 'var(--shape-borderRadius)',
          bgcolor: 'background.paper',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          id={summaryId}
          aria-controls={`${summaryId}-content`}
          expandIcon={<ExpandMoreIcon />}
          sx={{
            px: 2,
            minHeight: 64,
            '& .MuiAccordionSummary-content': { pr: canRemove && !disabled ? 11 : 5 },
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 0.75,
                bgcolor: 'background.neutral',
                color: 'text.secondary',
                flexShrink: 0,
              }}
            >
              <Iconify icon={GlobalIcons.clock} width={20} aria-hidden />
            </Box>
            <Stack spacing={0.5} sx={{ minWidth: 0 }}>
              <Typography component="h2" variant="subtitle1" fontWeight={600}>
                {title}
              </Typography>
              {!expanded && (
                <Typography variant="body2" color="text.secondary">
                  {String(config.totalSlots || 0)} slots ·{' '}
                  {getActiveDaysLabel(config.weekRange) || 'No active days'}
                  {times && ` · ${times}`}
                </Typography>
              )}
              {errors.hasError && (
                <Typography data-slot-error variant="caption" color="error">
                  Needs attention
                </Typography>
              )}
            </Stack>
          </Stack>
        </AccordionSummary>
        <AccordionDetails id={`${summaryId}-content`} sx={{ p: 2, pt: 0 }}>
          <SlotGroupFields {...props} errors={errors} />
        </AccordionDetails>
      </Accordion>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{ position: 'absolute', top: 10, right: 48 }}
      >
        <InfoTooltipIcon
          label={`${title} information`}
          title="Configure the active days and ordered time slots for this group."
        />
        {canRemove && !disabled && (
          <Tooltip title={`Remove slot group ${configIndex + 1}`}>
            <IconButton
              aria-label={`Remove slot group ${configIndex + 1}`}
              onClick={onRemove}
              sx={{ width: 44, height: 44, color: 'text.secondary' }}
            >
              <Iconify icon={GlobalIcons.delete} width={18} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Box>
  );
}
