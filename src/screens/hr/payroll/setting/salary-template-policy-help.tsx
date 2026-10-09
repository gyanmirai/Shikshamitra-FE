import type { ProtectionPolicy } from 'src/redux/hr/salary-template-api';

import { useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

const policies: Record<ProtectionPolicy, { title: string; protects: string; mayChange: string }> = {
  PROTECT_EMPLOYER_COST: {
    title: 'Protect employer cost',
    protects: 'Total school cost: gross salary plus employer contributions.',
    mayChange: 'Gross and take-home salary may change.',
  },
  PROTECT_GROSS: {
    title: 'Protect gross salary',
    protects: 'Gross salary before staff deductions.',
    mayChange: 'Take-home salary and total school cost may change.',
  },
  PROTECT_TAKE_HOME: {
    title: 'Protect take-home salary',
    protects: 'Net salary after staff deductions.',
    mayChange: 'Gross salary and total school cost may change.',
  },
};

export default function SalaryTemplatePolicyHelp({ policy }: { policy: ProtectionPolicy }) {
  const [open, setOpen] = useState(false);
  const introductionRef = useRef<HTMLParagraphElement>(null);
  const selected = policies[policy];

  return (
    <>
      <Typography
        id="salary-template-protection-help"
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mt: 0.75 }}
      >
        Protects {selected.protects.charAt(0).toLowerCase() + selected.protects.slice(1)}{' '}
        {selected.mayChange}
      </Typography>
      <Button
        type="button"
        size="small"
        variant="text"
        startIcon={<Iconify icon="mdi:information-outline" />}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? 'salary-policy-comparison' : undefined}
        onClick={() => setOpen(true)}
        sx={{ mt: 0.25 }}
      >
        Compare policies
      </Button>
      <CustomDialog
        open={open}
        handleClose={() => setOpen(false)}
        title="Compare protection policies"
        maxWidth="sm"
        hasForm={false}
        guardUnsavedChanges={false}
        paperProps={{
          id: 'salary-policy-comparison',
          sx: { backgroundImage: 'none', border: 1, borderColor: 'divider' },
        }}
        slotProps={{ transition: { onEntered: () => introductionRef.current?.focus() } }}
      >
        <DialogScrollContent>
          <Typography
            ref={introductionRef}
            tabIndex={-1}
            variant="body2"
            sx={{
              mb: 2,
              '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
            }}
          >
            Salary basis tells us which amount you enter. Protection policy identifies which
            calculated amount to protect.
          </Typography>
          <Box component="dl" sx={{ m: 0 }}>
            {Object.entries(policies).map(([value, details]) => (
              <Box
                key={value}
                sx={{
                  p: 1.5,
                  borderBottom: 1,
                  borderColor: 'divider',
                  bgcolor: value === policy ? 'action.selected' : 'transparent',
                  '&:last-child': { borderBottom: 0 },
                }}
              >
                <Typography component="dt" variant="subtitle2">
                  {details.title}
                  {value === policy && (
                    <Typography component="span" variant="caption" sx={{ ml: 1 }}>
                      {' Current policy'}
                    </Typography>
                  )}
                </Typography>
                <Box component="dd" sx={{ m: 0, mt: 0.5 }}>
                  <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 600 }}>
                      Amount to protect:{' '}
                    </Box>
                    {details.protects}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {details.mayChange}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            Payroll eligibility and statutory rules still apply. This policy does not guarantee an
            unchanged payment in every payroll run.
          </Typography>
        </DialogScrollContent>
        <DialogActions>
          <Button
            size="small"
            type="button"
            variant="outlined"
            startIcon={<Iconify icon="mdi:close" />}
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </DialogActions>
      </CustomDialog>
    </>
  );
}
