import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button, Typography } from '@mui/material';

export default function SetupFooter({
  step,
  disabled,
  conflict,
  saving,
  error,
  dirty,
  navigate,
  next,
  onExit,
}: {
  step: number;
  disabled: boolean;
  conflict: boolean;
  saving: boolean;
  error: string;
  dirty: boolean;
  navigate: (target: number) => Promise<void>;
  next: () => Promise<void>;
  onExit: () => Promise<void>;
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      spacing={1}
      useFlexGap
      sx={{
        '& .MuiButton-root': { minHeight: { xs: 44, sm: 32 }, px: 1.25, whiteSpace: 'nowrap' },
        '& .MuiButton-startIcon, & .MuiButton-endIcon': { mx: 0.5 },
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          size="small"
          startIcon={<Iconify icon="mdi:chevron-left" width={18} />}
          disabled={disabled || conflict || step === 0}
          onClick={() => navigate(step - 1)}
        >
          Back
        </Button>
        <Typography
          variant="caption"
          color="text.secondary"
          role="status"
          data-setup-save-state
          sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
        >
          <Iconify
            key={saving ? 'saving' : error ? 'error' : dirty ? 'dirty' : 'saved'}
            icon={
              saving
                ? 'mdi:content-save-outline'
                : error
                  ? 'mdi:alert-circle-outline'
                  : dirty
                    ? 'mdi:pencil-outline'
                    : 'mdi:check-circle-outline'
            }
            width={16}
          />
          {saving
            ? 'Saving…'
            : error
              ? 'Progress could not be saved'
              : dirty
                ? 'Unsaved changes'
                : 'Progress saved'}
        </Typography>
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        sx={{ '& .MuiButton-root': { flex: { xs: 1, sm: 'initial' } } }}
      >
        <Button
          size="small"
          aria-label="Save and exit"
          startIcon={<Iconify icon="mdi:logout" width={16} />}
          disabled={disabled || conflict}
          onClick={() => onExit()}
        >
          <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
            Save and exit
          </Box>
          <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
            Save & exit
          </Box>
        </Button>
        <Button
          size="small"
          variant="outlined"
          aria-label="Save progress"
          startIcon={<Iconify icon="mdi:content-save-outline" width={16} />}
          disabled={disabled || conflict}
          onClick={() => navigate(step)}
        >
          <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
            Save progress
          </Box>
          <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
            Save
          </Box>
        </Button>
        <Button
          size="small"
          aria-label={
            step === 0 ? 'Get started' : step === 5 ? 'Finish setup' : 'Save and continue'
          }
          endIcon={<Iconify icon={step === 5 ? 'mdi:check' : 'mdi:chevron-right'} width={18} />}
          variant="contained"
          color="inherit"
          loading={disabled}
          disabled={conflict}
          onClick={() => {
            next();
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
            {step === 0 ? 'Get started' : step === 5 ? 'Finish setup' : 'Save and continue'}
          </Box>
          <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
            {step === 0 ? 'Start' : step === 5 ? 'Finish' : 'Continue'}
          </Box>
        </Button>
      </Stack>
    </Stack>
  );
}
