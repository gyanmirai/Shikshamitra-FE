import type { Theme } from '@mui/material';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/material/styles';
import RemoveIcon from '@mui/icons-material/Remove';
import { Accordion, Typography, AccordionSummary, AccordionDetails } from '@mui/material';

interface CustomAccordionProps {
  title: string;
  content: React.ReactNode;
  expanded?: boolean;
  onChange?: (event: React.SyntheticEvent) => void;
  isActive?: boolean;
}

const CustomAccordion: React.FC<CustomAccordionProps> = ({
  title,
  content,
  expanded,
  onChange,
  isActive = false,
}) => {
  const theme: Theme = useTheme();
  return (
    <Accordion
      expanded={expanded}
      onChange={(e, value) => {
        if (onChange) onChange(e);
      }}
      sx={{
        boxShadow: 'none',

        color: isActive ? theme.vars.palette.primary.main : theme.vars.palette.text.secondary,
        fontSize: '14px',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={
          expanded ? (
            <RemoveIcon sx={{ fontSize: '18px' }} />
          ) : (
            <AddIcon sx={{ fontSize: '18px' }} />
          )
        }
        sx={{
          borderBottom: `1px solid ${theme.vars.palette.divider}`,
          borderLeft: isActive
            ? `2px solid ${theme.vars.palette.primary.main}`
            : `2px solid ${theme.vars.palette.divider}`,
          bgcolor: isActive ? varAlpha(theme.vars.palette.primary.mainChannel, 0.08) : 'inherit',
          '&.Mui-expanded': { minHeight: '40px' },
          '& .MuiAccordionSummary-content.Mui-expanded': { margin: '0' },
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontSize: '14px',
            fontWeight: isActive
              ? theme.typography.fontWeightBold
              : theme.typography.fontWeightMedium,
            color: isActive ? theme.vars.palette.primary.main : theme.vars.palette.text.secondary,
          }}
        >
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: 1 }}>{content}</AccordionDetails>
    </Accordion>
  );
};

export default CustomAccordion;
