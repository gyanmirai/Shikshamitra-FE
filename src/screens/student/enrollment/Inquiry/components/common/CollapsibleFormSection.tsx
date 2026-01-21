import React from 'react';
import { varAlpha } from 'src/theme/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Chip,
  Grid,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

/**
 * Props for the CollapsibleFormSection component.
 */
interface CollapsibleFormSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  step?: string;
  error?: boolean;
}

/**
 * CollapsibleFormSection Component
 *
 * wraps form fields in a collapsible accordion with error state styling.
 *
 * @param {string} title - Section title
 * @param {React.ReactNode} children - Form fields to render inside
 * @param {boolean} defaultExpanded - Whether the section is open by default
 * @param {string} step - Optional step indicator (e.g., "Step 1 of 4")
 * @param {boolean} error - Visual error state indication
 */
export const CollapsibleFormSection = ({
  title,
  children,
  defaultExpanded = false,
  step,
  error = false,
}: CollapsibleFormSectionProps) => (
  <Accordion
    defaultExpanded={defaultExpanded}
    sx={{
      mb: 2,
      borderRadius: '12px !important',
      boxShadow: (theme) => theme.customShadows.z1,
      '&:before': { display: 'none' }, // Hide default divider
      overflow: 'hidden',
      border: (theme) =>
        error ? `1px solid ${theme.palette.error.main}` : `1px solid transparent`,
      transition: 'all 0.3s ease-in-out',
    }}
  >
    <AccordionSummary
      expandIcon={<ExpandMoreIcon sx={{ color: error ? 'error.main' : 'text.secondary' }} />}
      sx={{
        backgroundColor: (theme) =>
          error
            ? varAlpha(theme.palette.error.mainChannel, 0.1)
            : varAlpha(theme.palette.grey['500Channel'], 0.2), // Soft green/blue accent
        borderBottom: (theme) =>
          `1px solid ${error ? theme.palette.error.main : theme.palette.divider}`,
        '&.Mui-expanded': { minHeight: 48 },
        minHeight: 48,
        transition: 'background-color 0.3s ease-in-out',
      }}
    >
      <Box display="flex" alignItems="center" width="100%" justifyContent="space-between">
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          color={error ? 'error.main' : 'text.primary'}
          sx={{ transition: 'color 0.3s ease' }}
        >
          {title}
        </Typography>
        {step && (
          <Chip
            label={step}
            size="small"
            color={error ? 'error' : 'default'} // Highlight step if error
            variant="soft"
            sx={{ mr: 2, fontWeight: 'bold', transition: 'all 0.3s ease' }}
          />
        )}
      </Box>
    </AccordionSummary>
    <AccordionDetails sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {children}
      </Grid>
    </AccordionDetails>
  </Accordion>
);
