'use client';

import type { ReactNode } from 'react';

import { useId } from 'react';
import { Box, ButtonBase } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomAccordion from 'src/components/custom-accordian';
import { FormSectionHeader } from 'src/components/form-section-card';

/** The existing Fees disclosure pattern, shared by the secondary setup sections. */
export default function StudentQuickSetupSection({
  title,
  icon,
  help,
  summary,
  expanded,
  onExpandedChange,
  disabled = false,
  toggleName = title,
  sectionId,
  children,
}: {
  title: string;
  icon: string;
  help: string;
  summary: ReactNode;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  disabled?: boolean;
  toggleName?: string;
  sectionId?: string;
  children: ReactNode;
}) {
  const id = useId();
  const toggleLabel = `${expanded ? 'Collapse' : 'Expand'} ${toggleName}`;
  return (
    <Box
      component="section"
      id={sectionId}
      aria-label={title}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <CustomAccordion
        title={title}
        expanded={expanded}
        onChange={() => !disabled && onExpandedChange(!expanded)}
        summary={
          <Box
            id={`${id}-summary`}
            sx={{
              p: { xs: 1.5, sm: 2 },
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                md: 'minmax(240px, 0.6fr) minmax(0, 1fr)',
              },
              alignItems: 'center',
              gap: 1.5,
              color: 'text.primary',
            }}
          >
            <FormSectionHeader title={title} icon={icon} descriptionTooltip={help} />
            <ButtonBase
              type="button"
              aria-label={toggleLabel}
              aria-expanded={expanded}
              aria-controls={`${id}-content`}
              disabled={disabled}
              onClick={() => onExpandedChange(!expanded)}
              sx={{
                minWidth: 0,
                minHeight: 44,
                width: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 1,
                textAlign: 'left',
                borderRadius: 1,
                gridColumn: { xs: 1, md: 2 },
                gridRow: { xs: 2, md: 1 },
                '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main' },
              }}
            >
              <Box sx={{ minWidth: 0, overflowWrap: 'anywhere', textAlign: 'right' }}>
                {summary}
              </Box>
              <Iconify icon={expanded ? 'mdi:chevron-down' : 'mdi:chevron-right'} width={20} />
            </ButtonBase>
          </Box>
        }
        content={
          <Box
            id={`${id}-content`}
            sx={{ p: { xs: 0.5, sm: 1 }, borderTop: 1, borderColor: 'divider' }}
          >
            {children}
          </Box>
        }
      />
    </Box>
  );
}
