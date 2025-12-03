import React from 'react';
import { Box, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

interface ReportFormProps {
  children: React.ReactNode;
  onSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  disabled?: boolean;
}

export const ReportForm = ({ children, onSubmit, disabled }: ReportFormProps) => (
  <Box
    component="form"
    onSubmit={onSubmit}
    sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column' }}
  >
    <Scrollbar sx={{ flexGrow: 1, p: 1 }}>{children}</Scrollbar>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button
        type="submit"
        variant="contained"
        size="small"
        disabled={disabled}
        startIcon={<Iconify icon={GlobalIcons.report} />}
      >
        Generate Report
      </Button>
    </Box>
  </Box>
);
