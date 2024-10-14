import React from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, Card, Button, Switch, TextField, Typography, FormControlLabel } from '@mui/material';

interface FinanceNotificationCardProps {
  cardTitle: string;                  // Prop for card title
  switchLabel: string;                // Prop for the main switch label
  optionalSwitchLabel?: string;       // Prop for the optional switch label (optional)
  textFieldLabel: string;             // Prop for the text field label
  showOptionalSwitch: boolean;        // Prop to control the visibility of the optional field
  onSwitchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOptionalSwitchChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

const FinanceNotificationCardComponent: React.FC<FinanceNotificationCardProps> = ({
  cardTitle,
  switchLabel,
  optionalSwitchLabel,
  textFieldLabel,
  showOptionalSwitch,
  onSwitchChange,
  onOptionalSwitchChange,
  onInputChange,
  onSave,
}) => (
  <Grid2 >
    <Card
      sx={{
        pl: 3,
        pt: 3,
        flexDirection: 'column',
      }}
    >
      <Typography variant="h6">{cardTitle}</Typography>
      <Box pb="10px" />

      {/* Main Switch */}
      <FormControlLabel
        label={switchLabel}
        control={<Switch name="dense" checked onChange={onSwitchChange} />}
      />

      {/* Conditionally render optional switch based on prop */}
      {showOptionalSwitch && optionalSwitchLabel && (
        <Box>
          <FormControlLabel
            label={optionalSwitchLabel}
            control={<Switch name="optional" onChange={onOptionalSwitchChange} />}
          />
        </Box>
      )}

      <Box py="10px" width="320px">
        <TextField
          name="discount"
          label={textFieldLabel}
          size="small"
          onChange={onInputChange}
        />
      </Box>

      <Box pr="20px" display="flex" flexDirection="row" justifyContent="flex-end">
        <Button variant="contained" size="small" onClick={onSave}>
          Save
        </Button>
      </Box>

      <Box py="12px" />
    </Card>
  </Grid2>
);

export default FinanceNotificationCardComponent;
