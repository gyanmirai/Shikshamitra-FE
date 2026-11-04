import type { SalaryBasis } from 'src/redux/hr/salary-template-api';

import { useId } from 'react';
import {
  Box,
  Radio,
  FormLabel,
  RadioGroup,
  Typography,
  FormControl,
  FormControlLabel,
} from '@mui/material';

const choices: { value: SalaryBasis; title: string; description: string }[] = [
  {
    value: 'GROSS',
    title: 'Monthly salary',
    description:
      'Earnings before employee deductions. Employer contributions are additional school costs.',
  },
  {
    value: 'EMPLOYER_COST',
    title: 'Monthly cost to school (CTC)',
    description: 'Total monthly budget including earnings and applicable employer contributions.',
  },
];

export default function SalaryBasisChoice({
  value,
  onChange,
  disabled = false,
  label = 'Amount basis',
}: {
  value: SalaryBasis;
  onChange: (value: SalaryBasis) => void;
  disabled?: boolean;
  label?: string;
}) {
  const labelId = useId();
  return (
    <FormControl fullWidth disabled={disabled}>
      <FormLabel id={labelId} sx={{ typography: 'body2', mb: 1 }}>
        {label}
      </FormLabel>
      <RadioGroup
        aria-labelledby={labelId}
        value={value}
        onChange={(_, selected) => onChange(selected as SalaryBasis)}
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
          gap: 1.5,
        }}
      >
        {choices.map((choice) => (
          <FormControlLabel
            key={choice.value}
            value={choice.value}
            disabled={disabled}
            control={<Radio size="small" />}
            label={
              <Box sx={{ py: 1.5, pr: 1.5 }}>
                <Typography variant="subtitle2">{choice.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {choice.description}
                </Typography>
              </Box>
            }
            sx={{
              m: 0,
              alignItems: 'flex-start',
              minWidth: 0,
              border: 1,
              borderColor: value === choice.value ? 'primary.main' : 'divider',
              borderRadius: 1.5,
              bgcolor: value === choice.value ? 'action.selected' : 'background.paper',
              '& .MuiRadio-root': { mt: 0.5 },
              '&:focus-within': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 2,
              },
            }}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}
