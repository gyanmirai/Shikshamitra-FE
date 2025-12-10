import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Button } from '@mui/material';

interface ReportFormProps {
  children: React.ReactNode;
  onSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  disabled?: boolean;
}

export const ReportForm: React.FC<ReportFormProps> = ({ children, onSubmit, disabled }) => (
  <form onSubmit={onSubmit}>
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {children}
        <Grid size={12} display="flex" justifyContent="flex-end">
          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={disabled}
            startIcon={<Iconify icon={GlobalIcons.generateReport} />}
          >
            Generate Report
          </Button>
        </Grid>
      </Grid>
    </Box>
  </form>
);

export default ReportForm;
